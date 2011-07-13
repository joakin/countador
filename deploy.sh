#!/bin/bash

DEPLOYPATH='/d/DEVEL/apache/htdocs/countador/'

echo 'Deleting '$DEPLOYPATH
rm -rf $DEPLOYPATH

echo 'Creating '$DEPLOYPATH
mkdir $DEPLOYPATH

echo 'Copying data'
cp -r css fakedata.json index.html js $DEPLOYPATH

echo '+DONE'

