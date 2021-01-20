#!/bin/bash

# The Bieber-izer (Mac OSX Only)
## Changes the wallpaper and posts a message to Slack.
## Used to shame coworkers who leave their computers unlocked.

# Usage:
# There are a few modes. The default mode:
# curl -L cht.fun | bash
# BOTH changes the wallpaper to a wonderful image AND posts to Slack.

# Alternatively, you can choose just one option by changing the URL:
# To ONLY change the wallpaper, use one of the following:
# curl -L wallpaper.cht.fun | bash
# curl -L w.cht.fun | bash

# To only post to Slack, use one of the following:
# - curl -L slack.cht.fun | bash
# - curl -L s.cht.fun | bash

# Note that all of these usages require running untrusted code on the target machine.
# I take no responsibility for your actions, any violations
# of corporate policy, or any other harm caused by these scripts.
# Some people find it funny. Others... Not so much. Good luck.

# Slack
echo 'set channel to "random"
set message to "/me is in :loveparrot: with :bieber:, and should :lock: their :computer:."
tell application "Slack" to activate
delay 0.3
tell application "System Events"
	key code 40 using command down
	delay 0.3
	keystroke channel
	delay 0.3
	key code 36
	delay 0.6
	keystroke message
	-- delay 1
	-- key code 36 -- Do not press enter, for now...
end tell' | osascript
