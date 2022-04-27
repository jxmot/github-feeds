#!/bin/bash
# This will create folders for github-feeds before 
# copying files to the server. Edit paths as needed 
# to match your server's document root.
#
# Edit as needed.
docroot="$HOME/public_html"
echo "Starting in $docroot"
# Edit as needed.
ghfeeds="$docroot/ghfeeds"
if [[ ! -d $ghfeeds ]];then
    mkdir $ghfeeds
    echo "Created $ghfeeds"
fi

cd $ghfeeds
# The data will be written here, so 
# create the folder if needed. 
# Edit as needed.
gfdata="$ghfeeds/gfdata"
if [[ ! -d $gfdata ]];then
    mkdir $gfdata
    echo "Created $gfdata"
fi
echo "Done"
