// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_PerPageSelector.js
// Purpose:                Tests for the "PerPageSelector" React component.
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
var PerPageSelector = Vitrail.PerPageSelector;


describe("PerPageSelector", function() {

    it("renders properly into the DOM", function() {
        var onUserInput = jest.genMockFunction();
        var perPage = 14;
        var testSelector = React.createElement(PerPageSelector,
                                               {onUserInput: onUserInput,
                                                perPage: perPage});
        // put the selector in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSelector);
        var testLabel = TestUtils.findRenderedDOMComponentWithTag(testDom, "label");
        var testLabelLabel = testLabel.props.children[0];
        var testInput = testLabel.props.children[1];
        // check things are rendered properly
        expect(testLabelLabel).toBe("Results per page: ");
        expect(testInput.type).toBe("input");
        expect(testInput.props.type).toBe("number");
        expect(testInput.props.name).toBe("perPage");
        expect(testInput.props.value).toBe(perPage);
    });

    it("calls the 'onUserInput' func with the @value attribute", function() {
        var onUserInput = jest.genMockFunction();
        var testSelector = React.createElement(PerPageSelector,
                                               {onUserInput: onUserInput});
        // put the selector in a test DOM, then find it
        var testDom = TestUtils.renderIntoDocument(testSelector);
        var testLabel = TestUtils.findRenderedDOMComponentWithTag(testDom, "label");
        var testInput = testLabel.props.children[1];
        // check the proper default value
        expect(testInput.props.value).toBe(10);
        // emit a "change" event, and see if it's handled properly
        var theChangeEvent = {"target": {"value": 42}};
        // TODO: the proper "Simulate" event doesn't seem to work... this does... oh well
        testInput.props.onChange(theChangeEvent);
        // TestUtils.Simulate.change(testInput, theChangeEvent);
        expect(onUserInput).toBeCalledWith(42);
    });

});
