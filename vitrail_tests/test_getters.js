// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_getters.js
// Purpose:                NuclearJS getters for Vitrail.
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

// This only tests getter-related functions. Whether the getters themselves are connected correctly
// is tested in test_nuclear.js.

jest.dontMock('nuclear-js');
const Immutable = require('nuclear-js').Immutable;
jest.dontMock('../js/nuclear/getters');
const formatters = require('../js/nuclear/getters').formatters;


describe('searchResultsPages()', () => {
    it('returns 0 when there are no results', () => {
        let results = Immutable.fromJS({results: null});
        expect(formatters.searchResultsPages(results)).toBe(0);
    });

    it('works when total results is less than perPage', () => {
        let results = Immutable.fromJS({results: {headers: {total_results: 5, per_page: 10}}});
        expect(formatters.searchResultsPages(results)).toBe(1);
    });

    it('works when total results is less than perPage (as strings)', () => {
        let results = Immutable.fromJS({results: {headers: {total_results: '5', per_page: '10'}}});
        expect(formatters.searchResultsPages(results)).toBe(1);
    });

    it('works when total results equals perPage', () => {
        let results = Immutable.fromJS({results: {headers: {total_results: 10, per_page: 10}}});
        expect(formatters.searchResultsPages(results)).toBe(1);
    });

    it('works when total results is greater than perPage', () => {
        let results = Immutable.fromJS({results: {headers: {total_results: 15, per_page: 10}}});
        expect(formatters.searchResultsPages(results)).toBe(2);
    });
});


describe('searchResultsPage()', () => {
    it('returns 0 when there are no results', () => {
        let results = Immutable.fromJS({results: null});
        expect(formatters.searchResultsPage(results)).toBe(0);
    });

    it('works when there are results', () => {
        let results = Immutable.fromJS({results: {headers: {page: 10}}});
        expect(formatters.searchResultsPage(results)).toBe(10);
    });

    it('works when there are results (as a string)', () => {
        let results = Immutable.fromJS({results: {headers: {page: '10'}}});
        expect(formatters.searchResultsPage(results)).toBe(10);
    });
});


describe('searchResultsPerPage()', () => {
    it('returns 0 when there are no results', () => {
        let results = Immutable.fromJS({results: null});
        expect(formatters.searchResultsPerPage(results)).toBe(0);
    });

    it('works when there are results', () => {
        let results = Immutable.fromJS({results: {headers: {per_page: 42}}});
        expect(formatters.searchResultsPerPage(results)).toBe(42);
    });

    it('works when there are results (as a string)', () => {
        let results = Immutable.fromJS({results: {headers: {per_page: '42'}}});
        expect(formatters.searchResultsPerPage(results)).toBe(42);
    });
});


describe('resourceType()', () => {
    it('works', () => {
        let query = Immutable.fromJS({type: 'croissants'});
        expect(formatters.resourceType(query)).toBe('croissants');
    });
});


describe('searchResults()', () => {
    it('works', () => {
        let results = Immutable.fromJS({results: 900, error: 404});
        expect(formatters.searchResults(results)).toBe(900);
    });
});


describe('searchError()', () => {
    it('works', () => {
        let results = Immutable.fromJS({results: 900, error: 404});
        expect(formatters.searchError(results)).toBe(404);
    });
});
