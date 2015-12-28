// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_signals.js
// Purpose:                NuclearJS signals for Vitrail.
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

import {cantusModule as cantusjs} from '../js/cantusjs/cantus.src';
import {reactor} from '../js/nuclear/reactor';
import {log} from '../js/util/log';

jest.dontMock('nuclear-js');
const Immutable = require('nuclear-js').Immutable;
jest.dontMock('../js/nuclear/getters');
const getters = require('../js/nuclear/getters');
jest.dontMock('../js/nuclear/signals');
const signals = require('../js/nuclear/signals');
const SIGNALS = signals.SIGNALS;
const SIGNAL_NAMES = signals.SIGNAL_NAMES;


describe('setSearchResultFormat()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); reactor.evaluate.mockClear(); });

    it('updates when the value is different', () => {
        let to = 1;
        reactor.evaluate.mockReturnValueOnce(2);
        SIGNALS.setSearchResultFormat(to);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_SEARCH_RESULT_FORM, to);
    });

    it('does not update when the value is the same', () => {
        let to = 5;
        reactor.evaluate.mockReturnValueOnce(5);
        SIGNALS.setSearchResultFormat(to);
        expect(reactor.dispatch).not.toBeCalled();
    });
});


describe('setPage()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); reactor.evaluate.mockClear(); });

    it('updates when the value is different', () => {
        let to = 1;
        reactor.evaluate.mockReturnValueOnce(2);
        SIGNALS.setPage(to);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_PAGE, to);
    });

    it('does not update when the value is the same', () => {
        let to = 5;
        reactor.evaluate.mockReturnValueOnce(5);
        SIGNALS.setPage(to);
        expect(reactor.dispatch).not.toBeCalled();
    });
});


describe('setPerPage()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); reactor.evaluate.mockClear(); });

    it('updates when the value is different', () => {
        let to = 42;
        reactor.evaluate.mockReturnValueOnce(2);
        SIGNALS.setPerPage(to);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_PAGE, 1);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_PER_PAGE, to);
    });

    it('does not update when the value is the same', () => {
        let to = 5;
        reactor.evaluate.mockReturnValueOnce(5);
        SIGNALS.setPerPage(to);
        expect(reactor.dispatch).not.toBeCalled();
    });
});


describe('setResourceType()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); reactor.evaluate.mockClear(); });

    it('updates when the value is different', () => {
        let to = 1;
        reactor.evaluate.mockReturnValueOnce(2);
        SIGNALS.setResourceType(to);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_SEARCH_QUERY, {type: to});
    });

    it('does not update when the value is the same', () => {
        let to = 5;
        reactor.evaluate.mockReturnValueOnce(5);
        SIGNALS.setResourceType(to);
        expect(reactor.dispatch).not.toBeCalled();
    });
});


describe('setSearchQuery()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); });

    it('updates when called with an object', () => {
        let params = {a: 'letter', b: 'number'};
        SIGNALS.setSearchQuery(params);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_SEARCH_QUERY, params);
    });

    it('updates when called with "clear"', () => {
        let params = 'clear';
        SIGNALS.setSearchQuery(params);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_SEARCH_QUERY, params);
    });

    it('logs a warning when called with anything else', () => {
        let params = 5;
        SIGNALS.setSearchQuery(params);
        expect(reactor.dispatch).not.toBeCalled();
        expect(log.warn).toBeCalled();
    });
});


describe('submitSearchQuery()', () => {
    beforeEach(() => {
        reactor.dispatch.mockClear();
        reactor.evaluate.mockClear();
        cantusjs.Cantus.mock.instances[0].search.mockClear();
        cantusjs.Cantus.mock.instances[0].get.mockClear();
    });

    describe('loadSearchResults()', () => {
        it('calls the Reactor', () => {
            const results = {res: 'ults'};
            SIGNALS.loadSearchResults(results);
            expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, results);
        });
    });

    it('calls CANTUS.search() properly', () => {
        // make a mock Promise to return from search(), then set it to be returned
        const mockSearch = cantusjs.Cantus.mock.instances[0].search;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockSearch.mockReturnValueOnce(mockPromise);
        // setup return values from reactor.evaluate()
        const evalReturn = Immutable.fromJS({type: 'f', a: 1});
        reactor.evaluate.mockReturnValue(evalReturn);
        // expected argument to search()
        const expAjaxSettings = {type: 'f', a: 1, page: evalReturn, per_page: evalReturn};

        SIGNALS.submitSearchQuery();

        expect(mockSearch).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === SIGNALS.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === SIGNALS.loadSearchResults).toBe(true);
    });

    it('calls CANTUS.get() properly', () => {
        // make a mock Promise to return from get(), then set it to be returned
        const mockGet = cantusjs.Cantus.mock.instances[0].get;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockGet.mockReturnValueOnce(mockPromise);
        // setup return values from reactor.evaluate()
        const evalReturn = Immutable.fromJS({type: 'f'});
        reactor.evaluate.mockReturnValue(evalReturn);
        // expected argument to get()
        const expAjaxSettings = {type: 'f', page: evalReturn, per_page: evalReturn};

        SIGNALS.submitSearchQuery();

        expect(mockGet).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === SIGNALS.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === SIGNALS.loadSearchResults).toBe(true);
    });
});


describe('setRenderAs()', () => {
    beforeEach(() => { reactor.dispatch.mockClear(); });

    it('works', () => {
        const as = 'table';
        SIGNALS.setRenderAs(as);
        expect(reactor.dispatch).toBeCalledWith(SIGNAL_NAMES.SET_RENDER_AS, as);
    });
});
