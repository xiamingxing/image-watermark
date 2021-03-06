import 'babel-polyfill';
import "mocha";
import {expect} from "chai"
import {resolveSystemFontPath, contain, all, is, has} from "../src/font";

describe("font 库测试", () => {
    before(function () {
        // 在本区块的所有测试用例之前执行
    });

    after(function () {
        // 在本区块的所有测试用例之后执行
    });

    beforeEach(function () {
        // 在本区块的每个测试用例之前执行
    });

    afterEach(function () {
        // 在本区块的每个测试用例之后执行
    });

    it("系统字体数量应该大于0", () => {
        expect(all().length).to.be.above(0)
    });

    it("华文黑体应该包含汉字'测试'", () => {
        expect(!has("华文黑体") || contain(resolveSystemFontPath("华文黑体")[0], "测试")).to.be.ok;
    });

    it("Arial不包含汉字'测试'", () => {
        expect(contain(resolveSystemFontPath("Arial")[0], "测试")).to.be.not.ok;
    });
});