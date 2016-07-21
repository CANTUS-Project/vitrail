// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
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
// ------------------------------------------------------------------------------------------------


import {Immutable} from 'nuclear-js';


// Submit these to reactor.evaluate().
// Key are whatever; values use the names of Stores registered in vitrail-init.js.


const formatters = {
    // Formatting functions for the getters that have a formatting function.
    //

    searchResultsPages(results) {
        if (results.get('results')) {
            return Math.ceil(parseInt(results.getIn(['results', 'headers', 'total_results'])) /
                             parseInt(results.getIn(['results', 'headers', 'per_page'])));
        }

        return 0;
    },

    searchResultsPage(results) {
        if (results.get('results')) {
            return parseInt(results.getIn(['results', 'headers', 'page']));
        }

        return 0;
    },

    searchResultsPerPage(results) {
        if (results.get('results')) {
            return parseInt(results.getIn(['results', 'headers', 'per_page']));
        }

        return 0;
    },

    resourceType(query) {
        return query.get('type');
    },
    searchResults(results) {
        return results.get('results');
    },
    searchError(results) {
        return results.get('error');
    },

    resultsFields(results) {
        if (results.hasIn(['results', 'headers', 'fields'])) {
            return Immutable.List(results.getIn(['results', 'headers', 'fields']).split(','));
        }
        else {
            return Immutable.List();
        }
    },
    resultsExtraFields(results) {
        if (results.getIn(['results', 'headers', 'extra_fields'])) {
            return Immutable.List(results.getIn(['results', 'headers', 'extra_fields']).split(','));
        }
        else {
            return Immutable.List();
        }
    },
    resultsAllFields(results) {
        return formatters.resultsFields(results).concat(formatters.resultsExtraFields(results));
    },

    /** resultsAllSameType: Determine whether all the search results are the same resource type.
     *
     * @param (ImmutableJS.Map) results - From the SearchResults store.
     * @returns (bool) Whether all of the resources in "results" have the same "resource_type."
     */
    resultsAllSameType(results) {
        const sortOrder = results.getIn(['results', 'sort_order']);
        const data = results.get('results');
        if (sortOrder && sortOrder.size > 0) {
            const firstResType = data.get(sortOrder.get(0)).get('type');
            for (const id of sortOrder.values()) {
                if (data.get(id).get('type') !== firstResType) {
                    return false;
                }
            }
            return true;
        }
        else {
            return true;
        }
    },

    /** ResultListTable_columns: Determine the columns to display in the ResultListTable.
     *
     * @param (ImmutableJS.Map) results - From the SearchResults store.
     * @returns (ImmutableJS.Map) Details about the column names to display. See below.
     *
     * The Map returned by this function contains two keys:
     *    - names: with a List of the field names to display, as they appear in the resources.
     *    - display: with a List of corresponding column headers for the ResultListTable.
     * The Lists are the same length. Items with the same index correspond to each other. They are
     * sorted in the order they should appear, from left to right. For example:
     *
     * {
     *     'names': ['incipit', 'genre', 'cao_concordances'],
     *     'display': ['Incipit', 'Genre', 'CAO Concordances'],
     * }
     */
    ResultListTable_columns(results) {
        // from other getters...
        const data = formatters.searchResults(results);
        const sortOrder = formatters.resultsSortOrder(results);
        const resultsAllSameType = formatters.resultsAllSameType(results)

        if (sortOrder.size === 0) {
            return Immutable.Map({names: Immutable.List(), display: Immutable.List()});
        }

        // Remove the "id" field and, if the resource types are all the same, remove "type" too.
        // First find out whether all the "types" are the same.
        const dontInclude = ['id'];
        const firstResType = data.get(sortOrder.get(0)).get('type');
        if (!resultsAllSameType) {
            dontInclude.push('type');
        }

        // Determine which columns to show. If all the results are "chant" or "source" then we'll
        // use a predetermined order of columns.
        let columns;
        if (resultsAllSameType && ('chant' === firstResType || 'source' === firstResType)) {
            // we'll show only the fields called "primary" in the ItemView
            if ('chant' === firstResType) {
                columns = ['incipit', 'genre', 'office', 'feast', 'position', 'siglum', 'folio',
                           'sequence', 'mode', 'differentia'
                          ];
            }
            else {
                columns = ['rism', 'title', 'date', 'provenance', 'summary'];
            }
        }
        else {
            columns = formatters.resultsAllFields(results);
            columns = columns.reduce((prev, curr) => {
                if (dontInclude.indexOf(curr) >= 0) {
                    return prev;
                }

                prev.push(curr);
                return prev;
            }, []);
        }

        // and make the formatted display names
        const display = columns.map((columnName) => {
            // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
            if (columnName === 'rism') {
                return 'RISM';
            }
            else if (columnName === 'cao_concordances') {
                return 'CAO Concordances';
            }
            const working = columnName.split('_');
            let polishedName = '';
            for (const i in working) {
                const rawr = working[i][0].toLocaleUpperCase();
                polishedName = `${polishedName}${rawr}${working[i].slice(1)} `;
            }
            polishedName = polishedName.slice(0, polishedName.length - 1);
            return polishedName;
        });

        return Immutable.fromJS({names: columns, display: display});
    },

    resultsSortOrder(results) {
        return results.getIn(['results', 'sort_order']);
    },
    searchResultsHeaders(results) {
        return results.getIn(['results', 'headers']);
    },

    swSupported(status) {
        return status.get('supported');
    },
    swInstalled(status) {
        return status.get('installed');
    },
};


const getters = {
    currentItemView: ['currentItemView'],
    itemViewOverlaySize: ['itemViewOverlaySize'],
    // related to the query already completed
    searchResultsFormat: ['searchResultsFormat'],
    searchResultsPages: [['searchResults'], formatters.searchResultsPages],
    searchResultsHeaders: [['searchResults'], formatters.searchResultsHeaders],
    resultsSortOrder: [['searchResults'], formatters.resultsSortOrder],
    resultsFields: [['searchResults'], formatters.resultsFields],  // ImmutableJS.List of X-Cantus-Fields
    resultsExtraFields: [['searchResults'], formatters.resultsExtraFields],  // ImmutableJS.List of X-Cantus-Extra-Fields
    resultsAllFields: [['searchResults'], formatters.resultsAllFields],  // ImmutableJS.List of previous two combined
    resultsAllSameType: [['searchResults'], formatters.resultsAllSameType],  // boolean: whether all the results are the same resourceType
    ResultListTable_columns: [['searchResults'], formatters.ResultListTable_columns],
    // current displayed page of results (not currently-requested page)
    searchResultsPage: [['searchResults'], formatters.searchResultsPage],
    // current displayed per-page of results (not currently-requested per-page)
    searchResultsPerPage: [['searchResults'], formatters.searchResultsPerPage],
    searchResults: [['searchResults'], formatters.searchResults],
    searchError: [['searchResults'], formatters.searchError],
    // related to the query before submission
    resourceType: [['searchQuery'], formatters.resourceType],
    searchQuery: ['searchQuery'],
    searchPage: ['searchPage'],
    searchPerPage: ['searchPerPage'],
    // for Collections in the Workspace
    collectionsList: [['collectionsList'], (results) => results.get('collections')],
    // for ServiceWorker
    swSupported: [['serviceWorkerStatus'], formatters.swSupported],
    swInstalled: [['serviceWorkerStatus'], formatters.swInstalled],
};

export {getters, formatters};
export default getters;
