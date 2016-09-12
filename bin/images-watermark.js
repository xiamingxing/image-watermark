#!/usr/bin/env node

/**
 * lodash
 */
const _ = require("lodash");

/**
 * fs
 */
const fs = require("fs");

/**
 *
 * @type {Color}
 */
const Color = require("color");

/**
 * cp
 */
const cp = require("child_process");

/**
 * commander
 * @type {*}
 */
const program = require('commander');

/**
 * imagesWatermark
 */
const imagesWatermark = require("../index");

/**
 *
 * @param filepath
 * @returns {boolean}
 */
function existSync(filepath) {
    try {
        return fs.statSync(filepath).isFile();
    }
    catch (e) {
        return false;
    }
}

/**
 * start
 */
function start() {
    var p = cp.fork(`${__filename}`, process.argv.slice(2));
    p.on('message', function (data) {
        if (data === 'restart') {
            p.kill('SIGINT');
            start();
        }
    });
}


/**
 * startup
 */
function startup() {

    program
        .version(require("../package.json").version)
        .usage('[options] <file ...> <text>')
        .allowUnknownOption()
        .option('-C --config [path]', 'config file')
        .option('-f, --font [path]', 'watermark text font path or name')
        .option('-p, --position [items]', 'text position of watermark')
        .option('-T, --target [path]', 'watermark-image path')
        .option('-s, --suffix [text]', 'watermark-image suffix name')
        .option('-c, --color [color]', 'watermark color')
        .option('-r, --resize [n]', 'resize image')
        .on('--help', () => {
            let examples = `  examples: \n\n    images-watermark ./resource/1.jpg "测试"`
            console.log(examples);
            process.exit();
        })
        .parse(process.argv);

    try {
        verify(program);
    }
    catch (e){
        console.log(`  Error: ${e.message}`);
        showHelp();
    }

    /**
     *
     * @param arr
     * @returns {Array}
     */
    function flat(arr) {
        return arr.join(",").split(",");
    }

    /**
     *
     * @param program
     */
    function verify(program) {
        let config;
        program.config = program.config || "images-watermark.config.js";
        if (existSync(program.config)) {
            config = require(program.config);
            if (config.image && config.text) {
                excute(config);
            }
        }
        else if (program.args.length >= 2) {
            excute(program.options.reduce((prev, option) => {
                let name = option.name(),
                    value = program[name];
                if (value !== undefined){
                    prev[name] = value;
                }
                return prev;
            }, {
                text: program.args.pop(),
                image: program.args
            }));
        }
        else {
            throw new Error("arguments error");
        }
    }

    /**
     *
     * @param images
     */
    function resolve(images) {
        if (_.isString(images) && fs.existsSync(images)){
            return [images];
        }
        if (_.isArray(images)) {
            return flat(images.filter(image => resolve(image)));
        }
        throw new Error("can not resolve images");
    }

    /**
     *
     * @param config
     * @returns {*}
     */
    function format(config) {
        _.forEach(config, (value, key) => {
            switch (key) {
                case "color":
                    config[key] = Color(value).rgbaString();
                    break;
                case "image":
                    config[key] = resolve(value);
                    break;
            }
        });
        return config;
    }

    /**
     *
     * @param config
     */
    function excute(config) {
        config = format(config);
        config.image.forEach(image => {
            imagesWatermark.make(image, config);
        });
    }

    /**
     * showHelp
     */
    function showHelp() {
        program.outputHelp();
    }
}

// Main
if (!process.send) {
    start();
}
else {
    startup();
}