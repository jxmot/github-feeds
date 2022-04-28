/* 
    Light/Dark Theme Switch

    Author: https://github.com/jxmot
    Repository: https://github.com/jxmot/github-feeds
*/
// create a CSS <link> element
function createCSSLink(cssfile){
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', cssfile);
    return link;
};

// replace a linked CSS file with another, don't 
// forget to use the same path you did in the 
// link that's being replaced.
function replaceCSSFile(oldcssfile, newcssfile){
    var links = document.getElementsByTagName('link');
    //search backwards within nodelist for matching elements to remove,
    // because the last is the first one to remove.
    for (var i=links.length; i>=0; i--) { 
        // for each link...
        // if the link tag found has a href AND has the file we're replacing...
        if (links[i] && links[i].getAttribute('href')!=null && 
            links[i].getAttribute('href').indexOf(oldcssfile)!=-1) {
                
                var newlink = createCSSLink(newcssfile);
                links[i].parentNode.replaceChild(newlink, links[i]);
        }
    }
};

// theme switch, this is called when checkbox is clicked
function swLightDark() {
    if($('.lightdarksw .switch input')[0].checked === true) {
        replaceCSSFile('assets/css/github-feed-default.css', 'assets/css/github-feed-dark.css');
    } else {
        replaceCSSFile('assets/css/github-feed-dark.css', 'assets/css/github-feed-default.css');
    }
};
