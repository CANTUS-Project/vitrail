// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_signals.js
// Purpose:                NuclearJS signals for Vitrail.
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
import localforage from 'localforage';
import {log} from '../js/util/log';

// unmocked
import nuclear from 'nuclear-js';
const Immutable = nuclear.Immutable;

import cantusjs from '../js/cantusjs/cantus.src';

import getters from '../js/nuclear/getters';
import reactor from '../js/nuclear/reactor';
import stores from '../js/nuclear/stores';
import {LOCALFORAGE_COLLECTIONS_KEY, LOCALFORAGE_CACHE_KEY, SIGNAL_NAMES, SIGNALS as signals} from '../js/nuclear/signals';


describe('submittedServerRequest()', () => {
    it('works', () => {
        expect(reactor.evaluate(getters.loadingResults)).toBe(false);  // precondition
        signals.submittedServerRequest();
        expect(reactor.evaluate(getters.loadingResults)).toBe(true);
    });
});


describe('setSearchResultsFormat()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        const to = 'ItemView';
        // make sure it's starting with the other value
        expect(reactor.evaluate(getters.searchResultsFormat)).toBe('table');
        signals.setSearchResultsFormat(to);
        expect(reactor.evaluate(getters.searchResultsFormat)).toBe(to);
    });
});


describe('setPage()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        // trick it into thinking there are 10 available pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        const to = 3;
        // make sure it's starting with another value
        expect(reactor.evaluate(getters.searchPage)).not.toBe(to);
        signals.setPage(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(to);
    });
});


describe('setPerPage()', () => {
    beforeEach(() => { reactor.reset(); });

    it('updates when the value is different', () => {
        const to = 42;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        signals.setPage(5);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(1);
    });

    it('does not update when the value is the same', () => {
        const to = 10;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        signals.setPage(5);
        // double-check that it is 10 even before we call setPerPage()
        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(5);
    });

    it('does not update when the value is invalid', () => {
        const to = 1000;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        const currentPage = 5;
        signals.setPage(currentPage);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).not.toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(currentPage);
    });
});


describe('setResourceType()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        const to = 'feast';
        const expected = 'feasts';  // converted to plural with CantusJS
        expect(reactor.evaluate(getters.resourceType)).not.toBe(to);

        signals.setResourceType(to);

        expect(reactor.evaluate(getters.resourceType)).toBe(expected);
    });
});


describe('setSearchQuery()', () => {
    beforeEach(() => { reactor.reset(); });

    it('updates when called with an object', () => {
        const params = {incipit: 'letter', genre: 'number'};
        signals.setSearchQuery(params);
        const actual = reactor.evaluate(getters.searchQuery);
        expect(actual.get('incipit')).toBe('letter');
        expect(actual.get('genre')).toBe('number');
    });

    it('updates when called with "clear"', () => {
        // first put some stuff in
        signals.setSearchQuery({incipit: 'letter'});
        expect(reactor.evaluate(getters.searchQuery).get('incipit')).toBe('letter');
        // now clear everything
        signals.setSearchQuery('clear');
        expect(reactor.evaluate(getters.searchQuery).get('incipit')).toBe(undefined);
    });

    it('logs a warning when called with anything else', () => {
        signals.setSearchQuery(5);
        expect(log.warn).toBeCalled();
    });
});


describe('submitSearchQuery()', () => {
    beforeEach(() => {
        reactor.reset();
        cantusjs.Cantus.prototype.search.mockClear();
        cantusjs.Cantus.prototype.get.mockClear();
    });

    describe('loadSearchResults()', () => {
        it('calls the Reactor', () => {
            const results = {res: 'ults'};
            signals.loadSearchResults(results);
            expect(reactor.evaluate(getters.searchResults).get('res')).toBe('ults');
        });
    });

    it('calls loadCollection() properly', () => {
        const origLoadCollection = signals.loadCollection;
        signals.loadCollection = jest.genMockFn();
        signals.setShowingCollection('123');
        const mockSearch = cantusjs.Cantus.prototype.search;
        const mockGet = cantusjs.Cantus.prototype.get;

        signals.submitSearchQuery();

        expect(signals.loadCollection).toBeCalledWith('123');
        expect(mockSearch).not.toBeCalled();
        expect(mockGet).not.toBeCalled();
        signals.loadCollection = origLoadCollection;
    });

    it('calls CANTUS.search() properly', () => {
        // make a mock Promise to return from search(), then set it to be returned
        const mockSearch = cantusjs.Cantus.prototype.search;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockSearch.mockReturnValueOnce(mockPromise);
        // setup some query
        const params = {incipit: 'letter', type: 'feasts'};
        signals.setSearchQuery(params);
        // expected argument to search()
        const expAjaxSettings = {type: 'feasts', incipit: 'letter', page: 1, per_page: 10};

        signals.submitSearchQuery();

        expect(mockSearch).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
    });

    it('calls CANTUS.get() properly', () => {
        // make a mock Promise to return from get(), then set it to be returned
        const mockGet = cantusjs.Cantus.prototype.get;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockGet.mockReturnValueOnce(mockPromise);
        // setup return values from reactor.evaluate()
        const params = {type: 'feasts'};
        signals.setSearchQuery(params);
        // expected argument to get()
        const expAjaxSettings = {type: 'feasts', page: 1, per_page: 10};

        signals.submitSearchQuery();

        expect(mockGet).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
    });
});


describe('setItemViewOverlaySize()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        const to = 'compact';
        expect(reactor.evaluate(getters.itemViewOverlaySize)).not.toBe(to);

        signals.setItemViewOverlaySize(to);

        expect(reactor.evaluate(getters.itemViewOverlaySize)).toBe(to);
    });
});


describe('loadInItemView()', () => {
    beforeEach(() => { reactor.reset(); log.warn.mockClear(); });

    it(`"type" is undefined: file a warning message and don't change state`, () => {
        const type = undefined;
        const id = 'a';
        signals.loadInItemView(type, id);
        expect(log.warn).toBeCalled();
    });

    it(`"id" is undefined: file a warning message and don't change state`, () => {
        const type = 'a';
        const id = undefined;
        signals.loadInItemView(type, id);
        expect(log.warn).toBeCalled();
    });

    it(`"type" is not a string: file a warning message and don't change state`, () => {
        const type = 5;
        const id = 'a';
        signals.loadInItemView(type, id);
        expect(log.warn).toBeCalled();
    });

    it(`"id" is not a string: file a warning message and don't change state`, () => {
        const type = 'a';
        const id = 5;
        signals.loadInItemView(type, id);
        expect(log.warn).toBeCalled();
    });

    it(`the CANTUS.get() call is successful (the Store is set)`, () => {
        // make a mock Promise to return from get(), then set it to be returned
        const mockGet = cantusjs.Cantus.prototype.get;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockGet.mockReturnValueOnce(mockPromise);
        // expected argument to get()
        const expAjaxSettings = {type: 'feasts', id: '2234'};

        signals.loadInItemView('feasts', '2234');

        expect(mockGet).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        // Just... make sure it was called... idk.
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        // Make sure the SUBMITTED_FOR_ITEMVIEW signal was emitted... because the CantusJS Promise
        // is mocked, LOAD_IN_ITEMVIEW isn't called, so SUBMITTED_FOR_ITEMVIEW is still true.
        expect(reactor.evaluate(getters.itemViewLoading)).toBe(true);
    });

    it(`loads from the CollectionsList cache when possible`, () => {
        signals.addToCache({123: {type: 'chant', id: '123'}, sort_order: ['123']});
        signals.loadInItemView('chant', '123');
        const expected = Immutable.fromJS({
            123: {type: 'chant', id: '123'},
            resources: {123: {}},
            sort_order: ['123'],
        });

        const actual = reactor.evaluate(getters.currentItemView);

        expect(actual.equals(expected)).toBeTruthy();
    });
});


describe('Collection management signals', () => {
    beforeEach(() => { reactor.reset(); });

    describe('functions with mocks on saveCollections() and saveCollectionCache()', function() {
        beforeAll(() => {
            this.saveColl = signals.saveCollections;
            this.saveCache = signals.saveCollectionCache;
        });
        beforeEach(() => {
            signals.saveCollections = jest.genMockFn();
            signals.saveCollections.mockReturnValue({then: (func) => { func(); }});
            signals.saveCollectionCache = jest.genMockFn();
            signals.saveCollectionCache.mockReturnValue({then: (func) => { func(); }});
        });
        afterAll(() => {
            signals.saveCollections = this.saveColl;
            signals.saveCollectionCache = this.saveCache;
        });

        describe('newCollection()', () =>{
            it('works', () => {
                const name = 'Tester Bester';

                signals.newCollection(name);

                const theStore = reactor.evaluate(getters.collections);
                expect(theStore.size).toBe(1);
                const newColl = theStore.first();
                expect(newColl.get('name')).toBe(name);
                expect(newColl.get('members').size).toBe(0);
                expect(signals.saveCollections).toBeCalled();
                expect(signals.saveCollectionCache).toBeCalled();
            });
        });

        describe('renameCollection()', () =>{
            it('works', () => {
                // setup: make a collection
                const name = 'Tester Bester';
                signals.newCollection(name);
                const newName = 'Broccoli is a "gateway vegetable."';

                const colid = reactor.evaluate(getters.collections).first().get('colid');
                signals.renameCollection(colid, newName);

                const collection = reactor.evaluate(getters.collections).get(colid);
                expect(collection.get('name')).toBe(newName);
                expect(signals.saveCollections).toBeCalled();
            });
        });

        describe('deleteCollection()', () =>{
            it('works', () => {
                // setup: make a collection
                const name = 'Tester Bester';
                signals.newCollection(name);
                const colid = reactor.evaluate(getters.collections).first().get('colid');

                signals.deleteCollection(colid);

                const theStore = reactor.evaluate(getters.collections);
                expect(theStore.size).toBe(0);
                expect(signals.saveCollections).toBeCalled();
                expect(signals.saveCollectionCache).toBeCalled();
            });
        });

        describe('addToCollection()', function() {
            beforeAll(() => { this.requestForCache = signals.requestForCache; });
            beforeEach(() => { signals.requestForCache = jest.genMockFn(); });
            afterAll(() => { signals.requestForCache = this.requestForCache; });

            it('works', () => {
                // setup: make a collection
                const rid = '123';
                signals.newCollection('whatever');
                const colid = reactor.evaluate(getters.collections).first().get('colid');

                signals.addToCollection(colid, rid);

                const collection = reactor.evaluate(getters.collections).get(colid);
                expect(collection.get('members').first()).toBe(rid);
                expect(signals.requestForCache).toBeCalledWith(rid);
                expect(signals.saveCollections).toBeCalled();
            });

            it('does not pass things along when the "rid" is missing', () => {
                // setup: make a collection
                const rid = undefined;
                signals.newCollection('whatever');
                signals.saveCollections.mockClear();  // called by newCollection()
                const colid = reactor.evaluate(getters.collections).first().get('colid');

                signals.addToCollection(colid, rid);

                const collection = reactor.evaluate(getters.collections).get(colid);
                expect(collection.get('members').size).toBe(0);
                expect(signals.requestForCache).not.toBeCalled();
                expect(signals.saveCollections).not.toBeCalled();
            });
        });

        describe('removeFromCollection()', () =>{
            it('works', () => {
                // setup: make a collection and put a resource in it
                const rid = '123';
                signals.newCollection('whatever');
                const colid = reactor.evaluate(getters.collections).first().get('colid');
                signals.addToCollection(colid, rid);

                signals.removeFromCollection(colid, rid);

                const collection = reactor.evaluate(getters.collections).get(colid);
                expect(collection.get('members').size).toBe(0);
            });
        });

        describe('addToCache()', () => {
            it('works with one thing to add', () => {
                // const saveCollectionCache = signals.saveCollectionCache;
                signals.saveCollectionCache = jest.genMockFn();
                const response = {
                    '123': {'type': 'chant', 'id': '123', 'incipit': 'Et quoniam...'},
                    'sort_order': ['123'],
                };
                signals.addToCache(response);
                const theStore = reactor.evaluate(getters.collectionsCache);
                expect(theStore.has('123')).toBeTruthy();
                expect(signals.saveCollectionCache).toBeCalled();
                // signals.saveCollectionCache = saveCollectionCache;
            });

            it('works with three things to add', () => {
                const response = {
                    '123': {'type': 'chant', 'id': '123', 'incipit': 'Et quoniam...'},
                    '456': {'type': 'chant', 'id': '456', 'incipit': 'Gloria in excelsis...'},
                    '789': {'type': 'chant', 'id': '789', 'incipit': 'Deus meus keus seus...'},
                    'sort_order': ['123', '456', '789'],
                };
                signals.addToCache(response);
                const theStore = reactor.evaluate(getters.collectionsCache);
                expect(theStore.has('123')).toBeTruthy();
                expect(theStore.has('456')).toBeTruthy();
                expect(theStore.has('789')).toBeTruthy();
            });

            it('works with nothing to add', () => {
                const response = {'sort_order': []};
                signals.addToCache(response);
                const theStore = reactor.evaluate(getters.collections);
                expect(theStore.size).toBe(0);
            });

            it('works when CantusJS reports an error', () => {
                const response = {code: '90001', response: "It's over nine thousand!"};
                signals.addToCache(response);
                const theStore = reactor.evaluate(getters.collectionsCache);
                expect(theStore.size).toBe(0);
            });
        });
    });

    describe('requestForCache()', () => {
        it('works', () => {
            // make a mock Promise to return from get(), then set it to be returned
            const mockSearch = cantusjs.Cantus.prototype.search;
            mockSearch.mockClear();
            const mockPromise = {then: jest.genMockFn()};
            mockSearch.mockReturnValueOnce(mockPromise);
            const rid = '400';
            const expAjaxSettings = {id: rid};

            signals.requestForCache(rid);

            expect(mockSearch).toBeCalledWith(expAjaxSettings);
            expect(mockPromise.then).toBeCalledWith(signals.addToCache);
        });
    });

    describe('loadCollection()', function() {
        beforeAll(() => { this.loadNow = signals._loadCollectionNow; });
        afterAll(() => { signals._loadCollectionNow = this.loadNow; });
        beforeEach(() => { signals._loadCollectionNow = jest.genMockFn(); });

        it('loads immediately when the collection ID is available', () => {
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');
            signals.loadCollection(colid);
            expect(signals._loadCollectionNow).toBeCalled();
        });
    });

    describe('_loadCollectionNow()', function() {
        beforeAll(() => { this.loadSearchResults = signals.loadSearchResults; });
        afterAll(() => { signals.loadSearchResults = this.loadSearchResults; });
        beforeEach(() => { signals.loadSearchResults = jest.genMockFn(); });

        it('does not crash when the collection ID does not exist', () => {
            const actual = signals._loadCollectionNow('123');
            expect(actual).toBe(undefined);
            expect(signals.loadSearchResults).not.toBeCalled();
        });

        it('processes three resources', () => {
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');
            signals.addToCollection(colid, '123');
            signals.addToCollection(colid, '789');
            signals.addToCollection(colid, '456');
            signals.addToCache({
                sort_order: ['123', '456', '789'],  // different from the order added to collection
                123: {type: 'chant', id: '123'},
                456: {type: 'chant', id: '456'},
                789: {type: 'chant', id: '789'},
            });

            const actual = signals._loadCollectionNow(colid);

            expect(actual.get('sort_order').equals(Immutable.List(['123', '789', '456']))).toBeTruthy();
            expect(actual.has('123')).toBeTruthy();
            expect(actual.has('789')).toBeTruthy();
            expect(actual.has('456')).toBeTruthy();
            expect(actual.getIn(['headers', 'total_results'])).toBe(3);
            expect(actual.getIn(['headers', 'page'])).toBe(1);
            expect(actual.getIn(['headers', 'per_page'])).toBe(10);
        });

        it('returns what is available when a resource is not in the cache', () => {
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');
            signals.addToCollection(colid, '123');
            signals.addToCollection(colid, '789');
            signals.addToCache({
                sort_order: ['123', '789'],
                123: {type: 'chant', id: '123'},
                // missing: 789
            });

            const actual = signals._loadCollectionNow(colid);

            expect(actual.get('sort_order').equals(Immutable.List(['123']))).toBeTruthy();
            expect(actual.has('123')).toBeTruthy();
            expect(actual.has('789')).toBeFalsy();  // missing!
            expect(actual.getIn(['headers', 'total_results'])).toBe(2);
        });

        it('handles showing the first page', () => {
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');
            signals.addToCollection(colid, '123');
            signals.addToCollection(colid, '789');
            signals.addToCollection(colid, '456');
            signals.addToCache({
                sort_order: ['123', '456', '789'],
                123: {type: 'chant', id: '123'},
                456: {type: 'chant', id: '456'},
                789: {type: 'chant', id: '789'},
            });
            signals.setPerPage(2);
            signals.setPage(1);

            const actual = signals._loadCollectionNow(colid);

            expect(actual.get('sort_order').equals(Immutable.List(['123', '789']))).toBeTruthy();
            expect(actual.has('123')).toBeTruthy();
            expect(actual.has('789')).toBeTruthy();
            expect(actual.has('456')).toBeFalsy();  // on the 2nd page
            expect(actual.getIn(['headers', 'total_results'])).toBe(3);
            expect(actual.getIn(['headers', 'page'])).toBe(1);
            expect(actual.getIn(['headers', 'per_page'])).toBe(2);
        });

        it('handles showing the second page', () => {
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');
            signals.addToCollection(colid, '123');
            signals.addToCollection(colid, '789');
            signals.addToCollection(colid, '456');
            signals.addToCache({
                sort_order: ['123', '456', '789'],
                123: {type: 'chant', id: '123'},
                456: {type: 'chant', id: '456'},
                789: {type: 'chant', id: '789'},
            });
            signals.setPerPage(2);
            signals.setPage(2);

            const actual = signals._loadCollectionNow(colid);

            expect(actual.get('sort_order').equals(Immutable.List(['456']))).toBeTruthy();
            expect(actual.has('123')).toBeFalsy();  // on the 1st page
            expect(actual.has('789')).toBeFalsy();  // on the 1st page
            expect(actual.has('456')).toBeTruthy();
            expect(actual.getIn(['headers', 'total_results'])).toBe(3);
            expect(actual.getIn(['headers', 'page'])).toBe(2);
            expect(actual.getIn(['headers', 'per_page'])).toBe(2);
        });
    });

    describe('setShowingCollection()', () => {
        it('works', () => {
            // precondition
            expect(reactor.evaluate(getters.showingCollection)).toBe(false);
            // make a collection so we can show it
            signals.newCollection('whatever');
            const colid = reactor.evaluate(getters.collections).first().get('colid');

            signals.setShowingCollection(colid);
            expect(reactor.evaluate(getters.showingCollection)).toBe(colid);
        });
    });

    describe('functions that use localForage', () => {
        beforeEach(() => {
            localforage.getItem.mockClear();
            localforage.setItem.mockClear();
        });

        it('saveCollections()', () => {
            reactor.dispatch(SIGNAL_NAMES.REPLACE_COLLECTIONS, Immutable.Map({one: 'two'}));
            signals.saveCollections();
            expect(localforage.setItem).toBeCalledWith(LOCALFORAGE_COLLECTIONS_KEY, {one: 'two'});
        });

        it('saveCollectionCache()', () => {
            reactor.dispatch(SIGNAL_NAMES.REPLACE_CACHE, Immutable.Map({three: 'one'}));
            signals.saveCollectionCache();
            expect(localforage.setItem).toBeCalledWith(LOCALFORAGE_CACHE_KEY, {three: 'one'});
        });

        it('loadCollections()', () => {
            // setup a Promise-alike to be returned by localForage
            localforage.getItem.mockReturnValue({then: (func) => { func({bark: 'woof'}); }});
            const expected = Immutable.Map({bark: 'woof'});

            signals.loadCollections();

            expect(localforage.getItem).toBeCalledWith(LOCALFORAGE_COLLECTIONS_KEY);
            expect(reactor.evaluate(getters.collections).equals(expected)).toBeTruthy();
        });

        it('loadCache()', () => {
            // setup a Promise-alike to be returned by localForage
            localforage.getItem.mockReturnValue({then: (func) => { func({bark: 'woof'}); }});
            const expected = Immutable.Map({bark: 'woof'});

            signals.loadCache();

            expect(localforage.getItem).toBeCalledWith(LOCALFORAGE_CACHE_KEY);
            expect(reactor.evaluate(getters.collectionsCache).equals(expected)).toBeTruthy();
        });

        it('clearShelf()', () => {
            // setup a Promise-alike to be returned by localForage
            localforage.setItem.mockReturnValue({then: (func) => { func(); }});
            reactor.dispatch(SIGNAL_NAMES.REPLACE_COLLECTIONS, Immutable.Map({one: 'two'}));
            reactor.dispatch(SIGNAL_NAMES.REPLACE_CACHE, Immutable.Map({three: 'one'}));

            signals.clearShelf();

            expect(reactor.evaluate(getters.collections).toJS()).toEqual({});
            expect(reactor.evaluate(getters.collectionsCache).toJS()).toEqual({});
            expect(localforage.setItem.mock.calls.length).toBe(2);
        });
    });
});
