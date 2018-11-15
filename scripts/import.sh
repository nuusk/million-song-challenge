#!/usr/bin/env bash

# ,--.                               ,--.   
# |  |,--,--,  ,---.  ,---. ,--.--.,-'  '-. 
# |  ||      \(  .-' | .-. :|  .--''-.  .-' 
# |  ||  ||  |.-'  `)\   --.|  |     |  |   
# `--'`--''--'`----'  `----'`--'     `--'   

perl -pi -e 's/<SEP>/,/g' unique_tracks.txt
perl -pi -e 's/<SEP>/,/g' triplets_sample_20p.txt
 
echo "~ replace delimiter <SEP> with ,"
 
echo "# begin procedure insert data"
 
sqlite3 main.db "create temp table activities_tmp(user_id,song_id,timestamp);"
printf '.separator ,\n.import triplets_sample_20p.txt activities_tmp\n' | sqlite3 main.db
sqlite3 main.db "insert into activities(user_id,song_id,timestamp) select * from activities_tmp;"
 
echo "~ activities data inserted"
 
sqlite3 main.db "create temp table tracks_tmp(track_id,song_id,artist,title);"
printf '.separator ,\n.import unique_tracks.txt tracks_tmp\n' | sqlite3 main.db
sqlite3 main.db "insert into tracks(track_id,song_id,artist,title) select * from tracks_tmp;"
 
echo "~ tracks data inserted"