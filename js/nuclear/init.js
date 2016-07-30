// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/init.js
// Purpose:                Initialize the NuclearJS Stores for Vitrail.
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
// ------------------------------------------------------------------------------------------------

import localforage from 'localforage';

import {localforageKey, reactor} from './reactor';
import {SIGNALS as signals} from '../nuclear/signals';
import stores from './stores';


reactor.registerStores({
    currentItemView: stores.stores.CurrentItemView,
    itemViewOverlaySize: stores.stores.ItemViewOverlaySize,
    searchResultsFormat: stores.stores.SearchResultsFormat,
    searchPerPage: stores.stores.SearchPerPage,
    searchPage: stores.stores.SearchPage,
    searchQuery: stores.stores.SearchQuery,
    searchResults: stores.stores.SearchResults,
    collectionsList: stores.stores.CollectionsList,
    serviceWorkerStatus: stores.stores.ServiceWorkerStatus,
});

// load any saved collections
signals.loadCollections().then(() => { signals.loadCache(); });


const init = 'init';
export {init};
export default init;
