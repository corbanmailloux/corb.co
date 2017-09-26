#!/bin/bash
echo 'set link to "http://i.imgur.com/HsSilpd.jpg"
set file_path to "/tmp/bieber.jpg"
set curl_command to "curl " & link & " -o " & file_path
do shell script curl_command

set img_file to POSIX file file_path
tell application "System Events"
	tell every desktop
		set picture to img_file
	end tell
end tell' | osascript
