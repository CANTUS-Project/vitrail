// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_TypeSelector.js
// Purpose:                Tests for the "TypeSelector" React component.
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
