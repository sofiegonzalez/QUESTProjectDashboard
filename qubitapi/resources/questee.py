from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict  # Needed for database querying, and response formatting
from ast import literal_eval    # Needed to clean the 'null' entries from join queries

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# QUESTee fields: id, major, major2, grad_status, involved, areas_of_expertise,
# past_internships, quest_clubs, resume_id, person_id, cohort_id. Note that id
# is automatically assigned in the database when creating an entry

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('major', location=['json', 'form', 'args'])  # type defaults to str
parser.add_argument('major2', location=['json', 'form', 'args'])
parser.add_argument('grad_status', location=['json', 'form', 'args'])
parser.add_argument('uid', location=['json', 'form', 'args'])
parser.add_argument('involved', location=['json', 'form', 'args'])
parser.add_argument('areas_of_expertise', action='split', location=['json', 'form', 'args'])
parser.add_argument('past_internships', action='split', location=['json', 'form', 'args'])
parser.add_argument('quest_clubs', action='split', location=['json', 'form', 'args'])
parser.add_argument('cohort_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('resume_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('person_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('team_id', action='append', location=['json', 'form', 'args'])


class QUESTeeList(Resource):
    """
    QUESTeeList handles GET requests for listing all questees of the system
     and POST requests to create a questee within the system
    """

    def get(self):
        """
        GET requests to QUESTeeList will return a list of all persons of the system
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
            query_string = """SELECT id, major, major2, grad_status, uid, involved, areas_of_expertise, 
            past_internships, quest_clubs, resume_id, person_id, cohort_id, JSON_ARRAYAGG(team_id) as team_ids 
            FROM questees LEFT OUTER JOIN questees_teams_rel ON questees.id=questees_teams_rel.questee_id 
            GROUP by id;"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional
        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = """SELECT id, major, major2, grad_status, uid, involved, areas_of_expertise, 
            past_internships, quest_clubs, resume_id, person_id, cohort_id, JSON_ARRAYAGG(team_id) as team_ids 
            FROM questees LEFT OUTER JOIN questees_teams_rel ON questees.id=questees_teams_rel.questee_id 
             WHERE """ + query_args_string + """ GROUP by id """
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'major', 'major2', 'grad_status', 'uid', 'involved', 'areas_of_expertise', 'past_internships',
                  'quest_clubs', 'resume_id','person_id', 'cohort_id', 'team_ids']
        to_return = response_to_dict(response, fields)

        clean = clean_up_joined(to_return)

        return make_response(jsonify(clean), 200)

    # TODO: (For POST) Make resume_id required when resume is implemented.
    @jwt_required
    def post(self):
        """
        POST requests to QUESTeeList will attempt to add a questee to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        # Configure parser for POST (update fields that are required in the database)
        post_parser = parser.copy()
        post_parser.replace_argument('major', location=['json', 'form'], required=True)
        post_parser.replace_argument('grad_status', location=['json', 'form'], required=True)
        post_parser.replace_argument('cohort_id', type=int, location=['json', 'form'], required=True)
        post_parser.replace_argument('person_id', type=int, location=['json', 'form'], required=True)

        args = post_parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if argument == 'team_id':  # Handle relational table in different query
                continue
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument)
                query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO questees (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))
        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects (%s) values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Handle relational table (questees to teams). Unlikely this will be known at questee creation though.
        # if a list of teams is passed in this will add a relation for each of the teams
        # parser above assumes that team_id arg will be passed in as a list
        if args['team_id'] is not None:
            for i in args['team_id']:
                check = check_team_id(i)  # check if the team_id is valid
                if check:
                    relation_str = "INSERT INTO questees_teams_rel (questee_id, team_id) VALUES (%s, %s)"
                    db_execute(relation_str, (assigned_id, i))
                else:
                    return make_response(jsonify({"An error occurred": "Not all team_ids were valid"}), 404)

        # Return new entry
        new_entry = db_query("""SELECT id, major, major2, grad_status, uid, involved, areas_of_expertise, 
                            past_internships, quest_clubs, resume_id, person_id, cohort_id, JSON_ARRAYAGG(team_id) as team_ids 
                            FROM questees LEFT OUTER JOIN questees_teams_rel ON questees.id=questees_teams_rel.questee_id 
                            WHERE id = (%s) GROUP by id;""", (assigned_id,))

        fields = ['id', 'major', 'major2', 'grad_status', 'uid', 'involved', 'areas_of_expertise', 'past_internships',
                  'quest_clubs', 'resume_id', 'person_id', 'cohort_id', 'team_ids']

        to_return = response_to_dict(new_entry, fields)

        clean = clean_up_joined(to_return)

        return make_response(jsonify(clean), 201)


class QUESTee(Resource):
    """
    QUESTee handles GET, PUT, and DELETE requests for a specific questee.
     The id is provided in the url as /api/questee/<id>
    """

    def get(self, questee_id):
        """
        GET requests to QUESTee will attempt to retrieve a questee with the given id
         and return the information associated with it.
        :param questee_id: The ID (primary key in database) of questee entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         questee, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT id, major, major2, grad_status, uid, involved, areas_of_expertise, 
                            past_internships, quest_clubs, resume_id, person_id, cohort_id, JSON_ARRAYAGG(team_id) as team_ids 
                            FROM questees LEFT OUTER JOIN questees_teams_rel ON questees.id=questees_teams_rel.questee_id 
                            WHERE id = (%s) GROUP by id;"""
        response = db_query(query_string, (questee_id,))

        if response is None or len(response) == 0:  # Indicate if questee doesn't exist
            return make_response(jsonify({"Questee GET error. Provided ID does not exist ": questee_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'major', 'major2', 'grad_status', 'uid', 'involved', 'areas_of_expertise', 'past_internships',
                  'quest_clubs', 'resume_id', 'person_id', 'cohort_id', 'team_ids']
        to_return = response_to_dict(response, fields)

        clean = clean_up_joined(to_return)

        return make_response(jsonify(clean), 200)

    @jwt_required
    def put(self, questee_id):
        """
        PUT requests to QUESTee will update the provided fields for a questee
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param questee_id: The ID (primary key in database) of questee entry to update
        :return: An HTTP code indicating success (200 if no new values provided and
         201 on successful update) or failure (404), along with a JSON object of
         the new database entry.
        """

        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're updating
        query_args_values = list()  # Values for the columns we're updating

        for argument in args:
            if argument == 'team_id':  # Handle relational table in different query
                continue
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0 and args['team_id'] is None:  # Only update if values were provided
            return make_response(jsonify({"Questee PUT": "No new values provided"}), 200)
        elif len(query_args) > 0:  # Team_id provided, but nothing else
            query_args_string = ', '.join(query_args)  # Convert column list to formatted string
            query_string = "UPDATE questees SET " + query_args_string + " WHERE id=(%s)"
            query_args_values.append(questee_id)  # Don't forget the questee_id for WHERE
            response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple
            if response is None:  # If a query error occurs, None is returned
                return make_response(jsonify({"An error occurred": "Ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("SELECT * FROM questees WHERE id=(%s)", (questee_id,))

        if len(new_entry) == 0:  # Indicate if questee with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT questee error. ID doesn't exist": questee_id}), 404)

        query_string = """SELECT id, major, major2, grad_status, uid, involved, areas_of_expertise, 
                    past_internships, quest_clubs, resume_id, person_id, cohort_id, JSON_ARRAYAGG(team_id) as team_ids 
                    FROM questees LEFT OUTER JOIN questees_teams_rel ON questees.id=questees_teams_rel.questee_id 
                    WHERE id = (%s) GROUP by id;"""
        new_entry = db_query(query_string, (questee_id,))

        fields = ['id', 'major', 'major2', 'grad_status', 'uid', 'involved', 'areas_of_expertise',
                  'past_internships', 'quest_clubs', 'resume_id', 'person_id', 'cohort_id', 'team_ids']
        to_return = response_to_dict(new_entry, fields)

        clean = clean_up_joined(to_return)

        return make_response(jsonify(clean), 201)

    @jwt_required
    def delete(self, questee_id):
        """
        DELETE requests to QUESTee will delete the questees table entry within
         the database that is associated with the provided key.
        :param questee_id: The ID (primary key in database) of questee entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the questee with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM questees WHERE id=(%s)"""
        response = db_execute(query_string, (questee_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no questee exists with the given id
            return make_response(jsonify({"Questee delete error": questee_id}), 404)

        return make_response(jsonify({"Questee delete success": questee_id}), 200)  # Indicate success


class QUESTeeToTeam(Resource):
    """
    QUESTee_to_team will handle the relationship table questee_to_team_rel
    This contains post and delete for relationships, updating relationships is handled by deleting the old and
    adding the new relationship
    """

    @jwt_required
    def push(self, questee_id, team_id):
        """
        Add a relationship of relationships to the table using a list of teams to be liked to.
        :param: The database ID of the QUESTee being linked to a team/teams
        :return: An HTTP code indicating success(201) or failure(404) along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        query_string = """INSERT (questee_id, team_it) INTO questees_teams_rel VALUES (%s, %s) """

        team_check = check_team_id(team_id)
        questee_check = check_questee_id(questee_id)
        if team_check and questee_check:

            exists = db_query("""SELECT * FROM questees_teams_rel WHERE questee_id = %s AND team_id = %s""",
                              (questee_id, team_id))

            if len(exists) == 0:
                db_execute(query_string, (questee_id, team_id))

            new_entry = db_query("""SELECT id, name, semester, course, JSON_ARRAYAGG(team_id) as team_ids, 
            FROM teams 
            LEFT OUTER JOIN questees_teams_rel
            ON teams.id=questees_teams_rel.team_id
            WHERE teams.id=(%s)
            GROUP by id""", (team_id,))

            if len(new_entry) == 0:  # Indicate if team with given id doesn't exist (no update has taken place)
                return make_response(jsonify({"POST TeamQuestee error. ID doesn't exist": team_id}), 404)

            fields = ['id', 'name', 'semester', 'course', 'team_ids']
            to_return = response_to_dict(new_entry, fields)
            to_return = clean_up_joined(to_return)
            return make_response(jsonify(to_return), 201)

        else:
            return make_response(jsonify({"One or more of your ids were invalid": questee_id}), 404)

    @jwt_required
    def delete(self, questee_id, team_id):
        """
               DELETE requests to QuesteeToTeam will remove the relationship between the
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
                jsonify({"TeamQUESTee relation delete error": {"team_id": team_id, "questee_id": questee_id}}), 404)

        return make_response(
            jsonify({"TeamQUESTee relation delete success": {"team_id": team_id, "questee_id": questee_id}}),
            200)  # Indicates success


def check_questee_id(id_in):
    query_string = """SELECT * FROM questees WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False


def clean_up_joined(to_return):
    for team in to_return:
        if team['team_ids'] is not None:
            team['team_ids'] = literal_eval(team['team_ids'].replace(', null', '').replace('null, ', '').replace('null', ''))
            team['team_ids'] = list(set(team['team_ids']))
    return to_return


def check_team_id(id_in):
    query_string = """SELECT * FROM teams WHERE id = (%s)"""

    response = db_query(query_string, (id_in,))

    if response is not None:
        return True
    else:
        return False

# Expose blueprint for api.py
QUESTee_api = Blueprint("resources.questee", __name__)

# Add resources to api
api = Api(QUESTee_api)

# resource, route, endpoint
api.add_resource(
    QUESTeeList,
    "/api/questees",
    endpoint="questees")

api.add_resource(
    QUESTee,
    "/api/questee/<questee_id>",
    endpoint="questee")

api.add_resource(
    QUESTeeToTeam,
    "/api/questee/<questee_id>/team/<team_id>",
    endpoint="questee_to_team")
