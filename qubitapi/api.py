import os
from flask import Flask  # Needed to run everything
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # Needed for managing tokens
from resources.admin import admin_api  # Imports below this point are for blueprints
from resources.client import client_api
from resources.cohort import cohort_api
from resources.corporation import corporation_api
from resources.industry import industry_api
from resources.permissions import permissions_api
from resources.poster import poster_api
from resources.person import person_api
from resources.project import project_api
from resources.questee import QUESTee_api
from resources.resume import resume_api
from resources.team import team_api
from resources.user import user_api
from resources.ta import ta_api

app = Flask(__name__)  # API app

# Needed for creating tokens
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = os.urandom(24)

cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register all of the blueprints
app.register_blueprint(admin_api)
app.register_blueprint(client_api)
app.register_blueprint(cohort_api)
app.register_blueprint(corporation_api)
app.register_blueprint(industry_api)
app.register_blueprint(permissions_api)
app.register_blueprint(poster_api)
app.register_blueprint(person_api)
app.register_blueprint(project_api)
app.register_blueprint(QUESTee_api)
app.register_blueprint(resume_api)
app.register_blueprint(team_api)
app.register_blueprint(user_api)
app.register_blueprint(ta_api)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
