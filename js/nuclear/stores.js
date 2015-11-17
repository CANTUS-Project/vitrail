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
import {SIGNAL_NAMES} from './signals';


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

    SearchResultFormat: Store({
        // Should search results be displayed as "table" or collection of "ItemView?"
        getInitialState() { return 'ItemView'; },
        initialize() { this.on(SIGNAL_NAMES.SET_SEARCH_RESULT_FORMAT, justReturnThePayload); },
    }),

    SearchResultsPerPage: Store({
        // The number of results to show per search result page.
        getInitialState() { return 10; },
        initialize() { this.on(SIGNAL_NAMES.SET_PER_PAGE, justReturnThePayload); },
    }),

    SearchResultsPages: Store({
        // The number of pages in the currently-displayed search results.
        getInitialState() { return 0; },
        initialize() { this.on(SIGNAL_NAMES.SET_PAGES, justReturnThePayload); },
    }),

    SearchResultsPage: Store({
        // Current page of search results being displayed.
        getInitialState() { return 1; },
        initialize() { this.on(SIGNAL_NAMES.SET_PAGE, justReturnThePayload); },
    }),
};


// Sometimes this is all we need. NOTE that Stores using this function should do validity checking
// in the signal function.
function justReturnThePayload(previousState, payload) { return toImmutable(payload); };


export default STORES;
