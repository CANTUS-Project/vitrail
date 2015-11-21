// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_TypeRadioButton.js
// Purpose:                Tests for the "TypeRadioButton" React component.
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
        expect(buttonInDom.props.checked).toBe(selected);
        expect(buttonInDom.props.value).toBe(buttonValue);
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
