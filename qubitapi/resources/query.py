import mysql.connector  # sql connection library
from flask import Blueprint, jsonify, make_response  # Needed for Flask blueprints and returning proper HTTP responses
from os import environ


#   Function to make querying the data base easier to implement for the api functions, specifically GET functions
#   input: An sql query in the form of a string
#   output: the result of the query to the data base (This is a read-only operation)
def db_query(query, args=None):
    # necessary identification information to access the data base as the api user
    config = {'user': environ.get('QUBIT_DB_USER'), 
              'password': environ.get('QUBIT_DB_PASSWORD'),
              'host': environ.get('QUBIT_DB_HOST'),
              'database': 'qubit_truth', 
              'raise_on_warnings': True
             }

    response = None

    try:
        conn = mysql.connector.connect(**config)  # generates the url string to connect to the data base
        cursor = conn.cursor(prepared=True)  # opens a connection to the data base

        if args is None:
            cursor.execute(query)  # execution of the query
        else:
            cursor.execute(query, args)

        response = cursor.fetchall()

        return response

    except mysql.connector.Error as error:
        print("Query went wrong {}".format(error))
        return None

    finally:
        if conn.is_connected():
            cursor.close()  # closing of the connection
            conn.close()


#   Function to make querying the data base easier to implement for the api functions, specifically POST functions
#   input: An sql query in the form of a string
#   output: the result of the query to the data base (This is a read-write operation)
def db_execute(query, args=None):
    # necessary identification information to access the data base as the api user
    config = {'user': environ.get('QUBIT_DB_USER'), 
              'password': environ.get('QUBIT_DB_PASSWORD'),
              'host': environ.get('QUBIT_DB_HOST'),
              'database': 'qubit_truth', 
              'raise_on_warnings': True
             }

    response = None

    try:
        conn = mysql.connector.connect(**config)  # generates the url string to connect to the data base
        cursor = conn.cursor(prepared=True)  # opens a connection to the data base

        if args is None:
            response = cursor.execute(query)  # execution of the query
        else:
            response = cursor.execute(query, args)

        conn.commit()

        if query[0:11] == "DELETE FROM":  # Indicate how many entries were deleted
            return cursor.rowcount

        return cursor.lastrowid

    except mysql.connector.Error as error:
        print("Query went wrong {}".format(error))
        return None

    finally:
        if conn.is_connected():
            cursor.close()  # closing of the connection
            conn.close()


def response_to_dict(response, fields):
    to_return = []
    for result in response :  # Iterate over each tuple (row from query)
        obj = {}
        for field, value in zip(fields, result): # Creates a list of field value tuples to iterate over
            if value is not None: # Only include results that are in the db
                if isinstance(value, bytearray):
                    value = value.decode('utf-8')
                obj.update({field: value})
        to_return.append(obj)
    return to_return


#   Function for generating dynamic string for the put query
#   in: table_name - the name of the table to insert into as a string
#   in: fields - a list of the arguments passed in by the parser
#   out: the result of the query to the database
def post_query(table_name, args):
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
        query_string = "INSERT INTO" + table_name + "(" + query_args_string + ") VALUES (%s)" % (
            ', '.join(['%s'] * len(query_args)))

        response = db_execute(query_string, tuple(query_args_values))
        if response is not None:
            return make_response(jsonify({"id": response}), 201)

