# github-feeds

This repository contains a "GitHub Feed" browser plug-in. On the back-end there is a *mock* API that can replace GitHub's.  

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
  * Modified CSS, fixed some classes and added a few. Also using CSS grid
  * Improved code readability, added comments
  * Can specify other API URLs for the data (*part of anti-rate limiting*)
  * Using [Shields.io](<https://shields.io/>) to display star and fork counts
  * The Gists tab is optional, it is disabled by default
  * Added an optional "scroll to top" button that appears in the footer, it is enabled by default
  * Can have more than one feed, just add a new GitHub user name **(*at this time the "to top" button must be disabled when more than one feed is used*)**
  * Can optionally switch between light and dark themes. The switching is enabled by default.

The other *major* modification that is made here is when and how the GitHub API data is retrieved and *saved*. There is more about this in the [Anti Rate Limiting](#anti-rate-limiting) section.

## Live Demo

You can view the demo [here](<https://webexperiment.info/portfolio/ghfeeds/>).

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/light.png" style="width:35%;border: 2px solid black;margin-right: 1rem;"; alt="Screen Shot Chrome on Android 12" txt="Screen Shot Chrome on Android 12"/>
        <img src="./mdimg/dark.png" style="width:35%;border: 2px solid black;margin-left: 1rem;"; alt="Screen Shot Firefox on Android 12" txt="Screen Shot Firefox on Android 12"/>
        <br>
        <figcaption><strong>Light and Dark Themes.</strong></figcaption>
    </figure>
</div>
<br>

## Anti Rate Limiting

The GitHub API is *rate limited*. This means that you can only issue up to 60 *requests* in one hour, after than you will not be able to obtain data and the API calls will fail.

The rate limiting may not be an issue for you if the page containing the feeds doesn't have a lot of visitors. However, there are no guarantees. It's generally better to design for "high traffic" scenarios.

### A Solution

The solution is simple... get the data *in the background* and limit the number of API hits. The data is saved and when a visitor arrives to view it the saved data is used and *not* the API.

To achieve this CRON and a *shell script* are used. I set up CRON to run periodically (*every 6 to 30 minutes*) and execute the script `gfscripts/getghdata-cron.sh`

**NOTE:** You may need to modify the script file to work in your environment. Before you run it double-check the paths in variables `ghfeeds` and `gfdata`.

Another script `gfscripts/getghdata.sh`, is intended to be ran from the command line. Don't run in a CRON job.

# Usage

The following will guide you through getting the files ready and setting up the CRON job on your server. 

## Set Up

**You will need:**
* A web server with PHP >5.6, Apache >2.x is recommended
* An understanding of CRON
* A means to copy files to your server, and command-line access
* Knowledge of where your *document root* is located

### For Experts Only

If you're well versed in all things "server" you probably won't need any detailed instructions. Just look over the following sections and note what needs to be edited.

### Server Preparation

1) Get access to your web server for copying files to it, and the command line to run a shell script.

2) Find your *document root*, you will need the path to it later

### Edit Files

**`public_html/index.html`:** Find `<div id="...` and edit `data-username="...` to the GitHub user name you want to use. **- required**

**`public_html/gfscripts/getghdata-cron.sh`**
* If the Gists feed is desired then find `# GIST: ...` and uncomment the `#curl -H "Accept:...` line.
* Edit `owner="...`, use the GitHub user name from the previous edit. **- required**
* Edit `docroot=...`, this should be the path to your server's *document root* folder.
* Optionally edit: *This is not required, the paths can be left as-is*
  * `gfdata=$docroot/ghfeeds/gfdata` - Change `ghfeeds` and `gfdata` if necessary

**`public_html/gfscripts/getghdata.sh`**
* If the Gists feed is desired then find `# GIST: ...` and uncomment the `#echo $owner...` and the `#curl -H "Accept:...` lines.

**`public_html/gfapi/index.php`** - Find the line `$datapath = '../gfdata/';` and change `gfdata` to match the previous edit in `getghdata-cron.sh`.

**`public_html/assets/js/github-feed.js`**
* The "Gists" tab is *optional*, and it is disabled by default. To enable it find `var showgists = false;` and change it to `true`. **NOTE:** If you enable Gists then editing `getghdata-cron.sh` and `getghdata.sh` is necessary.
* The "to top" button is optional, it is enabled by default. To change it find `var totop = true;` and change it to `false`.
  * There is a "top on tab switch" feature, , it is enabled by default. This will change the behavior of how the scroll bar is "homed" when a tab is switched *to*. When `true` switching tabs will immediately cause the feeds container to scroll to the top. When false it will use the same scrolling animation as the "to top" button. To change it find `var topontab = true;` and change it to `false`.
* The light/dark theme switch is optional, it is enabled by default. I needed a way to switch themes quickly so I could see differences and make adjustments as needed. It worked so well that I added come style to it and kept it. To disable the switch find `var lightdarksw = true;` and change it to `false`.

### Copy Files to the Server

Copy the **contents** of `public_html` (*including all subfolders and files*) to a suitable location on your server. Since this is a demonstation I recommend that you create a folder specifically for this demo.

#### Get the JSON Data

Before running the demo you will need some JSON data files. These files will contain the GitHub data you see in the feeds. To get the GitHub data follow these steps:

*You will need the command line interface(CLI) on your server.*

1) Change the current folder to the `gfscripts` folder. 
2) Run this command to make the scripts *executable* - `chmod +x *.sh`
3) Change the current folder to the **`gfdata`** folder.
4) Run this command to get the GitHub data - `../gfscripts/getghdata.sh [USER]`, where **`[USER]`** is the GitHub user who you want the data from.

You should now have three(*four, depending if Gists are enabled*) JSON files(*using the scripts as found*):

* `[USER]user.json` - user profile data
* `[USER]repos.json` - list of repositories, **NOTE:** This quantity is limited to a maximum of 100 repositories
* `[USER]events.json` - list of the user's GitHub events
* `[USER]gists.json` - optional Gist data, it may not be present

The last file is `x-ratelimit.log`, it is a capture of HTTP headers that GitHub returns after an API request. 

### Set Up CRON

This depends on your server. Some that have cPanel have a nice interface for managing CRON jobs. And with others you may only have a command line to use for creating CRON jobs.

Basically, you want the `gfscripts/getghdata-cron.sh` file to run every 5 minutes. Don't use less time because you will overrun the GitHub rate limitation and the script will fail.

A sample CRON job:
```
*/5 * * * * /path-to-docroot/path-to/gfscripts/getghdata-cron.sh
```

It would be a good idea to keep an eye on the `gfdata` folder and look for *new* files to appear there, and then wait a while and see that they get updated.

## Run 

Everything should be ready to go... take your browser and navigate to the folder you created when [you copied the files to the server](#copy-files-to-the-server).

You should see something very similar to the [screen shots](#live-demo) above.

# *Some* Design Details

## Mock GitHub API

This was *fun*, seriously. It really was! Even though one of my requirements was to not cause any *major* changes to `github-feed.js` where it originally used the GItHub API.

First I moved the API string *out of* `github-feed.js`. This was done by adding an `api` argument and having the feeds client supply the API URL.

Next I created a PHP script that mimics the GitHub API. It had to parse the queries that are used in `github-feed.js` and  return the correct JSON file.

The possible incoming query strings could be:

```
githubuser
githubuser/repos?type=sources&sort=updated&per_page=100
githubuser/events
githubuser/gists
```

Where "githubuser" is the GitHub user, as in `https://github.com/`**`githubuser`**. See `public_html/gfapi/index.php` for more details about parsing the queries.

## Changing Appearance

This is accomplished with *loading* and *unloading* CSS files, and the dark/light slide switch. Other than enabling or disabling the switch everything is contained in:
* `public_html/assets/css/lightdarksw.css` - CSS just for the switch itself
* `public_html/assets/js/swlightdark.js` - CSS load/unload functions, switch handler function

## To Top

This particular implementation of a "to top" scroll button can be applied to an *element*. And has an adjustable threshold for determining when the button appears. The files involved are:
* `public_html/assets/css/totop.css` - button styling and relative location
* `public_html/assets/js/totop.js` - enable or disable the button, and manage its appearance in the parent element
* `public_html/assets/js/github-feed.js` - contains `jumpToTop()`, a global function called when the button is clicked

---
<img src="http://webexperiment.info/extcounter/mdcount.php?id=github-feeds">
