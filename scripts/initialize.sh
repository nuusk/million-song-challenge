#!/usr/bin/env bash
 
# ,--.        ,--.  ,--.  ,--.        ,--.,--.               
# |  |,--,--, `--',-'  '-.`--' ,--,--.|  |`--',-----. ,---.  
# |  ||      \,--.'-.  .-',--.' ,-.  ||  |,--.`-.  / | .-. : 
# |  ||  ||  ||  |  |  |  |  |\ '-'  ||  ||  | /  `-.\   --. 
# `--'`--''--'`--'  `--'  `--' `--`--'`--'`--'`-----' `----' 
 
echo "# begin procedure create tables"

sqlite3 main.db \
"CREATE TABLE tracks (
 track_id varchar(18),
 song_id varchar(18),
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL
);"
 
echo "~ tracks table created"
 
sqlite3 main.db \
"CREATE TABLE activities (
 user_id varchar(50),
 song_id varchar(18),
 timestamp integer
);"
 
echo "~ activities table created"

echo "# finish procedure create tables"