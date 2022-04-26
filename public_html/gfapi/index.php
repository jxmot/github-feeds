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
    // MUST be done like this for PHP files that are 'linked'
    $queries = array();
    if(QRYSTR !== null) {
        $qstr = str_replace('?','&',QRYSTR);
        if(strstr($qstr, '/') !== false) {
            $qstr = str_replace('/','',$qstr);
        } else {
            $qstr = $qstr . 'user';
        }
        parse_str($qstr, $queries);

        $datafile = '../gfdata/' . current(array_keys($queries)) . '.json';
        if(file_exists($datafile)) {
            $fileid = fopen($datafile,'r');
            $result = fread($fileid,filesize($datafile));
        } else {
            $result = '{"error":"Data file was not found - '. $datafile .'","qry":"'.QRYSTR.'"}';
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

header('x-ratelimit-limit: 99');
header('x-ratelimit-remaining: 99');
header('x-ratelimit-used: 0');
header('x-ratelimit-reset: ' . (time() + 86400));

echo $result;
exit;
?>