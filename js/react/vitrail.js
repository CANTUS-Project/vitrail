// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/vitrail.js
// Purpose:                Core React components for Vitrail.
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

import React from 'react';
import {Immutable} from 'nuclear-js';
import {Link} from 'react-router';

import Alert from 'react-bootstrap/lib/Alert';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';


// This is the list of software given to the Colophon.
const listOfSoftware = [
    {
        name: 'Abbot',
        version: 'TODO (0.5.1+)',
        description: 'The "Cantus Server" that provides data for Vitrail.',
        licence: 'AGPLv3+',
        link: 'https://github.com/CANTUS-Project/abbot',
    },
    {
        name: 'CantusJS',
        version: 'TODO (commit f2a62ac)',
        description: 'Makes it easier for Vitrail to access Abbot.',
        licence: 'GPLv3+',
        link: 'https://github.com/CANTUS-Project/cantus-js',
    },
    {
        name: 'pysolr-tornado',
        version: '4.0.0a1',
        description: 'Used by Abbot to connect to a "Solr" database.',
        licence: 'New BSD',
        link: 'https://github.com/CANTUS-Project/pysolr-tornado',
    },
    {
        name: 'Vitrail',
        version: 'TODO (0.2.5+)',
        description: 'The browser-based application to access Cantus data.',
        licence: 'AGPLv3+',
        link: 'https://github.com/CANTUS-Project/vitrail',
    },
];


/** Alert the user about something.
 *
 * This component is intended primarily for alerting users about errors, but may also be used for
 * other purposes, like to alert them that an edit was successfully saved in the database.
 *
 * This component may be embedded in the user interface, or of "overlay" is set to true, displayed
 * "in front of" all
 *
 * Props
 * -----
 * @param (str) message - The error message to display to the user. Required.
 * @param (str) class - A Bootstrap 4 "contextual class" for the message (success, info, warning,
 *     danger). Defaults to "info."
 * @param (bool) overlay - Display in front of the rest of the UI. Default is false.
 * @param (ImmutableJS.Map) fields - A Map of key/value pairs with additional information for the
 *     user. These should help the user either solve the problem, or report it to the developers.
 *
 */
const AlertView = React.createClass({
    propTypes: {
        class: React.PropTypes.oneOf(['success', 'info', 'warning', 'danger']),
        fields: React.PropTypes.instanceOf(Immutable.Map),
        message: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]).isRequired,
        overlay: React.PropTypes.bool,
    },
    getDefaultProps() {
        return {overlay: false, class: 'info', fields: Immutable.Map()};
    },
    render() {
        let fields;
        if (this.props.fields.size > 0) {
            const innerList = [];
            this.props.fields.forEach((value, key) => {
                innerList.push(
                    <tr key={key.toLocaleLowerCase()}>
                        <td className="td-align-right">{`${key}:`}</td>
                        <td>{value}</td>
                    </tr>
                );
            });

            fields = (
                <Table fill striped>
                    <tbody>
                    {innerList}
                    </tbody>
                </Table>
        );
        }

        return (
            <Panel>
                <Alert bsStyle={this.props.class}>
                    {this.props.message}
                </Alert>
                {fields}
            </Panel>
        );
    },
});


/** A table of the software developed for CANTUS.
 *
 * Props:
 * ------
 * @param (array of object) software - An array of objects with the following members: "name",
 *     "version", "description", "licence", and "link". All data should be strings.
 */
const SoftwareTable = React.createClass({
    propTypes: {
        software: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    },
    getDefaultProps() {
        return {software: []};
    },
    render() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>{`Software`}</th>
                        <th>{`Version`}</th>
                        <th>{`Description`}</th>
                        <th>{`Licence`}</th>
                        <th>{`Source Code`}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.software.map((software) =>
                        <tr key={software.name.toLocaleLowerCase()}>
                            <td>{software.name}</td>
                            <td>{software.version}</td>
                            <td>{software.description}</td>
                            <td>{software.licence}</td>
                            <td><a href={software.link}>{`Link`}</a></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    },
});


/** An "About Cantus" component for the Vitrail home page.
 *
 */
const Colophon = React.createClass({
    render() {
        return (
            <article className="container">
                <section>
                    <h1>{`About the Cantus Database`}</h1>
                    <p className="lead">
                        {`Cantus is a database of the Latin chants found in over 130 manuscripts and early
                        printed books.`}
                    </p>
                    <p>
                        {`This searchable digital archive holds inventories of primarily
                        antiphoners and breviaries from medieval Europe; these are the main sources for
                        the music sung in the liturgical Office. You are currently accessing the
                        Cantus Database through a secondary user interface called Vitrail. The primary
                        user interface, called Drupal, is available at `}
                        <a href="http://cantus.uwaterloo.ca/">{`http://cantus.uwaterloo.ca/`}</a>{`.`}
                    </p>
                </section>

                <section>
                    <h2>{`Differences between the User Interfaces`}</h2>
                    <p>
                        {`Drupal is the usual way of accessing the Cantus Database. Drupal holds the authoritative
                        version of the database. Registered users may edit the database.`}
                    </p>
                    <p>
                        {`Vitrail is a new way to access the Cantus Database, currently under development.
                        Vitrail uses a replica of the Drupal database, which may occasionally be out-of-sync
                        with what you see on Drupal. However, Vitrail automatically updates itself, so
                        any differences are temporary.`}
                    </p>
                    <p>
                        {`Vitrail is being developed to provide a mobile-friendly way to access the Cantus
                        Database. Drupal will continue to exist alongside Vitrail for several
                        years\u2014perhaps indefinitely.`}
                    </p>
                </section>

                <section>
                    <h2>{`About Vitrail`}</h2>
                    <p>
                        {`Vitrail is currently under development. This is not \u201Cproduction-ready\u201D
                        software, so you can expect to encounter bugs and things that don\u0027t look right.
                        When you find these, please do report them to the Cantus team, whose contact
                        information is available on `}<a href="http://cantus.uwaterloo.ca/">{`Drupal`}</a>{`.`}
                    </p>
                    <p>
                        {`Vitrail is built with \u201Cfree and open source\u201D software, which means
                        that users have different legal rights than most software. One such right is
                        access to the application\u0027s \u201Csource code\u201D so that you may
                        modify, share, and study the application. Thus the following list briefly
                        describes some of the free and open source software used in Vitrail, and
                        where to access its source code.`}
                    </p>
                    <SoftwareTable software={listOfSoftware}/>
                    <p>
                        {`This list only includes software built by the Cantus team. You may learn about
                        additional software we use by visiting the source code repository of the project
                        you wish to learn about.`}
                    </p>
                </section>
            </article>
        );
    },
});


const NavbarItem = React.createClass({
    propTypes: {
        // the URL path (according to react-router) for this NavbarItem
        link: React.PropTypes.string.isRequired,
        // the textual name to display for this navbar entry
        name: React.PropTypes.string.isRequired,
    },
    render() {
        return (
            <li>
                <Link to={this.props.link} activeClassName="active">
                    {this.props.name}
                </Link>
            </li>
        );
    },
});


const VitrailNavbar = React.createClass({
    propTypes: {
        // array of objects with the props required for the "NavbarItem" component
        navbarItems: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                name: React.PropTypes.string,
                link: React.PropTypes.string,
            })
        ),
    },
    getDefaultProps() {
        return {navbarItems: []};
    },
    render() {
        return (
            <Navbar>
                <Navbar.Header><Navbar.Brand><a href="/">{`Cantus Database`}</a></Navbar.Brand></Navbar.Header>
                <Nav>
                    {this.props.navbarItems.map((item, index) =>
                        <NavbarItem key={index} name={item.name} link={item.link}/>
                    )}
                </Nav>
            </Navbar>
        );
    },
});


const NotImplemented = React.createClass({
    render() {
        return (
            <Alert scStyle="danger">{`Not implemented!`}</Alert>
        );
    },
});


const Vitrail = React.createClass({
    //

    propTypes: {
        children: React.PropTypes.element,
    },
    render() {
        const navbarItems = [
            // {name, link}
            {name: 'Onebox Search', link: '/onebox'},
            {name: 'Template Search', link: '/template'},
            {name: 'Workspace', link: '/workspace'},
            // {name: 'BookView (devel)',     link: '/bookview'},
        ];

        return (
            <div>
                <VitrailNavbar navbarItems={navbarItems}/>
                {this.props.children}
            </div>
        );
    },
});


export {AlertView, Colophon, NotImplemented, Vitrail};
