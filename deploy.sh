#!/bin/bash

DEPLOYPATH='/d/DEVEL/apache/htdocs/countador/'

echo 'Deleting '$DEPLOYPATH
rm -rf $DEPLOYPATH

echo 'Creating '$DEPLOYPATH
mkdir $DEPLOYPATH

echo 'Copying data'
cp -rv * $DEPLOYPATH

echo '+DONE'

