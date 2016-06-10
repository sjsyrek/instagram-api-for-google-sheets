#!/bin/bash
babel -o ../dist/main.gs main.js
cd ..
gapps upload
cd src
