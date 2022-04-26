#!/bin/bash
# This is the CRON version of this file.
owner="jxmot"

ghfeeds=$HOME/public_html/ghfeeds
if [[ ! -d $ghfeeds ]];then
    mkdir $ghfeeds
fi
cd $ghfeeds

gfdata=$HOME/public_html/ghfeeds/gfdata
if [[ ! -d $gfdata ]];then
    mkdir $gfdata
fi
cd $gfdata

curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner > "./"$owner"user.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/repos?type=sources&sort=updated&per_page=100" > "./"$owner"repos.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/events" > "./"$owner"events.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/gists" > "./"$owner"gists.json" 2>/dev/null
# This is for checking the rate limits, 
# look at its contents periodocally to 
# verify all is well for the chosen CRON 
# interval.
curl -H "Accept: application/vnd.github.v3+json" -I "https://api.github.com/users/"$owner 2>/dev/null | grep --ignore-case "^x-ratelimit" > ./x-ratelimit.log
