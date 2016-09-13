import 'babel-polyfill';
import "mocha";
import {expect} from "chai"
import {resolveSystemFontPath, contain, all} from "../src/font";

describe("font 库测试", () => {
    it("系统字体数量应该大于0", () => {
        expect(all().length).to.be.above(0)
    });
    it("系统字体应该包含")
});