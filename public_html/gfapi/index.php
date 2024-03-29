<?php
// NOT FOR GITHUB
// This MUST be the first thing executed, you cannot set this
// later when the reposonse header is being created.
header('Access-Control-Allow-Origin: *');
// ^NOT FOR GITHUB
/*
    GitHub Feeds - a mock API endpoint that emulates what 
    GitHub would return.

    With the exception of "filtering", when this endpoint is 
    used for getting the repo data the data can be "filtered".

    If the "filter.json" file is present then filtering will occur.

    This relies on JSON files existing in the `../gfdata` 
    folder. They are created with the scripts in `../gfscripts`.
*/
// if false run normally, if true then fake the query
define('_DEBUG', false);
define('QRYSTR', ((isset($_SERVER['QUERY_STRING']) === true) ? $_SERVER['QUERY_STRING']    : null));

$result = '';

// check for debug/test mode
if(!defined('_DEBUG') || _DEBUG === false) {
// only change this if getghdata-cron.sh has 
// a modified `gfdata`
    $datapath = '../gfdata/';
    require_once('./filter.php');

    $queries = array();
    if(QRYSTR !== null) {
        /*
            Possible incoming query strings could be:

                ghfver
                githubuser
                githubuser/repos?type=sources&sort=updated&per_page=100
                githubuser/events
                githubuser/gists

            Where:
              * "ghfver" is a request for the current version number
              * "githubuser" is the GitHub user, as in //github.com/githubuser

            NOTE: When the client is jQuery ajax AND "cache: false" it 
            will cause "&_=[timestamp]" to be appended to the URL. This 
            becomes a problem when our query is only just "githubuser".
        */
        $qstr = str_replace('?','&',QRYSTR);
        if(strstr($qstr, '/') !== false) {
            $qstr = str_replace('/','',$qstr);
        } else {
            // this will remove the "&_=[timestamp]" portion
            $qstr = (($temp = strstr($qstr, '&_=', true)) === false ? $qstr : $temp);
            $qstr = $qstr . 'user';
        }
        parse_str($qstr, $queries);
        clearstatcache();

        if(strpos($qstr, 'ghfver') !== false) {
            $f = 'ghfver.json';
            if(file_exists($f))
                $result = file_get_contents($f);
            else $result = '{"ver":"file.not.found","name":"'.$f.'"}';
        } else {
            $datafile = $datapath . current(array_keys($queries)) . '.json';
            if(file_exists($datafile)) {
                // if the file is being updated its length
                // will be 0. What until the update is done.
                $waitlimit = 10;
                while(filesize($datafile) === 0) {
                    sleep(3);
                    clearstatcache();
                    $waitlimit = $waitlimit - 1;
                    error_log('github-feeds('.$waitlimit.'): waiting for non-zero :'.$datafile,0);
                    if($waitlimit <= 0) {
                        error_log('github-feeds(): exceeded limit while waiting for non-zero :'.$datafile,0);
                        header('HTTP/1.0 500 Internal Server Error');
                        header('github-feeds-error-information: Exceeded wait limit for file:'.$datafile);
                        exit;
                    }
                }
                $fileid = fopen($datafile,'r');
                if(strpos($datafile, 'repos') === false) {
                    if(strpos($datafile, 'events') === false) {
                        $result = fread($fileid,filesize($datafile));
                    } else {
                        // NOTE: this is optional, if the filter.json file does 
                        // not exist then raw data is returned.
                        $result = filterEvents(fread($fileid,filesize($datafile)));
                    }
                } else {
                    // NOTE: this is optional, if the filter.json file does 
                    // not exist then raw data is returned.
                    $result = filterRepos(fread($fileid,filesize($datafile)));
                }
                fclose($fileid);
            } else {
                $result = '{"error":"Data file was not found - '. $datafile .'","qry":"'.QRYSTR.'"}';
                error_log('github-feeds: Data file was not found :'.$datafile.'  query:'.QRYSTR,0);
            }
        } // if(strpos($qstr, 'ghfver') !== false)
    }
} else {
    // for testing the query string while _DEBUG is true
    if(QRYSTR !== null) {
        $result = '{"QRYSTR":"'. QRYSTR .'"}';
    }
    // set variables as needed for testing
//    $something = 'something';
}

header('HTTP/1.0 200 OK');
header('Content-Type: application/json; charset=utf-8');
header('Content-Encoding: text');

// NOTE: The JSON data can get caught up in caching
// on the server and in the browser. This will affect 
// the browser, and there's an htaccess file in this
// folder that also has an effect. The goal is to 
// keep this data from ever being cached.
header('Cache-Control: no-cache, no-store');

// just to make it look like we're the real API,
// the client might use this data.
header('x-ratelimit-limit: 99');
header('x-ratelimit-remaining: 99');
header('x-ratelimit-used: 0');
header('x-ratelimit-reset: ' . time());

echo $result;
exit;
?>