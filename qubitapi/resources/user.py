from flask import Blueprint, jsonify, make_response, request  # Needed for blueprints and returning proper responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from .query import db_query, db_execute, response_to_dict  # Needed for database querying, and response formatting
from ast import literal_eval
from flask_jwt_extended import create_access_token, jwt_required  # Needed for validation
import bcrypt  # Needed for password hashing
from flask_cors import CORS, cross_origin

# Configure parent JSON parser with expected values. HTTP methods will use this or extend from this
# User fields: id, account_email, account_password, salt. Note that id is automatically assigned
# by the database, and salt is generated for the user rather than being an argument to pass to API
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('email', help='Invalid email. ', location=['json', 'form', 'args']) # type=str default
parser.add_argument('pwd', help='Invalid password. ', location=['json', 'form', 'args'])
parser.add_argument('permission_ids', location=['json', 'form', 'args'])

# cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

class UserList(Resource):
    """
    UserList handles GET requests for listing all users of the system
     and POST requests to create a user within the system
    """

    def get(self):
        """
        GET requests to UserList will return a list of all persons of the system
        :return: An HTTP code indicating success (200), along with a JSON object
         containing all information from persons table on success
        """
        query_parser = parser.copy()
        query_parser.replace_argument('pwd', help='Invalid password. ', location=['json', 'form', 'args'],
                                      dest='account_password')
        query_parser.replace_argument('email', help='Invalid email. ', location=['json', 'form', 'args'],
                                      dest='account_email')

        args = query_parser.parse_args()  # Parse url query if it exists

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:  # No query attached to URL
            query_string = """
            SELECT id, account_email, JSON_ARRAYAGG(permission_id) as permission_ids
            FROM users
            LEFT OUTER JOIN users_permissions_rel
            ON users.id=users_permissions_rel.user_id
            GROUP by id
            """
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = """
            SELECT id, account_email, JSON_ARRAYAGG(permission_id) as permission_ids
            FROM users
            LEFT OUTER JOIN users_permissions_rel
            ON users.id=users_permissions_rel.user_id
            WHERE """ + query_args_string + """
            GROUP by id """

            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))


        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'account_email', 'permission_ids']
        to_return = response_to_dict(response, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to UserList will attempt to add a user to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Configure parser for POST request (email and password are required)
        post_parser = parser.copy()
        post_parser.replace_argument('email', help='Email required', location=['json', 'form'], required=True)
        post_parser.replace_argument('pwd', help='Password required', location=['json', 'form'], required=True)

        # Parse request
        args = post_parser.parse_args()

        # Make sure a user with the same email doesn't exist
        query_string = """SELECT id FROM users WHERE account_email=(%s)"""
        response = db_query(query_string, (args['email'],))

        # Indicate if someone is already using the given email
        if response is not None and len(response) > 0:
            return make_response(jsonify({'Error: Email in use': args['email']}), 400)

        # Otherwise, hash and salt the password and insert into database
        (hashed, salt) = hash_password(args['pwd'])

        # Add information to the database
        query_string = """INSERT INTO users (account_email, account_password, salt) VALUES (%s, %s, %s)"""
        insert_tuple = (args['email'], hashed, salt)
        assigned_id = db_execute(query_string, insert_tuple)

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)


        if args['permission_ids'] is not None:
            for i in args['permission_ids']:
                check = check_permissions_id(i)
                if i is int and check:
                    relation_str = "INSERT INTO users_permissions_rel (user_id, permission_id) VALUES (%s, %s)"
                    db_execute(relation_str, (assigned_id, i))
                else:
                    return make_response(jsonify({"An error occurred": "Not all permission_ids were valid"}), 404)

        # Return new entry
        new_entry = db_query("""
        SELECT id, account_email, JSON_ARRAYAGG(permission_id) as permission_ids
        FROM users
        LEFT OUTER JOIN users_permissions_rel
        ON users.id=users_permissions_rel.user_id
        WHERE id=%s
        GROUP by id
        """, (assigned_id,))
        fields = ['id', 'account_email']
        to_return = response_to_dict(new_entry, fields)
        token = create_access_token(identity={"id": to_return[0].get('id'), "account_email": to_return[0].get(
                'account_email')})
        return token


class User(Resource):
    """
    User handles GET, PUT, and DELETE requests for a specific user.
     The id is provided in the url as /api/user/<id>
    """

    def get(self, user_id):
        """
        GET requests to User will attempt to retrieve a user with the given id
         and return the information associated with it.
        :param user_id: The ID (primary key in database) of user entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         user, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """
        SELECT id, account_email, JSON_ARRAYAGG(permission_id) as permission_ids 
        FROM users 
        LEFT OUTER JOIN users_permissions_rel 
        ON users.id=users_permissions_rel.user_id 
        WHERE id=(%s) 
        GROUP by id;"""

        response = db_query(query_string, (user_id,))

        if response is None or len(response) == 0:  # Indicate if user doesn't exist
            return make_response(jsonify({"User GET error. Provided ID does not exist ": user_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'account_email', 'permission_ids']
        to_return = response_to_dict(response, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def put(self, user_id):
        """
        PUT requests to User will update the provided fields for a user
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param user_id: The ID (primary key in database) of user entry to update
        :return: An HTTP code indicating success (200 if no new values provided and
         201 on successful update) or failure (404), along with a JSON object of
         the new database entry.
        """
        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're updating
        query_args_values = list()  # Values for the columns we're updating

        # Specific cases for email and password because extra functionality is needed (checking duplicates, hashing)
        for argument in args:

            if argument == 'permission_id':  # Handle relational table in different query
                continue
            if argument == 'email' and args[argument] is not None:
                # Make sure a user with the same email doesn't exist
                query_string = """SELECT id FROM users WHERE account_email=(%s)"""
                response = db_query(query_string, (args[argument],))
                if response is not None and len(response) > 0:  # Does someone already have that email?
                    return make_response(jsonify({'id': response[0][0], 'email': args['email']}), 400)
                else:  # No other user is associated with the provided email if the 'else' branch is executed
                    query_args.append("account_email = (%s)")
                    query_args_values.append(args[argument])

            elif argument == 'pwd' and args[argument] is not None:
                # Salt and hash new password and store results
                (hashed, salt) = hash_password(args[argument])
                query_args.append("account_password = (%s)")
                query_args_values.append(hashed)
                query_args.append("salt = (%s)")
                query_args_values.append(salt)

            # Else not needed since salt isn't a parser argument and we will never update id
        if len(query_args) == 0:  # Only update if values were provided
            return make_response(jsonify({"User PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE users SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(user_id)  # Don't forget the user_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))

        if response is None:  # If a query error occurs, None is returned (bad person_id, cohort_id, or resume_id)
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry (don't publish password and salt)
        new_entry = db_query("SELECT id, account_email FROM users WHERE id=(%s)", (user_id,))

        if len(new_entry) == 0:  # Indicate if user with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT user error. ID doesn't exist": user_id}), 404)

        fields = ['id', 'account_email']
        to_return = response_to_dict(new_entry, fields)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, user_id):
        """
        DELETE requests to User will delete the users table entry within
         the database that is associated with the provided key.
        :param user_id: The ID (primary key in database) of user entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the user with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM users WHERE id=(%s)"""
        response = db_execute(query_string, (user_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no user exists with the given id
            return make_response(jsonify({"User delete error": user_id}), 404)

        return make_response(jsonify({"User delete success": user_id}), 200)  # Indicate success

class UserPermission(Resource):
    @jwt_required
    def post(self, user_id, permission_id):
        """
        POST requests to UserPermission will attempt to add a relationship between the supplied User and Permissions
         with the information provided within the url request path
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the User entry on success, or an error message on
         failure.
        """

        if check_user_id(user_id) and check_permissions_id(permission_id):
            exists = db_query("""
            SELECT * from users_permissions_rel 
            WHERE user_id=(%s) AND permission_id=(%s)
            """, (user_id, permission_id))
            if len(exists) == 0:
                query_string = """
                INSERT INTO users_permissions_rel (user_id, permission_id) VALUES (%s, %s)"""
                db_execute(query_string, (user_id, permission_id))

            new_entry = db_query("""
            SELECT id, account_email, JSON_ARRAYAGG(permission_id) as permission_ids
            FROM users
            LEFT OUTER JOIN users_permissions_rel
            ON users.id=users_permissions_rel.user_id
            WHERE users.id=(%s)
            GROUP by id
            """, (user_id,))

            if len(new_entry) == 0:
                return make_response(jsonify({"POST UserPermissions error. ID doesn't exist": user_id}), 404)

            fields = ['id', 'account_email', 'permission_ids']
            to_return = response_to_dict(new_entry, fields)
            return make_response(jsonify(to_return), 201)

        else:
            return make_response(
                jsonify({"Post Failure, user or permission does not exist": {"user_id": user_id, "permission_id": permission_id}}),
                404)

    @jwt_required
    def delete(self, user_id, permission_id):
        """
        DELETE requests to UserPermission will remove the relationship between the
        supplied user_id and permission_id
        :param user_id: The ID (primary key in database) of user entry to delete
        :param permission_id: The ID (primary key in database) of permission entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the team with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM users_permissions_rel WHERE user_id=(%s) AND permission_id=(%s)"""
        response = db_execute(query_string, (user_id, permission_id))

        if response == 0:
            return make_response(
                jsonify({"UserPermission relation delete error": {"user_id": user_id, "permission_id": permission_id}}), 404)

        return make_response(
            jsonify({"UserPermission relation delete success": {"user_id": user_id, "permission_id": permission_id}}),
            200)  # Indicates success



class Login(Resource):
    """
    Login handles user login requests. Login requests are expected with
    POST; Other functions (GET, PUT, and DELETE) have no functionality
    associated with login requests
    """

    def get(self):
        return make_response(jsonify({"User login GET": "Not implemented"}), 501)

    def post(self):
        """
        POST requests to Login will compare provided credentials against the database
         to determine if the login request is valid.
        :return: An HTTP code indicating success (200) or failure (400), along with
         a JSON object of the users id and email on success, or an error message on
         failure.
        """

        args = parser.parse_args()

        # Easier to parse request object directly
        in_email = request.json.get('email', None)
        in_pwd = request.json.get('pwd', None)

        if in_email is None or in_pwd is None:  # Didn't provide email or password
            return make_response(jsonify({"Missing login credentials": "Please submit an email and password"}), 400)

        # Grab hashed password for comparison (pwd gets decoded in response_to_dict, so we encode it again)
        response = db_query("SELECT id, account_email, account_password FROM users WHERE account_email = (%s)",
                            (in_email,))

        if response is None or len(response) == 0:  # Invalid email case
            return make_response(jsonify({"Invalid email": "Make sure email address is correct and try again"}), 400)

        to_return = response_to_dict(response, ['id', 'account_email', 'account_password'])[0]
        hashed = to_return.pop('account_password').encode('utf8')

        # Can use hashpw to compare in_pw to hashed version without needing salt
        # This is because how salting is implemented in bcrypt
        if bcrypt.hashpw(in_pwd.encode('utf8'), hashed) == hashed:
            token = create_access_token(identity={"id": to_return.get('id'), "account_email": in_email})
            return token
        else:
            return make_response(jsonify({"User login failed": "Bad password"}), 400)

    def put(self):
        return make_response(jsonify({"User login PUT": "Not implemented"}), 501)

    def delete(self):
        return make_response(jsonify({"User login DELETE": "Not implemented"}), 501)


def hash_password(password):
    """
    Given a plain text password, hash_password generates a cryptographic salt then
    hashes the given password and salt combination. These values are to be stored
    in the users database. <https://en.wikipedia.org/wiki/Salt_(cryptography)>
    :param password: Plaintext password to be salted and hashed
    :return: A tuple containing a hashes password+salt, and the salt itself
    """

    salt = bcrypt.gensalt()
    hashed = (bcrypt.hashpw(password.encode('utf8'), salt))  # If you don't encode as utf8, hashpw will return an error

    return hashed, salt  # Return (hashed, salt) tuple to be stored in database

def check_user_id(id_in):
    query_string = """SELECT * FROM users WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False

def check_permissions_id(id_in):
    query_string = """SELECT * FROM permissions WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False

def cleanup_joined_response(to_return):
    for user in to_return:
        user['permission_ids'] = literal_eval(user['permission_ids'].replace(', null', '').replace('null, ', '').replace('null', ''))
        user['permission_ids'] = list(set(user['permission_ids']))

    return to_return

# Expose blueprint for api.py
user_api = Blueprint("resources.user", __name__)

# Add resources to api
api = Api(user_api)

api.add_resource(  # resource (class), route, endpoint
        UserList,
        "/api/users",
        endpoint="users")

api.add_resource(
        User,
        "/api/user/<user_id>",
        endpoint="user")

api.add_resource(
        Login,
        "/api/user/signin",
        endpoint="signin")

api.add_resource(
    UserPermission,
    "/api/user/<user_id>/permission/<permission_id>",
    endpoint="user_to_permission")
