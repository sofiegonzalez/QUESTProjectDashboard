import mysql.connector

config1 = {'user': 'api', 'password': 'cD5GbV9VzxCgqKpp',
          'host': 'qubit-database.cjuk1km2lgzn.us-east-1.rds.amazonaws.com',
          'database': 'qubit_truth', 'raise_on_warnings': True}

config2 = {'user': 'admin', 'password': '3W!00picm2os',
          'host': 'qubit-database.cjuk1km2lgzn.us-east-1.rds.amazonaws.com',
          'database': 'qubit_truth', 'raise_on_warnings': True}

conn = mysql.connector.connect(**config1)
cursor = conn.cursor()

query = ("SHOW TABLES")

cursor.execute(query)

for name in cursor:
    print(name)

cursor.close()
conn.close()
