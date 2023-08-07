# Bible Karaoke - Releases

## Legend

- :star: New feature
- :thumbsup: Improvement
- :boom: Bug fix

## v1.1.2

This is a bugfix release:

- :thumbsup: Improved security of the app
- :boom: It asks the OS for folder locations, rather than assuming default OS locations
- :boom: It can find audio files in the default SAB location
- :boom: It will show chapters with audio even if not every chapter in the book has audio

## v1.1.1

This is a patch feature and bugfix release:

- :star: You can now _Select All_ or _Clear All_ books in the **Book** panel
- :thumbsup: Uses phrase and word timing data from **Scripture App Builder** (SAB), in addition to the verse timing data
- :thumbsup: improved security of the app
- :boom: The green badges no longer show when selected multiple books - videos are still combined in canonical order

## v1.1.0

This is a minor feature and bugfix release:

- :star: Create videos from **Scripture App Builder** (SAB) as well as **HearThis**
- :thumbsup: improved security of the app
- :boom: When audio files have different sample rates they are now combined correctly at the right speed
- :boom: Changing the background image/video and changing either the SAB or HearThis source folder in **Settings** no
  longer interfere with each other

## v1.0.1

This is a bugfix release:

- :boom: The maximize button is now working and the window can be resized

## v1.0.0

This is a major feature and bugfix release:

- :star: New user interface makes it much easier to use, including:
  - Render multiple chapters at one time as one video or a separate video for each chapter
  - New Settings pane (gear icon)
    - HearThis project folder location
    - Output folder location and whether to overwrite existing files
    - Google Analytics reset and opt out
- :thumbsup: It no longer renders blocks of text that are marked as "skipped" in HearThis
- :boom: Books are now displayed in canonical order

## v0.3.6

This is a minor feature and bugfix release:

- :star: Use a video for the background instead of an image

## v0.3.5

This is a minor feature and bugfix release:

- :thumbsup: Removed known security vulnerabilities
- :boom: The program starts even if the specified background image file is empty or missing

## v0.3.4

This is a minor feature and bugfix release:

- :star: New **Text Location** option
  - text scrolling across the middle (as before)
  - text as subtitle across the bottom
- :star: The previously used settings are remembered each time
- :thumbsup: Chrome no longer needs to be installed for Bible Karaoke to work
- :thumbsup: Chapters are now displayed in numerical order
- :boom: "ghost" text from previous runs is cleared each time

## v0.3.3

This is a minor feature and bugfix release:

- :star: New color selector that still includes the preset colors
- :star: Indicates how long it will take to finish rendering the video
- :star: Logs errors to logs folder
  - on Windows: %USERPROFILE%\AppData\Roaming\bible-karaoke\logs\\{date_time}.log
  - on MacOS: ~/Library/Logs/bible-karaoke/{date_time}.log
  - on Linux: ~/.config/bible-karaoke/logs/{date_time}.log
- :thumbsup: Chapter labels are just numbers so the Chapter label doesn't need to be localized
- :thumbsup: Section headings are wider so they are easier to click
- :thumbsup: If there is only have one project, book, or chapter, it is automatically selected

## v0.3.2

:thumbsup: change animation to karaoke style

## v0.3.1

This is a minor bugfix release:

- Section headings are now bold
- :boom: Fixed an internet-dependent crash/bug on some computers
  - Chrome must be installed for Bible Karaoke to work

## v0.3.0

(Under the hood, the CLI code is now integrated into this repo, rather than being a npm dependency)

- :star: Lots of new display configuration options:
  - Use a solid background color as an alternative to an image
  - Set the font size and color as well as font family
  - Set the highlight color
  - Set the 'speech bubble' color and opacity
- :thumbsup: Extra 'Make another video...' button to reset the UI after a video finishes.
- :thumbsup: Added a refresh button next to the HearThis project selection
- :boom: Fixed background color - fills window when window is resized

## v0.2.2

- :boom: Corrected chapter numbering. Chapter '0' is now labeled as 'Intro'.

## v0.2.1

- :thumbsup: Removed application menu (unused)
- :thumbsup: Display application version number

## v0.2.0

- :boom: Miscellaneous files in the HearThis project directory are now (correctly) ignored
- :boom: Removed hard-coded 10 second limit on rendering frames
- :thumbsup: New icons

## v0.1.0

- :star: Initial release
