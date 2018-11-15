#!/usr/bin/env bash
                                                   
# ,------.                       ,--.                
# |  .--. ' ,---.  ,---. ,--.,--.|  | ,--,--.,--.--. 
# |  '--' || .-. || .-. ||  ||  ||  |' ,-.  ||  .--' 
# |  | --' ' '-' '| '-' ''  ''  '|  |\ '-'  ||  |    
# `--'      `---' |  |-'  `----' `--' `--`--'`--'    
#                 `--'                              
#                  ,--.  ,--.        ,--.   
#  ,--,--.,--.--.,-'  '-.`--' ,---.,-'  '-. 
# ' ,-.  ||  .--''-.  .-',--.(  .-''-.  .-' 
# \ '-'  ||  |     |  |  |  |.-'  `) |  |   
#  `--`--'`--'     `--'  `--'`----'  `--'   
                                          

sqlite3 main.db \
"SELECT 
  tracks.artist,
  COUNT(*) as uniq 
FROM tracks 
INNER JOIN activities ON tracks.song_id = activities.song_id 
GROUP BY tracks.artist 
ORDER BY uniq DESC
LIMIT (1)
;"