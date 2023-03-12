<?php
/*
    Repository Filter Function - Called when the previously 
    gathered repository data is retrieved. This function 
    will open a "filter" JSON file and use its contents to 
    allow, or remove specific repos from the data before 
    returning it to the requestor.

    NOTE: When using his filter it is possible that you may 
    not see any repo event data. This can occur when - 
        * When there as been a lot of activity in a repo
        * AND that repo is not in the filter list.

    RECOMMENDED: If you've only got a few repos then you won't 
    likely need to filter the repos. Then make sure the filter.json 
    file doesn't exist and nothiing will be filtered.
*/
// simply remove or rename the filter.json file and this 
// function will return raw data
function filterRepos($raw, $filtfile = './filter.json') {
    if(file_exists($filtfile)) {
        $data   = json_decode($raw);
        $filter = json_decode(file_get_contents($filtfile), true);
        $result = '[';
        $keep   = 0;

        for($ix = 0; $ix < count($data); $ix++) {
            $name = strtolower($data[$ix]->name);
            if(@$filter["{$name}"]) {
                if(@$filter["{$name}"]["render"]) {
                    $result .= ($keep > 0 ? ',' : '') . (json_encode($data[$ix]));
                    $keep += 1;
                } 
            } 
        }
        $result .= ']';
    } else {
        $result = $raw;
    }
    return $result;
}

function filterEvents($raw, $filtfile = './filter.json') {
    if(file_exists($filtfile)) {
        $data   = json_decode($raw);
        $filter = json_decode(file_get_contents($filtfile), true);
        $result = '[';
        $keep   = 0;

        for($ix = 0; $ix < count($data); $ix++) {
// NOTE: the next two lines are the only difference 
// from filterRepos(). 
// TODO: refactor and reduce lines of code here and in filterRepos()
            $name = strtolower($data[$ix]->repo->name);
            $name = substr($name, strrpos($name, '/')+1);
           if(@$filter["{$name}"]) {
                if(@$filter["{$name}"]["render"]) {
                    $result .= ($keep > 0 ? ',' : '') . (json_encode($data[$ix]));
                    $keep += 1;
                }
            } 
        }
        $result .= ']';
    } else {
        $result = $raw;
    }
    return $result;
}
?>