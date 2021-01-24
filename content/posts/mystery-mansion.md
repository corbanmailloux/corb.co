---
title: "Mystery Mansion, corb.co Edition"
date: 2016-01-10

description: A quick Python rebuild of a classic electronic board game.
summary: A quick Python rebuild of a classic electronic board game.

tags:
  - Game
  - Software Project

categories:
  - Projects

aliases:
  - /projects/mysterymansion
---

As a kid with 3 three siblings, we used to play family board games together. One of our family's favorites was [Electronic Talking Mystery Mansion](<https://en.wikipedia.org/wiki/Mystery_Mansion_(board_game)#1990s_electronic_version>), in which the players furnish a mansion with these little pieces of furniture and then search for clues about where the "money" is hidden. It's an awesome game; it kind of feels like a combination of [Clue](https://en.wikipedia.org/wiki/Cluedo) and a dollhouse.
{{< youtube MZxvu_zb2CA >}}

At a recent family gathering, we went to play the game and discovered that the "computer" part wasn't reliably working. I joked that I could recreate the game... and a couple of hours of tinkering later, we were playing again.

Later on, I went back through and recorded my best impression of the talking voice. The voice-overs use [winsound](https://docs.python.org/3.6/library/winsound.html) on Windows and [PyAudio](https://people.csail.mit.edu/hubert/pyaudio/) on Linux. The rest of the system is running on pure Python.

The project is [available on {{< fontawesome github >}} GitHub](https://github.com/corbanmailloux/MysteryMansion), where there is a readme with installation instructions.
