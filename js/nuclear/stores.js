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
import localforage from 'localforage';

import {getters} from './getters';
import {log} from '../util/log';
import {reactor} from './reactor';
import {LOCALFORAGE_INSTALLED_KEY, SIGNALS, SIGNAL_NAMES} from './signals';


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


/** Helper function for SETTERS.deleteCollection().
 *
 * @param (ImmutableJS.Map) colls - The state of the "CollectionsList" Store.
 * @param (str) deleting - The collection ID being deleted.
 * @param (str) cached - The resource ID being considered for deletion.
 *
 * Determine whether the "cached" resource is part of a collection other than the one being deleted.
 * If so, returns true, otherwise false.
 */
function _shouldDeleteFromCache(colls, deleting, cached) {
    // shortcut: only one collection and it's being removed, definitely can delete
    if (colls.get('collections').size === 1 && colls.hasIn(['collections', deleting])) {
        return true;
    }

    for (const collection of colls.get('collections').values()) {
        if (collection.get('colid') !== deleting && collection.get('members').includes(cached)) {
            return false;
        }
    }

    return true;
}


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
            return next;
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

    /** Make a new collection.
     *
     * @param (str) next - The name for the new collection.
     */
    newCollection(previous, next) {
        if (next && typeof next === 'string') {
            const collId = Date.now().toString();
            if (previous.hasIn(['collections', collId])) {
                log.warn('newCollection(): cannot add collection because of ID collision; try again');
            }
            else {
                return previous.setIn(
                    ['collections', collId],
                    toImmutable({colid: collId, name: next, members: []})
                );
            }
        }
        else {
            log.warn('Stores.newCollection() received incorrect arguments.');
        }

        return previous;
    },

    /** Rename a collection.
     *
     * @param (str) next.colid - ID of the collection to rename.
     * @param (str) next.name - New name for the collection.
     */
    renameCollection(previous, next) {
        if (next && next.colid && next.name && typeof next.colid === 'string' && typeof next.name === 'string') {
            if (previous.hasIn(['collections', next.colid])) {
                return previous.setIn(['collections', next.colid, 'name'], next.name);
            }
            else {
                log.warn('Stores.renameCollection() received nonexistent collection ID');
            }
        }
        else {
            log.warn('Stores.renameCollection() received incorrect arguments.');
        }

        return previous;
    },

    /** Delete a collection.
     *
     * @param (str) next - The ID of the collection to delete.
     */
    deleteCollection(previous, next) {
        if (next && typeof next === 'string') {
            if (previous.hasIn(['collections', next])) {
                let post = previous;
                for (const rid of previous.getIn(['collections', next, 'members'])) {
                    if (_shouldDeleteFromCache(previous, next, rid)) {
                        post = post.deleteIn(['cache', rid]);
                    }
                }
                return post.deleteIn(['collections', next]);
            }
            else {
                log.warn('Stores.deleteCollection() received a nonexistent collection ID');
            }
        }
        else {
            log.warn('Stores.deleteCollection() received incorrect arguments.');
        }

        return previous;
    },

    /** Add a resource ID to a List of the members in a Collection.
     *
     * @param (str) next.colid - ID of the collection to add a resource to.
     * @param (str) next.rid - Resource ID to add to the collection.
     *
     * NOTE: This function does not add anything to the "cache." You must do that separately.
     */
    addToCollection(previous, next) {
        if (next && next.colid && next.rid && typeof next.colid === 'string' && typeof next.rid === 'string') {
            if (previous.hasIn(['collections', next.colid])) {
                if (!previous.getIn(['collections', next.colid, 'members']).includes(next.rid)) {
                    return previous.updateIn(['collections', next.colid, 'members'], members =>
                        members.push(next.rid)
                    );
                }
                else {
                    log.debug('Stores.removeFromCollection() resource was already in collection');
                }
            }
            else {
                log.warn('Stores.removeFromCollection() received nonexistent collection ID');
            }
        }
        else {
            log.warn('Stores.removeFromCollection() received incorrect arguments.');
        }

        return previous;
    },

    /** Remove a resource ID from a List of the members in a Collection.
     *
     * @param (str) next.colid - ID of the collection to remove a resource from.
     * @param (str) next.rid - Resource ID to remove from the collection.
     */
    removeFromCollection(previous, next) {
        if (next && next.colid && next.rid && typeof next.colid === 'string' && typeof next.rid === 'string') {
            if (previous.hasIn(['collections', next.colid])) {
                if (previous.getIn(['collections', next.colid, 'members']).includes(next.rid)) {
                    let post = previous.updateIn(['collections', next.colid, 'members'], members =>
                        members.filter(eachRid => eachRid !== next.rid)
                    );
                    if (_shouldDeleteFromCache(previous, next.colid, next.rid)) {
                        post = post.deleteIn(['cache', next.rid]);
                    }
                    return post;
                }
                else {
                    log.warn('Stores.removeFromCollection() received nonexistent resource ID');
                }
            }
            else {
                log.warn('Stores.removeFromCollection() received nonexistent collection ID');
            }
        }
        else {
            log.warn('Stores.removeFromCollection() received incorrect arguments.');
        }

        return previous;
    },

    /** Add a resource to the CollectionsList cache.
     *
     * @param (object) next - The resource to add to the cache. Must contain an "id" field.
     */
    addToCache(previous, next) {
        if (next && next.id && typeof next.id === 'string') {
            return previous.setIn(['cache', next.id], Immutable.fromJS(next));
        }
        else {
            log.warn('Stores.addToCache() received incorrect arguments.');
        }

        return previous;
    },

    /** Replace the "collections" with data from elsewhere.
     *
     * @param (ImmutableJS.Map) next - To set as the "collections" member.
     */
    replaceCollections(previous, next) {
        if (Immutable.Map.isMap(next)) {
            return previous.set('collections', next);
        }
        else {
            log.warn('Store.replaceCollections() received incorrect arguments.');
        }

        return previous;
    },

    /** Replace the "cache" with data from elsewhere.
     *
     * @param (ImmutableJS.Map) next - To set as the "cache" member.
     */
    replaceCache(previous, next) {
        if (Immutable.Map.isMap(next)) {
            return previous.set('cache', next);
        }
        else {
            log.warn('Store.replaceCache() received incorrect arguments.');
        }

        return previous;
    },

    /** Set the "showing" member to "next," if it's either false or a string that is hopefully
     *  a collection ID.
     */
    setShowingCollection(previous, next) {
        if (next === false || typeof next === 'string') {
            return previous.set('showing', next);
        }
        else {
            log.warn('Stores.setShowingCollection() received incorrect arguments.');
            return previous;
        }
    },

    /** Record that the ServiceWorker was installed. */
    swInstalled(previous, next) {
        return previous.set('installed', true);
    },
    /** Record that the ServiceWorker was uninstalled. */
    swUninstalled(previous, next) {
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
        // It's an ImmutableJS data structure that holds Collections, the cached chants that are
        // part of those Collections, and "showing" which is either false or holds the collection
        // ID currently being displayed.
        //
        // {
        //   collections: {
        //     coll_one: {
        //       colid: 'coll_one',
        //       name: 'Some Important Chants',
        //       members: ['34', '88'],
        //     },
        //     coll_two: {
        //       colid: 'coll_two',
        //       name: 'Some Boring Chants',
        //       members: ['29', '48'],
        //     },
        //   cache: {
        //     29: {id: '29', type: 'chant', ... },
        //     34: {id: '34', type: 'chant', ... },
        //     48: {id: '48', type: 'chant', ... },
        //     88: {id: '88', type: 'chant', ... },
        //   }
        //   showing: 'coll_two',
        // }
        //
        getInitialState() {
            return Immutable.Map({
                collections: Immutable.Map(),
                cache: Immutable.Map(),
                showing: false
            });
        },
        initialize() {
            this.on(SIGNAL_NAMES.ADD_TO_COLLECTION, SETTERS.addToCollection);
            this.on(SIGNAL_NAMES.REMOVE_FROM_COLLECTION, SETTERS.removeFromCollection);
            this.on(SIGNAL_NAMES.DELETE_COLLECTION, SETTERS.deleteCollection);
            this.on(SIGNAL_NAMES.RENAME_COLLECTION, SETTERS.renameCollection);
            this.on(SIGNAL_NAMES.NEW_COLLECTION, SETTERS.newCollection);
            this.on(SIGNAL_NAMES.ADD_TO_CACHE, SETTERS.addToCache);
            this.on(SIGNAL_NAMES.REPLACE_COLLECTIONS, SETTERS.replaceCollections);
            this.on(SIGNAL_NAMES.REPLACE_CACHE, SETTERS.replaceCache);
            this.on(SIGNAL_NAMES.SET_SHOWING_COLLECTION, SETTERS.setShowingCollection);
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
        //     // whether the Vitrail ServiceWorker script is installed and the user has chosen to
        //     // "Install" but not chosen to "Uninstall"
        //     installed: true,
        // })

        // this is the cache key used by this Store
        localForageKey: 'vitrail_is_installed',
        getInitialState() {
            const supported = 'serviceWorker' in navigator && 'caches' in window;
            const installed = false;

            // determine whether the user previously chose to "Install"
            if (supported) {
                const controller = navigator.serviceWorker.controller;
                if (controller && controller.state === 'activated') {
                    localforage.getItem(LOCALFORAGE_INSTALLED_KEY).then(installed => {
                        if (installed) {
                            SIGNALS.swInstall();
                        }
                        else {
                            SIGNALS.swUninnstall();
                        }
                    });
                }
            }

            return Immutable.Map({supported, installed});
        },
        initialize() {
            this.on(SIGNAL_NAMES.SW_INSTALLED, SETTERS.swInstalled);
            this.on(SIGNAL_NAMES.SW_UNINSTALLED, SETTERS.swUninstalled);
        },
    }),
};


const theModule = {stores: STORES, setters: SETTERS, isWholeNumber, _shouldDeleteFromCache};
export {theModule};
export default theModule;
