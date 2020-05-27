from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict, post_query

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Person fields: id, first_name, last_name, contact_email, pronoun, title, work_city,
# work_state, linkedin, user_id. Note that id is automatically assigned
# by the database when creating an entry.
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('first_name', location=['json', 'form', 'args'])  # type defaults to str
parser.add_argument('last_name', location=['json', 'form', 'args'])
parser.add_argument('contact_email', location=['json', 'form', 'args'])
parser.add_argument('pronoun', action='split', location=['json', 'form', 'args'])
parser.add_argument('title', location=['json', 'form', 'args'])
parser.add_argument('work_city', location=['json', 'form', 'args'])
parser.add_argument('work_state', location=['json', 'form', 'args'])
parser.add_argument('linkedin', location=['json', 'form', 'args'])
parser.add_argument('user_id', type=int, location=['json', 'form', 'args'])


class PersonList(Resource):
    """
    PersonList handles GET requests for listing all persons of the system
     and POST requests to create a person within the system
    """

    def get(self):
        """
        GET requests to PersonList will return a list of all persons of the system
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
            query_string = """SELECT * FROM persons"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = "SELECT * FROM persons WHERE " + query_args_string
            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'first_name', 'last_name', 'contact_email', 'pronoun', 'title', 'work_city', 'work_state',
                  'linkedin', 'user_id']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to PersonList will attempt to add a person to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Adjust parser for POST (first_name, last_name, and user_id are required by database)
        post_parser = parser.copy()
        post_parser.replace_argument('first_name', location=['json', 'form'], required=True)
        post_parser.replace_argument('last_name', location=['json', 'form'], required=True)
        post_parser.replace_argument('user_id', type=int, location=['json', 'form'], required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument)
                query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO persons (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT * FROM persons WHERE id=(%s)", (assigned_id,))
        fields = ['id', 'first_name', 'last_name', 'contact_email', 'pronoun', 'title', 'work_city', 'work_state',
                  'linkedin', 'user_id']
        to_return = response_to_dict(new_entry, fields)
        return make_response(jsonify(to_return), 201)


# Used for a single person
class Person(Resource):
    """
    Persons handles GET, PUT, and DELETE requests for a specific person.
     The id is provided in the url as /api/person/<id>
    """
    def get(self, person_id):
        """
        GET requests to Person will attempt to retrieve a person with the given id
         and return the information associated with it.
        :param person_id: The ID (primary key in database) of person entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         person, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT * FROM persons WHERE id=(%s)"""
        response = db_query(query_string, (person_id,))

        if response is None or len(response) == 0:  # Indicate if person doesn't exist
            return make_response(jsonify({"Person GET error. Provided ID does not exist ": person_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'first_name', 'last_name', 'contact_email', 'pronoun', 'title', 'work_city', 'work_state',
                  'linkedin', 'user_id']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def put(self, person_id):
        """
        PUT requests to Person will update the provided fields for a person
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param person_id: The ID (primary key in database) of person entry to update
        :return: An HTTP code indicating success (200 if no new values provided and
         201 on successful update) or failure (404), along with a JSON object of
         the new database entry.
        """

        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're updating
        query_args_values = list()  # Values for the columns we're updating

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:  # Only update if values were provided
            return make_response(jsonify({"Person PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE persons SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(person_id)  # Don't forget the person_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if response is None:  # If a query error occurs, None is returned (bad user_id)
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        new_entry = db_query("SELECT * FROM persons WHERE id=(%s)", (person_id,))  # Return new entry

        if len(new_entry) == 0:  # Indicate if person with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT person error. ID doesn't exist": person_id}), 404)

        fields = ['id', 'first_name', 'last_name', 'contact_email', 'pronoun', 'title', 'work_city', 'work_state',
                  'linkedin', 'user_id']
        to_return = response_to_dict(new_entry, fields)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, person_id):
        """
        DELETE requests to Person will delete the persons table entry within the
         database that is associated with the provided key.

        :param person_id: The ID (primary key in database) of person entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the person with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM persons WHERE id=(%s)"""
        response = db_execute(query_string, (person_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no person exists with the given id
            return make_response(jsonify({"Person delete error": person_id}), 404)

        return make_response(jsonify({"Person delete success": person_id}), 200)  # Indicate success


# Expose blueprint for api.py
person_api = Blueprint("resources.person", __name__)

# Add resources to api
api = Api(person_api)

# resource, route, endpoint
api.add_resource(
    PersonList,
    "/api/persons",
    endpoint="persons")

api.add_resource(
    Person,
    "/api/person/<person_id>",
    endpoint="person")
