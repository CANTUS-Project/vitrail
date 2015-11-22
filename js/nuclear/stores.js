// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/stores.js
// Purpose:                NuclearJS Stores for Vitrail.
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

import {Store, toImmutable} from 'nuclear-js';
import cantusjs from '../cantusjs/cantus.src';

import getters from './getters';
import reactor from './reactor';
import {SIGNAL_NAMES} from './signals';


// Sometimes this is all we need. NOTE that Stores using this function should do validity checking
// in the signal function.
function justReturnThePayload(previousState, payload) { return toImmutable(payload); };


function isWholeNumber(num) {
    // Verify that "num" is a whole number (an integer 0 or greater).
    let outcome = false;

    if (num) {
        if ('number' === typeof num) {
            if (num >= 0) {
                if (0 === num % 1) {
                    outcome = true;
    }}}}

    return outcome;
};


const SETTERS = {
    setSearchResultFormat: function(previous, next) {
        // Set the format of search results to "table" or "ItemView". Other arguments won't change
        // the result format, and will cause an error message to appear in the console.
        if (undefined !== next) {
            if ('table' === next || 'ItemView' === next) {
                return next;
            } else {
                console.error(`Unknown search result format: "${next}"`);
                return previous;
            }
        }
    },

    // pagination
    setPages: function(previous, next) {
        // Set the number of pages in the current search results.
        if (isWholeNumber(next)) {
            return next;
        } else {
            console.error(`setPages() must be given a whole number, not ${next}`);
            return previous;
        }
    },
    setPage: function(previous, next) {
        // Set the current page in the current search results.
        if (isWholeNumber(next)) {
            let numOfPages = reactor.evaluate(getters.searchResultsPages);
            if (next <= numOfPages || 1 === next) {
                return next;
            } else {
                console.error(`Can't set page to ${next}: only ${numOfPages} exist.`);
                return previous;
            }
        } else {
            console.error(`setPage() must be given a whole number, not ${next}`);
            return previous;
        }
    },
    setPerPage: function(previous, next) {
        // Set the number of results per page for search results.
        if (isWholeNumber(next)) {
            if (0 < next && next < 101) {
                return next;
            } else {
                console.error(`Resources per page must be between 1 and 100 (got ${next})`);
                return previous;
            }
        } else {
            console.error(`setPerPage() must be given a whole number, not ${next}`);
            return previous;
        }
    },

    setSearchQuery: function(previous, next) {
        // Amend the search query. If "next" is the string "clear" then the search query is cleared.
        //
        let post = previous.toObject();

        if ('clear' === next) {
            // return toImmutable({type: 'all'});
            return STORES.SearchQuery.getInitialState();
        } else if ('object' === typeof next) {
            // iterate all the members in "next"
            for (let field in next) {
                // check the field
                if (!cantusjs.VALID_FIELDS.includes(field)) {
                    continue;
                }

                // check the value is a string (if not, print an error and continue)
                if ('string' !== typeof next[field]) {
                    console.error(`setSearchQuery() has ${field} field with improper type`);
                    continue;
                }

                // if the field is "type" check that it's a valid type (if not, print error and continue)
                if ('type' === field) {
                    let type = cantusjs.convertTypeNumber(next.type, 'plural');
                    if (undefined !== type) {
                        post.type = type;
                    } else {
                        console.error(`setSearchQuery() received invalid type (${next.type})`);
                    }

                // set the field
                } else {
                    post[field] = next[field];
                }
            }

            return toImmutable(post);
        } else {
            console.error('setSearchQuery() requires an object or "clear"');
            return previous;
        }
    },
};


const STORES = {
    CurrentItemView: Store({
        // The resource currently displayed in an ItemView.
        //

        getInitialState() {
            return toImmutable({});
        },
        initialize() {
            this.on(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, justReturnThePayload);
        },
    }),

    SearchResultsFormat: Store({
        // Should search results be displayed as "table" or collection of "ItemView?"
        getInitialState() { return 'ItemView'; },
        initialize() { this.on(SIGNAL_NAMES.SET_SEARCH_RESULT_FORMAT, justReturnThePayload); },
    }),

    SearchResultsPerPage: Store({
        // The number of results to show per search result page.
        getInitialState() { return 10; },
        initialize() { this.on(SIGNAL_NAMES.SET_PER_PAGE, SETTERS.setPerPage); },
    }),

    SearchResultsPages: Store({
        // The number of pages in the currently-displayed search results.
        getInitialState() { return 0; },
        initialize() { this.on(SIGNAL_NAMES.SET_PAGES, SETTERS.setPages); },
    }),

    SearchResultsPage: Store({
        // Current page of search results being displayed.
        getInitialState() { return 1; },
        initialize() { this.on(SIGNAL_NAMES.SET_PAGE, SETTERS.setPage); },
    }),

    SearchQuery: Store({
        // The current search query, stored as an object that can be sent straight to CantusJS.
        getInitialState() { return toImmutable({type: 'all'}); },
        initialize() {
            this.on(SIGNAL_NAMES.SET_SEARCH_QUERY, SETTERS.setSearchQuery);
            this.on(SIGNAL_NAMES.SET_RESOURCE_TYPE, SETTERS.setSearchQuery);
        },
    }),
};


export {STORES, SETTERS, isWholeNumber};
export default STORES;
