#!/usr/bin/env bash

# ,--.   ,--.                 ,--.  ,--.     ,--.          
# |   `.'   | ,---. ,--,--, ,-'  '-.|  ,---. |  |,--. ,--. 
# |  |'.'|  || .-. ||      \'-.  .-'|  .-.  ||  | \  '  /  
# |  |   |  |' '-' '|  ||  |  |  |  |  | |  ||  |  \   '   
# `--'   `--' `---' `--''--'  `--'  `--' `--'`--'.-'  /    
#                                                `---'     
#                 ,--.  ,--.          ,--.  ,--.  ,--.               
#  ,--,--. ,---.,-'  '-.`--',--.  ,--.`--',-'  '-.`--' ,---.  ,---.  
# ' ,-.  || .--''-.  .-',--. \  `'  / ,--.'-.  .-',--.| .-. :(  .-'  
# \ '-'  |\ `--.  |  |  |  |  \    /  |  |  |  |  |  |\   --..-'  `) 
#  `--`--' `---'  `--'  `--'   `--'   `--'  `--'  `--' `----'`----'  
                                                                   
sqlite3 -separator ' ' main.db \
"SELECT
  strftime('%m', datetime(activities.timestamp, 'unixepoch')) as mon, 
  COUNT(*)
FROM tracks
INNER JOIN activities ON tracks.song_id = activities.song_id 
GROUP BY mon
ORDER BY mon asc
;"