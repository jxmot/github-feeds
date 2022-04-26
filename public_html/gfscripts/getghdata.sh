#!/bin/bash
# This is the command line version of this file. Do not
# run it from CRON.
if [ -z "$1" ];then
    echo "Missing repository owner ID!"
    echo "Usage: getghdata.sh GitHubUser"
    echo "Where: GitHubUser is your github user name."
    echo "Files will be created in the location where"
    echo "this script is ran."
    exit
fi
# GitHub repository owner
owner=$1
# Get the GitHub data and save it to 
# JSON files.
echo $owner"user.json"
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner > "./"$owner"user.json" 2>/dev/null
echo $owner"repos.json"
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/repos?type=sources&sort=updated&per_page=100" > "./"$owner"repos.json" 2>/dev/null
echo $owner"events.json"
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/events" > "./"$owner"events.json" 2>/dev/null
echo $owner"gists.json"
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/gists" > "./"$owner"gists.json" 2>/dev/null
echo "Rate Limit After:"
curl -H "Accept: application/vnd.github.v3+json" -I "https://api.github.com/users/"$owner 2>/dev/null | grep --ignore-case "^x-ratelimit"
