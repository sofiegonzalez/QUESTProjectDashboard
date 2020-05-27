from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict # Needed for database querying, and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# corporation fields: id, name, website, description. Note that database automatically assigns id
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('name', location=['json', 'form', 'args'])  # type defaults to str
parser.add_argument('website', location=['json', 'form', 'args'])
parser.add_argument('description', location=['json', 'form', 'args'])


class CorporationList(Resource):
    """
    CorporationList handles GET requests for listing all corporations of the system
     and POST requests to create a corporation within the system
    """
    def get(self):
        """
        GET requests to CorporationList will return a list of all persons of the system
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
            query_string = """SELECT * FROM corporations"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = "SELECT * FROM corporations WHERE " + query_args_string
            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'website', 'description']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    # TODO: Update parser if one of the fields becomes not null
    def post(self):
        """
        POST requests to CorporationList will attempt to add a corporation to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Configure parser for POST (all fields required by database)
        # post_parser = parser.copy()
        # post_parser.replace_argument('name', location=['json', 'form'], required=True)

        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument)
                query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO corporations (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))
        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects (%s) values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT * FROM corporations WHERE id=(%s)", (assigned_id,))
        fields = ['id', 'name', 'website', 'description']
        to_return = response_to_dict(new_entry, fields)
        return make_response(jsonify(to_return), 201)


class Corporation(Resource):
    """
    Corporation handles GET, PUT, and DELETE requests for a specific corporation.
     The id is provided in the url as /api/corporation/<id>
    """
    def get(self, corporation_id):
        """
        GET requests to Corporation will attempt to retrieve a corporation with the given id
         and return the information associated with it.
        :param corporation_id: The ID (primary key in database) of corporation entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         corporation, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT * FROM corporations WHERE id=(%s)"""
        response = db_query(query_string, (corporation_id,))

        if response is None or len(response) == 0:  # Indicate if corporation doesn't exist
            return make_response(jsonify({"Corporation GET error. Provided ID does not exist ": corporation_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'website', 'description']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def put(self, corporation_id):
        """
        PUT requests to Corporation will update the provided fields for a corporation
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param corporation_id: The ID (primary key in database) of corporation entry to update
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
            return make_response(jsonify({"Corporation PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE corporations SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(corporation_id)  # Don't forget the corporation_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if response is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT * FROM corporations WHERE id=(%s)", (corporation_id,))

        if len(new_entry) == 0:  # Indicate if corporation with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT corporation error. ID doesn't exist": corporation_id}), 404)

        fields = ['id', 'name', 'website', 'description']
        to_return = response_to_dict(new_entry, fields)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, corporation_id):
        """
        DELETE requests to Corporation will delete the corporations table entry within
         the database that is associated with the provided key.
        :param corporation_id: The ID (primary key in database) of corporation entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the corporation with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM corporations WHERE id=(%s)"""
        response = db_execute(query_string, (corporation_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no corporation exists with the given id
            return make_response(jsonify({"Corporation delete error": corporation_id}), 404)

        return make_response(jsonify({"Corporation delete success": corporation_id}), 200)  # Indicate success


# Expose blueprint for api.py
corporation_api = Blueprint("resources.corporation", __name__)

# Add resources to api
api = Api(corporation_api)

# resource, route, endpoint
api.add_resource(
    CorporationList,
    "/api/corporations",
    endpoint="corporations")

api.add_resource(
    Corporation,
    "/api/corporation/<corporation_id>",
    endpoint="corporation")
