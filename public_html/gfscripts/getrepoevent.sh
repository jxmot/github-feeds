#!/bin/bash
# This is the command line version of this file. Do not
# run it from CRON. Change the current folder to where 
# you want the data files to go. Then run this script 
# using a relative or absolute path to its location.
if [ -z "$1" ];then
    echo "Missing repository owner ID!"
    echo "Usage: getrepoevent.sh GitHubUser"
    echo "Where: GitHubUser is your github user name."
    echo "Files will be created in the location where"
    echo "this script is ran."
    exit
fi
if [ -z "$2" ];then
    echo "Missing repository name!"
    echo "Usage: getrepoevent.sh GitHubUser  GitHubUserRepoName"
    echo "Where: GitHubUser is your github user name. And"
    echo "GitHubUserRepoName is a repo owned by GitHubUser."
    echo "Files will be created in the location where"
    echo "this script is ran."
    exit
fi
owner=$1
repo=$2
filen=$owner"_"$repo
tstamp=$(date +'%s')
echo ""
jfile=$filen"_"$tstamp"_repoevents.json"
echo $jfile
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$owner/$repo/events?per_page=100" > "./"$jfile 2>/dev/null
# NOTE: this counts against the rate limit
# echo "Rate Limit After:"
# curl -H "Accept: application/vnd.github.v3+json" -I "https://api.github.com/users/$owner" 2>/dev/null | grep --ignore-case "^x-ratelimit"
