#!/bin/bash
# This is the CRON version of this file.
# An interval of 5 to ?? minutes is 
# recommended, adjust as needed.
#
# GitHub repository owner. Edit as needed.
owner="jxmot"
# Edit as needed.
docroot="$HOME/public_html"
# Edit as needed.
gfdata="$docroot/ghfeeds/gfdata"
# Get the GitHub data and save it to 
# JSON files.
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/$owner" > $gfdata/$owner"user.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/$owner/repos?type=sources&sort=updated&per_page=100" > $gfdata/$owner"repos.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/$owner/events" > $gfdata/$owner"events.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/$owner/gists" > $gfdata/$owner"gists.json" 2>/dev/null
# This is for checking the rate limits, 
# look at its contents periodocally to 
# verify all is well for the chosen CRON 
# interval.
curl -H "Accept: application/vnd.github.v3+json" -I "https://api.github.com/users/$owner" 2>/dev/null | grep --ignore-case "^x-ratelimit" > $gfdata/x-ratelimit.log
