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
function renderMD(input, opt = {simpleLineBreaks: true}, dbg = false) {

    if(dbg === true) {
        // set breakpoint here
        dbg = !dbg;
    }

    if(input === null) return '';

    // set up the converter...
    var converter = new showdown.Converter(opt);
    converter.setFlavor('github');

    var output = converter.makeHtml(input.replace(/ & /g, ' &amp; ').replace('(<', '(').replace('>)', ')'));
    output = output.replace('<a ', '<a target="_blank" title="Open in new tab" ');
    return output;
};

// Used for testing, uncomment and run with node.js
//var input = "notes:\n* each entry save `d[i].created_at` in an attribute of the `<p class=\"date\">`\n* to iterate through entries it may be easier to add & use a sequenced ID - `<p id=\"ago-[1 - x]\" class=\"date\">`";
//var input = "Tried a couple of fontawesome SVGs, did not work well. And they do not (*this is expected*) size easily. Decided that HTML codes (&#9788; & &#9789;) would work better. They are easier to size via CSS and the colors can be easily changed.\n\nInstead of changing over to the icons a means to select icons or emojis was added. Look for `lightdarkicon` and change to either true(icons) or false(emojis).";
//var input = "minor adjustment for <code>";
//console.log(renderMD(input));

