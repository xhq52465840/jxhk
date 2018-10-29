@echo off
cd /d %~dp0
./jsdoc/jsdoc -r ../../uui/uui-loader.js ../../uui/core ../../uui/util -d ../../_apidocs --verbose

