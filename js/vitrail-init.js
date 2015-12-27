// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/vitrail-init.js
// Purpose:                Use RequireJS and React to initialize the Vitrail app for browsers.
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


import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route} from 'react-router';

import {reactor} from './nuclear/reactor';
import {STORES as stores} from './nuclear/stores';

// TODO: we won't need this eventually (after testing)
// import {SIGNAL_NAMES, SIGNALS} from './nuclear/signals';

import {NotImplemented, Vitrail} from './react/vitrail';
import {ItemViewDevelWrapper, ItemViewOverlay} from './react/itemview';
import {OneboxSearch} from './react/onebox';
import {TemplateSearch} from './react/template_search';


reactor.registerStores({
    'currentItemView': stores.CurrentItemView,
    'searchResultsFormat': stores.SearchResultsFormat,
    'searchPerPage': stores.SearchPerPage,
    'searchPage': stores.SearchPage,
    'searchQuery': stores.SearchQuery,
    'searchResults': stores.SearchResults,
});


// NOTE: for the ItemView URLs below, "rid" is the resource ID to display
ReactDOM.render(
    (
        <Router>
            <Route path="/" component={Vitrail}>
                <Route path="onebox" component={OneboxSearch}/>
                <Route path="template" component={TemplateSearch}/>
                <Route path="itemviewdevel" component={ItemViewDevelWrapper}>
                    <Route path=":type/:rid" component={ItemViewOverlay}/>
                </Route>
                <Route path="workspace" component={NotImplemented}/>
                <Route path="bookview" component={NotImplemented}/>
            </Route>
        </Router>
    ),
    document.getElementById('vitrail-goes-here')
);
