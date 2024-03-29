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
  * Modified CSS, fixed some classes and added a few. Also using CSS grid.
  * Improved code readability, added comments.
  * Can specify other API URLs for the data (*part of anti-rate limiting*)
  * Using [Shields.io](<https://shields.io/>) to display star and fork counts.
  * The Gists tab is optional, it is disabled by default.
  * Added an optional "scroll to top" button that appears in the footer, it is enabled by default.
  * Can have more than one feed, just add a new GitHub user name to an additional container.
  * Can optionally switch between light and dark themes. The switching is enabled by default.
  * Can optionally display a "wait" message while data is loading. Sometimes it could take longer than expected to retrieve all of the data. This feature will display a "standby" message until all of the data has been downloaded and rendered. Occasionally you might see it flash for a moment as the page is loading and before the data is seen.
  * Can render *markdown* nearly as well as GitHub. This can be seen in issue comments that have had text bounded by back-ticks (`).
  * Improved content, added optional content to the activities entries. Added activity events.
  * Added GitHub "PullRequestEvent" data to the "Activities" tab.
  * Added an optional repository filter. This filter will limit the repositories and user events seen by matching them to repository names in a filter JSON file.
  * Repository events, the original seemed incomplete to me. The repositories tab would show *updated* repositories but no other information was provided. I have changed this by using the GitHub API *directly* to obtain **repository events** from GitHub for *each repository that is rendered*.
  * Correctly interprets Markdown, anywhere GitHub allows Markdown will now be rendered correctly. I'm using  a *slightly* modified version of [ShowdownJS](<https://github.com/showdownjs/showdown>).

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

To achieve this CRON and a *shell script* are used. I set up CRON to run periodically (*every 5 to 30 minutes*) and execute the script `gfscripts/getghdata-cron.sh`

**NOTE:** You may need to modify the script file to work in your environment. Before you run it double-check the paths in variables `ghfeeds` and `gfdata`.

Another script `gfscripts/getghdata.sh`, is intended to be ran from the command line. Don't run in a CRON job.

# Usage

The following will guide you through getting the files ready and setting up the CRON job on your server. 

## Set Up

**You will need:**
* A web server with PHP >=5.6, Apache >=2.4 is recommended
* An understanding of CRON
* A means to copy files to your server, and command-line access
* Knowledge of where your *document root* is located on the server

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
4) Run this command to get the GitHub data - `../gfscripts/getghdata.sh [USER]`, where **`[USER]`** is the GitHub user who you want the data for.

You should now have three(*four, depending if Gists are enabled*) JSON files(*using the scripts as found*):

* `[USER]user.json` - user profile data
* `[USER]repos.json` - list of repositories, **NOTE:** This quantity is limited to a maximum of 100 repositories. The files `gfapi/filter.json` and `gfapi/filter.php` can be used to only allow specific repositories *by name*.
* `[USER]events.json` - list of the user's GitHub events
* `[USER]gists.json` - optional Gist data, it may not be present

The last file is `x-ratelimit.log`, it is a capture of HTTP headers that GitHub returns after an API request. 

### Set Up CRON

This depends on your server. Some servers that have cPanel have a nice interface for managing CRON jobs. And with others you may only have a command line to use for creating CRON jobs.

Basically, you want the `gfscripts/getghdata-cron.sh` file to run every 5 minutes. Don't use less time because you will overrun the GitHub rate limitation and the script will fail.

A sample CRON job:
```
*/5 * * * * /path-to-docroot/path-to/gfscripts/getghdata-cron.sh
```

It would be a good idea to keep an eye on the `gfdata` folder and look for *new* files to appear there, and then wait a while and see that they get updated.

#### Shared Server Notes

When installing on a *shared server* do **not** install the `gfapi` and `gfdata` folders on to more than one domain. Because the domains share an IP address the GitHub API will only see *one* client. And the rate limits will likely be exceeded. To get around this only install those folders under one domain and access it from clients hosted elsewhere.

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

### Error Notifications

Occasionally the GitHub API might be down or unresponsive. From the client side these errors can manifest as 0-length JSON data files. But this can also occur during normal operations while the data is being retrieved from the API. The scripts executed by CRON will overwrite the JSON files and initially their length will be 0. 

The code in `public_html/gfapi/index.php` will check for the 0-length condition and if found then it will retry for a fixed number of attempts. Currently there are 10 attempts with a 3 second delay between each attempt. Each attempt is logged in your servers PHP error log.

When the attempts are exhausted the client will received a `500 Internal Server Error` response and an entry will be written to your server's PHP error log. The response header contents will be:

```
HTTP/1.0 500 Internal Server Error
github-feeds-error-information: Exceeded wait limit for file: [USER][user|repos|events|gists].json
```

### Optional Repository and Event Filter

In some situations there can be large number of public repositories for the specified GitHub user. The maximum number is 100 since the current version of "GitHub Feeds" does not do any pagination when retrieving the repository data. 

And it may be possible that not all of them are desired in the rendered repository or events list.

Before the requested repository or event data is returned to the client it will be passed through `gfapi/filter.php:filterRepos()` or `gfapi/filter.php:filterEvents()`. Either function will look for a file named `gfapi/filter.json`, if it is found it contents will be used to determine which repositories and events are desired.

`gfapi/example_filter.json`:

```
{
    "_comment00":"all entries MUST be lowercase!!!",
    "_comment01":"repos that are named here, and render = true then that repo will be in the resulting data",
    "some-repo":{"render":true},
    "another-repo":{"render":true},
    "yet-another-repo":{"render":true},
    "_comment02":"repos can be filtered and not seen",
    "somewhere-repo":{"render":false}
}
```

Here is how filtering works:

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/filter.png" style="width:35%;border: 2px solid black;margin-left: 1rem;"; alt="Repository Filtering Flow Chart" title="Repository Filtering Flow Chart"/>
        <br>
        <figcaption><strong>Repository or Event Filtering</strong></figcaption>
    </figure>
</div>
<br>

**NOTE:** Filtering is only possible when using the `gfapi` endpoint.

## Repository Events

This new feature adds *repository event* data to each of the repositories that are rendered in the list. Unfortunately obtaining the repository event data requires a GitHub API call.

### Output Example

Shown side-by-side is a repository without any event data, and one with event data (inside of the red box):

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/repoev_1.png" style="width:35%;border: 2px solid black;margin-right: 1rem;"; alt="Example #1" title="Example #1, no event data"/>
        <img src="./mdimg/repoev_2.png" style="width:35%;border: 2px solid black;margin-left: 1rem;"; alt="Example #2" title="Example #2, has event data"/>
        <br>
        <figcaption><strong>Without and With Repository Event Data</strong></figcaption>
    </figure>
</div>
<br>

### Repository Event Retrieval

There are 4 distinct parts to repository event retrieval:

* Queuing the repository data used for event retrieval 
* Setting up event listeners for when the output element becomes visible
* Reacting when the event target element becomes visible and triggering GitHub repository event API calls
* Rendering the repository event data 

#### Queuing the Repository Data

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/repoflow_1.png" style="border: 2px solid black;margin-left: 1rem;"; alt="Queuing the Repository Data" title="Queuing the Repository Data"/>
        <br>
        <figcaption><strong>Queuing the Repository Data</strong></figcaption>
    </figure>
</div>
<br>

#### Setting Up Event Listeners

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/repoflow_2.png" style="border: 2px solid black;margin-left: 1rem;"; alt="Setting Up Event Listeners" title="Setting Up Event Listeners"/>
        <br>
        <figcaption><strong>Setting Up Event Listeners</strong></figcaption>
    </figure>
</div>
<br>

#### Reacting to Element Visibility

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/repoflow_3.png" style="border: 2px solid black;margin-left: 1rem;"; alt="Reacting to Element Visibility" title="Reacting to Element Visibility"/>
        <br>
        <figcaption><strong>Reacting to Element Visibility</strong></figcaption>
    </figure>
</div>
<br>

#### Rendering Event Data

<div align="center">
    <figure>
<!-- NOTE: When Github renders the images it will REMOVE the "margin", and ADD "max-width:100%" -->
        <img src="./mdimg/repoflow_4.png" style="border: 2px solid black;margin-left: 1rem;"; alt="Rendering Event Data" title="Rendering Event Data"/>
        <br>
        <figcaption><strong>Rendering Event Data</strong></figcaption>
    </figure>
</div>
<br>

## Changing Appearance

This is accomplished with *loading* and *unloading* CSS files, and the dark/light slide switch. Other than enabling or disabling the switch everything is contained in:
* `public_html/assets/css/lightdarksw.css` - CSS just for the switch itself
* `public_html/assets/js/swlightdark.js` - CSS load/unload functions, switch handler function

## To Top

This particular implementation of a "to top" scroll button can be applied to an *element*. And has an adjustable threshold for determining when the button appears. The files involved are:
* `public_html/assets/css/totop.css` - button styling and relative location
* `public_html/assets/js/github-feed.js` - contains `gfJumpToTop()`, a local function called when the button is clicked

## Trouble Shooting

### Missing Event Data

When using the filter it is possible that you may not see any repository event data. This can occur when - 
* When there as been a lot of activity in a repository
* AND that repository is not in the filter list. Or is not set to "render".

**RECOMMENDED**: If you've only got a few repositories then you won't likely need to filter them. Then make sure the `filter.json` file doesn't exist and nothing will be filtered.

# Known GitHub API Issues

The GitHub API is not perfect, it has bugs and some confusing documentation. I will try to clear up a few things here:

* Repository `"WatchEvent"` - This was an odd one. I found out that a "star" event type is not what you would expect. Such as "starred". Instead the data contains "started". GitHub support told me - "*Having the action as "started" is intentional. This is also referenced in our documentation:*". There's only a brief mention with no explanation as to "why", it can be found [here](<https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#watchevent>).
* Where oh where is the watchers count? This is another confusing GitHub API anomaly. You may have noticed that the repository list shown in the plug-on has star counts, fork counts, and issue counts. But no watcher counts. Even though the API documentation seems to indicate it should be available in the field `"subscribers_count"`. What is **not made clear** is that `"subscribers_count"` will only be available when retrieving data for a specific repository. That means that none of the “search” endpoints will return that field, period.
* GitHub API Failures - It can, and has happened. See [Error Notifications](#error_notifications) for details regarding how this is handled.

---
<img src="http://webexperiment.info/extcounter/mdcount.php?id=github-feeds">
