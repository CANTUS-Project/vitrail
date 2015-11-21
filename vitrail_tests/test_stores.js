// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __tests__/test_signals.js
// Purpose:                Tests for js/nuclear/signals.js
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


jest.dontMock('../js/nuclear/signals');
const signals = require('../js/nuclear/signals');



describe('isWholeNumber()', function() {

    it('false with undefined input', function() {
        var input = undefined;
        var expected = false;
        expect(signals.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is not a number', function() {
        var input = 'four';
        var expected = false;
        expect(signals.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is less than zero', function() {
        var input = -4;
        var expected = false;
        expect(signals.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is not an integer', function() {
        var input = 4.5;
        var expected = false;
        expect(signals.isWholeNumber(input)).toBe(expected);
    });

    it('true with a whole number', function() {
        var input = 4;
        var expected = true;
        expect(signals.isWholeNumber(input)).toBe(expected);
    });
});
