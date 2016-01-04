// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/getters.js
// Purpose:                NuclearJS getters for Vitrail.
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


// Submit these to reactor.evaluate().
// Key are whatever; values use the names of Stores registered in vitrail-init.js.


const formatters = {
    // Formatting functions for the getters that have a formatting function.
    //

    searchResultsPages(results) {
        if (null !== results.get('results')) {
            return Math.ceil(parseInt(results.get('results').get('headers').get('total_results'), 10) /
                             parseInt(results.get('results').get('headers').get('per_page'), 10));
        } else {
            return 0;
        }
    },

    searchResultsPage(results) {
        if (null !== results.get('results')) {
            return parseInt(results.get('results').get('headers').get('page'), 10);
        } else {
            return 0;
        }
    },

    searchResultsPerPage(results) {
        if (null !== results.get('results')) {
            return parseInt(results.get('results').get('headers').get('per_page'), 10);
        } else {
            return 0;
        }
    },

    resourceType(query) { return query.get('type'); },
    searchResults(results) { return results.get('results'); },
    searchError(results) { return results.get('error'); },
};


const getters = {
    currentItemView: ['currentItemView'],
    itemViewOverlaySize: ['itemViewOverlaySize'],
    // related to the query already completed
    searchResultsFormat: ['searchResultsFormat'],
    searchResultsPages: [['searchResults'], formatters.searchResultsPages],
    searchResultsPage: [['searchResults'], formatters.searchResultsPage],  // current displayed page of results (not currently-requested page)
    searchResultsPerPage: [['searchResults'], formatters.searchResultsPerPage],  // current displayed per-page of results (not currently-requested per-page)
    searchResults: [['searchResults'], formatters.searchResults],
    searchError: [['searchResults'], formatters.searchError],
    // related to the query before submission
    resourceType: [['searchQuery'], formatters.resourceType],
    searchQuery: ['searchQuery'],
    searchPage: ['searchPage'],
    searchPerPage: ['searchPerPage'],
};

export {getters, formatters};
export default getters;
