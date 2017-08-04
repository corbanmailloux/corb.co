#!/bin/bash

script='set weblink to "http://i.imgur.com/HsSilpd.jpg"
set temp_file to "/tmp/bieber.jpg"
set curl_command to "curl " & weblink & " -o " & temp_file
do shell script curl_command

set theFile to POSIX file temp_file
tell application "System Events"
	tell every desktop
		set picture to theFile
	end tell
end tell'

echo "$script" | osascript
