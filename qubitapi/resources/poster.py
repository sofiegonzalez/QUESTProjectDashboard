from flask import Blueprint, jsonify, make_response, redirect, request  # Needed for blueprints and return statements
from flask_restful import Resource, Api, reqparse  # Needed for routing, exposing the API, and parsing requests
from flask_jwt_extended import jwt_required
from .s3 import upload_file

# Configure parent JSON parser with expected values. HTTP methods use or extend from this
# Poster: file (and uid to store file for)
parser = reqparse.RequestParser(bundle_errors=True)

# Used for a single Poster
class Poster(Resource):

    def get(self):
        return make_response(jsonify({"Not implemented": "Poster single GET"}), 501)

    # needs an HTML form with its enctype attribute set to ‘multipart/form-data’
    @jwt_required
    def post(self):
        if 'file' not in request.files:  # Redirect if file not uploaded (front end handles?)
            return make_response(jsonify({"Bad Request": "No file payload attached"}), 400)
        f = request.files['file']
        extension = "-%s" % f.filename
        
        # Attempt to upload the file to s3
        response = upload_file(f, extension)
        if response is not None:
            to_return = {"url": response}
            return make_response(jsonify(to_return), 201)
        else:
            return make_response(jsonify({"Internal Server Error": "Failed to upload poster"}), 500)

    def put(self):
        return make_response(jsonify({"Not implemented": "Poster single PUT"}), 501)

    def delete(self):
        return make_response(jsonify({"Not implemented": "Poster single DELETE"}), 501)


# Expose blueprint for api.py
poster_api = Blueprint("resources.poster", __name__)

# Add resources to api
api = Api(poster_api)

# resource, route, endpoint

api.add_resource(
        Poster,
        "/api/poster/",
        endpoint="poster")
