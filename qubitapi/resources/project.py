from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from ast import literal_eval  # Needed for cleaning null entries from query responses
from flask_jwt_extended import jwt_required
from .query import db_execute, db_query, response_to_dict  # Needed for db querying and response formatting

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Project fields: id, name, description, poster_path, project_status, search_tags.
# team_id and client_id are taken from teams(id) and clients(id) respectively
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('name', location=['json', 'form', 'args'])
parser.add_argument('description', location=['json', 'form', 'args'])
parser.add_argument('poster_path', location=['json', 'form', 'args'])
parser.add_argument('project_status', type=int, location=['json', 'form', 'args'])  # TODO: Admin only
parser.add_argument('impact', location=['json', 'form', 'args'])
parser.add_argument('faculty_advisor', location=['json', 'form', 'args'])
parser.add_argument('team_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('client_id', type=int, location=['json', 'form', 'args'])
parser.add_argument('industries', action='append', location=['json', 'form', 'args'])


class ProjectList(Resource):
    """
    ProjectList handles GET requests for listing all projects of the system
     and POST requests to create a project within the system
    """
    def get(self):
        args = parser.parse_args()  # Parse url query if it exists
        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:  # No query attached to URL
            query_string = """SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id GROUP by id;"""
            response = db_query(query_string)  # Python scope is weird. This is visible outside conditional
        else:  # Query string exists in URL
            query_args_string = ' AND '.join(query_args)  # Convert list to formatted string
            query_string = """SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id WHERE """\
                           + query_args_string + " GROUP by id;"
            response = db_query(query_string, tuple(query_args_values))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'description', 'poster_path', 'project_status', 'impact', 'faculty_advisor',
                  'team_id', 'client_id', 'industries']
        response = response_to_dict(response, fields)
        to_return = cleanup_joined_response(response)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        """
        POST requests to ProjectList will attempt to add a project to the system
         with the information provided within the JSON or form body of the request.
        :return: An HTTP code indicating success (201) or failure (404), along with
         a JSON object of the new database entry on success, or an error message on
         failure.
        """

        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're inserting into
        query_args_values = list()  # Values for the columns we're inserting

        for argument in args:
            if argument == 'industries':  # Handle relational table later
                continue
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument)
                query_args_values.append(args[argument])

        query_args_string = ', '.join(query_args)  # Convert list to formatted string
        query_string = "INSERT INTO projects (" + query_args_string + ") VALUES (%s)" % (
                 ', '.join(['%s'] * len(query_args)))

        assigned_id = db_execute(query_string, tuple(query_args_values))  # Query expects (%s) values as a tuple

        if assigned_id is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Handle relational table
        if args['industries'] is not None:
            for industry in args['industries']:
                valid = validate_industry_id(industry)
                if valid is True:  # Only add industry if it exists
                    query_string = "INSERT INTO industries_projects_rel (industry_id, project_id) VALUES (%s, %s)"
                    db_execute(query_string, (industry, assigned_id))

        # Return new entry
        new_query = """SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id WHERE projects.id = (%s) 
            GROUP by id;"""
        new_entry = db_query(new_query, (assigned_id,))

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'description', 'poster_path', 'project_status', 'impact', 'faculty_advisor',
                  'team_id', 'client_id', 'industries']
        response = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(response)
        return make_response(jsonify(to_return), 201)


# Used for a single project
class Project(Resource):
    """
    Project handles GET, PUT, and DELETE requests for a specific project.
     The id is provided in the url as /api/project/<id>
    """
    def get(self, project_id):
        """
        GET requests to Project will attempt to retrieve a project with the given id
         and return the information associated with it.
        :param project_id: The ID (primary key in database) of project entry to retrieve
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object that upon success will contain the values associated with the
         project, or upon failure, a JSON indicating the ID was not associated with
         an entry in the database.
        """

        query_string = """SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id WHERE projects.id = (%s) 
            GROUP by id;"""
        response = db_query(query_string, (project_id,))

        if response is None or len(response) == 0:  # Indicate if project doesn't exist
            return make_response(jsonify({"Project GET error. Provided ID does not exist ": project_id}), 404)

        # Need to convert query response to dictionary for jsonify to work
        fields = ['id', 'name', 'description', 'poster_path', 'project_status', 'impact', 'faculty_advisor',
                  'team_id', 'client_id', 'industries']
        response = response_to_dict(response, fields)
        to_return = cleanup_joined_response(response)

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def put(self, project_id):
        """
        PUT requests to Project will update the provided fields for a project
         with the given id. Fields to be updated are expected (and parsed) from
         JSON or form body of request. Any fields that exist within the database
         but are not provided in the request will be left unchanged.
        :param project_id: The ID (primary key in database) of project entry to update
        :return: An HTTP code indicating success (200 if no new values provided and
         201 on successful update) or failure (404), along with a JSON object of
         the new database entry.
        """

        args = parser.parse_args()  # Parse request to store arguments provided in JSON or form

        query_args = list()  # Columns we're updating
        query_args_values = list()  # Values for the columns we're updating

        for argument in args:
            if argument == "industries":  # Not handled in PUT
                continue
            if args[argument] is not None:  # Arguments not provided will be set to None
                query_args.append(argument + " = (%s)")
                query_args_values.append(args[argument])

        if len(query_args) == 0:  # Only update if values were provided
            return make_response(jsonify({"Project PUT": "No new values provided"}), 200)

        query_args_string = ', '.join(query_args)  # Convert column list to formatted string
        query_string = "UPDATE projects SET " + query_args_string + " WHERE id=(%s)"
        query_args_values.append(project_id)  # Don't forget the project_id for WHERE
        response = db_execute(query_string, tuple(query_args_values))  # Query expects %s values as a tuple

        if response is None:  # If a query error occurs, None is returned
            return make_response(jsonify({"An error occurred": "Please ensure all data is valid and try again"}), 404)

        # Return new entry
        new_entry = db_query("""SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id WHERE projects.id = (%s) 
            GROUP by id""", (project_id,))

        if len(new_entry) == 0:  # Indicate if project with given id doesn't exist (no update has taken place)
            return make_response(jsonify({"PUT projects error. ID doesn't exist": project_id}), 404)

        fields = ['id', 'name', 'description', 'poster_path', 'project_status', 'impact', 'faculty_advisor',
                  'team_id', 'client_id', 'industries']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, project_id):
        """
        DELETE requests to project will delete the project table entry within
         the database that is associated with the provided key.
        :param project_id: The ID (primary key in database) of project entry to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
         a JSON object to indicate the project with the given id was successfully
         (or unsuccessfully) deleted
        """

        query_string = """DELETE FROM projects WHERE id=(%s)"""
        response = db_execute(query_string, (project_id,))  # %s value expected as a tuple

        if response == 0:  # Indicate if no questee exists with the given id
            return make_response(jsonify({"Project delete error": project_id}), 404)

        return make_response(jsonify({"Project delete success": project_id}), 200)  # Indicate success


class ProjectIndustry(Resource):
    """
    ProjectIndustry handles the linking table between a given Project
    and Industry. Handles POST and DELETE requests to
    /api/project/<project_id>/industry/<industry_id>
    """
    @jwt_required
    def post(self, project_id, industry_id):
        """
        POST requests to ProjectIndustry will attempt to add a relationship between
        the project and industry given in the url
        :param project_id: ID (primary key in database) of project to insert
        :param industry_id: ID (primary key in database) of industry to insert
        :return: An HTTP code indicating success (201) or failure (404), along with
        a JSON object of the new entry
        """

        valid_ids = check_for_entry(project_id, industry_id)  # Tuple of booleans

        # Only POST if both id's are valid
        if valid_ids == (True, True):
            # Only create new entry if it doesn't already exist
            query_string = "SELECT * FROM industries_projects_rel WHERE project_id = (%s) AND industry_id = (%s)"
            exists = db_query(query_string, (project_id, industry_id))
            if exists is None or len(exists) == 0:
                query_string = "INSERT INTO industries_projects_rel (industry_id, project_id) VALUES (%s, %s)"
                db_execute(query_string, (industry_id, project_id))
        else:  # Format error if at least one of the ids doesn't exist
            to_return = {"POST ProjectIndustry error": "At least one ID is invalid"}

            # Add invalid id's to return body
            if valid_ids[0] is False:
                to_return["project_id"] = project_id
            if valid_ids[1] is False:
                to_return["industry_id"] = industry_id

            return make_response(jsonify(to_return), 400)

        # Return relation table entries for given project
        new_entry = db_query("""SELECT id, name, description, poster_path, project_status, impact, faculty_advisor, 
            team_id, client_id, JSON_ARRAYAGG(industry_id) as industries FROM projects LEFT OUTER JOIN 
            industries_projects_rel ON projects.id=industries_projects_rel.project_id WHERE projects.id = (%s) 
            GROUP by id;""", (project_id, ))

        if new_entry is None or len(new_entry) == 0:  # Indicate if project doesn't exist (shouldn't happen)
            return make_response(jsonify({"POST ProjectIndustry error. ID doesn't exist": project_id}), 404)

        fields = ['id', 'name', 'description', 'poster_path', 'project_status', 'impact', 'faculty_advisor',
                  'team_id', 'client_id', 'industries']
        to_return = response_to_dict(new_entry, fields)
        to_return = cleanup_joined_response(to_return)
        return make_response(jsonify(to_return), 201)

    @jwt_required
    def delete(self, project_id, industry_id):
        """
        DELETE requests to ProjectIndustry will attempt to remove a relationship between
        the project and industry given in the url
        :param project_id: ID (primary key in database) of project relation to delete
        :param industry_id: ID (primary key in database) of industry relation to delete
        :return: An HTTP code indicating success (200) or failure (404), along with
        a JSON object to indicate the relation with the given ids was successfully or
        unsuccessfully deleted
        """

        query_string = "DELETE FROM industries_projects_rel WHERE project_id = (%s) AND industry_id = (%s)"
        response = db_execute(query_string, (project_id, industry_id))

        if response == 0:  # Indicate if nothing changed (entry didn't exist)
            return make_response(jsonify({"ProjectIndustry relation delete error": {"project_id": project_id,
                                                                                    "industry_id": industry_id}}), 404)

        return make_response(jsonify({"ProjectIndustry relation delete success": {"project_id": project_id,
                                                                                  "industry_id": industry_id}}), 200)


def check_for_entry(project_id, industry_id):
    """
    Given either 1 or 2 id(s) associated with a project, industry, or both, determines
    if the given ids match to an entry in the database
    :param project_id: ID (primary key in database) of project to search for
    :param industry_id: ID (primary key in database) of industry to search for
    :return: A tuple containing True, False, or None for each id.
    """

    # Check for provided id(s)
    if project_id is not None:
        project_response = db_query("SELECT * FROM projects WHERE id = (%s)", (project_id,))
        # Change project_response to False if query indicates no project exists with given id. Otherwise True
        project_response = False if (project_response is None or len(project_response) == 0) else True
    else:
        project_response = None

    if industry_id is not None:
        industry_response = db_query("SELECT * FROM industries WHERE id = (%s)", (industry_id,))
        # Change industry_response to False if query indicates no project exists with given id. Otherwise True
        industry_response = False if (industry_response is None or len(industry_response) == 0) else True
    else:
        industry_response = None

    # Return tuple containing T/F for existence of (project, industry)
    return project_response, industry_response


def validate_industry_id(in_name):
    """
    Checks if an industry with the given name exists in the industries table
    of system.
    :param in_name: ID associated with industry
    :return: True if industry with given id exists, false otherwise
    """

    response = db_query("SELECT id FROM industries WHERE id = (%s)", (in_name,))

    if response is not None and len(response) > 0:  # Return if industry already exists
        return True

    return False

    # Otherwise, add it to database
    # assigned_id = db_execute("INSERT INTO industries (name) VALUES (%s)", (in_name,))
    # return assigned_id  # Will always be an int if INSERT takes place


def cleanup_joined_response(to_return):
    """
    Given a list of entries resulting from a JOIN query removes null
    entries from the list
    :param to_return: List to cleanup that results from a JOIN on the database
    :return: The original list with all null entries removed
    """

    for project in to_return:  # Industries is what is joined from relational table
        project['industries'] = literal_eval(project['industries'].replace(', null', '').replace('null, ', '').replace(
                'null', ''))
        project['industries'] = list(set(project['industries']))

    return to_return


# Expose blueprint for api.py
project_api = Blueprint("resources.project", __name__)

# Add resources to api
api = Api(project_api)

# resource, route, endpoint
api.add_resource(
        ProjectList,
        "/api/projects",
        endpoint="projects")

api.add_resource(
        Project,
        "/api/project/<project_id>",
        endpoint="project")

api.add_resource(
        ProjectIndustry,
        "/api/project/<project_id>/industry/<industry_id>",
        endpoint="project_to_industry")


