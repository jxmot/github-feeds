/***********************************************************
* #### jQuery-Github-Feed v3.0 ####
* Coded by Ican Bachors 2014.
* https://github.com/bachors/jQuery-Github-Feed
* Updates will be posted to this site.
***********************************************************/
/*
    This code has been extensively modified. Please see the 
    README in the repository that contins this file.

    Author: https://github.com/jxmot
    Repository: https://github.com/jxmot/github-feeds
*/
/*
    Obtain the most recent event for all repositories 
    that have been rendered.
*/
var reporeqs = [];

// https://codeutility.org/event-listener-for-when-element-becomes-visible/
function respondToVisibility(element, idx, callback) {
    new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.intersectionRatio > 0) {
                callback(element, idx);
                observer.disconnect();
            }
        });
    }).observe(element);
};

function queueRepoEvReqs(target, reponame, url, depth = 1) {
    //               0        1       2     3
    reporeqs.push([target, reponame, url, depth]);
};

const TARG = 0;
const REPN = 1;
const URL  = 2;
const DPTH = 3;

function getRepoEvents() {
    while(reporeqs.length > 0) {
        repo = reporeqs.shift();
        var element = document.getElementById(repo[TARG]);
        respondToVisibility(element, repo, function(e, r) {
            var evurl = r[URL] + '?per_page=' + r[DPTH];
            var ajx = $.ajax({
                url: evurl,
                crossDomain: true,
                dataType: 'json'
            });
            ajx.fail(function(jqXHR, textStatus) {
                console.log('getRepoEvents() - Request failed: ' + textStatus);
            });
            ajx.done(function(evdata) {
                if(evdata.length > 0) {

                    var action = '';
                    var actor  = {};

                    switch(evdata[0].type) {
                        case 'WatchEvent':
                            if(evdata[0].payload.action === 'started') {
                                action = 'starred this repository';
                            } else {
                                // not sure, is there a "watched"?
                                action = 'unknown action - ' + evdata[0].payload.action;
                                console.log('getRepoEvents() - ' + action);
                            }
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        case 'ForkEvent':
                            action = 'forked this repository';
                            actor.name = evdata[0].payload.forkee.owner.login;
                            actor.avat = evdata[0].payload.forkee.owner.avatar_url;
                            break;

                        case 'PushEvent':
                            action = 'pushed to this repository';
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        case 'IssueCommentEvent':
                            action = 'commented on an issue';
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        case 'IssuesEvent':
                            action = evdata[0].payload.action + ' an issue';
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        case 'CreateEvent':
                            action = 'created a ' + evdata[0].payload.ref_type;
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        case 'ReleaseEvent':
                            action = 'published a release';
                            actor.name = evdata[0].actor.login;
                            actor.avat = evdata[0].actor.avatar_url;
                            break;

                        default:
                            action = 'unknown type - ' + evdata[0].type;
                            console.log('getRepoEvents() - ' + action);
                            break;
                    };

                    if(action !== '') {
                        action += ' ' + relative_time(evdata[0].created_at) + ' ago.';
                        var out = '<img src="' + actor.avat + '"/> ';
                        out += actor.name + ' has ' + action;
                        $('#'+r[TARG]).html(out);
                        $('#'+r[TARG]).css('display','block');
                    }
                } else {
                    console.log('getRepoEvents() - no ev data ' + r[REPN]);
                    $('#'+r[TARG]).html('<i>Github has no event data.</i>');
                    $('#'+r[TARG]).css('display','block');
                }
            });
        });
    }
};

function relative_time(a) {
    if (!a) {
        return
    }
    a = $.trim(a);
    a = a.replace(/\.\d\d\d+/, "");
    a = a.replace(/-/, "/").replace(/-/, "/");
    a = a.replace(/T/, " ").replace(/Z/, " UTC");
    a = a.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
    var b = new Date(a);
    var c = (arguments.length > 1) ? arguments[1] : new Date();
    var d = parseInt((c.getTime() - b) / 1000);
    d = (d < 2) ? 2 : d;
    var r = '';
    if (d < 60) {
        r = 'just now'
    } else if (d < 120) {
        r = 'a min'
    } else if (d < (45 * 60)) {
        r = (parseInt(d / 60, 10)).toString() + ' mins'
    } else if (d < (2 * 60 * 60)) {
        r = 'an hr'
    } else if (d < (24 * 60 * 60)) {
        r = (parseInt(d / 3600, 10)).toString() + ' hrs'
    } else if (d < (48 * 60 * 60)) {
        r = 'a day'
    } else {
        dd = (parseInt(d / 86400, 10)).toString();
        if (dd <= 30) {
            r = dd + ' days'
        } else {
            mm = (parseInt(dd / 30, 10)).toString();
            if (mm <= 12) {
                r = mm + ' mon'
            } else {
                r = (parseInt(mm / 12, 10)).toString() + ' yrs'
            }
        }
    }
    return r
};

// When the user clicks on the to-top button, 
// scroll to the top of the container. This 
// function must be global and take the argument 
// as the username, it creates a selector from it.
function gfJumpToTop(uname, snap = false) {
    // only scroll the specified container, and 
    // snap the scroll if desired
    if(snap) {
        $('#' + uname + '>#ghfeed_body').scrollTop(0);
    } else {
        $('#' + uname + '>#ghfeed_body').stop(true).animate({scrollTop: 0},450);
    }
};

$.fn.githubfeed = function({
// default "base" address of the API we will use. 
api = 'https://api.github.com/users/', 
// sort repositories by...
sort = 'updated', 
// width of widget within the .ghfeed container
width = '100%', 
// height of the content space
height = '400px', 
// .foot title
title = 'github-feeds', 
// .foot link href
author = 'https://github.com/jxmot/github-feeds',
// if true show last x-ratelimit-* values in the .foot
debug = false,
// shows the heading if true
showhead = true,
// extra content, issues and releases
issuebody = true,
releasebody = true,
// show badges from shields.io
usebadges = true,
// the gists tab is optional
showgists = false,
// the "to top" button is optional
totop = true,
// scroll to top when a tab is switched to,
// otherwise leave the scroll where it was.
topontab = true,
// enable/disable theme switch and icon/emoji control
lightdarksw = true,
// true = single color icons, false = multi color emoji
lightdarkicon = false,
// initial busy spinner control
waitforit = true
} = {}) {

    // This is how the "Please Standby..." message gets 
    // hidden. 
    var loaded;
    const _REPO = 0, _ACTV = 1, _GIST = 2;
    if(waitforit === true) {
        loaded = new Array((showgists === true ? 3 : 2));
        loaded.forEach(function(v, i, a) {a[i] = false;});
    }
    // this gets called after data has been downloaded and 
    // rendered. 
    function loadDone(ix, z, x) {
        if(waitforit === true) {
            // set the "loaded" indicator for a specific section
            loaded[ix] = true;
            // check every element in the array, if all are true 
            // then hide the standby message.
            if(loaded.every(Boolean)) {
                $('.busy-spin span').addClass('icon-animate-stop');
                $('.busy-spin').css('display', 'none');
                $(z + ':eq(' + x + ') .feed-repos').css('display', 'block');
            }
        }
    };

    // set the width of the tabs(repos, activity, gists?) depending on 
    // how many there are.
    function setTabWidth(w) {
        var r = document.querySelector(':root');
        r.style.setProperty('--gftab-width', w);
    };

    /*
        "To Top" Button Management


    */
    // A percentage of element size, if scrolled past this
    // point the 'to top' button will be displayed. Adjust 
    // as needed.
    const element_scroll_travel = 0.1;
    // keeps redundant execution to a minimum
    var element_isToTop = false;
    // we will save the element that gets the button
    var topElemQ = null;
    var topElem = null;

    function enableToTop(elem) {
        topElemQ = elem;
        topElem = document.querySelector(elem);
        topElem.onscroll = onElementScroll;
    };

    function disableToTop(elem) {
        document.querySelector(elem).onscroll = nullFunc;
        document.querySelector(topElemQ + ' ~ .foot > #elemtop_button').style.display = 'none';
    };

    function nullFunc() {};

    function onElementScroll() {
        if(showElementToTop()) {
            // has the button been enabled yet?
            if(element_isToTop === false) {
                document.querySelector(topElemQ + ' ~ .foot > #elemtop_button').style.display = 'block';
                element_isToTop = true;
            }
        } else {
            // has the button been disabled yet?
            if(element_isToTop === true) {
                document.querySelector(topElemQ + ' ~ .foot > #elemtop_button').style.display = 'none';
                element_isToTop = false;
            }
        }
    };

    // returns true if the 'to top' button should be made visible
    function showElementToTop() {
        // the point where the the button appears is based on the 
        // percentage of the height of the document and NOT the window.
        if(topElem === null) return false;
        if(Math.round((topElem.scrollHeight * element_scroll_travel)) < topElem.scrollTop) return true;
        else return false;
    };

    function profile(d, x, z) {
// need a variable for access to ajax functions
        var ajx = $.ajax({
            url: api + d.toLowerCase(),
            crossDomain: true,
            dataType: 'json',
            cache: false
        });
// added all .fail() functions
        ajx.fail(function(jqXHR, textStatus) {
            console.log('profile() - Request failed: ' + textStatus);
        });
        ajx.done(function(b) {
// keep track of rate limit
// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#checking-your-rate-limit-status
            var stats = {
                limit: ajx.getResponseHeader('x-ratelimit-limit'),
                remain: ajx.getResponseHeader('x-ratelimit-remaining'),
                used: ajx.getResponseHeader('x-ratelimit-used'),
                reset: [ 
                    ajx.getResponseHeader('x-ratelimit-reset'),
                    Date(ajx.getResponseHeader('x-ratelimit-reset')*1000).toLocaleString()
                ]
            };

            if(showhead === true) {
                var c = '    <div class="col-1-of-3 avatar-img">';
                c += '        <a href="https://github.com/' + b.login + '" target="_blank"><img src="' + b.avatar_url + '"></a>';
                c += '    </div>';
                c += '    <div class="col-2-of-3 user-bio">';
                c += '        <a href="https://github.com/' + b.login + '" target="_blank">' + b.name + '</a>';
                if(b.type != 'User'){
                    c += '        <p>' + (b.bio != null ? b.bio : '') + '</p>';
                }
                c += '        <p><span class="octicon octicon-location"></span> ' + (b.location != null ? b.location : '') + '</p>';
                if(b.type == 'User'){
                    c += '        <p><span class="user">Followers <span>'+ b.followers + '</span></span> <span class="user">Following <span>'+ b.following + '</span></span></p>';
                }
                c += '    </div>';
                if(lightdarksw === true) {
                    c += '    <div class="col-3-of-3 lightdarksw">';
                    if(lightdarkicon === true) c += '        <span class="light-icon light-icon-size">&#9788;&nbsp;</span>';
                    else c += '        <span class="light-icon">&#127774;</span>';
                    c += '        <label class="switch">';
                    c += '            <input type="checkbox" onclick="swLightDark()">';
                    c += '            <span class="slider round"></span>';
                    c += '        </label>';
                    if(lightdarkicon === true) c += '        <span class="dark-icon dark-icon-size">&nbsp;&#9789;</span>';
                    else c += '        <span class="dark-icon">&#127772;</span>';
                    c += '    </div>';
                }
                $(z + ':eq(' + x + ') .github-feed .head').html(c);
            }
            tabs(d, x, z, b);
        });
    };

    function tabs(d, x, z, b) {
        if(debug === true) {
            // using .foot for rate limit stats
            s = 'Limit: ' + stats.limit + '&nbsp;&nbsp;&nbsp;' + 'Remaining: ' + stats.remain + '&nbsp;&nbsp;&nbsp;' + 'Reset: ' + stats.reset[1];
            $(z + ':eq(' + x + ') .github-feed .foot').html(s);
        }
        if(showgists === true) {
            $(z + ':eq(' + x + ') .github-feed sup.gisc').html(b.public_gists);
        }
        $(z + ':eq(' + x + ') .github-feed .gftab').click(function() {
            $(z + ':eq(' + x + ') .github-feed .gftab').removeClass('aktip');
            $(z + ':eq(' + x + ') .github-feed .feed').css('display', 'none');
            var a = $(this).data('dip');
            $(this).addClass('aktip');
            $(z + ':eq(' + x + ') .' + 'feed-' + a).css('display', 'block');
            if(topontab === true) gfJumpToTop(d.toLowerCase(), true);
            return false;
        });
    };

    function repos(d, x, z) {
        var owner = d;
        var ajx = $.ajax({
// try to remove unwanted repos, and not have any 
// "repo not found" errors in the shields.io badges.
// also needs "&per_page=100" to get almost correct quantity 
// of repos back. FYI- there is no "pagination" here.
// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#pagination
// https://jesse.sh/async-api-calls-with-pagination/#getting-the-next-page
            url: api + d.toLowerCase() + '/repos?type=sources&sort=' + sort + '&per_page=100',
            crossDomain: true,
            dataType: 'json',
            cache: false
        });
        ajx.fail(function(jqXHR, textStatus) {
            console.log('repos() - Request failed: ' + textStatus);
        });
        ajx.done(function(b) {
// keep track of rate limit
// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#checking-your-rate-limit-status
            var stats = {
                limit: ajx.getResponseHeader('x-ratelimit-limit'),
                remain: ajx.getResponseHeader('x-ratelimit-remaining'),
                used: ajx.getResponseHeader('x-ratelimit-used'),
                reset: [ 
                    ajx.getResponseHeader('x-ratelimit-reset'),
                    Date(ajx.getResponseHeader('x-ratelimit-reset')*1000).toLocaleString()
                ],
// won't be needed with "&per_page=100", when the 
// quantity of repos is larger than "&per_page=" (the 
// default is 30) then this will be present.
//                link: ajx.getResponseHeader('link').split(',')
            };

            if(debug === true) {
                // using .foot for rate limit stats
                s = 'Limit: ' + stats.limit + '&nbsp;&nbsp;&nbsp;' + 'Remaining: ' + stats.remain + '&nbsp;&nbsp;&nbsp;' + 'Reset: ' + stats.reset[1];
                $(z + ':eq(' + x + ') .github-feed .foot').html(s);
            }

            var c = '';
            $.each(b, function(i, a) {
                c += '<div class="result">';
                c += '    <div class="icon">';
                c += '        <span class="octicon octicon-repo"></span>';
                c += '    </div>';
                c += '    <div class="gfpost">';
                c += '        <a href="' + b[i].html_url + '" target="_blank">' + b[i].name + '</a>';
                c += '        <p>' + (b[i].description === null ? '<i>No Description Provided</i>' : b[i].description.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ & /g, ' &amp; ')) + '</p>';
                c += '        <p class="date">created ' + relative_time(b[i].created_at) + ' ago - updated ' + relative_time(b[i].updated_at) + ' ago</p>';
                c += '        <p id="repo_event-' +  b[i].name + '" class="repoevent"></p>';
                // queue the repo event request
                queueRepoEvReqs('repo_event-' +  b[i].name, b[i].name, b[i].events_url);
                c += '    </div>';
                c += '    <div class="contributor">';

                if(usebadges === true) {
                    // shields.io badges
                    c += '        <img class="" src="https://img.shields.io/github/stars/'+ d + '/' + b[i].name + '">';
                    c += '        <br>';
                    c += '        <img class="" src="https://img.shields.io/github/forks/'+ d + '/' + b[i].name + '">';
                } else {
// NOTE: It would be nice to have the "subscribers_count" 
// field. BUT it's not here, you will only see it if getting 
// a specific repo.
                    c += '        <a title="Open in new tab" href="' + b[i].html_url + '/stargazers" target="_blank"><span>' + addCommas(b[i].stargazers_count) + '</span> <i class="octicon octicon-star"></i></a><br>';
                    c += '        <a title="Open in new tab" href="' + b[i].html_url + '/network/members" target="_blank"><span>' + addCommas(b[i].forks_count) + '</span> <i class="octicon octicon-repo-forked"></i></a><br>';
                    c += '        <a title="Open in new tab" href="' + b[i].html_url + '/issues" target="_blank"><span>' + addCommas(b[i].open_issues) + '</span> <i class="octicon octicon-issue-opened"></i></a>';
                }
                c += '    </div>';
                c += '</div>'
            });
            $(z + ':eq(' + x + ') .feed-repos').html(c)
            // should work with filter nor not
            $('.github-feed sup.repc').html(b.length);
            loadDone(_REPO, z, x);
            // process queued repo event requests, just 
            // wait a short time before getting them
            setTimeout(getRepoEvents, 1000);
        });
    };

    function events(f, x, z) {
        var ajx = $.ajax({
            url: api + f.toLowerCase() + '/events',  // + '&per_page=100',
            crossDomain: true,
            dataType: 'json',
            cache: false
        });
        ajx.fail(function(jqXHR, textStatus) {
            console.log('events() - Request failed: ' + textStatus);
        });
        ajx.done(function(d) {
// keep track of rate limit
// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#checking-your-rate-limit-status
            var stats = {
                limit: ajx.getResponseHeader('x-ratelimit-limit'),
                remain: ajx.getResponseHeader('x-ratelimit-remaining'),
                used: ajx.getResponseHeader('x-ratelimit-used'),
                reset: [ 
                    ajx.getResponseHeader('x-ratelimit-reset'),
                    Date(ajx.getResponseHeader('x-ratelimit-reset')*1000).toLocaleString()
                ]
            };

            if(debug === true) {
                // using .foot for rate limit stats
                s = 'Limit: ' + stats.limit + '&nbsp;&nbsp;&nbsp;' + 'Remaining: ' + stats.remain + '&nbsp;&nbsp;&nbsp;' + 'Reset: ' + stats.reset[1];
                $(z + ':eq(' + x + ') .github-feed .foot').html(s);
            }

            var e = '';
            $.each(d, function(i, a) {
                if (d[i].type == "WatchEvent") {
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-star"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += (d[i].payload.action === 'started' ? 'starred' : d[i].payload.action) + ' ';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
                    e += '    </div>';
                    e += '</div>'
                } else if (d[i].type == "ForkEvent") {
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-repo-forked"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += '        forked ';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a> to';
                    e += '        <a href="https://github.com/' + d[i].payload.forkee.full_name + '" target="_blank">' + d[i].payload.forkee.full_name + '</a>';
                    e += '        <span class="date">' + relative_time(d[i].created_at) + ' ago</span>';
                    e += '    </div>';
                    e += '</div>'
                } else if (d[i].type == "ReleaseEvent") {
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-tag"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += '        released ';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '/release/tag/' + d[i].payload.release.tag_name + '" target="_blank">' + d[i].payload.release.tag_name + '</a> at';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
                    if(releasebody === true) {
                        e += '        <p class="release-body">' + renderMD(d[i].payload.release.body) + '</p>';
                    }
                    e += '        <p><span class="octicon octicon-cloud-download"></span> <a href="' + d[i].payload.release.tarball_url + '" target="_blank">Download Source Code (tar)</a></p>';
                    e += '        <p><span class="octicon octicon-cloud-download"></span> <a href="' + d[i].payload.release.zipball_url + '" target="_blank">Download Source Code (zip)</a></p>';

                    e += '    </div>';
                    e += '</div>'
                } else if (d[i].type == "IssueCommentEvent") {
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-comment-discussion"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += '        commented on issue in ';
                    e += '        <a href="' + d[i].payload.issue.html_url + '" target="_blank">' + d[i].repo.name + ' - ' + d[i].payload.issue.title + ' #' + d[i].payload.issue.number + '</a>';
                    e += '        ' + renderMD(d[i].payload.comment.body);
                    e += '    </div>';
                    e += '</div>'
                } else if (d[i].type == "IssuesEvent") {
                    var b = "";
                    if (d[i].payload.action == "closed") {
                        b += "closed issue in"
                    } else if (d[i].payload.action == "opened") {
                        b += "opened issue in"
                    }
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-issue-' + d[i].payload.action + '"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += b + ' ';
                    e += '        <a href="' + d[i].payload.issue.html_url + '" target="_blank">' + d[i].repo.name + ' - ' + d[i].payload.issue.title + ' #' + d[i].payload.issue.number + '</a>';
                    if(issuebody === true) {
                        e += renderMD(d[i].payload.issue.body);
                    }
                    e += '    </div>';
                    e += '</div>'
                } else if((d[i].type == "PushEvent") && (d[i].payload.commits.length > 0)) {
                    if (d[i].payload.ref.substring(0, 11) === 'refs/heads/') {
                        rep = d[i].payload.ref.substring(11);
                    } else {
                        rep = d[i].payload.ref;
                    }
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-git-commit"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += '        pushed to ';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '/tree/' + d[i].payload.ref + '" target="_blank">' + rep + '</a> in ';
                    e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
                    var c = d[i].payload.commits.length;

                    if(c === 2) {
                        e += '    <p><a class="shalink" href="https://github.com/' + d[i].repo.name + '/commit/' + d[i].payload.commits[0].sha + '" target="_blank">' + d[i].payload.commits[0].sha.substr(0, 6) + '</a> - ' + renderMD(d[i].payload.commits[0].message, {simpleLineBreaks: true, _noPwrap: true}) + '</p>';
                        e += '    <p><a class="shalink" href="https://github.com/' + d[i].repo.name + '/commit/' + d[i].payload.commits[1].sha + '" target="_blank">' + d[i].payload.commits[1].sha.substr(0, 6) + '</a> - ' + renderMD(d[i].payload.commits[1].message, {simpleLineBreaks: true, _noPwrap: true}) + '</p>';
                        e += '    <br><p><a href="https://github.com/' + d[i].repo.name + '/compare/' + d[i].payload.before + '...' + d[i].payload.head + '" target="_blank">View comparison for these 2 commits &raquo;</a></p>'
                    } else if(c > 2) {
                        e += '    <p><a class="shalink" href="https://github.com/' + d[i].repo.name + '/commit/' + d[i].payload.commits[0].sha + '" target="_blank">' + d[i].payload.commits[0].sha.substr(0, 6) + '</a> - ' + renderMD(d[i].payload.commits[0].message, {simpleLineBreaks: true, _noPwrap: true}) + '</p>';
                        e += '    <p><a class="shalink" href="https://github.com/' + d[i].repo.name + '/commit/' + d[i].payload.commits[1].sha + '" target="_blank">' + d[i].payload.commits[1].sha.substr(0, 6) + '</a> - ' + renderMD(d[i].payload.commits[1].message, {simpleLineBreaks: true, _noPwrap: true}) + '</p>';
                        e += '    <br><p><a href="https://github.com/' + d[i].repo.name + '/compare/' + d[i].payload.before + '...' + d[i].payload.head + '" target="_blank">' + (c - 2) + ' more commit &raquo;</a></p>'
                    } else {
                        if(c > 0) {
                            e += '    <p><a class="shalink" href="https://github.com/' + d[i].repo.name + '/commit/' + d[i].payload.commits[0].sha + '" target="_blank">' + d[i].payload.commits[0].sha.substr(0, 6) + '</a> - ' + renderMD(d[i].payload.commits[0].message, {simpleLineBreaks: true, _noPwrap: true}) + '</p>';
                        }
                    }
                    e += '    </div>';
                    e += '</div>'
                } else if (d[i].type == "CreateEvent") {
                    if (d[i].payload.ref_type == "branch") {
                        e += '<div class="result">';
                        e += '    <div class="icon">';
                        e += '        <span class="octicon octicon-git-branch"></span>';
                        e += '    </div>';
                        e += '    <div class="gfpost event-post">';
                        e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                        e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                        e += '        created branch ';
                        e += '        <a href="https://github.com/' + d[i].repo.name + '/tree/' + d[i].payload.ref + '" target="_blank">' + d[i].payload.ref + '</a> at ';
                        e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
//                        e += '        <span class="date">' + relative_time(d[i].created_at) + ' ago</span>';
                        e += '    </div>';
                        e += '</div>'
                    } else if (d[i].payload.ref_type == "repository") {
                        e += '<div class="result">';
                        e += '    <div class="icon">';
                        e += '        <span class="octicon octicon-plus"></span>';
                        e += '    </div>';
                        e += '    <div class="gfpost event-post">';
                        e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                        e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                        e += '        created repository ';
                        e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
//                        e += '        <span class="date">' + relative_time(d[i].created_at) + ' ago</span>';
                        e += '    </div>';
                        e += '</div>'
                    } else if (d[i].payload.ref_type == "tag") {
                        e += '<div class="result">';
                        e += '    <div class="icon">';
                        e += '        <span class="octicon octicon-tag"></span>';
                        e += '    </div>';
                        e += '    <div class="gfpost event-post">';
                        e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                        e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                        e += '        created tag ';
                        e += '        <a href="https://github.com/' + d[i].repo.name + '/tree/'+d[i].payload.ref+'" target="_blank">' + d[i].payload.ref + '</a> at';
                        e += '        <a href="https://github.com/' + d[i].repo.name + '" target="_blank">' + d[i].repo.name + '</a>';
//                        e += '        <span class="date">' + relative_time(d[i].created_at) + ' ago</span>';
                        e += '    </div>';
                        e += '</div>'
                    }
                } else if (d[i].type == "PullRequestEvent") {
                    // https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pullrequestevent
                    var b = "";
                    if (d[i].payload.action == "closed") {
                        b += "closed PR"
                    } else if (d[i].payload.action == "opened") {
                        b += "opened PR"
                    }
                    e += '<div class="result">';
                    e += '    <div class="icon">';
                    e += '        <span class="octicon octicon-git-pull-request"></span>';
                    e += '    </div>';
                    e += '    <div class="gfpost event-post">';
                    e += '        <p class="date">' + relative_time(d[i].created_at) + ' ago</p>';
                    e += '        <a href="https://github.com/' + d[i].actor.login + '" target="_blank">' + d[i].actor.login + '</a> ';
                    e += b + ' ';
                    e += '        <a href="' + d[i].payload.pull_request.html_url + '" target="_blank">' + d[i].repo.name + '#' + d[i].payload.pull_request.number + '</a>';
                    e += '        <p>' + d[i].payload.pull_request.title + '</p>';
                    e += '        <p>' + renderMD(d[i].payload.pull_request.body) + '</p>';
                    e += '    </div>';
                    e += '</div>'
                }
            });
            $(z + ':eq(' + x + ') .feed-activ').html(e)

            loadDone(_ACTV, z, x);
        });
    };

    function gists(d, x, z) {
        var ajx = $.ajax({
            url: api + d.toLowerCase() + '/gists',
            crossDomain: true,
            dataType: 'json',
            cache: false
        });
        ajx.fail(function(jqXHR, textStatus) {
            console.log('gists() - Request failed: ' + textStatus);
        });
        ajx.done(function(b) {
// keep track of rate limit
// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#checking-your-rate-limit-status
            var stats = {
                limit: ajx.getResponseHeader('x-ratelimit-limit'),
                remain: ajx.getResponseHeader('x-ratelimit-remaining'),
                used: ajx.getResponseHeader('x-ratelimit-used'),
                reset: [ 
                    ajx.getResponseHeader('x-ratelimit-reset'),
                    Date(ajx.getResponseHeader('x-ratelimit-reset')*1000).toLocaleString()
                ]
            };

            if(debug === true) {
                // using .foot for rate limit stats
                s = 'Limit: ' + stats.limit + '&nbsp;&nbsp;&nbsp;' + 'Remaining: ' + stats.remain + '&nbsp;&nbsp;&nbsp;' + 'Reset: ' + stats.reset[1];
                $(z + ':eq(' + x + ') .github-feed .foot').html(s);
            }

            var c = '';
            $.each(b, function(i, a) {
                var keys = Object.keys(b[i].files);
                c += '<div class="result">';
                c += '    <div class="icon">';
                c += '        <span class="octicon octicon-code"></span>';
                c += '    </div>';
                c += '    <div class="gfpost">';
                c += '        <a href="' + b[i].html_url + '" target="_blank">' + keys[0] + '</a>';
                c += '        <p>' + (b[i].description != null ? b[i].description.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ & /g, ' &amp; ') : '') + '</p>';
                c += '        <p class="date">created ' + relative_time(b[i].created_at) + ' ago - updated ' + relative_time(b[i].updated_at) + ' ago</p>';
                c += '    </div>';
                c += '    <div class="contributor">';
                c += '        <a href="' + b[i].html_url + '" target="_blank"><span>' + addCommas(b[i].comments) + '</span> <i class="octicon octicon-comment"></i></a>';
                c += '    </div>';
                c += '</div>'
            });
            $(z + ':eq(' + x + ') .feed-gists').html(c)

            loadDone(_GIST, z, x);
        });
    };

    function addCommas(a) {
        var b = parseInt(a, 10);
        if (b === null) {
            return 0
        }
        if (b >= 1000000000) {
            return (b / 1000000000).toFixed(1).replace(/\.0$/, "") + "G"
        }
        if (b >= 1000000) {
            return (b / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
        }
        if (b >= 1000) {
            return (b / 1000).toFixed(1).replace(/\.0$/, "") + "K"
        }
        return b
    };

    $(this).each(function(i, a) {
        var b = ($(this).attr('id') != null ? '#' + $(this).attr('id') : '.' + $(this).attr('class')),
            g = $(this).data('username').toLowerCase(),
            j = '';
        
        // the 'username' will make this container unique on a page
        j += '<div id="' + g + '" class="github-feed" style="width: ' + width + '">';
        if(showhead === true) j += '  <div class="col-3x head"></div>';
        j += '  <div class="gftabs">';
        j += '    <div title="Click to see Repositories" class="gftab aktip" data-dip="repos">Repositories <sup class="repc"></sup></div><div title="Click to see Current Activity" class="gftab" data-dip="activ">Activity</div>';
        if(showgists === true) {
            setTabWidth('33.33%');
            j += '<div title="Click to see Gists" class="gftab" data-dip="gists">Gists <sup class="gisc"></sup></div>';
        } else {
            setTabWidth('50%');
        }
        j += '  </div>';
        j += '  <div id="ghfeed_body" class="bod" style="height: ' + height + '">';

        if(waitforit === true) {
            j += '    <div class="feed busy-spin"><span class="octicon octicon-mark-github icon-animate-spiny" style=""></span><br><span>Please Stand By...</span></div>';
            j += '    <div class="feed feed-repos" style="display:none"></div>';
        } else {
            j += '    <div class="feed feed-repos"></div>';
        }
        if(showgists === true) {
            j += '    <div class="feed feed-gists" style="display:none"></div>';
        }
        j += '    <div class="feed feed-activ" style="display:none"></div>';
        j += '  </div>';
        j += '  <div class="foot">';
        if(debug === false) {
            j += '    <a title="See this on GitHub" href="' + author + '" class="" target="_blank"><span class="octicon octicon-mark-github icon-animate-spiny" style=""></span>&nbsp;' + title + '</a>';
        }
        if((totop === true) && (typeof enableToTop === 'function')) {
            j += '    <button id="elemtop_button" class="gototop gf-gototop gototop-footer" onclick="gfJumpToTop(\'' + g + '\')" title="Go to top">';
            j += '        <span id="gototop_span" class="gototop-span">&#9650;</span>';
            j += '    </button>';
        }
        j += '  </div>';
        j += '</div>';
        $(this).html(j);

        // the 'username' will be used a part of the selector, that 
        // way multiple "feeds" can be created and have their own 
        // to top button. See issue #1
        if((totop === true) && (typeof enableToTop === 'function')) enableToTop('#' + g + '>' + '#ghfeed_body');

        profile(g, i, b);
        repos(g, i, b);
        events(g, i, b);
        if(showgists === true) {
            gists(g, i, b);
        }
    });
};
