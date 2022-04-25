# github-feeds

This repository contains a "GitHub Feed" browser plug-in. 

# History

I had been searching for a *usable*, *responsive*, *working*, GitHub feed (*repositories, activity, gists*) plugin for use on my website. There are a number of them available on GitHub, but none had what I was looking for.

I found [bachors/jQuery-Github-Feed](<https://github.com/bachors/jQuery-Github-Feed>) and at first it appeared that this one met my requirements. Unfortunately, it's really **old**. And there has not been any real activity in that repository for quite a while.

But I grabbed a copy of it anyway and began dissecting it. I was able to find some deficiencies and a few errors. And I after I evaluated the amount of effort it would take to make changes I decided to move forward with it.

And that's what you will find here... an extensively *modified* version of [bachors/jQuery-Github-Feed](<https://github.com/bachors/jQuery-Github-Feed>).

When I started I had considered *forking* the original. However since it is old and not maintained, and because that I would be making extensive modifications to it I decided not to fork it.

# My Requirement Details



# Modifications

* Updated:
  * jQuery
  * Octicons
* Changed:
  * Modified CSS
  * Improved code readability 
  * Can specify other API URLs for the data (*part of anti-rate limiting*)

The other *major* modification that is made here is when and how the GitHub API data is retreived and *saved*. There is more about this in the next section.

## Cosmetic

## Anti-Rate Limiting

The GitHub API is *rate limited*. This means that you can only issue up to 60 *requests* in one hour, after than you will not be able to obtain data. And the API calls will fail.

The rate limiting may not be an issue for you if the page containing the feeds doesn't have a lot of visitors. However, there are no guarantees. It's generally better to design for "high traffic" scenarios.

### A Solution

The solution is simple... get the data *in the background* and limit the number of API hits. The data is saved and when a visitor arrives to view it the saved data is used and *not* the API.

To achieve this CRON and a *shell script* are used. I set up CRON to run periodically (*every 15 to 30 minutes*) and execute a script:

```bash
#!/bin/bash
# This is the CRON version of this file.
owner="jxmot"
gfdata=$HOME/public_html/gfdata

if [[ ! -d $gfdata ]];then
    mkdir $gfdata
fi

cd $gfdata
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner > "./"$owner"user.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/repos?type=sources&sort=updated&per_page=100" > "./"$owner"repos.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/events" > "./"$owner"events.json" 2>/dev/null
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/users/"$owner"/gists" > "./"$owner"gists.json" 2>/dev/null
```

**NOTE:** You may need to modify the script file to work in your environment. 

# Usage

