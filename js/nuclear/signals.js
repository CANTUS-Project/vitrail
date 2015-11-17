// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/signals.js
// Purpose:                ActionTypes and Actions for NuclearJS in Vitrail.
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


import reactor from './reactor';


// TODO: switch over to a CantusJS instance maintained in this file only
// const cantusjs = new cantusModule.Cantus('http://abbot.adjectivenoun.ca:8888/');
// const cantusjs = window['temporaryCantusJS'];


function isWholeNumber(num) {
    // Verify that "num" is a whole number (an integer 0 or greater).
    let outcome = false;

    if (num) {
        if ('number' === typeof num) {
            if (num >= 0) {
                if (0 === num % 1) {
                    outcome = true;
    }}}}

    return outcome;
};


const SIGNAL_NAMES = {
    LOAD_IN_ITEMVIEW: 1,
    SET_SEARCH_RESULT_FORMAT: 2,
    SET_PER_PAGE: 3,
    SET_PAGES: 4,
    SET_PAGE: 5,
};


const SIGNALS = {
    loadInItemView: function(type, id) {
        // Load a resource in the ItemView, given a type and ID.
        //

        if (undefined === type || undefined === id) {
            let msg = 'loadInItemView() requires "type" and "id" arguments';
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: make this not be stupid
        let cantusjs = window['temporaryCantusJS'];

        let settings = {type: type, id: id};
        cantusjs.get(settings)
        .then(function(response) {reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, response)})
        .catch(function(response) {
            if (404 === response.code) {
                reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, {});
            } else {
                // TODO: handle other errors better
                console.error(response)
            }
        });
    },

    setSearchResultFormat: function(to) {
        // Set the format of search results to "table" or "ItemView". Other arguments won't change
        // the result format, and will cause an error message to appear in the console.
        if (to) {
            if ('table' === to || 'ItemView' === to) {
                reactor.dispatch(SIGNAL_NAMES.SET_SEARCH_RESULT_FORM, to);
            } else {
                console.error(`Unknown search result format: "${to}"`);
            }
        }
    },

    setPages: function(to) {
        // Set the number of pages in the current search results.
        // NOTE this also resets the "current page" to 1.
        if (isWholeNumber(to)) {
            reactor.dispatch(SIGNAL_NAMES.SET_PAGES, to);
            reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
        } else {
            console.error(`setPages() must be given a whole number, not ${to}`);
        }
    },

    setPage: function(to) {
        // Set the current page in the current search results.
        if (isWholeNumber(to)) {
            let numOfPages = reactor.evaluate(getters.searchResultsPages);
            if (to <= numOfPages) {
                reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
            } else {
                console.error(`Can't set page to ${to}: only ${numOfPages} exist.`);
            }
        } else {
            console.error(`setPage() must be given a whole number, not ${to}`);
        }
    },

    setPerPage: function(to) {
        // Set the number of results per page for search results.
        // NOTE this also resets the "current page" to 1.
        if (isWholeNumber(to)) {
            if (0 < to && to < 101) {
                reactor.dispatch(SIGNAL_NAMES.SET_PER_PAGE, to);
                reactor.dispatch(SIGNAL_NAMES.SET_PAGE, 1);
            } else {
                console.error(`Resources per page must be between 1 and 100 (got ${to})`);
            }
        } else {
            console.error(`setPerPage() must be given a whole number, not ${to}`);
        }
    },
};


export {SIGNAL_NAMES, SIGNALS};
export default SIGNALS;
