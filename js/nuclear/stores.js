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
import {cantusModule as cantusjs} from '../cantusjs/cantus.src';

import {getters} from './getters';
import {log} from '../log';
import {reactor} from './reactor';
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
    setSearchResultFormat(previous, next) {
        // Set the format of search results to "table" or "ItemView". Other arguments won't change
        // the result format, and will cause an error message to appear in the console.
        if (undefined !== next) {
            if ('table' === next || 'ItemView' === next) {
                return next;
            } else {
                log.warn(`Invariant violation: setSearchResultFormat() expects "table" or "ItemView"`);
                return previous;
            }
        }
    },

    // pagination
    setPage(previous, next) {
        // Set the current page in the current search results.
        if (isWholeNumber(next)) {
            let numOfPages = reactor.evaluate(getters.searchResultsPages);
            if (next <= numOfPages || 1 === next) {
                return next;
            } else {
                log.warn(`Can't set page to ${next}: only ${numOfPages} exist.`);
                return previous;
            }
        } else {
            log.warn(`setPage() must be given a whole number, not ${next}`);
            return previous;
        }
    },
    setPerPage(previous, next) {
        // Set the number of results per page for search results.
        if (isWholeNumber(next)) {
            if (0 < next && next < 101) {
                return next;
            } else {
                log.warn(`Resources per page must be between 1 and 100 (got ${next})`);
                return previous;
            }
        } else {
            log.warn(`Invariant violation: setPerPage() requires a whole number`);
            return previous;
        }
    },

    setSearchQuery(previous, next) {
        // Amend the search query. If "next" is the string "clear" then the search query is cleared.
        //
        let post = previous;

        if ('clear' === next) {
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
                    log.warn(`Invariant violation: setSearchQuery() has ${field} that isn't a string`);
                    continue;
                }

                // if the field is "type" check that it's a valid type (if not, print error and continue)
                if ('type' === field) {
                    let type = cantusjs.convertTypeNumber(next.type, 'plural');
                    if (undefined !== type) {
                        post = post.set('type', type);
                    } else {
                        log.warn(`setSearchQuery() received invalid type (${next.type})`);
                    }

                // set the field
                } else {
                    post = post.set(field, next[field]);
                }
            }

            return post;
        } else {
            log.warn('Invariant violation: setSearchQuery() requires an object or "clear"');
            return previous;
        }
    },

    loadSearchResults(previous, next) {
        // Load the search results.
        //
        if (undefined === next.code) {
            // request was successful
            return toImmutable({error: null, results: next});
        } else {
            // request was not successful
            return toImmutable({error: next, results: previous.get('results')});
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

    SearchPerPage: Store({
        // Currently-requested number of results to show per search result page.
        getInitialState() { return 10; },
        initialize() { this.on(SIGNAL_NAMES.SET_PER_PAGE, SETTERS.setPerPage); },
    }),

    SearchPage: Store({
        // Currently-requested page of search results being displayed.
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

    SearchResults: Store({
        // The current search results.
        // This is the object returned from CantusJS without modification.
        // Getters results appropriately-formatted results.
        //
        getInitialState() { return toImmutable({error: null, results: null}); },
        initialize() { this.on(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, SETTERS.loadSearchResults); },
    }),
};


export {STORES, SETTERS, isWholeNumber};
export default STORES;
