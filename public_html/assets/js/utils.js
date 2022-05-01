/* 
    Utility Functions

    Author: https://github.com/jxmot
    Repository: https://github.com/jxmot/github-feeds
*/

// insert a new string into a string at an index
function insertAt(orig, index, insrt) {
    if(index > 0) {
        return orig.substring(0, index) + insrt + orig.substr(index);
    }
    return insrt + orig;
};

// replace a character with a new string at an index
function replaceAt(orig, index, rplcmnt) {
    if(index >= orig.length) {
        return orig.valueOf();
    }
    return orig.substring(0, index) + rplcmnt + orig.substring(index + 1);
};

// is the number even?
function isEven(num) {
    return ((num % 2) === 0);
};

// render markdown flavored text as HTML
function renderMD(input) {
    var step = 0;
    var loc = 0;
    var output = input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/ & /g, ' &amp; ');
    while((loc = output.lastIndexOf('`')) !== -1) {
        output = replaceAt(output, loc, '<');
        if(isEven(step)) {
            output = insertAt(output, loc+1, '/code>');
        } else {
            output = insertAt(output, loc+1, 'code>');
        }
        step++;
    }
    return output;
};

// Used for testing, uncomment and run with node.js
//var input = "notes:\n* each entry save `d[i].created_at` in an attribute of the `<p class=\"date\">`\n* to iterate through entries it may be easier to add & use a sequenced ID - `<p id=\"ago-[1 - x]\" class=\"date\">`";
//var input = "Tried a couple of fontawesome SVGs, did not work well. And they do not (*this is expected*) size easily. Decided that HTML codes (&#9788; & &#9789;) would work better. They are easier to size via CSS and the colors can be easily changed.\n\nInstead of changing over to the icons a means to select icons or emojis was added. Look for `lightdarkicon` and change to either true(icons) or false(emojis).";
//console.log(renderMD(input));

