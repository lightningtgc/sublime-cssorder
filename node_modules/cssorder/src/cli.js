/**
 * Command line implementation for CSSOrder
 *
 * Usage example:
 * ./node_modules/.bin/cssorder [options] file1 [dir1 [fileN [dirN]]]
 */
var fs = require('fs');
var path = require('path');
var program = require('commander');
var vow = require('vow');
var CSSOrder = require('./cssorder');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-v, --verbose', 'verbose mode')
    .option('-c, --config [path]', 'configuration file path')
    .option('-d, --detect', 'detect mode (would return detected options)')
    .option('-l, --lint', 'in case some fixes needed returns an error')
    .parse(process.argv);

if (!program.args.length) {
    console.log('No input paths specified');
    program.help();
}

var cssorder = new CSSOrder();

if (program.detect) {
    console.log(JSON.stringify(CSSOrder.detectInFile(program.args[0]), false, 4));
    process.exit(0);
}

var config;
var configPath = program.config &&
    path.resolve(process.cwd(), program.config) ||
    CSSOrder.getCustomConfigPath();

if (!fs.existsSync(configPath)) {
    config = require('./config/config.json');
} else if (configPath.match(/\.css$/)) {
    config = CSSOrder.detectInFile(configPath);
} else {
    config = CSSOrder.getCustomConfig(configPath);
}

if (!config) {
    console.log('Configuration file ' + configPath + ' was not found.');
    process.exit(1);
}

if (config.template) {
    if (fs.existsSync(config.template)) {
        var templateConfig = CSSOrder.detectInFile(config.template);
        for (var attrname in templateConfig) {
            if (!config[attrname]) {
                config[attrname] = templateConfig[attrname];
            }
        }
    } else {
        console.log('Template configuration file ' + config.template + ' was not found.');
        process.exit(1);
    }
}

console.time('spent');

config.verbose = program.verbose === true || config.verbose;
config.lint = program.lint;

cssorder.configure(config);

vow.all(program.args.map(cssorder.processPath.bind(cssorder)))
.then(function(changedFiles) {
    changedFiles = [].concat.apply([], changedFiles)
        .filter(function(isChanged) {
            return isChanged !== undefined;
        });

    for (var i = changedFiles.length, tbchanged = 0; i--;) {
        tbchanged += changedFiles[i];
    }

    var changed = config.lint ? 0 : tbchanged;

    if (config.verbose) {
        console.log('');
        console.log(changedFiles.length + ' file' + (changedFiles.length === 1 ? '' : 's') + ' processed');
        console.log(changed + ' file' + (changed === 1 ? '' : 's') + ' fixed');
        console.timeEnd('spent');
    }

    if (config.lint && tbchanged) {
        process.exit(1);
    }
})
.fail(function(e) {
    console.log('stack: ', e.stack);
    process.exit(1);
});

