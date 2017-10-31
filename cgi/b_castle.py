#!/usr/bin/python
# -*- coding: windows-1251 -*-
#import sys
#sys.path.append('C:\\Python27\\lib\\site-packages')
import BCDatabase
import hashlib
import string, random
import json
from datetime import datetime

import cgi

print "Content-type: text/html\n\n"
#print BCDatabase.DatabaseWork.__doc__

def register(nick):
	db = BCDatabase.DatabaseWork()
	conn = db.connect()
	cursor = conn.cursor()
	
	authcode = hashlib.md5(''.join(random.choice(string.ascii_uppercase + string.digits) for i in range(10)) + datetime.strftime(datetime.now(), "%Y.%m.%d %H:%M:%S")).hexdigest()
	cursor.execute('INSERT INTO players(auth_code, nick, opponent_id) VALUES (%s, %s, %s)', (authcode, nick, 0))
	conn.commit()
	id = cursor.lastrowid
	
	cursor.close()
	conn.close()
	
	response = json.dumps({'id':id, 'authcode':authcode, 'opponentid':0, 'nick':nick})
	print response

def set_active(input):
	db = BCDatabase.DatabaseWork()
	conn = db.connect()
	cursor = conn.cursor(buffered=True)
	
	id = input.getvalue("id") #make test for proper INTEGER value
	authcode = input.getvalue("authcode") #make test for proper HEX value
		
	cursor.execute("SELECT * FROM players WHERE id=%s", (id,))
	
	row = cursor.fetchone()
	fetched = {}
	fetched['id'] = row[0]
	fetched['authcode'] = row[1].encode('utf-8')
	fetched['nick'] = row[2].encode('utf-8')
	fetched['opponentid'] = row[3]
	fetched['lasttime'] = int((row[5]-datetime(1970,1,1)).total_seconds())
	
	if fetched['id'] == int(id) and fetched['authcode'] == authcode:
		print 'True'
		cursor.execute("UPDATE players SET active=TRUE, last_time_active=%s WHERE id=%s", (datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S"), id))
		conn.commit()
		# cursor.execute("UPDATE players SET opponent_id=%s WHERE id=%s", (id, row[0]))
		# cursor.execute("SELECT * FROM players WHERE id<>%s AND opponent_id=0 AND active=TRUE LIMIT 1 FOR UPDATE", (id,))
		# row = cursoe.fetchone()
		# if row is not None:
			# cursor.execute("UPDATE players SET opponent_id=%s WHERE id=%s", (id, row[0]))
			# cursor.execute("UPDATE players SET opponent_id=%s WHERE id=%s", (row[0], id))
		# else:
			# print "No opponents! Try once more"
	else:
		print 'Player auth error'
	
	cursor.close()
	conn.close()

data = cgi.FieldStorage()

if data.getvalue("authcode") is None:
	register(data.getvalue("nick", "player"))
elif data.getvalue("authcode") == 'null' or data.getvalue("id") == 'null':
	register(data.getvalue("nick", "player"))
else: 
	set_active(data)