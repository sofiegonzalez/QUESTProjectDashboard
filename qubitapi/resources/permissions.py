from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict, post_query

permissions = {}  # Placeholder since we're not hooked up to database yet
# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Permissions fields: id, name, description - id is automatically assigned by the database
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('name', location=['json', 'form', 'args'])
parser.add_argument('description', location=['json', 'form', 'args'])


# Used when retrieving all projects of system
class PermissionsList(Resource):
    """
    PermissionsList handles GET requests for listing all permissions of the system
     and POST requests to create a permission within the system
    """
    def get(self):

        """
        GET requests to PermissionsList will return a list of all persons of the system
        :return: An HTTP code indicating success (200), along with a JSON object
        containing all information from persons table on success
        """

        args = parser.parse_args()  # Parse url query if it exists

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:  # No query attached to URL
            query_string = """SELECT * FROM permissions"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = "SELECT * FROM permissions WHERE " + query_args_string
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'description']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to PermissionList will attempt to add a permission to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """
        # TODO: Are we even allowing permissions to be created?
        # Configure parser for POST request
        post_parser = parser.copy()  # Inherit from main parser
        post_parser.remove_argument('uid')  # UID is assigned by DB, so don't need it here

        # Parse request
        args = post_parser.parse_args()

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:  # Don't need to check for missing arguments since all arguments are required
            query_args.append(argument)
            query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args) # convert list to form a string
        query_string = "INSERT INTO permissions (" + query_args_string + ") VALUES (%s)" % (
            ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))

        if assigned_id is None:
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT id, name, description FROM permissions WHERE id=(%s)", (assigned_id,))
        return make_response(jsonify(response_to_dict(new_entry, ['id', 'name', 'description'])))


# Used for a single permissions
class Permissions(Resource):
    """
    Permissions handles GET, PUT, and DELETE requests for a specific permission.
     The id is provided in the url as /api/permission/<id>
    """
    def get(self, permission_id):
        """
        GET requests to Permissions will attempt to retrieve a permission with the given id
         and return the information associated with it.
        :param permission_id: The ID (primary key in database) of permission entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         permission, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT * FROM permissions WHERE id = (%s)"""
        result = db_query(query_string, (permission_id,))

        if result is None or len(result) == 0:  # Indicate if key doesn't exist
            return make_response(jsonify({"Permission GET error. Provided ID does not exist ": permission_id}), 404)

        # Otherwise, return information.
        fields = ['id', 'name', 'description']
        to_return = response_to_dict(result, fields)
        return make_response(jsonify(to_return), 200)


    @jwt_required
    def put(self, permission_id):
        """
        PUT requests to Permissions will update the provided fields for a permission
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param permission_id: The ID (primary key in database) of permission entry to update
        :return: An HTTP code indicating success (200 if no new values provided and
         201 on successful update) or failure (404), along with a JSON object of
         the new database entry.
        """
        # Main parser is already configured for PUT
        args = parser.parse_args()

        query_args = list()
        query_args_values = list()

        for argument in args:
            if args[argument] is not None:
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:
            return make_response(jsonify({"Permissions PUT": "No new values provided"}), 200)
        
        query_args_string = ', '.join(query_args) # convert column list to formatted string
        query_string = "UPDATE permissions SET " + query_args_string + "WHERE id=(%s)"
        query_args_values.append(permission_id) # needed for WHERE
        assigned_id = db_execute(query_string, tuple(query_args_values))

        if assigned_id is None:
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        new_entry = db_query("SELECT id, name, description FROM permissions WHERE id=(%s)", (permission_id,))
        if len(new_entry) == 0:
            return make_response(jsonify({"PUT permission error. ID doesn't exist": permission_id}), 404)

        return make_response(jsonify(response_to_dict(new_entry, ['id', 'name', 'description'])))

    @jwt_required
    def delete(self, permission_id):
        """
        DELETE requests to Permissions will delete the permission table entry within the
         database that is associated with the provided key.

        :param permission_id: The ID (primary key in database) of permission entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the permission with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM permissions WHERE id=(%s)"""
        response = db_execute(query_string, (permission_id,))

        if response == 0:
            return make_response(jsonify({"Permission delete error": permission_id}), 404)

        return make_response(jsonify({"Permission delete success": permission_id}), 200)  # Indicate success


# Expose blueprint for api.py
permissions_api = Blueprint("resources.permissions", __name__)

# Add resources to api
api = Api(permissions_api)

# resource, route, endpoint
api.add_resource(
    PermissionsList,
    "/api/permissions",
    endpoint="permissions")

api.add_resource(
    Permissions,
    "/api/permission/<permission_id>",
    endpoint="permission")
