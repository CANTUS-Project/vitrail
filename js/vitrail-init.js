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

import reactor from './nuclear/reactor';
import stores from './nuclear/stores';

// TODO: we won't need this eventually (after testing)
// import {SIGNAL_NAMES, SIGNALS} from './nuclear/signals';

import cantusModule from './cantusjs/cantus.src';
import {BasicSearch, NotImplemented, OneboxSearch, Vitrail} from './vitrail.src.js';
import {ItemViewDevelWrapper, ItemViewOverlay} from './itemview.src';
import TemplateSearch from './templatesearch.src';


// TODO: move this to the models
window['temporaryCantusJS'] = new cantusModule.Cantus('http://abbot.adjectivenoun.ca:8888/');

reactor.registerStores({
    'currentItemView': stores.CurrentItemView,
});


// NOTE: for the ItemView URLs below, "rid" is the resource ID to display
ReactDOM.render(
    (
        <Router>
            <Route path="/" component={Vitrail}>
                <Route path="onebox" component={OneboxSearch}/>
                <Route path="basicsearchdevel" component={BasicSearch}/>
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
