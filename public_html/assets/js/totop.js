/*
    totop.js - 'To Top' functionality, displays a stylized 
    'to top' button when the document is scrolled past a 
    specific distance determined by the length of the document.

    NOTE: The scrollTo() function resides elsewhere. That is 
    because it needs access to the height of the page's nav 
    bar. See nobs.js

    As described at (but with major modifications & improvements) - 
        https://www.w3schools.com/howto/howto_js_scroll_to_top.asp

    Author: https://github.com/jxmot
    Repository: https://github.com/jxmot/website_template-no_bootstrap
*/
// call our function when the window contents are scrolled
//window.onscroll = function() {onWindowScroll()};

// https://linuxhint.com/disable-scrolling-javascript/

// A percentage of document size, if scrolled past this
// point the 'to top' button will be displayed. Adjust 
// as needed.
const scroll_travel = 0.1;
// keeps redundant execution to a minimum
var isToTop = false;

var topElem = null;

function enableToTop(elem) {
    if(elem.charAt(0) === '#') elem = elem.substring(1);
    topElem = document.getElementById(elem);
    topElem.onscroll = onElementScroll;
};

function disableToTop(elem) {
    if(elem.charAt(0) === '#') elem = elem.substring(1);
    document.getElementById(elem).onscroll = nullFunc;
    document.getElementById('gototop_button').style.display = 'none';
};

function nullFunc() {};

function onElementScroll() {
    // for debugging
    //dump();
    if(showToTop()) {
        // has the button been enabled yet?
        if(isToTop === false) {
            document.getElementById('gototop_button').style.display = 'block';
            isToTop = true;
        }
    } else {
        // has the button been disabled yet?
        if(isToTop === true) {
            document.getElementById('gototop_button').style.display = 'none';
            isToTop = false;
        }
    }
};

// returns true if the 'to top' button should be made visible
function showToTop() {
    // the point where the the button appears is based on the 
    // percentage of the height of the document and NOT the window.
    if(topElem === null) return false;
    if(Math.round((topElem.scrollHeight * scroll_travel)) < topElem.scrollTop) return true;
    else return false;
};

// called as needed after the page has loaded, this will 
// adjust the size of the to-top button. (Firefox SUCKS!)
//function adjustToTop() {
//    // this is necessary because the default value is 
//    // too large and in FF mobile it won't be seen
//    scroll_travel = 0.05;
//    // the values of these adjustments are dependant 
//    // on the values in .gototop(totop.css)
//    document.getElementById('gototop_button').style.right  = '5%';
//    document.getElementById('gototop_button').style.width  = '1.5em';
//    document.getElementById('gototop_button').style.height = '1.5em';
//    document.getElementById('gototop_span').style.fontSize = '0.7em';
//};

// for debugging
function dump() {
    console.log($(document).height());
    console.log(document.documentElement.scrollTop);
    console.log(Math.round($(document).height() * scroll_travel));
    console.log(Math.round(($(document).height() * scroll_travel)) < document.documentElement.scrollTop);
    console.log('showToTop() - ' + showToTop());
    console.log('-------');
    console.log(document.body.scrollTop);
    console.log('=======');
};
