from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from ast import literal_eval
from .query import db_execute, db_query, response_to_dict  # Needed for database querying, and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# ta fields: id, course, semester, office_hours, office, questee_id. Note that id
# is automatically assigned by database
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('course', location=['json', 'form', 'args'])  # type defaults to str
parser.add_argument('semester', location=['json', 'form', 'args'])
parser.add_argument('office_hours', location=['json', 'form', 'args'])
parser.add_argument('office', location=['json', 'form', 'args'])
parser.add_argument('questee_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('team_ids', action='append', location=['json', 'form', 'args'])

class TAList(Resource):
    """
    TAList handles GET requests for listing all TAs of the system
     and POST requests to create a TA within the system
    """

    def get(self):
        """
        GET requests to TAList will return a list of all persons of the system
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
            query_string = """
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            GROUP BY id
            """
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = """
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            WHERE """ + query_args_string + """
            GROUP BY id
            """
            print("query string: " + query_string)
            print("query values: " + str(query_args_values))
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'course', 'semester', 'office_hours', 'office', 'questee_id', 'team_ids']
        to_return = response_to_dict(response, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 200)

    def post(self):
        """
        POST requests to TAList will attempt to add a TA to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """
        # Configure parser for POST (update fields that are required in the database)
        post_parser = parser.copy()
        post_parser.replace_argument('questee_id', type=int, location=['json', 'form'], dest="questee_id",
                                     required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if argument == 'team_ids':
                continue
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument)
                query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO tas (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Handle linking tables
        if args['team_ids'] is not None:
            for team_id in args['team_ids']:
                try:
                    team_id = int(team_id)
                except ValueError:
                    # provided something other than an id, ignore
                    continue
                if(check_team_id(team_id)):
                    query_string = "INSERT INTO tas_teams_rel (ta_id, team_id) VALUES (%s, %s)"
                    db_execute(query_string, (assigned_id, team_id))

        # Return new entry
        new_entry = db_query("""
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            WHERE tas.id=(%s)
            GROUP BY id
            """,
            (assigned_id,))

        
        fields = ['id', 'course', 'semester', 'office_hours', 'office', 'questee_id', 'team_ids']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)
        return make_response(jsonify(to_return), 201)


class TA(Resource):
    """
    TA handles GET, PUT, and DELETE requests for a specific TA.
     The id is provided in the url as /api/ta/<id>
    """
    def get(self, ta_id):
        """
        GET requests to TA will attempt to retrieve a TA with the given id
         and return the information associated with it.
        :param ta_id: The ID (primary key in database) of ta entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         ta, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            WHERE tas.id=(%s)
            GROUP BY id
            """
        response = db_query(query_string, (ta_id,))

        if response is None or len(response) == 0:  # Indicate if ta doesn't exist
            return make_response(jsonify({"TA GET error. Provided ID does not exist ": ta_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'course', 'semester', 'office_hours', 'office', 'questee_id', 'team_ids']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)

    def put(self, ta_id):
        """
        PUT requests to TA will update the provided fields for a TA
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param ta_id: The ID (primary key in database) of ta entry to update
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
            return make_response(jsonify({"TA PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE tas SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(ta_id)  # Don't forget the ta_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if response is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("""
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            WHERE tas.id=(%s)
            GROUP BY id
            """, (ta_id,))

        if len(new_entry) == 0:  # Indicate if ta with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT TA error. ID doesn't exist": ta_id}), 404)

        fields = ['id', 'course', 'semester', 'office_hours', 'office', 'questee_id', 'team_ids']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)
        return make_response(jsonify(to_return), 201)

    def delete(self, ta_id):
        """
        DELETE requests to TA will delete the TA table entry within
         the database that is associated with the provided key.
        :param ta_id: The ID (primary key in database) of TA entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the ta with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM tas WHERE id=(%s)"""
        response = db_execute(query_string, (ta_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no TA exists with the given id
            return make_response(jsonify({"TA delete error": ta_id}), 404)

        return make_response(jsonify({"TA delete success": ta_id}), 200)  # Indicate success

class TaTeam(Resource):
    """
    TaTeam handles the linking table between the Team and Ta resources
    defining POST and DELETE endpoints to manage relationships
    """
    def post(self, ta_id, team_id):
        """
        POST requests to TaTeam will attempt to add a relationship between the supplied team and ta
         with the information provided within the url request path
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the Team entry on success, or an error message on
         failure.
        """
        
        if check_ta_id(ta_id) and check_team_id(team_id):
            exists = db_query("SELECT * from tas_teams_rel WHERE ta_id = %s AND team_id = %s", (ta_id, team_id))
            if len(exists) == 0:
                query_string = """INSERT INTO tas_teams_rel (ta_id, team_id) VALUES (%s, %s)"""
                db_execute(query_string, (ta_id, team_id))

            new_entry = db_query("""
            SELECT id, course, semester, office_hours, office, questee_id, JSON_ARRAYAGG(team_id) as team_ids
            FROM tas
            LEFT OUTER JOIN tas_teams_rel
            ON tas.id=tas_teams_rel.ta_id
            WHERE tas.id=(%s)
            GROUP BY id
            """, (ta_id,))

            if len(new_entry) == 0:  # Indicate if ta with given id doesn't exist (no update has taken place)
                return make_response(jsonify({"POST TaTeam error. ID doesn't exist": ta_id}), 404)

            fields = ['id', 'course', 'semester', 'office_hours', 'office', 'questee_id', 'team_ids']
            to_return = response_to_dict(new_entry, fields)
            to_return = cleanup_joined_response(to_return)
            return make_response(jsonify(to_return), 201)

        else:
            return make_response(jsonify({"Post Failure, team or ta does not exist":{"team_id": team_id, "ta_id": ta_id}}), 404)

        

    def delete(self, ta_id, team_id):
        """
        DELETE requests to TaTeam will remove the relationship between the
        supplied team_id and ta_id
        :param team_id: The ID (primary key in database) of team entry to delete
        :param ta_id: The ID (primary key in database) of ta entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the team with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM tas_teams_rel WHERE team_id=(%s) AND ta_id=(%s)"""
        response = db_execute(query_string, (team_id, ta_id))

        if response == 0:
            return make_response(jsonify({"TaTeam relation delete error":{"team_id": team_id, "ta_id": ta_id}}), 404)

        return make_response(jsonify({"TaTeam relation delete success": {"team_id": team_id, "ta_id": ta_id}}), 200) # Indicates success

def check_ta_id(id_in):
    query_string = """SELECT * FROM tas WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False

def check_team_id(id_in):
    query_string = """SELECT * FROM teams WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False

def cleanup_joined_response(to_return):
    for ta in to_return:
        ta['team_ids'] = literal_eval(ta['team_ids'].replace(', null', '').replace('null, ', '').replace('null', ''))
        ta['team_ids'] = list(set(ta['team_ids']))

    return to_return

# Expose blueprint for api.py
ta_api = Blueprint("resources.ta", __name__)

# Add resources to api
api = Api(ta_api)

# resource, route, endpoint
api.add_resource(
    TAList,
    "/api/tas",
    endpoint="tas")

api.add_resource(
    TA,
    "/api/ta/<ta_id>",
    endpoint="ta")

api.add_resource(
    TaTeam,
    "/api/ta/<ta_id>/team/<team_id>",
    endpoint="ta_to_team"
)