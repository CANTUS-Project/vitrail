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

import init from '../js/nuclear/init';

// mocked
import {log} from '../js/util/log';

// unmocked
import nuclear  from 'nuclear-js';
const Immutable = nuclear.Immutable;

import reactor from '../js/nuclear/reactor';
import signals from '../js/nuclear/signals';
import stores from '../js/nuclear/stores';


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
    beforeEach(() => { log.warn.mockClear(); });

    it('returns "next" when it is "table"', () => {
        let previous = 4;
        let next = 'table';
        let actual = stores.setters.setSearchResultFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "next" when it is "ItemView"', () => {
        let previous = 4;
        let next = 'ItemView';
        let actual = stores.setters.setSearchResultFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "previous" when "next" is invalid', () => {
        let previous = 4;
        let next = 'shout to to my friends';
        let actual = stores.setters.setSearchResultFormat(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });
});


describe('SETTERS.setPage()', () => {
    beforeEach(() => { log.warn.mockClear(); reactor.reset(); });

    it(`returns "next" when it's a whole number less than the number of pages`, () => {
        // 10 pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        let previous = 3;
        let next = 5;
        let actual = stores.setters.setPage(previous, next);
        expect(actual).toBe(next);
    });

    it(`returns "next" when it's 1, but number of pages is 0`, () => {
        // 0 pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 0, per_page: 10}}));
        let previous = 3;
        let next = 1;
        let actual = stores.setters.setPage(previous, next);
        expect(actual).toBe(next);
    });

    it(`returns "next" when it is a string with an integer in it`, () => {
        // 10 pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        let previous = 3;
        let next = '4';
        let expected = 4;
        let actual = stores.setters.setPage(previous, next);
        expect(actual).toBe(expected);
    });

    it(`returns "previous" when "next" is greater than the number of pages`, () => {
        // 10 pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        let previous = 3;
        let next = 400;
        let actual = stores.setters.setPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });

    it(`returns "previous" when "next" is not a number`, () => {
        // 10 pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        let previous = 3;
        let next = 'one hundred';
        let actual = stores.setters.setPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });
});


describe('SETTERS.setPerPage()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it(`returns "next" when it's valid input`, () => {
        let previous = 3;
        let next = 5;
        let actual = stores.setters.setPerPage(previous, next);
        expect(actual).toBe(next);
    });

    it(`returns "next" when it's a string with a number in it`, () => {
        let previous = 3;
        let next = '5';
        let expected = 5;
        let actual = stores.setters.setPerPage(previous, next);
        expect(actual).toBe(expected);
    });

    it(`returns "previous" when "next" is 0`, () => {
        let previous = 3;
        let next = 0;
        let actual = stores.setters.setPerPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });

    it(`returns "previous" when "next" is greater than 100`, () => {
        let previous = 3;
        let next = 400;
        let actual = stores.setters.setPerPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });

    it(`returns "previous" when "next" is not a number`, () => {
        let previous = 3;
        let next = 'one hundred';
        let actual = stores.setters.setPerPage(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });
});


describe('SETTERS.setSearchQuery', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('returns initial state when called with "clear"', () => {
        let actual = stores.setters.setSearchQuery('asdf', 'clear');
        expect(actual.equals(stores.stores.SearchQuery.getInitialState())).toBe(true);
    });

    it('returns "previous" when called with invalid "next"', () => {
        let previous = 42;
        let next = 600;
        let actual = stores.setters.setSearchQuery(previous, next);
        expect(actual).toBe(previous);
        expect(log.warn).toBeCalled();
    });

    it('works in a comprehensive test', () => {
        // in this test...
        // - one invalid field name
        // - one non-string field value
        // - one proper field
        // - proper type
        // - set an existing field to zero-length string removes it
        // - leave existing field untouched
        let previous = nuclear.toImmutable({city: 'true', date: 'orange'});
        let next = {force: 'a', feast: 9, incipit: 'bonsoir', type: 'chant', date: ''};
        let expected = nuclear.toImmutable({city: 'true', incipit: 'bonsoir', type: 'chants'});
        let actual = stores.setters.setSearchQuery(previous, next);
        expect(actual.equals(expected)).toBe(true);
        expect(log.warn).toBeCalled();  // for "feast" set to 9 instead of a string
    });

    it('works with one proper field and improper type', () => {
        let previous = nuclear.toImmutable({alreadyHere: true});
        let next = {incipit: 'bonsoir', type: 'blueberry'};
        let expected = nuclear.toImmutable({alreadyHere: true, incipit: 'bonsoir'});
        let actual = stores.setters.setSearchQuery(previous, next);
        expect(actual.equals(expected)).toBe(true);
        expect(log.warn).toBeCalled();  // for "feast" set to 9 instead of a string
    });
});


describe('SETTERS.loadSearchResults()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('deals with a successful request', () => {
        let previous = 'whatever';
        let next = {incipit: 'deus ex machina'};
        let expected = nuclear.toImmutable({error: null, results: next});
        let actual = stores.setters.loadSearchResults(previous, next);
        expect(nuclear.Immutable.Map.isMap(actual)).toBe(true);
        expect(actual.equals(expected)).toBe(true);
    });

    it('deals with an unsuccessful request', () => {
        let previous = nuclear.toImmutable({results: 42});
        let next = {code: 500};
        let expected = nuclear.toImmutable({results: 42, error: next});
        let actual = stores.setters.loadSearchResults(previous, next);
        expect(nuclear.Immutable.Map.isMap(actual)).toBe(true);
        expect(actual.equals(expected)).toBe(true);
    });
});


describe('SETTERS.setRenderAs()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('works with "ItemView"', () => {
        const previous = 'lolz';
        const next = 'ItemView';
        const expected = next;
        expect(stores.setters.setRenderAs(previous, next)).toBe(expected);
    });

    it('works with "table"', () => {
        const previous = 'lolz';
        const next = 'table';
        const expected = next;
        expect(stores.setters.setRenderAs(previous, next)).toBe(expected);
    });

    it('does not work with "banana"', () => {
        const previous = 'lolz';
        const next = 'banana';
        const expected = previous;
        expect(stores.setters.setRenderAs(previous, next)).toBe(expected);
    });
});
