import os from "os";
import fs from "fs";
import path from "path";
import _ from "lodash";
import {Get_Char_Index, New_Memory_Face} from "freetype2";

/**
 *
 * @type {{Window: string, MacOS: string, Linux: string}}
 */
const SystemDictionary = {
    "Window": "Windows_NT",
    "MacOS": "Darwin",
    "Linux": "Linux"
};

/**
 *
 * @type {{Window: string[], MacOS: string[], Linux: string[]}}
 */
const FontSystemDictionary = {
    "Window": ["C:\\WINDOWS\\Fonts"],
    "MacOS": ["/System/Library/Fonts", "/Library/Fonts"],
    "Linux": ["/usr/share/fonts"]
};

/**
 *
 * @param arr
 * @returns {Array}
 */
let flat = (arr) => {
    return arr.join(",").split(",");
};

/**
 *
 * @returns {*}
 */
let system = () => {
    let type = os.type(),
        system;
    _.forEach(SystemDictionary, (_type, _system) => {
        if (_type == type) {
            system = _system;
        }
    });
    return system;
};

/**
 *
 * @param _system
 * @returns {boolean}
 */
let is = (_system) => {
    return system() === _system;
};

/**
 *
 * @param fontpath
 * @returns {{}}
 */
let getFontFace = (fontpath) => {
    let fontfile = fs.readFileSync(fontpath),
        fontface = {};
    if (!New_Memory_Face(fontfile, 0, fontface)) {
        return fontface.face;
    }
    throw new Error(`can not resolve system font ${fontpath}`);
};

/**
 *
 * @param fontpath
 * @param fontchar
 * @returns {boolean}
 */
let contain = (fontpath, fontchar) => {
    try {
        let fontface = getFontFace(fontpath);
        if (_.isArray(fontchar)) {
            fontchar = fontchar.join("");
        }
        if (_.isString(fontchar)) {
            return _.uniq(fontchar.split("")).every(char => Get_Char_Index(fontface, char.charCodeAt(0)));
        }
        return false;
    }
    catch (e) {
        console.log(e);
        return false;
    }
};

/**
 *
 * @returns {*}
 */
let getSystemFontPath = () => {
    return FontSystemDictionary[system()];
};

/**
 *
 * @returns {*}
 */
let all = () => {
    try {
        return flat(getSystemFontPath()
            .map(fontpath => {
                return fs
                    .readdirSync(fontpath);
            })
            .filter(fontpath => fontpath && fontpath.length));
    }
    catch (e) {
        return false;
    }
};

/**
 *
 * @param fontname
 * @returns {*}
 */
let resolveSystemFontPath = (fontname) => {
    if (_.isArray(fontname)) {
        return flat(fontname.map(_fontname => resolveSystemFontPath(_fontname)));
    }

    try {
        return flat(getSystemFontPath()
            .map(fontpath => {
                return fs
                    .readdirSync(fontpath)
                    .filter(filename => path.basename(filename, path.extname(filename)) == fontname)
                    .map(filename => path.resolve(fontpath, filename));
            })
            .filter(fontpath => fontpath && fontpath.length));

    }
    catch (e) {
        return false;
    }
};

/**
 *
 * @type {{resolveSystemFontPath: ((p1?:*)), contain: ((p1?:*, p2?:*))}}
 */
module.exports = {resolveSystemFontPath, contain, all, is};

