var CSSComb = require('csscomb');
var fs      = require('fs');

var PATH_CONFIG = './config/config.json';

/**
 * preHandleSrc
 * Handle special case
 *
 * @param cssSrc
 * @return string
 */
function preHandleSrc(cssSrc, options) {
  options = options || {};
  /* 
   * Fix like: .a{ filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#e6529dda', endColorstr='#e6529dda', GradientType=0)\9;}
   * which has two semicolon( : ) will cause parse error.
   */
  cssSrc = cssSrc.replace(/progid(\s)?:(\s)?/g, '#order1#');

  /*
   * Fix absolute url path like: 
   * .a { background: url("http://www.qq.com/one.png");} 
   *
   */
  cssSrc = cssSrc.replace(/:\/\//g, '#order2#');

  /*
   * Fix base64 url like: 
   * .a { background: url("data:image/png;base64,iVBOMVEX///////////////+g0jAqu8zdII=");} 
   *
   */
  cssSrc = cssSrc.replace(/data(\:)[\s\S]+?\)/g, function(match){
      match = match.replace(/:/g, '#order3#');
      match = match.replace(/;/g, '#order4#');
      match = match.replace(/\//g, '#order5#');
      return match;
  });

  //Just css will handle single comment //
  if(options.syntax == 'css'){ 
      /*
       * Fix multiple line comment include single comment //
       * eg: / * sth // another * /
       */
      cssSrc = cssSrc.replace(/\/\*[\s\S]+?\*\//g, function(match){
          // handle single comment //
          match = match.replace(/\/\//g, '#order6#');
          return  match;
      });

      /*
       * Fix single comment like:  // something 
       * It can't works in IE, and will cause parse error
       * update: handle single line for compressive case
       */
      cssSrc = cssSrc.replace(/(^|[^:|'|"|\(])\/\/.+?(?=\n|\r|$)/g, function(match){

          // Handle compressive file
          if (match.indexOf('{') === -1 || match.indexOf('}') === -1 || match.indexOf(':') === -1) {
              var targetMatch;

              //Handle first line
              if (match.charAt(0) !== '/' ) {
                  // Remove first string and / and \ 
                  targetMatch = match.substr(1).replace(/\\|\//g, '');
                  return match.charAt(0) + '/*' + targetMatch + '*/';
              } else {
                  targetMatch = match.replace(/\\|\//g, '');
                  return '/*' + targetMatch + '*/';
              }
          } else {
              throw new Error('There maybe some illegal single comment // in this file.');
          }
      });

  }
  return cssSrc;
}

/**
 * afterHandleSrc
 * after handle src, recover special string
 *
 * @param content
 * @return string
 */
function afterHandleSrc (content) {

    content = content.replace(/#order1#/g, 'progid:');
    content = content.replace(/#order2#/g, '://');
    content = content.replace(/#order3#/g, ':');
    content = content.replace(/#order4#/g, ';');
    content = content.replace(/#order5#/g, '/');
    content = content.replace(/#order6#/g, '//');

    // Handle compressive css file 
    content = content.replace(/(\}|\*\/)(?!\r|\n).*/g, function(match){
        // Deal with multiple line comment include block {}
        if (match.indexOf('*/') > 0 && match.indexOf('/*') === -1) {
          return match;
        }
        // \n will translate to \r\n in windows?
        return match + '\n';
    });

    return content;
}


/**
 * CSSOrder
 * Main Fun
 *
 * @param {string || object} config
 * @return {undefined}
 */
var CSSOrder = function(config) {

    // Set custom configure translate to object
    if (!config) {
        try {
            config = require(PATH_CONFIG);
        } catch(e) {
            throw new Error('CSSOrder:Parse default config error.');
        }
    }

    var cssComb = new CSSComb(config);

    /**
     * processText
     * Export a text handle method.
     *
     * @param {string}text
     * @param {object} options
     * @return {string}
     */
    cssComb.processText = function(text, options){
        var content = '';
        text = preHandleSrc(text, options);
        content = cssComb.processString(text, options);
        content = afterHandleSrc(content);

        // Remove ^M and fix newLine issue in windows
        if (process.platform === 'win32') {
            content = content.replace(/\r/g, '');
            /* content = content.replace(/\n/g, '\r\n'); */
        }

        return content;
    }

    return cssComb;
}

// extend CSSComb to CSSOrder
for (var key in CSSComb) {
    if (Object.prototype.hasOwnProperty.call(CSSComb, key)) {
        CSSOrder[key] = CSSComb[key]; 
    }
}

module.exports = CSSOrder;

