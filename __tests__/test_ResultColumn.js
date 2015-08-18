// tests/test_ResultColumn.js

jest.dontMock("../js/vitrail");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var Vitrail = require("../js/vitrail");
var ResultColumn = Vitrail.ResultColumn;


describe("ResultColumn", function() {

    it("properly fills in default values", function() {
        var testColumn = React.createElement(ResultColumn);
        expect(testColumn.props.link).toBe("");
        expect(testColumn.props.data).toBe("");
        expect(testColumn.props.header).toBe(false);
    });

    it("renders properly (no link; not header)", function() {
        var link = "";
        var data = "something";
        var header = false;
        var testColumn = React.createElement(ResultColumn,
                                             {link: link, data: data, header: header});
        // throw it in a DOM
        var testDom = TestUtils.renderIntoDocument(testColumn);
        var colInDom = TestUtils.findRenderedDOMComponentWithTag(testDom, "td");
        var child = colInDom.props.children;
        // check it's all set correctly
        expect(child).toBe(data);
    });

    it("renders properly (with link; is a header)", function() {
        var link = "http";
        var data = "something";
        var header = true;
        var testColumn = React.createElement(ResultColumn,
                                             {link: link, data: data, header: header});
        // throw it in a DOM
        var testDom = TestUtils.renderIntoDocument(testColumn);
        var colInDom = TestUtils.findRenderedDOMComponentWithTag(testDom, "th");
        var aElement = colInDom.props.children;  // that's "an <a> element"
        var child = aElement.props.children;
        // check it's all set correctly
        expect(child).toBe(data);
        expect(aElement.props.href).toBe(link);
    });

});
