#Sublime CSSOrder

> CSSOrder is a sublime plugin for CSS file formatting from Tencent Alloyteam.

> Required Node.js

## Intro

CSSOrder is a css coding style formatter with [Alloyteam Css Style](http://alloyteam.github.io/code-guide/#css)

It can handle some special case like  'base64 url', 'single comment // ' and so on in CSS files.

## Install

1. Install  [Package Control](https://packagecontrol.io/installation):

2. Press `Ctrl + Shift + p` and then input `install`.

 After that input `CSSOrder` to find the plugin and  press `Enter` to install it.

Manually:

Clone or [download](https://github.com/lightningtgc/sublime-cssorder/archive/master.zip) git repo into your packages folder (in SublimeText, find Browse Packages... menu item to open this folder)

## Usage

Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>o</kbd> 

or `right click` the content and select `Run Cssorder`.

## Custom configuration

* You can  write your own configuration by opening 

 `Tools> Css Order> Set Cssorder Config` 
 
 or `right click` the content and select `Set Cssorder Config`

* It will automatically format when you saved the file,

 and you can close automatical format  by 
 
 setting `format_on_save` to `false` in `Set Cssorder Config`.
 
## Release History

+ v0.3.1: Fix libs dependence.
+ v0.3.0: Support Sass and Less.
+ v0.2.1: Fix bug and submitting to Sublime Package Control.
+ v0.2.0: Handle compressive file case.
+ v0.1.0: Release.
