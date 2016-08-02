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

import nuclear from 'nuclear-js';
import {formatters} from '../js/nuclear/getters';

const Immutable = nuclear.Immutable;


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


describe('ServiceWorker-related getters', () => {
    it('swSupported() works', () => {
        const results = Immutable.Map({supported: 'yes'});
        expect(formatters.swSupported(results)).toBe('yes');
    });

    it('swInstalled() works', () => {
        const results = Immutable.Map({installed: 'sure'});
        expect(formatters.swInstalled(results)).toBe('sure');
    });
});


describe('resultsSortOrder()', () => {
    it('works', () => {
        const results = Immutable.fromJS({'results': {'sort_order': '1,2,3'}});
        expect(formatters.resultsSortOrder(results)).toBe('1,2,3');
    });
});


describe('searchResultsHeaders()', () => {
    it('works', () => {
        const results = Immutable.fromJS({'results': {'headers': 'X-Cantus-Whatever'}});
        expect(formatters.searchResultsHeaders(results)).toBe('X-Cantus-Whatever');
    });
});


describe('resultsFields(), resultsExtraFields(), and resultsAllFields()', () => {
    it('the headers field is present', () => {
        const results = Immutable.fromJS({'results': {'headers': {'fields': 'one,two'}}});
        expect(formatters.resultsFields(results)).toEqual(Immutable.List(['one', 'two']));
    });

    it('the headers field is not present', () => {
        const results = Immutable.fromJS({'results': {'headers': {'whatever': 'five'}}});
        expect(formatters.resultsFields(results)).toEqual(Immutable.List());
    });

    it('the extra headers field is present', () => {
        const results = Immutable.fromJS({'results': {'headers': {'extra_fields': 'one,two'}}});
        expect(formatters.resultsExtraFields(results)).toEqual(Immutable.List(['one', 'two']));
    });

    it('the extra headers field is not present', () => {
        const results = Immutable.fromJS({'results': {'headers': {'whatever': 'five'}}});
        expect(formatters.resultsExtraFields(results)).toEqual(Immutable.List());
    });

    it('all fields', () => {
        const results = Immutable.fromJS({'results': {'headers': {'fields': 'one,two', 'extra_fields': 'three,four'}}});
        expect(formatters.resultsAllFields(results)).toEqual(Immutable.List(['one', 'two', 'three', 'four']));
    });
});


describe('resultsAllSameType()', () => {
    it('three resources, all same type', () => {
        const results = Immutable.fromJS({
            results: {
                asdf: {type: 'chant'},
                bsdf: {type: 'chant'},
                csdf: {type: 'chant'},
                sort_order: ['asdf', 'bsdf', 'csdf'],
            }
        });
        expect(formatters.resultsAllSameType(results)).toBe(true);
    });

    it('three resources, all different types', () => {
        const results = Immutable.fromJS({
            results: {
                asdf: {type: 'chant'},
                bsdf: {type: 'dhant'},
                csdf: {type: 'ehant'},
                sort_order: ['asdf', 'bsdf', 'csdf'],
            }
        });
        expect(formatters.resultsAllSameType(results)).toBe(false);
    });

    it('one resource', () => {
        const results = Immutable.fromJS({
            results: {
                asdf: {type: 'chant'},
                sort_order: ['asdf'],
            }
        });
        expect(formatters.resultsAllSameType(results)).toBe(true);
    });

    it('three resources, only one is in sort_order', () => {
        const results = Immutable.fromJS({
            results: {
                asdf: {type: 'chant'},
                bsdf: {type: 'ciant'},
                csdf: {type: 'cjant'},
                sort_order: ['asdf'],
            }
        });
        expect(formatters.resultsAllSameType(results)).toBe(true);
    });

    it('no resources in sort_order', () => {
        const results = Immutable.fromJS({results: {sort_order: []}});
        expect(formatters.resultsAllSameType(results)).toBe(true);
    });

    it('no resources', () => {
        expect(formatters.resultsAllSameType(Immutable.Map())).toBe(true);
    });
});


describe('ResultListTable_columns()', () => {
    it('works with no results for input', () => {
        const results = Immutable.fromJS(
            {'results': { 'fields': ['what'], 'extra_fields': ['ever'], 'sort_order': []}}
        );
        const expected = Immutable.fromJS({names: [], display: []});
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });

    it('properly detects when all records are chants', () => {
        const results = Immutable.fromJS({'results': {
            'headers': {'fields': 'what', 'extra_fields': 'ever'},
            'sort_order': ['1', '2', '3'],
            '1': {type: 'chant'},
            '2': {type: 'chant'},
            '3': {type: 'chant'},
        }});
        const expected = Immutable.fromJS({
            names: ['incipit', 'genre', 'office', 'feast', 'position','siglum', 'folio', 'sequence',
                    'mode', 'differentia'],
            display: ['Incipit', 'Genre', 'Office', 'Feast', 'Position','Siglum', 'Folio', 'Sequence',
                      'Mode', 'Differentia']
        });
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });

    it('properly detects when all records are sources', () => {
        const results = Immutable.fromJS({'results': {
            'headers': {'fields': 'what', 'extra_fields': 'ever'},
            'sort_order': ['1', '2', '3'],
            '1': {type: 'source'},
            '2': {type: 'source'},
            '3': {type: 'source'},
        }});
        const expected = Immutable.fromJS({
            names: ['rism', 'title', 'date', 'provenance', 'summary'],
            display: ['RISM', 'Title', 'Date', 'Provenance', 'Summary'],
        });
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });

    it('is not thrown off when only the first result is a chant', () => {
        const results = Immutable.fromJS({'results': {
            'headers': {'fields': 'what', 'extra_fields': 'ever'},
            'sort_order': ['1', '2', '3'],
            '1': {type: 'source'},
            '2': {type: 'feast'},
            '3': {type: 'genre'},
        }});
        const expected = Immutable.fromJS({
            names: ['what', 'ever'],
            display: ['What', 'Ever']
        });
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });

    it('is not thrown off when only the first result is a source', () => {
        const results = Immutable.fromJS({'results': {
            'headers': {'fields': 'what', 'extra_fields': 'branch_force'},
            'sort_order': ['1', '2', '3'],
            '1': {type: 'source'},
            '2': {type: 'feast'},
            '3': {type: 'genre'},
        }});
        const expected = Immutable.fromJS({
            names: ['what', 'branch_force'],
            display: ['What', 'Branch Force']
        });
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });

    it('deals with all resources of same type, but not Chant or Source', () => {
        const results = Immutable.fromJS({'results': {
            'headers': {'fields': 'fun,is', 'extra_fields': 'cao_concordances'},
            'sort_order': ['1', '2', '3'],
            '1': {type: 'feast'},
            '2': {type: 'feast'},
            '3': {type: 'feast'},
        }});
        const expected = Immutable.fromJS({
            names: ['fun', 'is', 'cao_concordances'],
            display: ['Fun', 'Is', 'CAO Concordances'],
        });
        expect(formatters.ResultListTable_columns(results)).toEqual(expected);
    });
});


describe('CollectionsList getters', () => {
    it('collections() getter', () => {
        const collectionsList = Immutable.Map({collections: 'collections', cache: 'cache', showing: 'showing'});
        expect(formatters.collections(collectionsList)).toBe('collections');
    });

    it('collectionsCache() getter', () => {
        const collectionsList = Immutable.Map({collections: 'collections', cache: 'cache', showing: 'showing'});
        expect(formatters.collectionsCache(collectionsList)).toBe('cache');
    });

    it('showingCollection() getter', () => {
        const collectionsList = Immutable.Map({collections: 'collections', cache: 'cache', showing: 'showing'});
        expect(formatters.showingCollection(collectionsList)).toBe('showing');
    });
});


describe('CurrentItemView getters', () => {
    it('currentItemView() getter', () => {
        const theStore = Immutable.Map({resource: 'shmesource'});
        const actual = formatters.currentItemView(theStore);
        expect(actual).toBe('shmesource');
    });

    it('itemViewLoading() getter', () => {
        const theStore = Immutable.Map({loading: false});
        const actual = formatters.itemViewLoading(theStore);
        expect(actual).toBe(false);
    });
});
