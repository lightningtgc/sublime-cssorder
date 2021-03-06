#Sublime CSSOrder

> CSSOrder is a sublime text plugin for CSS file formatting. 

> Required Node.js

## Intro

CSSOrder is a css coding style formatter with [Tencent CSS Style](http://alloyteam.github.io/CodeGuide/#css)

It can handle some special case like  'base64 url', 'single comment // ' and so on in CSS files.

## Effect

Make CSS code become the following coding style:

```css
/* Final CSS code */
.some-style,
.same-style {
    position: relative;
    top: -2px;
    right: 0;
    bottom: 0;
    left: 5px;
    z-index: 100;

    display: inline-block;
    width: 20px;
    height: 20px;
    padding: 5px 10px;
    overflow: hidden;

    vertical-align: middle;

    color: #fff;
    -webkit-border-radius: 5px;
       -moz-border-radius: 5px;
            border-radius: 5px;
    background-color: rgba(82,157,218,.9);
    -webkit-background-clip: padding-box;
       -moz-background-clip: padding-box;
            background-clip: padding-box;
}

```

## Install

0. Install [Node.js](http://nodejs.org/) ( if you don't install it before ).

1. Install  [Package Control](https://packagecontrol.io/installation).

2. Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>p</kbd> , then input `install` and press <kbd>Enter</kbd> .

 After that input `CSSOrder` to find the plugin and  press <kbd>Enter</kbd> to install it.

Manually:

Clone or [download](https://github.com/lightningtgc/sublime-cssorder/archive/master.zip) git repo into your packages folder (in SublimeText, find Browse Packages... menu item to open this folder)

## Usage

Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>o</kbd> 

or `right click` the content and select `Run Cssorder`.

## Custom configuration

* You can  write your own configuration by opening 

 `Tools> Css Order> Set Cssorder Config` 
 
 or `right click` the content and select `Set Cssorder Config`

* `order_config` is using for some special case (like add newline for every
  block).
 
 `comb_config` is using for the configuration of CSSComb.

* It will automatically format when you saved the file,

 and you can close automatical format  by 
 
 setting `format_on_save` to `false` in `Set Cssorder Config`.
 
## Release History

+ v0.4.0: Add custom config to handle special case.
+ v0.3.1: Fix libs dependence.
+ v0.3.0: Support Sass and Less.
+ v0.2.1: Submitting to Sublime Package Control.
+ v0.2.0: Handle compressive file case.
+ v0.1.0: Release.
