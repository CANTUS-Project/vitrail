// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_ResultColumn.js
// Purpose:                Tests for the "ResultColumn" React component.
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
