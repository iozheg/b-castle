import mysql.connector
from mysql.connector import Error

class DatabaseWork:
	'''Class for DB work'''
	def connect(self):
		""" Connect to MySQL database """
		try:
			conn = mysql.connector.connect(host='localhost',
											database='b_castle',
											user='root',
											password='')
			if conn.is_connected():
				return conn

		except Error as e:
			print(e)
	# def get_cursor(self):
		# return self.cursor()
	# def close_cursor(self):
		# self.close()
	def close_connection(self):
		try:
			self.close()
		except Error as e:
			return 'error closing DB connection: ' + e