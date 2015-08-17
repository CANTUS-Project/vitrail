// tests/vitrail-test.js

jest.dontMock("../js/vitrail");


describe("TypeRadioButton", function() {
    it("is an element", function() {
        var React = require("react/addons");
        var TypeRadioButton = require("../js/vitrail");

        var soup = React.createElement("TypeRadioButton", {value: "yes", onUserInput: function() {return null;}});
        expect(React.addons.TestUtils.isElement(soup)).toBe(true);
    });
});
