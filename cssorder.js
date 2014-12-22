var str = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (data) {
    str += data;
});

// Handle special case
function preHandleSrc (cssSrc) {

  /* 
   * fix like: .a{ filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#e6529dda', endColorstr='#e6529dda', GradientType=0)\9;}
   * which has two semicolon( : ) will cause parse error.
   */
  cssSrc = cssSrc.replace(/progid(\s)?:(\s)?/g, '#tidy1#');

  /*
   * fix absolute url path like: 
   * .a { background: url("http://www.qq.com/one.png");} 
   *
   */
  cssSrc = cssSrc.replace(/:\/\//g, '#tidy2#');

  /*
   * fix base64 url like: 
   * .a { background: url("data:image/png;base64,iVBOMVEX///////////////+g0jAqu8zdII=");} 
   *
   */
  cssSrc = cssSrc.replace(/data[\s\S]+?\)/g, function(match){
      match = match.replace(/:/g, '#tidy3#');
      match = match.replace(/;/g, '#tidy4#');
      match = match.replace(/\//g, '#tidy5#');
      return match;
  });
  /*
   * fix multiple line comment include single comment //
   * eg: / * sth // another * /
   */
  cssSrc = cssSrc.replace(/\/\*[\s\S]+?\*\//g, function(match){
      // handle single comment //
      match = match.replace(/\/\//g, '#tidy6#');
      return  match;
  });

  /*
   * fix single comment like:  // something 
   * It can't works in IE, and will cause parse error
   * update: handle single line for compressive case
   */
  cssSrc = cssSrc.replace(/(^|[^:|'|"|\(])\/\/.+?(?=\n|\r|$)/g, function(match){

      // Handle compressive file
      if (match.indexOf('{') === -1 || match.indexOf('}') === -1 || match.indexOf(':') === -1) {
          var targetMatch;

          //handle first line
          if (match.charAt(0) !== '/' ) {
              // remove first string and / and \ 
              targetMatch = match.substr(1).replace(/\\|\//g, '');
              return match.charAt(0) + '/*' + targetMatch + '*/';
          } else {
              targetMatch = match.replace(/\\|\//g, '');
              return '/*' + targetMatch + '*/';
          }
      } else {
          throw new Error('There maybe some single comment // in this file.');
      }
  });
  return cssSrc;
}

// after handle src, recover special string
function afterHandleSrc (content) {

    content = content.replace(/#tidy1#/g, 'progid:');
    content = content.replace(/#tidy2#/g, '://');
    content = content.replace(/#tidy3#/g, ':');
    content = content.replace(/#tidy4#/g, ';');
    content = content.replace(/#tidy5#/g, '/');
    content = content.replace(/#tidy6#/g, '//');

    // handle compressive css file 
    content = content.replace(/(\}|\*\/)(?!\r|\n)/g, function(match){
        // \n will translate to \r\n in windows?
        return match + '\n';
    });

    return content;
}

process.stdin.on('end', function () {
    var Comb = require('./node_modules/csscomb/lib/csscomb'),
    comb = new Comb(),
    syntax = process.argv[2],
    config, combed;

    try {
    config = JSON.parse(process.argv[3]);
    } catch (e) {
    config = null;
    }

    config = Comb.getCustomConfig() ||
    config ||
    Comb.getConfig('csscomb');

    str = preHandleSrc(str);
    combed = comb.configure(config).processString(str, {syntax: syntax});
    combed = afterHandleSrc(combed);
    process.stdout.write(combed);
});

