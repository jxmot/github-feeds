<?php
/*
    Repository Filter Function - Called when the previously 
    gathered repository data is retrieved. This function 
    will open a "filter" JSON file and use its contents to 
    allow, or remove specific repos from the data before 
    returning it to the requestor.
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
?>