// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_SearchBox.js
// Purpose:                Tests for the "SearchBox" React component.
//
// Copyright (C) 2015 Christopher Antila
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//-------------------------------------------------------------------------------------------------


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
