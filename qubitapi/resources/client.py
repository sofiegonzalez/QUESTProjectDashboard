from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_query, db_execute, response_to_dict  # Needed for database querying, and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Client fields: id, person_id, corporation_id. Note that id is assigned by database
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('corporation_id', location=['json', 'form', 'args'], dest="corporation_id")
parser.add_argument('person_id', location=['json', 'form', 'args'], dest="person_id")


class ClientList(Resource):
    """
    ClientList handles GET requests for listing all clients of the system
     and POST requests to create a client within the system
    """
    def get(self):
        """
        GET requests to ClientList will return a list of all persons of the system
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
            query_string = """SELECT id, corporation_id, person_id FROM clients"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = "SELECT id, corporation_id, person_id FROM clients WHERE " + query_args_string
            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'corporation_id', 'person_id']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to ClientList will attempt to add a client to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Adjust parser for POST (person_id and corporation_id required by database)
        post_parser = parser.copy()
        post_parser.replace_argument('corporation_id', type=int, location=['json', 'form'],
                                     dest="corporation_id", required=True)
        post_parser.replace_argument('person_id', location=['json', 'form'], dest="person_id", required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:  # Don't need to check for missing arguments since all arguments are required
            query_args.append(argument)
            query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO clients (" + query_args_string + ") VALUES (%s)" % (
            ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT id, corporation_id, person_id FROM clients WHERE id=(%s)", (assigned_id,))
        return make_response(jsonify(response_to_dict(new_entry, ["id", "corporation_id", "person_id"])), 201)


class Client(Resource):
    """
    Client handles GET, PUT, and DELETE requests for a specific client.
     The id is provided in the url as /api/client/<id>
    """

    def get(self, client_id):
        """
        GET requests to Client will attempt to retrieve a client with the given id
         and return the information associated with it.
        :param client_id: The ID (primary key in database) of client entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         client, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT id, corporation_id, person_id FROM clients WHERE id=(%s)"""
        response = db_query(query_string, (client_id,))

        if response is None or len(response) == 0:  # Indicate if client doesn't exist
            return make_response(jsonify({"Client GET error. Provided ID does not exist ": client_id}), 404)

        return make_response(jsonify(response_to_dict(response, ["id", "corporation_id", "person_id"])), 200)

    @jwt_required
    def put(self, client_id):
        """
        PUT requests to Client will update the provided fields for a client
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param client_id: The ID (primary key in database) of client entry to update
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
            return make_response(jsonify({"Client PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE clients SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(client_id)  # Don't forget the client_id for WHERE
        result = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if result is None:  # If a query error occurs, None is returned (bad id provided)
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        new_entry = db_query("SELECT id, corporation_id, person_id FROM clients WHERE id=(%s)", (client_id,))  # Return new entry

        if len(new_entry) == 0:  # Indicate if client with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT client error. ID doesn't exist": client_id}), 404)

        return make_response(jsonify(response_to_dict(new_entry, ['id', 'corporation_id', 'person_id'])), 201)

    @jwt_required
    def delete(self, client_id):
        """
        DELETE requests to Client will delete the clients table entry within the
         database that is associated with the provided key.

        :param client_id: The ID (primary key in database) of client entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the client with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM clients WHERE id=(%s)"""
        response = db_execute(query_string, (client_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no client exists with the given id
            return make_response(jsonify({"Client delete error": client_id}), 404)

        return make_response(jsonify({"Client delete success": client_id}), 200)  # Indicate success


# Expose blueprint for api.py
client_api = Blueprint("resources.client", __name__)

# Add resources to api
api = Api(client_api)

# resource, route, endpoint
api.add_resource(
    ClientList,
    "/api/clients",
    endpoint="clients")

api.add_resource(
    Client,
    "/api/client/<client_id>",
    endpoint="client")
