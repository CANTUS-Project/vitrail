// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_stores.js
// Purpose:                Tests for js/nuclear/stores.js
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


// mocked
import {log} from '../js/log';
import {reactor} from '../js/nuclear/reactor';

// unmocked
jest.dontMock('../js/nuclear/stores');
const stores = require('../js/nuclear/stores');


describe('isWholeNumber()', function() {

    it('false with undefined input', function() {
        let input = undefined;
        let expected = false;
        expect(stores.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is not a number', function() {
        let input = 'four';
        let expected = false;
        expect(stores.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is less than zero', function() {
        let input = -4;
        let expected = false;
        expect(stores.isWholeNumber(input)).toBe(expected);
    });

    it('false with input that is not an integer', function() {
        let input = 4.5;
        let expected = false;
        expect(stores.isWholeNumber(input)).toBe(expected);
    });

    it('true with a whole number', function() {
        let input = 4;
        let expected = true;
        expect(stores.isWholeNumber(input)).toBe(expected);
    });
});


describe('SETTERS.setSearchResultFormat()', () => {
    it('returns "next" when it is "table"', () => {
        let previous = 4;
        let next = 'table';
        let actual = stores.SETTERS.setSearchResultFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "next" when it is "ItemView"', () => {
        let previous = 4;
        let next = 'ItemView';
        let actual = stores.SETTERS.setSearchResultFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "previous" when "next" is invalid', () => {
        let previous = 4;
        let next = 'shout to to my friends';
        let actual = stores.SETTERS.setSearchResultFormat(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });
});


describe('SETTERS.setPage()', () => {
    it(`returns "next" when it's a whole number less than the number of pages`, () => {
        reactor.evaluate.mockReturnValue(10);
        let previous = 3;
        let next = 5;
        let actual = stores.SETTERS.setPage(previous, next);
        expect(actual).toBe(next);
    });

    it(`returns "next" when it's 1, but number of pages is 0`, () => {
        reactor.evaluate.mockReturnValue(0);
        let previous = 3;
        let next = 1;
        let actual = stores.SETTERS.setPage(previous, next);
        expect(actual).toBe(next);
    });

    it(`returns "previous" when "next" is greater than the number of pages`, () => {
        reactor.evaluate.mockReturnValue(10);
        let previous = 3;
        let next = 400;
        let actual = stores.SETTERS.setPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });

    it(`returns "previous" when "next" is not a number`, () => {
        reactor.evaluate.mockReturnValue(10);
        let previous = 3;
        let next = 'one hundred';
        let actual = stores.SETTERS.setPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });
});
