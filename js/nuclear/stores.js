// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/stores.js
// Purpose:                NuclearJS Stores for Vitrail.
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

import {Immutable, Store, toImmutable} from 'nuclear-js';
import {cantusModule as cantusjs} from '../cantusjs/cantus.src';

import {getters} from './getters';
import {log} from '../util/log';
import {reactor} from './reactor';
import {SIGNAL_NAMES} from './signals';


function isWholeNumber(num) {
    // Verify that "num" is a whole number (an integer 0 or greater).
    let outcome = false;

    if (num) {
        if ('number' === typeof num) {
            if (num >= 0) {
                if (0 === num % 1) {
                    outcome = true;
                } } } }

    return outcome;
}


/** Determine whether the ServiceWorker features Vitrail uses are supported.
 *
 * Currently this checks for the "serviceWorker" object and "caches" object.
 */
function checkSWSupported() {
    return _swInNav() && _cachesInWindow();
}
function _swInNav() { return 'serviceWorker' in navigator; }
function _cachesInWindow() { return 'caches' in window; }


const SETTERS = {
    setSearchResultsFormat(previous, next) {
        // Set the format of search results to "table" or "ItemView". Other arguments won't change
        // the result format, and will cause an error message to appear in the console.
        if (undefined !== next) {
            if ('table' === next || 'ItemView' === next) {
                return next;
            } else {
                log.warn(`Invariant violation: setSearchResultsFormat() expects "table" or "ItemView"`);
                return previous;
            }
        }
    },

    // pagination
    setPage(previous, next) {
        // Set the current page in the current search results.
        next = parseInt(next, 10);
        if (isWholeNumber(next)) {
            const numOfPages = reactor.evaluate(getters.searchResultsPages);
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
        next = parseInt(next, 10);
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
            for (const field in next) {
                // check the field
                if (cantusjs.VALID_FIELDS.indexOf(field) < 0) {
                    continue;
                }

                // check the value is a string (if not, print an error and continue)
                if ('string' !== typeof next[field]) {
                    log.warn(`Invariant violation: setSearchQuery() has ${field} that isn't a string`);
                    continue;
                }

                // if the field is "type" check that it's a valid type (if not, print error and continue)
                if ('type' === field) {
                    const type = cantusjs.convertTypeNumber(next.type, 'plural');
                    if (undefined !== type) {
                        post = post.set('type', type);
                    } else {
                        log.warn(`setSearchQuery() received invalid type (${next.type})`);
                    }

                // if the field is being set to an empty string, delete it
                } else if ('' === next[field]) {
                    post = post.delete(field);

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

    /** Load results of a search query.
     *
     * TODO: describe all this
     * TODO: test the "reset" functionality, which disregards both arguments and sets to initial state
     * TODO: test the Error raising functionality
     */
    loadSearchResults(previous, next) {
        if ('reset' === next) {
            return STORES.SearchResults.getInitialState();
        }
        else if (next instanceof Error) {
            log.error(next.toString());
            return previous;
        }
        else if (undefined === next.code) {
            // request was successful
            return toImmutable({error: null, results: next});
        }
        else {
            // request was not successful
            return toImmutable({error: next, results: previous.get('results')});
        }
    },

    /** Set how the ResultList component will render itself.
     *
     * @param (str) next - Either "ItemView" or "table"
     */
    setRenderAs(previous, next) {
        if ('ItemView' === next || 'table' === next) {
            return next;
        } else {
            log.warn('Invariant violation: setRenderAs() requires "ItemView" or "table"');
            return previous;
        }
    },

    /** Set the "size" prop for the ItemViewOverlay componnet.
     *
     * @param (str) next - Either "full" or "compact".
     */
    itemViewOverlaySize(previous, next) {
        if ('full' === next || 'compact' === next) {
            return next;
        }
        else {
            log.warn('Invariant violation: itemViewOverlaySize() requires "ItemView" or "table"');
            return previous;
        }
    },

    /** Set the "CurrentItemView."
     *
     * @param (ImmutableJS.Map) next - The resource to display in an ItemView.
     */
    setCurrentItemView(previous, next) {
        if (typeof next !== 'object') {
            log.warn('Invariant violation: setCurrentItemView() requires an Object');
            return previous;
        }
        return toImmutable(next);
    },

    /** Add a resource ID to a List of the members in a Collection.
     *
     * @param (object) next - An object with "colid" and "rid" members, both strings, indicating the
     *     collection ID to be amended and the resource ID to append, respectively.
     */
    addResourceIDToCollection(previous, next) {
        // TODO: untested
        if (typeof next.colid !== 'string' || typeof next.rid !== 'string') {
            log.warn('Invariant violation: addResourceIDToCollection() received non-string args');
        }
        else if (!previous.get('collections').has(next.colid)) {
            log.warn('addResourceIDToCollection() received nonexistent collection ID');
        }
        else if (previous.getIn(['collections', next.colid, 'members']).indexOf(next.rid) < 0) {
            // TODO: figure out how to do this elegantly with ImmutableJS
            previous = previous.toJS();
            previous['collections'][next.colid]['members'].push(next.rid);
            previous = toImmutable(previous);
        }
        return previous;
    },

    /** Remove a resource ID from a List of the members in a Collection.
     *
     * @param (object) next - An object with "colid" and "rid" members, both strings, indicating the
     *     collection ID to be amended and the resource ID to remove, respectively.
     */
    removeResourceIDFromCollection(previous, next) {
        // TODO: untested
        if (typeof next.colid !== 'string' || typeof next.rid !== 'string') {
            log.warn('Invariant violation: removeResourceIDFromCollection() received non-string args');
        }
        else if (!previous.get('collections').has(next.colid)) {
            log.warn('removeResourceIDFromCollection() received nonexistent collection ID');
        }
        else if (previous.getIn(['collections', next.colid, 'members']).indexOf(next.rid) >= 0) {
            previous = previous.toJS();
            const index = previous['collections'][next.colid]['members'].indexOf(next.rid);
            previous['collections'][next.colid]['members'].splice(index, 1);
            previous = toImmutable(previous);
        }
        return previous;
    },

    /** Delete a collection.
     *
     * @param (str) next - The ID of the collection to delete.
     */
    deleteCollection(previous, next) {
        // TODO: untested
        if (typeof next !== 'string') {
            log.warn('Invariant violation: deleteCollection() received non-string arg');
        }
        else if (!previous.get('collections').has(next)) {
            log.warn('deleteCollection() receive a nonexistent collection ID');
        }
        else {
            return previous.update('collections', () => {
                return previous.get('collections').delete(next);
            });
        }
    },

    /** Rename a collection.
     *
     * @param (str) next.colid - ID of the collection to rename.
     * @param (str) next.name - New name for the collection.
     */
    renameCollection(previous, next) {
        // TODO: untested
        if (typeof next.colid !== 'string' || typeof next.name !== 'string') {
            log.warn('Invariant violation: renameCollection() received non-string args');
        }
        else if (!previous.get('collections').has(next.colid)) {
            log.warn('renameCollection() received nonexistent collection ID');
        }
        else {
            previous = previous.toJS();
            previous['collections'][next.colid]['name'] = next.name;
            previous = toImmutable(previous);
        }
        return previous;
    },

    /** Make a new collection.
     *
     * @param (str) next - The name for the new collection.
     */
    addNewCollection(previous, next) {
        // TODO: untested
        if (typeof next !== 'string') {
            log.warn('Invariant violation: addNewCollection() received a non-string arg.');
        }
        else {
            const id = Date.now().toString();
            if (previous.hasIn(['collections', id])) {
                // NOTE: this seems impossible... if Date.now() works as advertized...
                log.error('addNewCollection(): cannot add collection because of ID collision; try again');
            }
            else {
                previous = previous.toJS();
                previous['collections'][id] = {colid: id, name: next, members: []};
                previous = toImmutable(previous);
            }
        }
        return previous;
    },

    /** Record that the ServiceWorker was installed. */
    swInstalled(previous, next) {  // TODO: untested
        return previous.set('installed', true);
    },
    /** Record that the ServiceWorker was uninstalled. */
    swUninstalled(previous, next) {  // TODO: untested
        return previous.set('installed', false);
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
            this.on(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, SETTERS.setCurrentItemView);
        },
    }),

    ItemViewOverlaySize: Store({
        // The "size" prop for the current ItemViewOverlay component.
        //

        getInitialState() { return 'full'; },
        initialize() {
            this.on(SIGNAL_NAMES.SET_ITEMVIEW_OVERLAY_SIZE, SETTERS.itemViewOverlaySize);
        },
    }),

    SearchResultsFormat: Store({
        // Should search results be displayed as "table" or collection of "ItemView?"
        getInitialState() { return 'table'; },
        initialize() { this.on(SIGNAL_NAMES.SET_SEARCH_RESULT_FORMAT, SETTERS.setSearchResultsFormat); },
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

    CollectionsList: Store({
        // A list of the user's "collections."
        //
        // It's an ImmutableJS.Map of ImmutableJS.Map objects. It looks like this:
        //
        // Map({
        //    // whether to show the "add to which collection?" Modal
        //    'showAddToCollection': false,
        //    // a resource ID we're currently asking about adding to a collection
        //    'candidate': undefined,
        //    // Map of collection ID to other Maps
        //    'collections': Map({
        //       '123': Map({
        //          'colid': '123',
        //          'name': 'Some Important Collection',
        //          'members': List(['34', '88', '29', '48'])
        //       })
        // })
        //
        getInitialState() {
            return (
                Immutable.Map({
                    'showAddToCollection': false,
                    'candidate': undefined,
                    'collections': Immutable.Map(),
                })
            );
        },
        initialize() {
            this.on(SIGNAL_NAMES.ADD_RID_TO_COLLECTION, SETTERS.addResourceIDToCollection);
            this.on(SIGNAL_NAMES.REMOVE_RID_FROM_COLLECTION, SETTERS.removeResourceIDFromCollection);
            this.on(SIGNAL_NAMES.DELETE_COLLECTION, SETTERS.deleteCollection);
            this.on(SIGNAL_NAMES.RENAME_COLLECTION, SETTERS.renameCollection);
            this.on(SIGNAL_NAMES.ADD_COLLECTION, SETTERS.addNewCollection);
        },
    }),

    ServiceWorkerStatus: Store({
        // Record information about how Vitrail is using ServiceWorker functionality.
        //
        // NOTE: you should call the isAppCached() signal right after registering this Store.
        //
        // Map({
        //     // whether this browser supports the ServiceWorker and Cache APIs
        //     supported: true,
        //     // whether the Vitrail ServiceWorker script is installed and assets are cached
        //     installed: true,
        // })
        //
        getInitialState() {
            const supported = checkSWSupported();
            const installed = false;  // determined and set by the asynchronous function just below

            return Immutable.Map({supported, installed});
        },
        initialize() {
            this.on(SIGNAL_NAMES.SW_INSTALLED, SETTERS.swInstalled);
            this.on(SIGNAL_NAMES.SW_UNINSTALLED, SETTERS.swUninstalled);
        },
    }),
};


const theModule = {stores: STORES, setters: SETTERS, isWholeNumber: isWholeNumber,
    checkSWSupported: checkSWSupported, _swInNav: _swInNav, _cachesInWindow: _cachesInWindow};
export {theModule};
export default theModule;
