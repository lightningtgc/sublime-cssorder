var str = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (data) {
    str += data;
});

// Deal with cssorder custom config 
function handleOrderCustom (content) {
    var orderConfig;
    try {
        orderConfig = JSON.parse(process.argv[4]);
    } catch (e) {
        orderConfig = null;
    }

    // handle options
    if (orderConfig) { 
        //Every block add newline
        if(orderConfig["block-newline"]){
            // Deal with multiple comment include css block {}
            content = content.replace(/\}[\s\S][^\}+\*\/]+?\{/g, function(match){

              // remove unnecessary newline,keep single newline
                match = match.replace(/\n(?=\n)/g, '');
                match = match.replace(/\}/, '');
                return '}\n' + match;
            });

            // add \n between } and /*
            // don't handle same line
            content = content.replace(/\}\n[\s\S][^\}+\{+\*\/]+?\/\*/g, function(match){
                // remove unnecessary newline,keep single newline
                match = match.replace(/\n/g, '');
                match = match.replace(/\}/, '');
                return '}\n\n' + match;
            });
        }
    }
    return content;
}

process.stdin.on('end', function () {
    var CSSOrder = require('./node_modules/cssorder/src/cssorder'),
    order = new CSSOrder(),
    syntax = process.argv[2],
    config, ordered;

    try {
        config = JSON.parse(process.argv[3]);
    } catch (e) {
        config = null;
    }

    config = config ||
             CSSOrder.getCustomConfig() ||  
             CSSOrder.getConfig('csscomb');

    ordered = order.configure(config).processText(str, {syntax: syntax});
    // Handle cssorder custom config 
    try {
        ordered = handleOrderCustom(ordered);
    } catch (e) {
        throw new Error('CSSOrder custom config error');
    }
    process.stdout.write(ordered);
});

