# QUESTProjectDashboard
Capstone Project for the QUEST program at UMD

The objective of this project is to create a new unified management system and provide a dashboard to display projects and allow administrators to manipulate data. To accomplish this, the QUBIT team has decided to create a unified database to house the current QUEST data, an API to facilitate future development, a web application to display projects created by QUEST students, and thorough documentation for future developers. This unified database and API will set the groundwork in place to allow the flow of data between the many disparate applications QUEST admins currently interact with. This will allow for the time that was used transferring data to be saved. Due to the fact the development effort to interface the existing systems with the new API exceeds the team’s time, after meetings with Jess and Danny the decision has been made to instead build a Project Dashboard, adding additional tools to enhance the QUEST admin workflow. The goal is to provide a functional system that makes the QUEST workflow more efficient while being flexible enough to be extended as QUEST grows.


Project Dashboard
-----------------------------------------------------------------
1. Install Node Modules
	npm install --save react-router-dom
  npm install node


2. Start the Application
	npm start
  A simple development server will show up in browser: http://localhost:3000/
  
 
 
Flask API
-----------------------------------------------------------------
 
0. Make sure you have project directory set up correctly [See https://flask.palletsprojects.com/en/1.1.x/installation/]
	- the venv isn't included in our SVN because it takes up unnecessary space, and has a different format depending on if you're a Windows, Mac, or Linux user

1. Activate the virtual environment that API directory exists in
	[cd to your project directory]
	On Windows: venv\Scripts\activate
	On Mac/Linux: . venv/bin/activate
	- You should see (venv) or an updated directory on your terminal to indicate this worked
	- You can deactivate by simply typing 'deactivate' in terminal
	- Note that this is a script. The script is ran by supplying the path like in the examples above

2. Download postman, a platform for API testing that writes http requests for you
	- https://www.postman.com/

3. Import QUBIT.postman_environment.json and QUBIT_api_tests_postman_collection.json to postman
	- This includes 138 tests (at time of writing this) to throw at the API.
	- postman makes testing a lot easier than writing these requests by hand. We highly recommend it

4. Setup your environment variables for the database (only needs to be done once)
	- Setting up environment variables depends on your OS, but it typically boils down to adding your python interpreter to system PATH and creating the key value pairs
	- The environment variables are needed for signing in to the database. You can find the names of what you need in query.db where you see os.environ being indexed.
	- The values for these variables are not publically available so you should ask the system administrator for these.

5. Run the program
	In terminal: python api.py
	- You might need to run 'python ./api.py' if above doesn't work
	- If you're missing dependencies, type 'pip install -r requirements.txt' (requirements.txt can be found in SVN)

6. Do some testing!
	- After step 5, you should see someting along the lines of "Running on http://127.0.0.1:5000/"
	- That web address is what you can use for testing. This URL can be changed in the postman environment to be whatever address the API is running on (even the deployed version!)
	- For postman, ensure you run `User Tests` -> `POST login` first. This will set the `token` postman environment variable to be used in the rest of the API calls that require it
		- You may need to repeat this step everytime you restart the API server, or you get token expired messages

Notes/Help:
- After step 5, your terminal is occupied until the API terminates (use ctrl+c to terminate just like in 216). Open a 2nd terminal for curl tests if you're using a terminal (or just use postman :) )
- Routes for the API can be found in the bottom of the .py files in the resources directory.
- If you get 308 errors, make sure you don't have a `/` at the end of the URL.  http://127.0.0.1:5000/api/users IS NOT THE SAME AS http://127.0.0.1:5000/api/users/ (notice the last /)
- An authentication token is required for most requests. As such, you need to make a login request to get this token. This token should be applied with `Authentication bearer <token>` header
	
  
  
 
