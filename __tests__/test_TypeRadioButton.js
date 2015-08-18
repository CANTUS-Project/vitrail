// tests/test_TypeRadioButton.js

jest.dontMock("../js/vitrail");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var Vitrail = require("../js/vitrail");
var TypeRadioButton = Vitrail.TypeRadioButton;


describe("TypeRadioButton", function() {

    it("renders properly into the DOM", function() {
        var buttonValue = "century";
        var labelValue = "rawr";
        var selected = false;
        var testButton = React.createElement(TypeRadioButton,
                                             {value: buttonValue,
                                              onUserInput: function(){},
                                              selected: selected,
                                              label: labelValue});
        // put the button in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testButton);
        var labelInDom = TestUtils.findRenderedDOMComponentWithTag(testDom, "label");
        var buttonInDom = labelInDom.props.children[0];
        // the following props are set properly: value, selected, and label
        expect(labelInDom.props.children[1]).toBe(labelValue);
        expect(buttonInDom.type).toBe("input");
        expect(buttonInDom._store.props.checked).toBe(selected);
        expect(buttonInDom._store.props.value).toBe(buttonValue);
    });

    it("calls the 'onUserInput' func with the @value attribute", function() {
        var testFunc = jest.genMockFunction();
        var buttonValue = "century";
        var testButton = React.createElement(TypeRadioButton,
                                             {value: buttonValue,
                                              onUserInput: testFunc,
                                              selected: false,
                                              label: "rawr"});
        // put the button in a test DOM and simulate a click
        var testDom = TestUtils.renderIntoDocument(testButton);
        var buttonInDom = TestUtils.findRenderedDOMComponentWithTag(testDom, "input");
        TestUtils.Simulate.change(buttonInDom);
        // after "clicking," it called the "onUserInput" func with @value
        expect(testFunc).toBeCalledWith(buttonValue);
    });
    
});
