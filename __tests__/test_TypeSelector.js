// tests/test_TypeSelector.js

jest.dontMock("../js/vitrail");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var Vitrail = require("../js/vitrail");
var TypeRadioButton = Vitrail.TypeRadioButton;
var TypeSelector = Vitrail.TypeSelector;


describe("TypeSelector", function() {

    it("renders properly into the DOM", function() {
        var types = [["草莓", "strawberry"], ["苹果", "apple"], ["西瓜", "watermelon"]];
        var selectedType = "apple";
        var onUserInput = jest.genMockFunction();
        var testSelector = React.createElement(TypeSelector,
                                              {types: types,
                                               onUserInput: onUserInput,
                                               selectedType: selectedType});
        // put the button in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSelector);
        var divInDom = TestUtils.findRenderedDOMComponentWithClass(testDom, "typeSelector");
        var strawberryButton = divInDom.props.children[0];
        var appleButton = divInDom.props.children[1];
        var watermelonButton = divInDom.props.children[2];
        // check the sub-components are the right type
        expect(TestUtils.isElementOfType(strawberryButton, TypeRadioButton)).toBe(true);
        expect(TestUtils.isElementOfType(appleButton, TypeRadioButton)).toBe(true);
        expect(TestUtils.isElementOfType(watermelonButton, TypeRadioButton)).toBe(true);
        // check the sub-components have the right labels
        expect(strawberryButton.props.label).toBe(types[0][0]);
        expect(appleButton.props.label).toBe(types[1][0]);
        expect(watermelonButton.props.label).toBe(types[2][0]);
        // check the sub-components have the right values
        expect(strawberryButton.props.value).toBe(types[0][1]);
        expect(appleButton.props.value).toBe(types[1][1]);
        expect(watermelonButton.props.value).toBe(types[2][1]);
    });

    it("calls the 'onUserInput' func with the @value attribute", function() {
        var types = [["草莓", "strawberry"], ["苹果", "apple"], ["西瓜", "watermelon"]];
        var selectedType = "apple";
        var onUserInput = jest.genMockFunction();
        var testSelector = React.createElement(TypeSelector,
                                              {types: types,
                                               onUserInput: onUserInput,
                                               selectedType: selectedType});
        // put the button in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSelector);
        var divInDom = TestUtils.scryRenderedDOMComponentsWithTag(testDom, "input");
        var strawberryButton = divInDom[0];
        // simulate a click
        TestUtils.Simulate.change(strawberryButton);
        // check the callback was called
        expect(onUserInput).toBeCalledWith("strawberry");
    });

});
