<?php
/*
    GitHub Feeds - a mock API endpoint that emulates what 
    GitHub would return.

    This relies on JSON files existing in the `../gfdata` 
    folder. They are created with the scripts in `../gfscripts`.
*/
// if false run normally, if true then fake the query
define('_DEBUG', false);
define('QRYSTR', ((isset($_SERVER['QUERY_STRING']) === true) ? $_SERVER['QUERY_STRING']    : null));

// check for debug/test mode
if(!defined('_DEBUG') || _DEBUG === false) {
// only change this if getghdata-cron.sh has 
// a modified `gfdata`
    $datapath = '../gfdata/';

    $queries = array();
    if(QRYSTR !== null) {
        /*
            Possible incoming query strings could be:

                githubuser
                githubuser/repos?type=sources&sort=updated&per_page=100
                githubuser/events
                githubuser/gists

            Where "githubuser" is the GitHub user, as in //github.com/githubuser
        */
        $qstr = str_replace('?','&',QRYSTR);
        if(strstr($qstr, '/') !== false) {
            $qstr = str_replace('/','',$qstr);
        } else {
            $qstr = $qstr . 'user';
        }
        parse_str($qstr, $queries);

        $datafile = $datapath . current(array_keys($queries)) . '.json';
        clearstatcache();
        if(file_exists($datafile)) {
            // if the file is being updated its length
            // will be 0. What until the update is done.
            while(filesize($datafile) === 0) {
                sleep(3);
                clearstatcache();
                error_log('github-feeds: waiting for non-zero :'.$datafile,0);
            }
            $fileid = fopen($datafile,'r');
            $result = fread($fileid,filesize($datafile));
        } else {
            $result = '{"error":"Data file was not found - '. $datafile .'","qry":"'.QRYSTR.'"}';
            error_log('github-feeds: Data file was not found :'.$datafile,0);
        }
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