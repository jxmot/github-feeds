# github-feeds

This repository contains a "GitHub Feed" browser plug-in. On the backend there is a *mock* API that can replace GitHub's.  

# History

I had been searching for a *usable*, *responsive*, *working*, GitHub feed (*repositories, activity, gists*) plugin for use on my website. There are a number of them available on GitHub, but none had *exactly* what I was looking for.

I found [bachors/jQuery-Github-Feed](<https://github.com/bachors/jQuery-Github-Feed>) and at first it appeared that this one met my requirements. Unfortunately, it's really **old**. And there has not been any real activity in that repository for quite a while. 

But I grabbed a copy of it anyway and began dissecting it. I was able to find some deficiencies and a few errors. And I after I evaluated the amount of effort it would take to make changes I decided to move forward with it.

And that's what you will find here... an extensively *modified* version of [bachors/jQuery-Github-Feed](<https://github.com/bachors/jQuery-Github-Feed>). I give the original author a lot of credit for creating something *very cool*. It's already *responsive* and views well on mobile browsers.

When I started I had considered *forking* the original. However since it is old and not maintained, and because of the nature of the modifications I was going to make I decided not to fork it.

# Modifications

Here is an overview of the modifications I made to [jQuery-Github-Feed](<https://github.com/bachors/jQuery-Github-Feed>):

* Updated:
  * jQuery - updated to 3.6.0, local file in `assets/jq`
  * Octicons - updated to 3.5.0, local files in `assets/css/octicons-3.5.0`
* Changed:
  * Modified CSS, fixed some classes and added a few
  * Improved code readability, added comments
  * Can specify other API URLs for the data (*part of anti-rate limiting*)

The other *major* modification that is made here is when and how the GitHub API data is retrieved and *saved*. There is more about this in the next section.

## Anti Rate Limiting

The GitHub API is *rate limited*. This means that you can only issue up to 60 *requests* in one hour, after than you will not be able to obtain data. And the API calls will fail.

The rate limiting may not be an issue for you if the page containing the feeds doesn't have a lot of visitors. However, there are no guarantees. It's generally better to design for "high traffic" scenarios.

### A Solution

The solution is simple... get the data *in the background* and limit the number of API hits. The data is saved and when a visitor arrives to view it the saved data is used and *not* the API.

To achieve this CRON and a *shell script* are used. I set up CRON to run periodically (*every 15 to 5 to 30 minutes*) and execute a script:

**gfscripts/getghdata-cron.sh:**
```bash
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
```
**NOTE:** You may need to modify the script file to work in your environment. Before you run it double-check the paths in `ghfeeds` and `gfdata`.

Run this next script from the command line, do not run it in a CRON job:

**gfscripts/getghdata.sh:**
```bash
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
```

# Usage

The following will guide you through setting up the CRON jobs and getting the files ready on your server.

## Set Up

**You will need:**
* A web server with PHP >5.6, Apache >2.x is recommended
* An understanding of CRON
* A means to copy files to your server, and command-line access
* Knowledge of where your *document root* is located

### Server Preparation

1) Get access to your web server for:
  * Copying files to it
  * Command line
2) Find your *document root* and 


### Edit Files

**`public_html/index.html`**
Find `<div id="ghdata"...` and edit `data-username="...` to the GitHub user name you want to use.

**`public_html/gfscripts/getghdata-cron.sh`**
* Edit `owner="...`, use the GitHub user name from the previous edit.
* 

### Copy Files to the Server

### Set Up CRON

## Run 

### Get JSON Data Ready

Now you should have four JSON files(*using the scripts as found*):

* 


### Go!

