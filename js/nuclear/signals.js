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

import {getters} from './getters';
import {log} from '../util/log';
import {localforageKey, reactor} from './reactor';


// The Ansible playbook used for deployment will swap out the "<< SERVER URL HERE >>" string with
// the actual URL of the server. At runtime, we check whether the string was replaced; if not, we'll
// supply a default server URL. NOTE that we can't use the full "<< SERVER URL HERE >>" string
// twice because the playbook would replace both instances, leading the default URL to be used every
// time!
let urlToCantusServer =
'<< SERVER URL HERE >>'
;
if (urlToCantusServer.includes('SERVER URL HERE')) {
    urlToCantusServer = 'http://abbot.adjectivenoun.ca:8888/';
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
    ADD_RID_TO_COLLECTION: 'ADD_RID_TO_COLLECTION',
    REMOVE_RID_FROM_COLLECTION: 'REMOVE_RID_FROM_COLLECTION',
    TOGGLE_ADD_TO_COLLECTION: 'TOGGLE_ADD_TO_COLLECTION',
    ASK_WHICH_COLLECTION: 'ASK_WHICH_COLLECTION',
    DELETE_COLLECTION: 'DELETE_COLLECTION',
    RENAME_COLLECTION: 'RENAME_COLLECTION',
    ADD_COLLECTION: 'ADD_COLLECTION',
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
     */
    submitSearchQuery() {
        // Submit a search query to the Cantus server with the settings currently in NuclearJS.
        //

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

    /** Given a list of resource IDs, load them into the results.
     *
     * @param (ImmutableJS.List) rids - A list of resource IDs to load for the collection.
     *
     * This function first tries to load the resources from the browser cache using localforage. If
     * resoruces are missing, they are loaded from the server.
     */
    loadFromCache(rids) {  // TODO: untested
        const results = rids.toArray();
        const resultsLength = results.length;

        // first, try recovering all the results from the localforage cache
        for (let i = 0; i < resultsLength; i += 1) {
            results[i] = localforage.getItem(results[i]);
        }

        // wait for all the Promises to resolve, then...
        Promise.all(results).then(results => {
            // check if any of the results are missing
            for (let i = 0; i < resultsLength; i += 1) {
                if (results[i] === null) {
                    results[i] = CANTUS.search({any: `+id:${rids.get(i)}`});
                }
            }
            Promise.all(results).then(results => {
                // assemble the results into a CantusJS-like structure, then send them to the Reactor

                // post-processing on resources we got just now
                for (let i = 0; i < resultsLength; i += 1) {
                    if (results[i].sort_order) {
                        results[i] = results[i][results[i].sort_order[0]];
                        localforage.setItem(results[i].id, results[i]);  // TODO: catch()
                    }
                }

                // We have to fake a lot of CantusJS stuff to make this work.
                // We also have to set things weirdly so that the key of an Object isn't accidentally
                // set to "rid" instead of the value of the rid variable.
                const post = {sort_order: rids, resources: {}};

                for (let i = 0; i < resultsLength; i += 1) {
                    const id = results[i].id;
                    post[id] = results[i];
                    post.resources[id] = {};
                }

                post['headers'] = {page: '1', per_page: resultsLength, fields: '', extraFields: '',
                    total_results: resultsLength};

                SIGNALS.loadSearchResults(post);
            }).catch(err => {
                // TODO: write better error handling
                log.error('Error in the inner loop of loadFromCache() (see the Console)');
                throw err;
            });
        }).catch(err => {
            // TODO: write better error handling
            log.error('There was some problem in loadFromCache() (see the Console)');
            throw err;
        });
    },

    /** Make a new collection.
     *
     * @param (str) name - The name of the new collection.
     */
    addNewCollection(name) {
        reactor.dispatch(SIGNAL_NAMES.ADD_COLLECTION, name);
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
     *
     * NOTE: this signal also clears the resource in "ask_which_collection."
     */
    addResourceIDToCollection(colid, rid) {
        reactor.dispatch(SIGNAL_NAMES.ADD_RID_TO_COLLECTION, {colid: colid, rid: rid});
    },

    /** Remove resource with ID "rid" from the collection with ID "colid."
     *
     * @param (str) colid - The collection ID to amend.
     * @param (str) rid - The resource ID to remove.
     */
    removeResourceIDFromCollection(colid, rid) {
        reactor.dispatch(SIGNAL_NAMES.REMOVE_RID_FROM_COLLECTION, {colid: colid, rid: rid});
    },

    /** Clear all data in "localforage" and all cached chants. */
    clearShelf() {  // TODO: untested
        reactor.reset();
        localforage.clear();
        // TODO: clear cached chants-and-stuff, once those are cached
    },

    /** Save extant collections with localforage. */
    saveCollections() {  // TODO: untested
        localforage.setItem(localforageKey, reactor.serialize()).then(() => {
            // make sure all the resources in all the collections are cached
            const collections = reactor.evaluate(getters.collectionsList);

            collections.forEach(collection => {
                CANTUS.search({'any': `+id:(${collection.get('members').join(' OR ')})`}).then(resp => {
                    if (resp.code) {
                        // TODO: panic over error
                        log.warn(`response was ${resp.cod}`);
                    }
                    else {
                        for (const rid of resp.sort_order) {
                            localforage.setItem(rid, resp[rid]);
                        }
                    }
                });
            });
        });
    },
};


export {SIGNAL_NAMES, SIGNALS};
export default SIGNALS;
