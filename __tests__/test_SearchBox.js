// tests/test_TypeSelector.js

jest.dontMock("../js/vitrail");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var Vitrail = require("../js/vitrail");
var SearchBox = Vitrail.SearchBox;


describe("SearchBox", function() {

    it("renders properly into the DOM", function() {
        var submitSearch = jest.genMockFunction();
        var contents = "your search query here";
        var testSearchBox = React.createElement(SearchBox,
                                                {submitSearch: submitSearch,
                                                 contents: contents});
        // render the stuff in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSearchBox);
        var testForm = TestUtils.findRenderedDOMComponentWithTag(testDom, "form");
        var testLabel = testForm.props.children;
        var testLabelLabel = testLabel.props.children[0];
        var testBox = testLabel.props.children[1];
        var testButton = testLabel.props.children[3];  // element 2 is a "&nbsp;"
        // check the props were set properly
        expect(testLabel.type).toBe("label");
        expect(testLabelLabel).toBe("Search Query: ")  // NOTE: the space in the string is non-breaking
        expect(testBox.type).toBe("input");
        expect(testBox.props.type).toBe("search");
        expect(testBox.props.defaultValue).toBe(contents);
        expect(testButton.type).toBe("input");
        expect(testButton.props.type).toBe("submit");
        expect(testButton.props.value).toBe("Search");
    });

    it("calls submitSearch() when the form is submitted", function() {
        var theSearchQuery = "incipit:'*deus*'"
        var submitSearch = jest.genMockFunction();
        var testSearchBox = React.createElement(SearchBox,
                                                {submitSearch: submitSearch});
        // render the stuff in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSearchBox);
        var testForm = TestUtils.findRenderedDOMComponentWithTag(testDom, "form");
        var testBox = testForm.props.children.props.children[1];  // element 0 is a string
        // check the default defaultValue came out properly
        expect(testBox.props.defaultValue).toBe("");
        // submit the form, and see if the "submitSearch" function is called with the right arg
        var theSubmitEvent = {"target": [{"value": theSearchQuery}]};
        TestUtils.Simulate.submit(testForm, theSubmitEvent);
        expect(submitSearch).toBeCalledWith(theSearchQuery);
    });

});
