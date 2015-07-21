#!/bin/bash

for var in "$@"
do
    mkdir $var
    cp template.html $var/index.html
done
