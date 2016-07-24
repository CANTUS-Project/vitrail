// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/offline.js
// Purpose:                React components to manage Vitrail's use of offline caches.
//
// Copyright (C) 2016 Christopher Antila
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

import React from 'react';

import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Panel from 'react-bootstrap/lib/Panel';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';


/** The whole "Offline" page.
 *
 * Note: We could do a "serviceWorker in navigator" check here, but we'll consolidate the check for
 * supportedness so that we can change it easily if required.
 */
const OfflineManager = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {swSupported: getters.swSupported};
    },
    render() {
        if (this.state.swSupported) {
            return (
                <div className="container">
                    <PageHeader>
                        {`Use Cantus Offline`}
                    </PageHeader>
                    <YesServiceWorker/>
                </div>
            );
        }
        else {
            return (
                <div className="container">
                    <PageHeader>
                        {`Use Cantus Offline`}
                    </PageHeader>
                    <NoServiceWorker/>
                </div>
            );
        }
    },
});


/** Shown when the browser does support ServiceWorker. */
const YesServiceWorker = React.createClass({
    render() {
        return (
            <Panel>
                <p>
                    {`Your browser can save the Cantus Database as a browser app for offline use.`}
                </p>
                <p>
                    {`When you "install" the Cantus Database, that means you can load the database
                    by visiting our homepage URL even when you're not connected to the internet.`}
                </p>
                <p>
                    {`When you're offline, you can view any chants that you saved in the `}
                    <Link to="/workspace">{`Workspace`}</Link>{`. However, you can only search the
                    database when you're online.`}
                </p>
                <hr/>
                <InstallOrUninstall/>
            </Panel>
        );
    },
});


/** Shows the "Install" or "Uninstall" button as required.
 *
 * State
 * -----
 * @param {str} emitted - Either undefined, "install," or "uninstall," indicating the signal called
 *     most recently by clicking this button.
 * @param {bool} swInstalled - From NuclearJS, indicating whether Vitrail's assets are currently
 *     cached by the browser.
 */
const InstallOrUninstall = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {swInstalled: getters.swInstalled};
    },
    handleButtonClick() {
        // NB: we use setTimeout() so that it looks like it takes a moment to (un)install Vitrail!
        if (this.state.swInstalled) {
            this.setState({emitted: 'uninstall'});
            window.setTimeout(() => { signals.swUninstall(); }, 1000);
        }
        else {
            this.setState({emitted: 'install'});
            window.setTimeout(() => { signals.swInstall(); }, 1000);
        }
    },
    render() {
        let working = false;  // whether install/uninstall signal was emitted and isn't done yet
        let buttonText = 'Install';

        if (this.state.swInstalled) {
            if (this.state.emitted === 'uninstall') {
                buttonText = '(uninstalling)';
                working = true;
            }
            else {
                buttonText = 'Uninstall';
            }
        }
        else {
            if (this.state.emitted === 'install') {
                buttonText = '(installing)';
                working = true;
            }
        }

        return (
            <Button onClick={this.handleButtonClick} disabled={working}>{buttonText}</Button>
        );
    },
});


/** Shown when the browser doesn't support ServiceWorker. */
const NoServiceWorker = React.createClass({
    render() {
        return (
            <Panel>
                <p>
                    {`If you want to use the Cantus Database when you're not connected to the web,
                    remember to load it in your browser before you go offline.`}
                </p>
                <p>
                    {`When you're offline, you can view any chants that you saved in the `}
                    <Link to="/workspace">{`Workspace`}</Link>{`. However, you can only search the
                    database when you're online.`}
                </p>
                <p>
                    {`Some devices and browsers allow you to save the Cantus Database as a browser
                    app for offline use. Unfortunately your browser does not have this feature.`}
                </p>
            </Panel>
        );
    },
});


export default OfflineManager
export {OfflineManager};
