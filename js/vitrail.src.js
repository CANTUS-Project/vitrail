// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/vitrail.src.js
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
import TemplateSearch from './templatesearch.src';
import {ItemViewDevelWrapper} from './itemview.src';
import ResultListFrame from './result_list';


var SearchBox = React.createClass({
    propTypes: {
        // "contents" is the initial value in the search box
        contents: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {contents: ""};
    },
    // submitSearch: function(changeEvent) {
        // this.props.submitSearch(changeEvent.target[0].value);
        // changeEvent.preventDefault();  // stop the default GET form submission
    // },
    render: function() {
        return (
            <fieldset className="form-group row">
                <label htmlFor="#searchQuery" className="col-sm-2">Search Query</label>
                <div className="input-group col-sm-10">
                    <input id="searchQuery" type="search" className="form-control form-control-search" defaultValue={this.props.contents}/>
                    <span className="input-group-btn">
                        <button className="btn btn-secondary" type="submit" value="Search">Search</button>
                    </span>
                </div>
            </fieldset>
        );
    }
});

var TypeRadioButton = React.createClass({
    propTypes: {
        value: React.PropTypes.string.isRequired,
        onUserInput: React.PropTypes.func.isRequired,
        selected: React.PropTypes.bool,
        label: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {selected: false, label: ""};
    },
    render: function() {
        let thisId = `typeRadioButton-${this.props.value}`;
        return (
            <div className="radio">
                <input type="radio" name="resourceType" id={thisId} value={this.props.value}
                       onChange={this.handleChange} checked={this.props.selected} />
                <label htmlFor={thisId}>
                    {this.props.label}
                </label>
            </div>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var TypeSelector = React.createClass({
    propTypes: {
        // "types" is an array of 2-element array of strings. In the sub-arrays, the first element
        // should be the name of the type, for use in the UI; the second element should be the name
        // of the member as it's held in the HATEOAS resource URLs provided by the Cantus server.
        types: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)),
        // Name of the currently selected type, as it appears in the second element of the sub-array
        // described in "types."
        selectedType: React.PropTypes.string,
        // This function is executed when the user selects a different type. There is one argument,
        // a string with the name of the newly-selected type, as it appears in the second element
        // of the sub-array described in "types."
        onUserInput: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {types: [], selectedType: ""};
    },
    render: function() {
        var renderedButtons = [];
        this.props.types.forEach(function (buttonDeets, index) {
            var selected = false;
            if (this.props.selectedType === buttonDeets[1]) {
                selected = true;
            }
            renderedButtons.push(<TypeRadioButton label={buttonDeets[0]}
                                                  value={buttonDeets[1]}
                                                  onUserInput={this.props.onUserInput}
                                                  selected={selected}
                                                  key={index}
                                 />);
        }, this);
        return  (
            <fieldset className="typeSelector form-group row">
                <label className="col-sm-2">Resource Type</label>
                <div className="col-sm-10">
                    {renderedButtons}
                </div>
            </fieldset>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var PerPageSelector = React.createClass({
    propTypes: {
        onUserInput: React.PropTypes.func.isRequired,
        perPage: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {perPage: 10};
    },
    render: function() {
        // NOTE: the <div> down there only exists to help keep the <input> within col-sm-10
        return (
            <fieldset className="form-group row">
                <label htmlFor="#perPageSelector" className="col-sm-2">Results per page:</label>
                <div className="col-sm-10">
                    <input type="number"
                           name="perPage"
                           id="perPageSelector"
                           className="form-control form-control-number"
                           value={this.props.perPage}
                           onChange={this.handleChange}
                           />
                </div>
            </fieldset>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});


var BasicSearch = React.createClass({
    getInitialState: function() {
        return {resourceType: 'all', page: 1, perPage: 10, currentSearch: '', errorMessage: null};
    },
    failedAjaxRequest: function(errorInfo) {
        // when an AJAX request fails

        // 1.) was there a 404, meaning no search results were found?
        if (404 === errorInfo.code) {
            this.setState({errorMessage: "No results were found."});
        }

        // 2.) otherwise there was another failure
        else {
            var errorMessage = "There was an error while contacting the CANTUS server:\n" + errorInfo.response;
            console.error(errorInfo);
            this.setState({errorMessage: errorMessage});
        }
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        var newPage = 1;
        var curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null});
    },
    submitSearch: function(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        this.setState({currentSearch: submitEvent.target[1].value,
                       page: 1,
                       errorMessage: null});
    },
    render: function() {
        var mainScreen = null;

        // the resource types to allow searching for
        var types = [
            ['Any Type', 'all'],
            ['Cantus ID', 'cantusids'],
            ['Centuries', 'centuries'],
            ['Chants', 'chants'],
            ['Feasts', 'feasts'],
            ['Genres', 'genres'],
            ['Indexers', 'indexers'],
            ['Notations', 'notations'],
            ['Offices', 'offices'],
            ['Provenances', 'provenances'],
            ['RISM Sigla', 'sigla'],
            ['Segments', 'segments'],
            ['Sources', 'sources'],
            ['Source Status', 'source_statii']
        ];
        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        var dontRender = ['type', 'id'];
        if ('browse' === this.state.resourceType) {
            // if there may be many types, we want users to know what they're getting
            dontRender = ['id'];
        }

        // the server is compatible, but there was another error
        else if (null !== this.state.errorMessage) {
            mainScreen = (<p>{this.state.errorMessage}</p>);
        }

        // otherwise we'll show the usual thing
        else {
            mainScreen = (<ResultListFrame resourceType={this.state.resourceType}
                                           dontRender={dontRender}
                                           perPage={this.state.perPage}
                                           page={this.state.page}
                                           searchQuery={this.state.currentSearch}
                                           changePage={this.changePage}
                                           onError={this.failedAjaxRequest}
                                           cantus={window['temporaryCantusJS']}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm col-sm-12">
                <div className="searchSettings card">
                    <div className="card-block">
                        <h2 className="card-title">Query Settings</h2>
                    </div>
                    <form onSubmit={this.submitSearch}>
                        <SearchBox contents={this.state.currentSearch} />
                        <TypeSelector onUserInput={this.changeResourceType}
                                      types={types}
                                      selectedType={this.state.resourceType} />
                        <PerPageSelector onUserInput={this.changePerPage} perPage={this.state.perPage} />
                    </form>
                </div>
                <div className="searchResults">
                    {mainScreen}
                </div>
            </div>
        );
    }
});


var OneboxSearch = React.createClass({
    // TODO: move this to its own file and refactor ResultListFrame (etc) when you get rid of BasicSearch
    //

    getInitialState: function() {
        return {page: 1, perPage: 10, currentSearch: '', errorMessage: null};
    },
    failedAjaxRequest: function(errorInfo) {
        // when an AJAX request fails

        // 1.) was there a 404, meaning no search results were found?
        if (404 === errorInfo.code) {
            this.setState({errorMessage: "No results were found."});
        }

        // 2.) otherwise there was another failure
        else {
            var errorMessage = "There was an error while contacting the CANTUS server:\n" + errorInfo.response;
            console.error(errorInfo);
            this.setState({errorMessage: errorMessage});
        }
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        var newPage = 1;
        var curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null});
    },
    submitSearch: function(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        this.setState({currentSearch: submitEvent.target[1].value,
                       page: 1,
                       errorMessage: null});
    },
    render: function() {
        let mainScreen = null;

        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        let dontRender = ['id'];

        // if there's an error, show an error message
        if (null !== this.state.errorMessage) {
            mainScreen = (<p>{this.state.errorMessage}</p>);
        }

        // otherwise we'll show the usual thing
        else {
            mainScreen = (<ResultListFrame resourceType='all'
                                           dontRender={dontRender}
                                           perPage={this.state.perPage}
                                           page={this.state.page}
                                           searchQuery={this.state.currentSearch}
                                           changePage={this.changePage}
                                           onError={this.failedAjaxRequest}
                                           cantus={window['temporaryCantusJS']}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm col-sm-12">
                <div className="searchSettings card">
                    <div className="card-block">
                        <h2 className="card-title">Onebox Search</h2>
                    </div>
                    <form onSubmit={this.submitSearch}>
                        <SearchBox contents={this.state.currentSearch} />
                    </form>
                </div>
                <div className="searchResults">
                    {mainScreen}
                </div>
            </div>
        );
    }
});


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
            {name: 'Basic Search (devel)', link: '/basicsearchdevel'},
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


export {SearchBox, TypeRadioButton, TypeSelector, PerPageSelector, BasicSearch, Vitrail,
    OneboxSearch, ResultListFrame};
