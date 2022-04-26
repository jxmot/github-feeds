#!/bin/bash
# This is the CRON version of this file.
# An interval of 5 to ?? minutes is 
# recommended, adjust as needed.
#
# GitHub repository owner
owner="jxmot"
# This is here just in case this script 
# is ran before uploading the project 
# to your server. Edit as needed.
ghfeeds=$HOME/public_html/ghfeeds
if [[ ! -d $ghfeeds ]];then
    mkdir $ghfeeds
fi
cd $ghfeeds
# The data will be written here, so 
# create the folder if needed. 
# Edit as needed.
gfdata=$HOME/public_html/ghfeeds/gfdata
if [[ ! -d $gfdata ]];then
    mkdir $gfdata
fi
cd $gfdata
# Get the GitHub data and save it to 
# JSON files.
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner > "./"$owner"user.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/repos?type=sources&sort=updated&per_page=100" > "./"$owner"repos.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/events" > "./"$owner"events.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/gists" > "./"$owner"gists.json" 2>/dev/null
# This is for checking the rate limits, 
# look at its contents periodocally to 
# verify all is well for the chosen CRON 
# interval.
curl -H "Accept: application/vnd.github.v3+json" -I "https://api.github.com/users/"$owner 2>/dev/null | grep --ignore-case "^x-ratelimit" > ./x-ratelimit.log
