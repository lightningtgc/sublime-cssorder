#CSSOrder

> A CSS style formatter, make CSS code tidy and order.

> Base on Node.js and csscomb

## Intro

CSSOrder is a css coding style formatter with [Tencent CSS Style](http://alloyteam.github.io/code-guide/#css)

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

```
npm install -g cssorder
```


