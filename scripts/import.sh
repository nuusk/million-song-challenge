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
 
sqlite3 main.db "create temp table footmp(user_id,song_id,timestamp);"
printf '.separator ,\n.import triplets_sample_20p.txt footmp\n' | sqlite3 main.db
sqlite3 main.db "insert into activities(user_id,song_id,timestamp) select * from footmp;"
 
echo "~ activities data inserted"
 
sqlite3 main.db "create temp table bartmp(track_id,song_id,artist,title);"
printf '.separator ,\n.import unique_tracks.txt bartmp\n' | sqlite3 main.db
sqlite3 main.db "insert into tracks(track_id,song_id,artist,title) select * from bartmp;"
 
echo "~ tracks data inserted"