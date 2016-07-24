// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/vitrail-init.js
// Purpose:                Use RequireJS and React to initialize the Vitrail app for browsers.
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

// this is imported for the side-effect of setting up our NuclearJS Stores
import init from './nuclear/init';  // eslint-disable-line no-unused-vars

import React from 'react';
import ReactDOM from 'react-dom';
import {hashHistory, IndexRoute, Route, Router} from 'react-router';

import {Colophon, NotImplemented, Vitrail} from './react/vitrail';
import {ItemViewOverlay} from './react/itemview';
import {OneboxSearch} from './react/onebox';
import {TemplateSearch} from './react/template_search';
import {DeskAndShelf, JustShelf, Workspace} from './react/workspace';
import {OfflineManager} from './react/offline';


// NOTE: for the ItemView URLs below, "rid" is the resource ID to display
ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={Vitrail}>
            <IndexRoute component={Colophon}/>

            <Route path="onebox" component={OneboxSearch}>
                <Route path=":type/:rid" component={ItemViewOverlay}/>
            </Route>

            <Route path="template" component={TemplateSearch}>
                <Route path=":type/:rid" component={ItemViewOverlay}/>
            </Route>

            <Route path="workspace" component={Workspace}>
                <IndexRoute component={JustShelf}/>
                <Route path="collection/:colid" component={DeskAndShelf}>
                    <Route path=":type/:rid" component={ItemViewOverlay}/>
                </Route>
            </Route>

            <Route path="offline" component={OfflineManager}>
            </Route>

            <Route path="bookview" component={NotImplemented}/>
        </Route>
    </Router>,
    document.getElementById('vitrail-goes-here')
);


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js');
}
