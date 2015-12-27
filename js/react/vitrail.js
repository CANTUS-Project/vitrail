// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/vitrail.js
// Purpose:                Core React components for Vitrail.
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
import {Link} from 'react-router';


var NavbarItem = React.createClass({
    propTypes: {
        // the textual name to display for this navbar entry
        name: React.PropTypes.string.isRequired,
        // the URL path (according to react-router) for this NavbarItem
        link: React.PropTypes.string.isRequired,
    },
    render: function() {
        return (
            <Link to={this.props.link} className="btn btn-primary-outline" activeClassName="active">
                {this.props.name}
            </Link>
        );
    }
});


var VitrailNavbar = React.createClass({
    propTypes: {
        // array of objects with the props required for the "NavbarItem" component
        navbarItems: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                name: React.PropTypes.string,
                link: React.PropTypes.string
            })
        )
    },
    getDefaultProps: function() {
        return {navbarItems: []};
    },
    render: function() {
        return (
            <nav className="navbar navbar-light bg-faded">
                <div className="navbar-brand">CANTUS Database</div>
                <ul className="nav navbar-nav">
                    {this.props.navbarItems.map((item, index) =>
                        <NavbarItem key={index} name={item.name} link={item.link}/>
                    )}
                </ul>
            </nav>
        );
    }
});


var NotImplemented = React.createClass({
    render: function() {
        return (
            <div className="alert alert-danger" htmlRole="alert">Not implemented!</div>
        );
    }
});


var Vitrail = React.createClass({
    //

    render: function() {
        let navbarItems = [
            // {name, link}
            {name: 'Onebox Search',        link: '/onebox'},
            {name: 'Template Search',      link: '/template'},
            {name: 'My Workspace',         link: '/workspace'},
            {name: 'ItemView (devel)',     link: '/itemviewdevel'},
            {name: 'BookView (devel)',     link: '/bookview'},
        ];

        return (
            <div>
                <VitrailNavbar navbarItems={navbarItems}/>
                <div className="container-fluid">{this.props.children}</div>
            </div>
        );
    }
});


export {Vitrail, NotImplemented};
