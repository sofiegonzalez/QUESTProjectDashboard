from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_query,db_execute,response_to_dict # Needed for database querying, and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Cohort fields: id, number, year - id is automatically assigned when creating Cohort
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('number', type=int, location=['json', 'form', 'args'])
parser.add_argument('year', type=int, location=['json', 'form', 'args'])


class CohortList(Resource):
    """
    CohortList handles GET requests for listing all cohorts of the system
     and POST requests to create a cohort within the system
    """
    def get(self):
        """
        GET requests to CohortList will return a list of all persons of the system
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
            query_string = """SELECT * FROM cohorts"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = "SELECT * FROM cohorts WHERE " + query_args_string
            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'number', 'year']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to CohortList will attempt to add a cohort to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Adjust parser for POST (number and year required by database)
        post_parser = parser.copy()
        post_parser.replace_argument('number', type=int, location=['json', 'form'], required=True)
        post_parser.replace_argument('year', location=['json', 'form'], required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:  # Don't need to check for missing arguments since all arguments are required
            query_args.append(argument)
            query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO cohorts (" + query_args_string + ") VALUES (%s)" % (
            ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT * FROM cohorts WHERE id=(%s)", (assigned_id,))
        return make_response(jsonify(response_to_dict(new_entry, ['id', 'number', 'year'])), 201)


class Cohort(Resource):
    """
    Cohort handles GET, PUT, and DELETE requests for a specific cohort.
     The id is provided in the url as /api/cohort/<id>
    """
    def get(self, cohort_id):
        """
        GET requests to Cohort will attempt to retrieve a cohort with the given id
         and return the information associated with it.
        :param cohort_id: The ID (primary key in database) of cohort entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         cohort, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT * FROM cohorts WHERE id=(%s)"""
        response = db_query(query_string, (cohort_id,))

        if response is None or len(response) == 0:  # Indicate if cohort doesn't exist
            return make_response(jsonify({"Cohort GET error. Provided ID does not exist ": cohort_id}), 404)

        return make_response(jsonify(response_to_dict(response, ['id', 'number', 'year'])), 200)

    @jwt_required
    def put(self, cohort_id):
        """
        PUT requests to Cohort will update the provided fields for a cohort
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param cohort_id: The ID (primary key in database) of cohort entry to update
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
            return make_response(jsonify({"Cohort PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE cohorts SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(cohort_id)  # Don't forget the cohort_id for WHERE
        result = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if result is None:  # If a query error occurs, None is returned (bad id provided)
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        new_entry = db_query("SELECT * FROM cohorts WHERE id=(%s)", (cohort_id,))  # Return new entry

        if len(new_entry) == 0:  # Indicate if cohort with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT cohort error. ID doesn't exist": cohort_id}), 404)

        return make_response(jsonify(response_to_dict(new_entry, ['id', 'number', 'year'])), 201)

    @jwt_required
    def delete(self, cohort_id):
        """
        DELETE requests to Cohort will delete the cohorts table entry within the
         database that is associated with the provided key.

        :param cohort_id: The ID (primary key in database) of cohort entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the cohort with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM cohorts WHERE id=(%s)"""
        response = db_execute(query_string, (cohort_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no cohort exists with the given id
            return make_response(jsonify({"Cohort delete error": cohort_id}), 404)

        return make_response(jsonify({"Cohort delete success": cohort_id}), 200)  # Indicate success


# Expose blueprint for api.py
cohort_api = Blueprint("resources.cohort", __name__)

# Add resources to api
api = Api(cohort_api)

# resource, route, endpoint
api.add_resource(
    CohortList,
    "/api/cohorts",
    endpoint="cohorts")

api.add_resource(
    Cohort,
    "/api/cohort/<cohort_id>",
    endpoint="cohort")
