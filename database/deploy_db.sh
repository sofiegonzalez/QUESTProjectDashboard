#!/bin/bash

if [ $# -ne 4 ]; then
    echo "Invalid Arguments. Usage: deploy_db.sh <url> <port> <username> <sql_file>"; exit 2
fi

if [ -z "$qubit_sql_password" ]; then
    echo "ERROR qubit_sql_password variable not set"; exit 2
else
    echo "mysql -h $1 -P $2 -u $3 --password=######### < $4"
    mysql -h $1 -P $2 -u $3 --password=$qubit_sql_password < $4
fi