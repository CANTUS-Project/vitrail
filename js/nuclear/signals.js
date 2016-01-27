// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------

import {cantusModule as cantusjs} from '../cantusjs/cantus.src';

import {getters} from './getters';
import {log} from '../util/log';
import {reactor} from './reactor';


const CANTUS = new cantusjs.Cantus('http://abbot.adjectivenoun.ca:8888/');


const SIGNAL_NAMES = {
    LOAD_IN_ITEMVIEW: 1,
    SET_SEARCH_RESULT_FORMAT: 2,
    SET_PER_PAGE: 3,
    SET_PAGES: 4,
    SET_PAGE: 5,
    SET_SEARCH_QUERY: 6,
    LOAD_SEARCH_RESULTS: 7,
    SET_RENDER_AS: 8,
    SET_ITEMVIEW_OVERLAY_SIZE: 9,
    // for Collections
    ADD_RID_TO_COLLECTION: 10,
    REMOVE_RID_FROM_COLLECTION: 11,
    TOGGLE_ADD_TO_COLLECTION: 12,
    ASK_WHICH_COLLECTION: 13,
    DELETE_COLLECTION: 14,
    RENAME_COLLECTION: 15,
    ADD_COLLECTION: 16,
};


const SIGNALS = {
    /** Load a resource in the ItemView, given a type and ID.
     *
     * @param (str) type - The resource type to load.
     * @param (str) id - The resource ID to load.
     */
    loadInItemView: function(type, id) {
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
        .then(response => { reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, response) })
        .catch(response => {
            reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, {});
            log.warn(response);
        });
    },

    /** Set the "size" prop of the ItemViewOverlay component.
     *
     * @param (str) to - Either "full" or "compact".
     */
    setItemViewOverlaySize(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_ITEMVIEW_OVERLAY_SIZE, to);
    },

    /** Set the format of search results to "table" or "ItemView". Calling this signal with other
     *  arguments will cause an error message.
     */
    setSearchResultsFormat: function(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_RESULT_FORMAT, to);
    },

    /** Set the currently-displayed page of search results. */
    setPage: function(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_PAGE, to);
    },

    /** Set the number of search results displayed per page.
     *
     * NOTE: This function resets the current page to 1.
     */
    setPerPage: function(to) {
        // To prevent inadvertently resetting the current page when per_page doesn't actually change,
        // we'll do this slightly weird thing.
        const initialPerPage = reactor.evaluate(getters.searchPerPage);
        reactor.dispatch(SIGNAL_NAMES.SET_PER_PAGE, to);
        if (initialPerPage !== reactor.evaluate(getters.searchPerPage)) {
            reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
        }
    },

    /** Set the resource type for which to search. */
    setResourceType: function(to) {
        reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_QUERY, {type: to});
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
            log.warn('signals.setSearchQuery() was called with incorrect input.');
        }
    },

    /** TODO: write the docs for this, including the "reset" special arg
     *
     */
    loadSearchResults(result) {
        reactor.dispatch(SIGNAL_NAMES.LOAD_SEARCH_RESULTS, result);
    },
    submitSearchQuery() {
        // Submit a search query to the Cantus server with the settings currently in NuclearJS.
        //

        // default, unchanging things
        let ajaxSettings = reactor.evaluate(getters.searchQuery).toObject();

        // pagination
        ajaxSettings['page'] = reactor.evaluate(getters.searchPage);
        ajaxSettings['per_page'] = reactor.evaluate(getters.searchPerPage);

        // submit the request
        // type, page, per_page will always be there. If "ajax Settings" has more members, that
        // means there are extra query parameters and it's a SEARCH request
        if (Object.keys(ajaxSettings).length > 3) {
            // search query
            CANTUS.search(ajaxSettings).then(SIGNALS.loadSearchResults).catch(SIGNALS.loadSearchResults);
        } else {
            // browse query
            CANTUS.get(ajaxSettings).then(SIGNALS.loadSearchResults).catch(SIGNALS.loadSearchResults);
        }
    },

    /** Add resource with ID "rid" to the collection with ID "colid."
     *
     * @param (str) colid - The collection ID to amend.
     * @param (str) rid - The resource ID to append.
     *
     * NOTE: this signal also clears the resource in "ask_which_collection."
     */
    addResourceIDToCollection(colid, rid) {
        // TODO: untested
        reactor.dispatch(SIGNAL_NAMES.ADD_RID_TO_COLLECTION, {colid: colid, rid: rid});
        reactor.dispatch(SIGNAL_NAMES.ASK_WHICH_COLLECTION, undefined);
    },

    /** Remove resource with ID "rid" from the collection with ID "colid."
     *
     * @param (str) colid - The collection ID to amend.
     * @param (str) rid - The resource ID to remove.
     */
    removeResourceIDFromCollection(colid, rid) {
        // TODO: untested
        reactor.dispatch(SIGNAL_NAMES.REMOVE_RID_FROM_COLLECTION, {colid: colid, rid: rid});
    },

    /** Toggle the "add to which collection?" Modal component. */
    toggleAddToCollection() {
        reactor.dispatch(SIGNAL_NAMES.TOGGLE_ADD_TO_COLLECTION);
    },

    /** When you want to add a resource to a collection, but you don't know which collection.
     *
     * @param (str) rid - The resource ID to add to ??? collection.
     */
    askWhichCollection(rid) {
        reactor.dispatch(SIGNAL_NAMES.ASK_WHICH_COLLECTION, rid);
        reactor.dispatch(SIGNAL_NAMES.TOGGLE_ADD_TO_COLLECTION);
    },

    /** Delete a collection.
     *
     * @param (str) colid - The ID of the collection to delete.
     */
    deleteCollection(colid) {
        reactor.dispatch(SIGNAL_NAMES.DELETE_COLLECTION, colid);
    },

    /** Rename a collection.
     *
     * @param (str) colid - The ID of the collection to rename.
     * @param (str) name - The new name for this collection.
     */
    renameCollection(colid, name) {
        reactor.dispatch(SIGNAL_NAMES.RENAME_COLLECTION, {colid: colid, name: name});
    },

    /** Make a new collection.
     *
     * @param (str) name - The name of the new collection.
     */
    addNewCollection(name) {
        reactor.dispatch(SIGNAL_NAMES.ADD_COLLECTION, name);
    },
};


export {SIGNAL_NAMES, SIGNALS};
export default SIGNALS;
