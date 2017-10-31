#!/usr/bin/python
# -*- coding: windows-1251 -*-

import BCDatabase
from datetime import datetime, timedelta

db = BCDatabase.DatabaseWork()
conn = db.connect()
cursor = conn.cursor(buffered=True)

''' make opponents pairs. Every script run get 100 players and 50 pairs'''
outdate = datetime.now() - timedelta(days=1)
cursor.execute("SELECT * FROM players WHERE id<>0 AND opponent_id=0 AND active=TRUE AND last_time_active > %s LIMIT 100 FOR UPDATE", (datetime.strftime(outdate, "%Y-%m-%d %H:%M:%S"),))

row = cursor.fetchall()

if len(row) > 1:
	iter = len(row)/2
	i=0
	while i <= iter:
		cursor.execute("UPDATE players SET opponent_id=%s WHERE id=%s", (row[i+1][0], row[i][0]))
		cursor.execute("UPDATE players SET opponent_id=%s WHERE id=%s", (row[i][0], row[i+1][0]))
		i+=2
	conn.commit()

''' delete outdated players'''	
outdate = datetime.now() - timedelta(days=1)
cursor.execute("SELECT * FROM players WHERE id<>0 AND opponent_id=0 AND last_time_active < %s FOR UPDATE", (datetime.strftime(outdate, "%Y-%m-%d %H:%M:%S"),))
cursor.execute("DELETE FROM players WHERE id<>0 AND opponent_id=0 AND last_time_active < %s", (datetime.strftime(outdate, "%Y-%m-%d %H:%M:%S"),))
conn.commit()
#print "Content-type: text/html\n\n"
print outdate

cursor.close()
conn.close()