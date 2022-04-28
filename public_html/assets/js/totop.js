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
    Repository: https://github.com/jxmot/github-feeds
*/
// call our function when the window contents are scrolled

// A percentage of element size, if scrolled past this
// point the 'to top' button will be displayed. Adjust 
// as needed.
const scroll_travel = 0.1;
// keeps redundant execution to a minimum
var isToTop = false;
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
    document.querySelector(topElemQ + ' ~ .foot > #gototop_button').style.display = 'none';
};

function nullFunc() {};

function onElementScroll() {
    if(showToTop()) {
        // has the button been enabled yet?
        if(isToTop === false) {
            document.querySelector(topElemQ + ' ~ .foot > #gototop_button').style.display = 'block';
            isToTop = true;
        }
    } else {
        // has the button been disabled yet?
        if(isToTop === true) {
            document.querySelector(topElemQ + ' ~ .foot > #gototop_button').style.display = 'none';
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
