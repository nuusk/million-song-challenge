#!/usr/bin/env bash
 
# ,------.                        
# |  .-.  \ ,--.--. ,---.  ,---.  
# |  |  \  :|  .--'| .-. || .-. | 
# |  '--'  /|  |   ' '-' '| '-' ' 
# `-------' `--'    `---' |  |-'  
#                         `--'   
#   ,--.          ,--.   ,--.               
# ,-'  '-. ,--,--.|  |-. |  | ,---.  ,---.  
# '-.  .-'' ,-.  || .-. '|  || .-. :(  .-'  
#   |  |  \ '-'  || `-' ||  |\   --..-'  `) 
#   `--'   `--`--' `---' `--' `----'`----'  
                                          
echo "# begin procedure drop tables"

sqlite3 main.db "DROP TABLE IF EXISTS tracks;"
 
sqlite3 main.db "DROP TABLE IF EXISTS activities;"

sqlite3 main.db "DROP TABLE IF EXISTS queen_table;"
 
echo "# finish procedure drop tables"