#!/usr/bin/env bash

# ,--.           ,--.                  
# |  |,--,--,  ,-|  | ,---. ,--.  ,--. 
# |  ||      \' .-. || .-. : \  `'  /  
# |  ||  ||  |\ `-' |\   --. /  /.  \  
# `--'`--''--' `---'  `----''--'  '--' 
#   ,--.          ,--.   ,--.               
# ,-'  '-. ,--,--.|  |-. |  | ,---.  ,---.  
# '-.  .-'' ,-.  || .-. '|  || .-. :(  .-'  
#   |  |  \ '-'  || `-' ||  |\   --..-'  `) 
#   `--'   `--`--' `---' `--' `----'`----'  

sqlite3 main.db "CREATE INDEX tracks_song_id ON tracks (song_id);"
echo "~ tracks index created on song_id"
 
sqlite3 main.db "CREATE INDEX activities_user_id ON activities (user_id);"
echo "~ activities index created on user_id"
 
sqlite3 main.db "CREATE INDEX activities_track_id ON activities (song_id);"
echo "~ activities index created on track_id"
 
sqlite3 main.db "CREATE TABLE queen_table (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL
);"