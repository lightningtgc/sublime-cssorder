#Sublime CSSOrder

> CSSOrder is a sublime plugin for CSS file formatting from Tencent Alloyteam.

> Required Node.js

## Intro

CSSOrder is a css coding style formatter with [Alloyteam Css Style](http://alloyteam.github.io/code-guide/#css)

It can handle some special case like  'base64 url', 'single comment // ' and so on in CSS files.

## Usage

Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>o</kbd> 

or right click the content and select "Run Cssorder".

## Custom configuration

* You can  write your own configuration by opening 

 `Tools> Css Order> Set Cssorder Config` 
 
 or right click the content and select 'Set Cssorder Config'

* It will automatically format when you saved the file,

 and you can close automatical format  by setting `format_on_save` to `false` in `Set Cssorder Config`.
 
## Release History

+ v0.2.1: Fix bug and submitting to Sublime Package Control
+ v0.2.0: Handle compressive file case.
+ v0.1.0: Release.
