from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from ast import literal_eval
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict  # Needed for database querying, and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# team fields: id, name, semester, course. Note that database automatically assigns id
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('name', location=['json', 'form', 'args'])  # type defaults to str
parser.add_argument('semester', location=['json', 'form', 'args'])
parser.add_argument('course', location=['json', 'form', 'args'])
parser.add_argument('ta_ids', action='append', location=['json', 'form', 'args'])
parser.add_argument('questee_ids', action='append', location=['json', 'form', 'args'])


class TeamList(Resource):
    """
    TeamList handles GET requests for listing all teams of the system
     and POST requests to create a team within the system
    """

    def get(self):
        """
        GET requests to TeamList will return a list of all persons of the system
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
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            GROUP by id
            """
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional

        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = """
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            WHERE """ + query_args_string + """
            GROUP by id """

            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
        to_return = response_to_dict(response, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to TeamList will attempt to add a team to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Configure parser for POST (all fields required by database)
        post_parser = parser.copy()
        post_parser.replace_argument('name', location=['json', 'form'], required=True)
        post_parser.replace_argument('semester', location=['json', 'form'], required=True)
        post_parser.replace_argument('course', location=['json', 'form'], required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:  # Don't need to check for missing arguments since all arguments are required
            if argument == 'ta_ids' or argument == 'questee_ids':
                continue
            query_args.append(argument)
            query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO teams (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))
        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects (%s) values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Handle linking tables
        if args['ta_ids'] is not None:
            for ta_id in args['ta_ids']:
                try:
                    ta_id = int(ta_id)
                except ValueError:
                    # provided something other than an id, ignore
                    continue
                if (check_ta_id(ta_id)):
                    query_string = "INSERT INTO tas_teams_rel (ta_id, team_id) VALUES (%s, %s)"
                    db_execute(query_string, (ta_id, assigned_id))

        if args['questee_ids'] is not None:
            for questee_id in args['questee_ids']:
                try:
                    questee_id = int(questee_id)
                except ValueError:
                    # provided something other than an id, ignore
                    continue
                if (check_questee_id(questee_id)):
                    query_string = "INSERT INTO questees_teams_rel (questee_id, team_id) VALUES (%s, %s)"
                    db_execute(query_string, (questee_id, assigned_id))

        # Return new entry
        new_entry = db_query("""
        SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
        FROM teams 
        LEFT OUTER JOIN questees_teams_rel 
        ON teams.id=questees_teams_rel.team_id 
        LEFT OUTER JOIN tas_teams_rel
        ON teams.id=tas_teams_rel.team_id
        WHERE teams.id=(%s)
        GROUP by id
        """, (assigned_id,))
        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 201)


class Team(Resource):
    """
    Team handles GET, PUT, and DELETE requests for a specific team.
     The id is provided in the url as /api/team/<id>
    """

    def get(self, team_id):
        """
        GET requests to Team will attempt to retrieve a team with the given id
         and return the information associated with it.
        :param team_id: The ID (primary key in database) of team entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         team, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            WHERE teams.id=(%s)
            GROUP by id
            """
        response = db_query(query_string, (team_id,))

        if response is None or len(response) == 0:  # Indicate if team doesn't exist
            return make_response(jsonify({"Team GET error. Provided ID does not exist ": team_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
        to_return = response_to_dict(response, fields)
        to_return = cleanup_joined_response(to_return)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def put(self, team_id):
        """
        PUT requests to Team will update the provided fields for a team
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param team_id: The ID (primary key in database) of team entry to update
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
            return make_response(jsonify({"Team PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE teams SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(team_id)  # Don't forget the team_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if response is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("""
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            WHERE teams.id=(%s)
            GROUP by id
            """, (team_id,))

        if len(new_entry) == 0:  # Indicate if team with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT team error. ID doesn't exist": team_id}), 404)

        fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, team_id):
        """
        DELETE requests to Team will delete the teams table entry within
         the database that is associated with the provided key.
        :param team_id: The ID (primary key in database) of team entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the team with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM teams WHERE id=(%s)"""
        response = db_execute(query_string, (team_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no team exists with the given id
            return make_response(jsonify({"Team delete error": team_id}), 404)

        return make_response(jsonify({"Team delete success": team_id}), 200)  # Indicate success


class TeamTa(Resource):
    """
    TeamTa handles the linking table between the Team and Ta resources
    defining POST and DELETE endpoints to manage relationships
    """

    @jwt_required
    def post(self, team_id, ta_id):
        """
        POST requests to TeamTa will attempt to add a relationship between the supplied team and ta
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
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            WHERE teams.id=(%s)
            GROUP by id
            """, (team_id,))

            if len(new_entry) == 0:  # Indicate if team with given id doesn't exist (no update has taken place)
                return make_response(jsonify({"POST TeamTa error. ID doesn't exist": team_id}), 404)

            fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
            to_return = response_to_dict(new_entry, fields)
            to_return = cleanup_joined_response(to_return)
            return make_response(jsonify(to_return), 201)

        else:
            return make_response(
                jsonify({"Post Failure, team or ta does not exist": {"team_id": team_id, "ta_id": ta_id}}), 404)

    @jwt_required
    def delete(self, team_id, ta_id):
        """
        DELETE requests to TeamTa will remove the relationship between the
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
            return make_response(jsonify({"TeamTa relation delete error": {"team_id": team_id, "ta_id": ta_id}}), 404)

        return make_response(jsonify({"TeamTa relation delete success": {"team_id": team_id, "ta_id": ta_id}}),
                             200)  # Indicates success


class TeamQuestee(Resource):
    """
    TeamTa handles the linking table between the Team and Ta resources
    defining POST and DELETE endpoints to manage relationships
    """

    @jwt_required
    def post(self, team_id, questee_id):
        """
        POST requests to TeamQuestee will attempt to add a relationship between the supplied team and Questee
         with the information provided within the url request path
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the Team entry on success, or an error message on
         failure.
        """

        if check_questee_id(questee_id) and check_team_id(team_id):
            exists = db_query("SELECT * from questees_teams_rel WHERE questee_id = %s AND team_id = %s",
                              (questee_id, team_id))
            if len(exists) == 0:
                query_string = """INSERT INTO questees_teams_rel (questee_id, team_id) VALUES (%s, %s)"""
                db_execute(query_string, (questee_id, team_id))

            new_entry = db_query("""
            SELECT id, name, semester, course, JSON_ARRAYAGG(ta_id) as ta_ids, JSON_ARRAYAGG(questee_id) AS questee_ids 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel 
            ON teams.id=questees_teams_rel.team_id 
            LEFT OUTER JOIN tas_teams_rel
            ON teams.id=tas_teams_rel.team_id
            WHERE teams.id=(%s)
            GROUP by id
            """, (team_id,))

            if len(new_entry) == 0:  # Indicate if team with given id doesn't exist (no update has taken place)
                return make_response(jsonify({"POST TeamQuestee error. ID doesn't exist": team_id}), 404)

            fields = ['id', 'name', 'semester', 'course', 'ta_ids', 'questee_ids']
            to_return = response_to_dict(new_entry, fields)
            to_return = cleanup_joined_response(to_return)
            return make_response(jsonify(to_return), 201)

        else:
            return make_response(
                jsonify({"Post Failure, team or ta does not exist": {"team_id": team_id, "queste_id": questee_id}}),
                404)

    @jwt_required
    def delete(self, team_id, questee_id):
        """
        DELETE requests to TeamQuestee will remove the relationship between the
        supplied team_id and questee_id
        :param team_id: The ID (primary key in database) of team entry to delete
        :param questee_id: The ID (primary key in database) of ta entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the team with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM questees_teams_rel WHERE questee_id=(%s) AND team_id=(%s)"""
        response = db_execute(query_string, (questee_id, team_id))

        if response == 0:
            return make_response(
                jsonify({"TeamTa relation delete error": {"team_id": team_id, "questee_id": questee_id}}), 404)

        return make_response(
            jsonify({"TeamTa relation delete success": {"team_id": team_id, "questee_id": questee_id}}),
            200)  # Indicates success


def check_questee_id(id_in):
    query_string = """SELECT * FROM questees WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False


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
    for team in to_return:
        team['ta_ids'] = literal_eval(team['ta_ids'].replace(', null', '').replace('null, ', '').replace('null', ''))
        team['ta_ids'] = list(set(team['ta_ids']))
        team['questee_ids'] = literal_eval(
            team['questee_ids'].replace(', null', '').replace('null, ', '').replace('null', ''))
        team['questee_ids'] = list(set(team['questee_ids']))
    return to_return


# Expose blueprint for api.py
team_api = Blueprint("resources.team", __name__)

# Add resources to api
api = Api(team_api)

# resource, route, endpoint
api.add_resource(
        TeamList,
        "/api/teams",
        endpoint="teams")

api.add_resource(
        Team,
        "/api/team/<team_id>",
        endpoint="team")

api.add_resource(
        TeamTa,
        "/api/team/<team_id>/ta/<ta_id>",
        endpoint="team_to_ta")

api.add_resource(
        TeamQuestee,
        "/api/team/<team_id>/questee/<questee_id>",
        endpoint="team_to_questee")