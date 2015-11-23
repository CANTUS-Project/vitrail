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
            return Math.ceil(results.get('results').get('headers').get('total_results') /
                             results.get('results').get('headers').get('per_page'));
        } else {
            return 0;
        }
    },

    searchResultsPage(results) {
        if (null !== results.get('results')) {
            return results.get('results').get('headers').get('page');
        } else {
            return 0;
        }
    },

    searchResultsPerPage(results) {
        if (null !== results.get('results')) {
            return results.get('results').get('headers').get('per_page');
        } else {
            return 0;
        }
    },
};


const getters = {
    currentItemView: ['currentItemView'],
    searchResultsFormat: ['searchResultsFormat'],
    searchResultsPages: [['searchResults'], formatters.searchResultsPages],
    searchResultsPage: [['searchResults'], formatters.searchResultsPage],  // current displayed page of results (not currently-requested page)
    searchResultsPerPage: [['searchResults'], formatters.searchResultsPerPage],  // current displayed per-page of results (not currently-requested per-page)
    resourceType: [['searchQuery'], (query) => query.get('type')],
    searchQuery: ['searchQuery'],
    searchPage: ['searchPage'],
    searchPerPage: ['searchPerPage'],
    searchResults: [['searchResults'], (res) => { if (res.get('results')) return res.get('results'); else return null; }],
    searchError: [['searchResults'], (res) => { if (res.get('error')) return res.get('error'); else return null; }],
};

export {getters, formatters};
export default getters;
