// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_stores.js
// Purpose:                Tests for js/nuclear/stores.js
//
// Copyright (C) 2015, 2016 Christopher Antila
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


const setters = stores.setters;
const _shouldDeleteFromCache = stores._shouldDeleteFromCache;


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


describe('SETTERS.setSearchResultsFormat()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('returns "next" when it is "table"', () => {
        let previous = 4;
        let next = 'table';
        let actual = stores.setters.setSearchResultsFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "next" when it is "ItemView"', () => {
        let previous = 4;
        let next = 'ItemView';
        let actual = stores.setters.setSearchResultsFormat(previous, next);
        expect(actual).toBe(next);
    });

    it('returns "previous" when "next" is invalid', () => {
        let previous = 4;
        let next = 'shout to to my friends';
        let actual = stores.setters.setSearchResultsFormat(previous, next);
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

    it('handles the special "reset" value', () => {
        const previous = 'yep';
        const next = 'reset';
        const expected = stores.stores.SearchResults.getInitialState();

        const actual = stores.setters.loadSearchResults(previous, next);

        expect(actual.equals(expected)).toBeTruthy();
    });

    it('accepts an Error and reports it properly', () => {
        const previous = 'yep';
        const next = new Error('wow this sucks');
        const expected = Immutable.fromJS({error: 'Unexpected error', results: null});

        const actual = stores.setters.loadSearchResults(previous, next);

        expect(actual.equals(expected)).toBeTruthy();
    });

    it('deals with a successful request', () => {
        const previous = 'whatever';
        const next = {incipit: 'deus ex machina'};
        const expected = Immutable.fromJS({error: null, results: next});

        const actual = stores.setters.loadSearchResults(previous, next);

        expect(actual.equals(expected)).toBeTruthy();
    });

    it('deals with an unsuccessful request', () => {
        const previous = Immutable.fromJS({results: 42});
        const next = {code: 500};
        const expected = Immutable.fromJS({results: null, error: next});

        const actual = stores.setters.loadSearchResults(previous, next);

        expect(actual.equals(expected)).toBeTruthy();
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


describe('itemViewOverlaySize()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('works with "full"', () => {
        const previous = 'lolz';
        const next = 'full';
        const expected = next;
        expect(stores.setters.itemViewOverlaySize(previous, next)).toBe(expected);
    });

    it('works with "compact"', () => {
        const previous = 'lolz';
        const next = 'compact';
        const expected = next;
        expect(stores.setters.itemViewOverlaySize(previous, next)).toBe(expected);
    });

    it('does not work with "banana"', () => {
        const previous = 'lolz';
        const next = 'banana';
        const expected = previous;
        expect(stores.setters.itemViewOverlaySize(previous, next)).toBe(expected);
    });
});


describe('setCurrentItemView()', () => {
    beforeEach(() => { log.warn.mockClear(); });

    it('works when the argument is a Map', () => {
        const previous = 'fuzz';
        const next = Immutable.fromJS({'123': {id: '123', type: 'chant'}, sort_order: ['123']});
        const actual = stores.setters.setCurrentItemView(previous, next);
        expect(actual).toBe(next);
    });

    it('works when the argument is an object', () => {
        const previous = 'fuzz';
        const next = {'123': {id: '123', type: 'chant'}, sort_order: ['123']};
        const actual = stores.setters.setCurrentItemView(previous, next);
        expect(Immutable.Map.isMap(actual)).toBe(true);
    });

    it('fails when the argument is not an object', () => {
        const previous = 'fuzz';
        const next = 'bark!';
        const expected = previous;
        expect(stores.setters.setCurrentItemView(previous, next)).toBe(expected);
        expect(log.warn).toBeCalled();
    });
});


describe('ServiceWorker and "installation" related functions', () => {
    afterAll(() => reactor.reset());

    it('swInstalled() works', () => {
        const previous = Immutable.Map({supported: 5, installed: 6});
        const actual = stores.setters.swInstalled(previous);
        expect(actual).toEqual(Immutable.Map({supported: 5, installed: true}));
    });

    it('swUninstalled() works', () => {
        const previous = Immutable.Map({supported: 5, installed: 6});
        const actual = stores.setters.swUninstalled(previous);
        expect(actual).toEqual(Immutable.Map({supported: 5, installed: false}));
    });
});


describe('The CollectionsList Store', () => {
    describe('newCollection() handler', () => {
        it('adds a new collection', () => {
            const previous = Immutable.Map({collections: Immutable.Map(), cache: Immutable.Map()});
            const actual = setters.newCollection(previous, 'whatever');

            expect(actual.get('collections').size).toBe(1);
            const coll = actual.get('collections').first();
            expect(coll.has('colid')).toBeTruthy();
            expect(typeof coll.get('colid') === 'string').toBeTruthy();
            expect(coll.get('name')).toBe('whatever');
            expect(coll.get('members')).toEqual(Immutable.List());
        });

        it('does not add a collection when the name is not given', () => {
            const previous = Immutable.Map({collections: Immutable.Map(), cache: Immutable.Map()});
            const actual = setters.newCollection(previous);
            expect(actual.get('collections').size).toBe(0);
        });

        it('does not add a collection when the name is not a string', () => {
            const previous = Immutable.Map({collections: Immutable.Map(), cache: Immutable.Map()});
            const actual = setters.newCollection(previous, 14);
            expect(actual.get('collections').size).toBe(0);
        });
    });

    describe('renameCollection() handler', () => {
        it('renames a collection', () => {
            const previous = Immutable.fromJS({
                cache: {},
                collections: {416: {name: 'The Cheronnow Collection'}},
            });
            const next = {colid: '416', name: 'Broccoli Invasion'};
            const actual = setters.renameCollection(previous, next);
            expect(actual.getIn(['collections', '416', 'name'])).toBe('Broccoli Invasion');
        });

        it('does not rename when the name is not a string', () => {
            const previous = Immutable.fromJS({
                cache: {},
                collections: {416: {name: 'The Cheronnow Collection'}},
            });
            const next = {colid: '416', name: 416};
            const actual = setters.renameCollection(previous, next);
            expect(actual.getIn(['collections', '416', 'name'])).toBe('The Cheronnow Collection');
        });

        it('does not rename when the collection ID is wrong', () => {
            const previous = Immutable.fromJS({
                cache: {},
                collections: {416: {name: 'The Cheronnow Collection'}},
            });
            const next = {colid: '905', name: 'Broccoli Invasion'};
            const actual = setters.renameCollection(previous, next);
            expect(actual.getIn(['collections', '416', 'name'])).toBe('The Cheronnow Collection');
        });
    });

    describe('_shouldDeleteFromCache() helper for deleteCollection()', () => {
        it('returns true when there is only one collection', () => {
            const colls = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const deleting = '416';
            const cached = '1';

            expect(_shouldDeleteFromCache(colls, deleting, cached)).toBe(true);
        });

        it('returns true when "cached" is not in another resource', () => {
            const colls = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {
                    416: {colid: '416', name: '我是Ted', members: ['1', '2']},
                    905: {colid: '905', name: 'Slim Shady', members: ['2']}
                },
            });
            const deleting = '416';
            const cached = '1';

            expect(_shouldDeleteFromCache(colls, deleting, cached)).toBe(true);
        });

        it('returns false when "cached" is in another resource', () => {
            const colls = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {
                    416: {colid: '416', name: '我是Ted', members: ['1', '2']},
                    905: {colid: '905', name: 'Slim Shady', members: ['2']}
                },
            });
            const deleting = '416';
            const cached = '2';

            expect(_shouldDeleteFromCache(colls, deleting, cached)).toBe(false);
        });
    });

    describe('deleteCollection() handler', () => {
        it('deletes the collection and cached resources', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.deleteCollection(previous, '416');
            expect(actual.hasIn(['collections', '416'])).toBeFalsy();
            expect(actual.hasIn(['cache', '1'])).toBeFalsy();
            expect(actual.hasIn(['cache', '2'])).toBeFalsy();
        });

        it('does not delete cached resources needed by another collection', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {
                    416: {colid: '416', name: '我是Ted', members: ['1', '2']},
                    905: {colid: '905', name: 'Slim Shady', members: ['2']}
                },
            });
            const actual = setters.deleteCollection(previous, '416');
            expect(actual.hasIn(['collections', '416'])).toBeFalsy();
            expect(actual.hasIn(['cache', '1'])).toBeFalsy();
            expect(actual.hasIn(['cache', '2'])).toBeTruthy();
        });

        it('does not delete when the Collection ID does not exist', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.deleteCollection(previous, '90000000');
            expect(actual.hasIn(['collections', '416'])).toBeTruthy();
            expect(actual.hasIn(['cache', '1'])).toBeTruthy();
            expect(actual.hasIn(['cache', '2'])).toBeTruthy();
        });

        it('does not delete when the Collection ID is not provided', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.deleteCollection(previous);
            expect(actual.hasIn(['collections', '416'])).toBeTruthy();
            expect(actual.hasIn(['cache', '1'])).toBeTruthy();
            expect(actual.hasIn(['cache', '2'])).toBeTruthy();
        });
    });

    describe('addToCollection() handler', () => {
        it('adds the ID to the collection', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCollection(previous, {colid: '416', rid: '3'});
            expect(actual.getIn(['collections', '416', 'members']).includes('3')).toBeTruthy();
        });

        it('does not add the ID when it is already in the collection', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCollection(previous, {colid: '416', rid: '2'});
            expect(actual.getIn(['collections', '416', 'members']).size).toEqual(2);
        });

        it('does not add the ID when the collection ID does not exist', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCollection(previous, {colid: '333333', rid: '3'});
            expect(actual.getIn(['collections']).size).toEqual(1);
            expect(actual.getIn(['collections', '416', 'members']).size).toEqual(2);
        });

        it('does not add an ID when the ID is not given', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCollection(previous);
            expect(actual.getIn(['collections']).size).toEqual(1);
            expect(actual.getIn(['collections', '416', 'members']).size).toEqual(2);
        });
    });

    describe('removeFromCollection() handler', () => {
        it('removes the resource and the cached copy', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.removeFromCollection(previous, {colid: '416', rid: '1'});
            expect(actual.getIn(['collections', '416', 'members']).includes('1')).toBeFalsy();
            expect(actual.hasIn(['cache', '1'])).toBeFalsy();
        });

        it('does not delete the cached copy when the resource ID is in another collection', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {
                    416: {colid: '416', name: '我是Ted', members: ['1', '2']},
                    905: {colid: '905', name: 'Slim Shady', members: ['2']}
                },
            });
            const actual = setters.removeFromCollection(previous, {colid: '416', rid: '2'});
            expect(actual.getIn(['collections', '416', 'members']).includes('2')).toBeFalsy();
            expect(actual.hasIn(['cache', '2'])).toBeTruthy();
        });

        it('does not delete when the collection ID does not exist', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.removeFromCollection(previous, {colid: '905', rid: '1'});
            expect(actual).toEqual(previous);
        });

        it('does not delete when the resource ID does not exist', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.removeFromCollection(previous, {colid: '416', rid: '42'});
            expect(actual).toEqual(previous);
        });

        it('does not delete when the resource and collection IDs are not given', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.removeFromCollection(previous);
            expect(actual).toEqual(previous);
        });
    });

    describe('addToCache() handler', () => {
        it('adds the resource to the collection', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCache(previous, {id: '2', type: 'fruit'});
            expect(actual.hasIn(['cache', '2'])).toBeTruthy();
            expect(actual.getIn(['cache', '2', 'type'])).toBe('fruit');
        });

        it('does not add the resource when its ID is missing', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCache(previous, {fruit: 'papaya'});
            expect(actual).toEqual(previous);
        });

        it('does not add anything when the resource is not given', () => {
            const previous = Immutable.fromJS({
                cache: {1: {field: 'value'}, 2: {field: 'value'}},
                collections: {416: {colid: '416', name: '我是Ted', members: ['1', '2']}},
            });
            const actual = setters.addToCache(previous);
            expect(actual).toEqual(previous);
        });
    });

    describe('setShowingCollection() handler', () => {
        it('works when given a valid value', () => {
            let theStore = Immutable.Map({showing: 'tree'});

            theStore = setters.setShowingCollection(theStore, 'some collection ID');
            expect(theStore.get('showing')).toBe('some collection ID');

            theStore = setters.setShowingCollection(theStore, false);
            expect(theStore.get('showing')).toBe(false);
        });

        it('does not set to an invalid value', () => {
            let theStore = Immutable.Map({showing: 'tree'});

            theStore = setters.setShowingCollection(theStore, {showing: 'collections!'});
            expect(theStore.get('showing')).toBe('tree');

            theStore = setters.setShowingCollection(theStore, 42);
            expect(theStore.get('showing')).toBe('tree');

            theStore = setters.setShowingCollection(theStore);
            expect(theStore.get('showing')).toBe('tree');
        });
    });

    describe('replaceCollections() handler', () => {
        it('works when given an ImmutableJS Map', () => {
            const next = Immutable.Map({yeah: 'whatever'});
            const actual = setters.replaceCollections(Immutable.Map(), next);
            expect(actual.getIn(['collections', 'yeah'])).toBe('whatever');
        });

        it('does not replace when given another value', () => {
            const next = 'four';
            const actual = setters.replaceCollections(Immutable.Map(), next);
            expect(actual.has('collections')).toBeFalsy();
        });
    });

    describe('replaceCache() handler', () => {
        it('works when given an ImmutableJS Map', () => {
            const next = Immutable.Map({yeah: 'whatever'});
            const actual = setters.replaceCache(Immutable.Map(), next);
            expect(actual.getIn(['cache', 'yeah'])).toBe('whatever');
        });

        it('does not replace when given another value', () => {
            const next = 'four';
            const actual = setters.replaceCache(Immutable.Map(), next);
            expect(actual.has('cache')).toBeFalsy();
        });
    });
});
