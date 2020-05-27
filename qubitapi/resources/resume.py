from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .query import db_query, db_execute, response_to_dict

resumes = {}  # Placeholder since we're not hooked up to database yet
# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Resume fields: id, resume_path, date_updated, status. Note that id is automatically assigned
parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('uid', type=int, help='Invalid user id', location=['json', 'form', 'args'], required=True)
parser.add_argument('resume_path', location='json')
parser.add_argument('date_updated', location='json')  # TODO: Use Date library to automatically fill this?
parser.add_argument('status', location='json')  # TODO: Use type=bool with ignore=True? Only admin can do this


# Used when retrieving all resumes of system
class ResumeList(Resource):
    def get(self):
        query_string = """SELECT * FROM resumes"""
        response = db_query(query_string)

        fields = ['id', 'resume_path', 'date_updated', 'status']
        to_return = response_to_dict(response, fields)

        return make_response(jsonify(to_return), 200)


# Used for a single resume
class Resume(Resource):
    def get(self):
        # Main parser is already configured for GET
        uid = parser.parse_args()['uid']  # ID of resume we're getting

        query_string = """SELECT * FROM clients WHERE id = (%s)"""
        result = db_query(query_string, (uid,))

        if result is None:  # Indicate if key doesn't exist
            return make_response(jsonify(id=uid), 404)

        fields = ['id', 'resume_path', 'date_updated', 'status']
        to_return = response_to_dict(result, fields)

        # Otherwise, return information.

        return make_response(jsonify(to_return), 200)

    @jwt_required
    def post(self):
        # Configure parser for POST request
        post_parser = parser.copy()  # Inherit from main parser
        post_parser.remove_argument('uid')  # UID is assigned by DB, so don't need it here
        post_parser.replace_argument('status', location='json', required=True)  # status is required

        # Parse request
        args = post_parser.parse_args()
        # Construct sql query from provided
        query_args = list()
        query_args_values = list()
        for argument in args:
            if argument == 'uid':
                continue
            if args[argument] is not None:
                query_args.append(argument)
                query_args_values.append(args[argument])

        if len(query_args) > 0:  # If we were provided args to put into the db
            query_args_string = ', '.join(query_args)
            query_string = "INSERT INTO resumes (" + query_args_string + ") VALUES (%s)" % (
                ', '.join(['%s'] * len(query_args)))

            response = db_execute(query_string, tuple(query_args_values))
            if response is not None:
                return make_response(jsonify({"id": response}), 201)

    @jwt_required
    def put(self):
        # Main parser is already configured for PUT
        args = parser.parse_args()
        uid = args['uid']  # ID of resume we're adjusting

        # TODO: IMPLEMENT DB LOGIC WHEN ITS CONNECTED. EVERYTHING BELOW THIS JUST USES A DICT (resumes)
        # Logic is still relevant though; Make sure the id exists, and only adjust what is provided

        if uid not in resumes.keys():  # Indicate if resume with given id doesn't exist
            return make_response(jsonify(id=uid), 404)

        # TODO: status is of type 'bit' in DB. Convert True and False to appropriate values?
        # Update fields
        for argument in args:
            if args[argument] is not None and argument != 'uid':  # Only adjust provided fields, excluding UID
                resumes[uid][argument] = args[argument]

        # Format response and return it
        to_return = {uid: resumes.get(uid)}
        return make_response(jsonify(to_return), 200)

    @jwt_required
    def delete(self):
        # Main parser is already configured for DELETE
        args = parser.parse_args()
        uid = args['uid']

        # TODO: IMPLEMENT DB LOGIC WHEN ITS CONNECTED. EVERYTHING BELOW THIS JUST USES A DICT (resumes)

        if uid not in resumes.keys():  # Indicate if key doesn't exist
            return make_response(jsonify(id=uid), 404)

        # Remove the resume and return it with success code
        removed = resumes.pop(uid)
        to_return = {uid: removed}
        return make_response(jsonify(to_return), 200)  # Indicate success


# Expose blueprint for api.py
resume_api = Blueprint("resources.resume", __name__)

# Add resources to api
api = Api(resume_api)

# resource, route, endpoint
api.add_resource(
    ResumeList,
    "/api/resumes",
    endpoint="resumes")

api.add_resource(
    Resume,
    "/api/resume/",
    endpoint="resume")
