// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/signals.js
// Purpose:                ActionTypes and Actions for NuclearJS in Vitrail.
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
// ------------------------------------------------------------------------------------------------

import {cantusModule as cantusjs} from '../cantusjs/cantus.src';
import localforage from 'localforage';
import {Immutable} from 'nuclear-js';

import {getters} from './getters';
import {log} from '../util/log';
import {localforageKey, reactor} from './reactor';

// this is the key where stored whether the user "installed" Vitrail
const LOCALFORAGE_INSTALLED_KEY = 'vitrail_is_installed';


// The Ansible playbook used for deployment will swap out the "<< SERVER URL HERE >>" string with
// the actual URL of the server. At runtime, we check whether the string was replaced; if not, we'll
// supply a default server URL. NOTE that we can't use the full "<< SERVER URL HERE >>" string
// twice because the playbook would replace both instances, leading the default URL to be used every
// time!
let urlToCantusServer =
'<< SERVER URL HERE >>'
;
if (urlToCantusServer.indexOf('SERVER URL HERE') >= 0) {
    urlToCantusServer = 'https://abbot.adjectivenoun.ca:8888/';
}
const CANTUS = new cantusjs.Cantus(urlToCantusServer);


const SIGNAL_NAMES = {
    LOAD_IN_ITEMVIEW: 'LOAD_IN_ITEMVIEW',
    SET_SEARCH_RESULT_FORMAT: 'SET_SEARCH_RESULT_FORMAT',
    SET_PER_PAGE: 'SET_PER_PAGE',
    SET_PAGES: 'SET_PAGES',
    SET_PAGE: 'SET_PAGE',
    SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
    LOAD_SEARCH_RESULTS: 'LOAD_SEARCH_RESULTS',
    SET_RENDER_AS: 'SET_RENDER_AS',
    SET_ITEMVIEW_OVERLAY_SIZE: 'SET_ITEMVIEW_OVERLAY_SIZE',
    // for Collections
    NEW_COLLECTION: 'NEW_COLLECTION',
    RENAME_COLLECTION: 'RENAME_COLLECTION',
    DELETE_COLLECTION: 'DELETE_COLLECTION',
    ADD_TO_COLLECTION: 'ADD_TO_COLLECTION',
    REMOVE_FROM_COLLECTION: 'REMOVE_FROM_COLLECTION',
    SET_SHOWING_COLLECTION: 'SET_SHOWING_COLLECTION',
    // for ServiceWorker
    SW_INSTALLED: 'SW_INSTALLED',
    SW_UNINSTALLED: 'SW_UNINSTALLED',
};


const SIGNALS = {
    /** Load a resource in the ItemView, given a type and ID.
     *
     * @param {str} type - The resource type to load.
     * @param {str} id - The resource ID to load.
     * @returns {undefined}
     */
    loadInItemView(type, id) {
        if (undefined === type || undefined === id) {
            log.warn('SIGNALS.loadInItemView() requires "type" and "id" arguments');
            return;
        }
        if ((typeof type !== 'string') || (typeof id !== 'string')) {
            log.warn('SIGNALS.loadInItemView() arguments must both be strings');
            return;
        }

        const settings = {type: type, id: id};
        CANTUS.get(settings)
        .then((response) => reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, response))
        .catch((response) => {
            reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, {});
            log.warn(response);
        });
    },

    /** Set the "size" prop of the ItemViewOverlay component.
     *
     * @param {str} to - Either "full" or "compact".
     * @returns {undefined}
     */
    setItemViewOverlaySize(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_ITEMVIEW_OVERLAY_SIZE, to);
    },

    /** Set the format of search results to "table" or "ItemView". Calling this signal with other
     *  arguments will cause an error message.
     * @param {str} to - Either "table" or "ItemView"
     * @returns {undefined}
     */
    setSearchResultsFormat(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_RESULT_FORMAT, to);
    },

    /** Set the currently-displayed page of search results.
     * @param {int} to - The page of results.
     * @returns {undefined}
     */
    setPage(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_PAGE, to);
    },

    /** Set the number of search results displayed per page.
     *
     * @param {int} to - The per page.
     * @returns {undefined}
     *
     * NOTE: This function resets the current page to 1.
     */
    setPerPage(to) {
        // To prevent inadvertently resetting the current page when per_page doesn't actually change,
        // we'll do this slightly weird thing.
        const initialPerPage = reactor.evaluate(getters.searchPerPage);
        reactor.dispatch(SIGNAL_NAMES.SET_PER_PAGE, to);
        if (initialPerPage !== reactor.evaluate(getters.searchPerPage)) {
            reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
        }
    },

    /** Set the resource type for which to search.
     *
     * @param {str} to - The new resource type to search for.
     */
    setResourceType(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, {type: to});
    },

    /** Set the parameters for a search query.
     *
     * @param {object} params - Parameters for the search query. Each member is assumed to be a
     *     field name, and the member's value is what to search for in that field. Members that
     *     are not valid fields for CantusJS are silently ignored.
     *
     * The fields in "params" augment or replace existing fields in the search query. If you want
     * to "start from scratch," first call this function with the "clear" argument, then set new
     * search parameters as you wish.
     *
     * NOTE: "params" may also be the string "clear," in which case all current search parameters
     *     are cleared and the resourceType is reset to "all."
     */
    setSearchQuery(params) {
        if ('object' === typeof params) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, params);
        }
        else if ('clear' === params) {
            reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, 'clear');
        }
        else {
            log.warn('signals.setSearchQuery() was called with incorrect input.');
        }
    },

    /** Load search results from CantusJS.
     *
     * You may call this function with "reset" to clear previously-loaded results from CantusJS.
     * Otherwise, this function expects the result of a call to CantusJS.
     */
    loadSearchResults(result) {
        reactor.dispatch(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, result);
    },
    /** Submit a search query to the Cantus server.
     *
     * This function uses CantusJS to submit a request to the Cantus server according to the settings
     * previously set in the Stores. Whether this is actually an HTTP SEARCH request depends on the
     * query settings.
     *
     * When the request completes or fails, the "loadSearchResults" signal function is called.
     *
     * NOTE: If this function is called while the CollectionsList Store believes it is showing a
     *       collection, this signal calls the loadCollection() signal.
     */
    submitSearchQuery() {
        const showingCollection = reactor.evaluate(getters.showingCollection);
        if (showingCollection) {
            return SIGNALS.loadCollection(showingCollection);
        }

        // default, unchanging things
        const ajaxSettings = reactor.evaluate(getters.searchQuery).toObject();

        // pagination
        ajaxSettings.page = reactor.evaluate(getters.searchPage);
        ajaxSettings.per_page = reactor.evaluate(getters.searchPerPage);

        // submit the request
        // type, page, per_page will always be there. If "ajax Settings" has more members, that
        // means there are extra query parameters and it's a SEARCH request
        if (Object.keys(ajaxSettings).length > 3) {
            // search query
            CANTUS.search(ajaxSettings).then(SIGNALS.loadSearchResults).catch(SIGNALS.loadSearchResults);
        }
        else {
            // browse query
            CANTUS.get(ajaxSettings).then(SIGNALS.loadSearchResults).catch(SIGNALS.loadSearchResults);
        }
    },

    /** Load a "collection" into the SearchResults Store.
     *
     * @param (str) colid - The ID of the "collection" to load.
     *
     * This function loads its chants from the CollectionsList cache.
     */
    loadCollection(colid) {
        const collections = reactor.evaluate(getters.collections);
        const cache = reactor.evaluate(getters.collectionsCache);
        const page = reactor.evaluate(getters.searchPage);
        const perPage = reactor.evaluate(getters.searchPerPage);

        if (!collections.has(colid)) {
            log.warn('signals.loadCollection() given a nonexistent collection ID');
            return;
        }

        const collection = collections.get(colid);
        const pageSliceStart = perPage * (page - 1);
        const pageSliceEnd = pageSliceStart + perPage;
        const onThisPage = collection.get('members').slice(pageSliceStart, pageSliceEnd);
        let post = Immutable.fromJS({sort_order: [], resources: {}});

        for (const rid of onThisPage.values()) {
            if (cache.has(rid)) {
                post = post.set(rid, cache.get(rid));
                post = post.updateIn(['sort_order'], order => order.push(rid));
                post = post.setIn(['resources', rid], Immutable.Map());  // "resources" is required, even if empty
            }
            else {
                // TODO: fallback to the server if resource isn't in cache?
                log.warn(`Resource missing in collections cache; ID is ${rid}`);
            }
        }

        // we also have to fake HTTP response headers
        const headers = Immutable.Map({
            total_results: collection.get('members').size,
            page: page,
            per_page: perPage,
        });
        post = post.set('headers', headers);

        SIGNALS.loadSearchResults(post);
        return post;  // for testing
    },

    /** Make a new collection.
     *
     * @param (str) name - The name of the new collection.
     */
    newCollection(name) {
        reactor.dispatch(SIGNAL_NAMES.NEW_COLLECTION, name);
    },

    /** Rename a collection.
     *
     * @param (str) colid - The ID of the collection to rename.
     * @param (str) name - The new name for this collection.
     */
    renameCollection(colid, name) {
        reactor.dispatch(SIGNAL_NAMES.RENAME_COLLECTION, {colid: colid, name: name});
    },

    /** Delete a collection.
     *
     * @param (str) colid - The ID of the collection to delete.
     */
    deleteCollection(colid) {
        reactor.dispatch(SIGNAL_NAMES.DELETE_COLLECTION, colid);
    },

    /** Add resource with ID "rid" to the collection with ID "colid."
     *
     * @param (str) colid - The collection ID to amend.
     * @param (str) rid - The resource ID to append.
     */
    addToCollection(colid, rid) {
        if (rid && typeof rid === 'string') {
            reactor.dispatch(SIGNAL_NAMES.ADD_TO_COLLECTION, {colid: colid, rid: rid});
            SIGNALS.requestForCache(rid);
        }
        else {
            log.warn('signals.addToCollection() received invalid resource ID');
        }
    },

    /** Remove resource with ID "rid" from the collection with ID "colid."
     *
     * @param (str) colid - The collection ID to amend.
     * @param (str) rid - The resource ID to remove.
     */
    removeFromCollection(colid, rid) {
        reactor.dispatch(SIGNAL_NAMES.REMOVE_FROM_COLLECTION, {colid: colid, rid: rid});
    },

    /** Ask the Cantus server for a resource, then add it to the CollectionsList cache.
     *
     * @param (str) rid - The resource ID to request.
     */
    requestForCache(rid) {
        CANTUS.search({id: rid}).then(SIGNALS.addToCache);
    },

    /** Add a resource to the CollectionsList Store.
     * NOTE: call this function as the then() of a call to CantusJS
     * NOTE: if the response includes multiple resources, they will all be added to the cache
     */
    addToCache(response) {
        if (response.code) {
            log.error(`Failed to add resource to cache. Cantus server responds: ${response.response}`);
        }
        else {
            for (const rid of response.sort_order) {
                reactor.dispatch(SIGNAL_NAMES.ADD_TO_CACHE, response[rid]);
            }
            // TODO: call another function to update localForage
        }
    },

    /** Clear all data in "localforage" and all cached chants. */
    clearShelf() {
        console.log('clearShelf()');
        // TODO: rewrite so it only clears the "collections" and cached chants ... and add tests
    },

    /** Set whether we're currently expecting the interface to show a Collection.
     *
     * @param (bool or str) show - Either false (if the interface will show search results) or the
     *     collection ID that will be shown.
     */
    setShowingCollection(show) {
        reactor.dispatch(SIGNAL_NAMES.SET_SHOWING_COLLECTION, show);
    },

    /** Call this signal when the user chooses to "Install" Vitral. */
    swInstall() {  // TODO: test
        const controller = navigator.serviceWorker.controller;
        if (controller && controller.state === 'activated') {
            localforage.setItem(LOCALFORAGE_INSTALLED_KEY, true).then(() => {
                reactor.dispatch(SIGNAL_NAMES.SW_INSTALLED);
            });
        }
    },
    /** Call this signal when the user chooses to "Uninstall" Vitrail. */
    swUninstall() {  // TODO: test
        return localforage.setItem(LOCALFORAGE_INSTALLED_KEY, false).then(() => {
            reactor.dispatch(SIGNAL_NAMES.SW_UNINSTALLED);
        });
    },
};


export {SIGNAL_NAMES, SIGNALS, LOCALFORAGE_INSTALLED_KEY};
export default SIGNALS;
