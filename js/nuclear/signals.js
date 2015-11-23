// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/signals.js
// Purpose:                ActionTypes and Actions for NuclearJS in Vitrail.
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

import cantusjs from '../cantusjs/cantus.src';

import reactor from './reactor';
import getters from './getters';


const CANTUS = new cantusjs.Cantus('http://abbot.adjectivenoun.ca:8888/');


const SIGNAL_NAMES = {
    LOAD_IN_ITEMVIEW: 1,
    SET_SEARCH_RESULT_FORMAT: 2,
    SET_PER_PAGE: 3,
    SET_PAGES: 4,
    SET_PAGE: 5,
    SET_SEARCH_QUERY: 6,
    LOAD_SEARCH_RESULTS: 7,
};


// TODO: all these verification functions should be in the Stores
const SIGNALS = {
    loadInItemView: function(type, id) {
        // Load a resource in the ItemView, given a type and ID.
        //

        if (undefined === type || undefined === id) {
            let msg = 'loadInItemView() requires "type" and "id" arguments';
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: make this not be stupid
        let cantusjs = window['temporaryCantusJS'];

        let settings = {type: type, id: id};
        cantusjs.get(settings)
        .then(function(response) {reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, response)})
        .catch(function(response) {
            if (404 === response.code) {
                reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, {});
            } else {
                // TODO: handle other errors better
                console.error(response)
            }
        });
    },

    setSearchResultFormat: function(to) {
        // Set the format of search results to "table" or "ItemView". Other arguments won't change
        // the result format, and will cause an error message to appear in the console.
        //
        if (to !== reactor.evaluate(getters.searchResultsFormat)) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_RESULT_FORM, to);
        }
    },

    // pagination
    setPage: function(to) {
        // Set the currently displayed page of search results to "to."
        //
        if (to !== reactor.evaluate(getters.searchResultsPage)) {
            reactor.dispatch(SIGNAL_NAMES.SET_PAGE, to);
        }
    },
    setPages: function(to) {
        // Set the total number of pages in the search results to "to."
        // NOTE: resets current page to 1
        //
        if (to !== reactor.evaluate(getters.searchResultsPages)) {
            reactor.batch(() => {
                reactor.dispatch(SIGNAL_NAMES.SET_PAGES, to);
                reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
            });
        }
    },
    setPerPage: function(to) {
        // Set the number of search results per page to "to."
        // NOTE: resets current page to 1
        //
        if (to !== reactor.evaluate(getters.searchResultsPerPage)) {
            reactor.batch(() => {
                reactor.dispatch(SIGNAL_NAMES.SET_PER_PAGE, to);
                reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
            });
        }
    },

    setResourceType: function(to) {
        // Set the resource type to search for to "to".
        //
        if (to !== reactor.evaluate(getters.resourceType)) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, {type: to});
        }
    },

    setSearchQuery: function(params) {
        // Set the search query parameters given in "params".
        // If "params" is an object, its members are assumed to be field names and the values are
        //    verified to be strings, which are assumed to be the sought field values. Members that
        //    are not valid field names for CantusJS are silently ignored.
        // If "params" is the string "clear", all current search parameters are cleared, and the
        //    resourceType is also reset to "all".
        //
        if ('object' === typeof params) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, params);
        } else if ('clear' === params) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, 'clear');
        } else {
            console.error('signals.setSearchQuery() was called with incorrect input.');
        }
    },

    submitSearchQuery: function() {
        // Submit a search query to the Cantus server with the settings currently in NuclearJS.
        //

        // default, unchanging things
        const querySettings = reactor.evaluate(getters.searchQuery);
        let ajaxSettings = querySettings.toObject();

        // pagination
        ajaxSettings['page'] = reactor.evaluate(getters.searchResultsPage);
        ajaxSettings['per_page'] = reactor.evaluate(getters.searchResultsPerPage);

        // submit the request
        if (querySettings.count() > 1) {
            // search query
            CANTUS.search(ajaxSettings).then(r => reactor.dispatch(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, r));
        } else {
            // browse query
            CANTUS.get(ajaxSettings).then(r => reactor.dispatch(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, r));
        }
    },
};


export {SIGNAL_NAMES, SIGNALS};
export default SIGNALS;
