import images from "images";
import _ from "lodash";
import Log from "log";
import fs from "fs";
import path from "path";
import watermark from "image-watermark";
import {resolveSystemFontPath, contain, all} from "./font";

/**
 *
 * @type {{text: string, color: string, font: string, suffix: string}}
 */
const defaultOptions = {
    'text' : 'sample 黑',
    'color' : 'rgb(50, 50, 46, 0.1)',
    'font' : '华文黑体',
    'suffix': '-watermark'
};

/**
 *
 * @type {module.Log}
 */
const log = new Log("info");

/**
 *
 * @param filepath
 * @returns {boolean}
 */
let existSync = function (filepath) {
    try {
        return fs.statSync(filepath).isFile();
    }
    catch (e){
        return false;
    }
}

/**
 *
 * @param dirname
 * @returns {boolean}
 */
let isDirectory = (dirname) => {
    try {
        return fs.statSync(dirname).isDirectory();
    }
    catch (e) {
        return false;
    }
};

/**
 *
 * @param filepath
 * @returns {*}
 */
let isImage = (filepath) => {
    try {
        return fs.statSync(filepath).isFile() && images(filepath);
    }
    catch (e) {
        return false;
    }
};

/**
 *
 * @param dirname
 * @param filename
 * @param suffix
 * @returns {string}
 */
let resolveDstPath = (dirname, filename, suffix) => {
    if (_.isFunction(suffix)){
        suffix = suffix(dirname, filename);
    }
    return `${path.resolve(dirname, path.basename(filename, path.extname(filename)) + suffix + path.extname(filename))}`;
};

/**
 *
 * @param fontpath
 * @param text
 * @returns {*}
 */
let resolveFontFile = (fontpath, text = "a") => {
    if (existSync(fontpath) && contain(fontpath, text)){
        return fontpath;
    }
    return resolveSystemFontPath(fontpath).filter(fontpath => contain(fontpath, text))[0];
}

/**
 *
 * @param options
 * @returns {{}}
 */
let formatOptions = (options = {}) => {
    options = {
        ...defaultOptions,
        ...options
    };
    options['font'] = resolveFontFile(options['font'], options['text']);
    return options;
}

/**
 *
 * @param filepath
 * @returns {*}
 * @private
 */
let __make = (filepath, options) => {
    if (isImage(filepath)){
        return watermark.embedWatermark(filepath, options);
    }
    log.info(`${filepath} is\`t image`);
}

/**
 *
 * @param origin
 * @param options
 * @returns {*}
 */
let make = (origin, options) => {
    options = formatOptions(options);
    if (isDirectory(origin)) {
        return fs.readdirSync(origin).filter(filename => {
            return __make(path.resolve(origin, filename), {
                ...options,
                dstPath: resolveDstPath(origin, filename, options.suffix)
            });
        });
    }
    return __make(origin, options);
};

module.exports = {make, all};


