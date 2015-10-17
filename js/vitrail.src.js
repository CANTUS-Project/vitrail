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


import React from "react";
import cantusModule from "./cantusjs/cantus.src";

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

var ResultColumn = React.createClass({
    propTypes: {
        // URL corresponding to "data," which will be used as the @href of an <a>. Optional.
        link: React.PropTypes.string,
        // Data to show in the column.
        data: React.PropTypes.string,
        // Whether this is a column in the table header (default is false).
        header: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {link: "", data: "", header: false};
    },
    render: function() {
        var post;
        if (this.props.link) {
            post = <a href={this.props.link}>{this.props.data}</a>;
        } else {
            post = this.props.data;
        }
        if (this.props.header) {
            post = <th>{post}</th>;
        } else {
            post = <td>{post}</td>;
        }
        return post;
    }
});

var Result = React.createClass({
    propTypes: {
        // the column names to render, or the fields in "data" to render as columns
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        // the object to render into columns
        data: React.PropTypes.object.isRequired,
        // members here are the URL for the same-name member in "data"
        resources: React.PropTypes.object
    },
    getDefaultProps: function() {
        return {resources: {}};
    },
    render: function() {
        var renderedColumns = [];
        this.props.columns.forEach(function (columnName) {
            var columnData = this.props.data[columnName];
            if (columnData !== undefined) {
                columnData = columnData.toString();
            }

            var columnLink = '';
            if ("name" === columnName)
                columnLink = this.props.resources['self'];
            else {
                columnLink = this.props.resources[columnName];
            }

            renderedColumns.push(<ResultColumn key={columnName} data={columnData} link={columnLink} />);
        }, this);
        if (this.props.data["drupal_path"] !== undefined) {
            renderedColumns.push(<ResultColumn key="drupal_path" data="Show" link={this.props.data["drupal_path"]} />);
        }
        return (
            <tr className="resultComponent">
                {renderedColumns}
            </tr>
        );
    }
});

var ResultList = React.createClass({
    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,
        headers: React.PropTypes.object,
        // the order in which to display results
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null};
    },
    render: function() {
        var tableHeader = [];
        var results = [];

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (null !== this.props.data && null !== this.props.headers) {
            var columns = this.props.headers.fields.split(',');
            var extraFields = this.props.headers.extra_fields;
            if (null !== extraFields) {
                extraFields = extraFields.split(',');
                columns = columns.concat(extraFields);
            }

            // remove the field names in "dontRender"
            for (var field in this.props.dontRender) {
                var pos = columns.indexOf(this.props.dontRender[field]);
                if (pos >= 0) {
                    columns.splice(pos, 1);
                }
            };

            columns.forEach(function(columnName) {
                // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
                var working = columnName.split("_");
                var polishedName = "";
                for (var i in working) {
                    var rawr = working[i][0];
                    rawr = rawr.toLocaleUpperCase();
                    polishedName += rawr;
                    polishedName += working[i].slice(1) + " ";
                }
                polishedName = polishedName.slice(0, polishedName.length);

                // now we can make the <th> cell itself
                tableHeader.push(<ResultColumn key={columnName} data={polishedName} header={true} />);
            });

            this.props.sortOrder.forEach(function (id) {
                results.push(<Result
                    key={id}
                    columns={columns}
                    data={this.props.data[id]}
                    resources={this.props.data.resources[id]} />);
            }, this);
        }

        return (
            <div className="resultList card">
                <div className="card-block">
                    <h2 className="card-title">Results</h2>
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr className="resultTableHeader">
                            {tableHeader}
                        </tr>
                    </thead>
                    <tbody>
                        {results}
                    </tbody>
                </table>
            </div>
        );
    }
});

var Paginator = React.createClass({
    propTypes: {
        changePage: React.PropTypes.func.isRequired,
        currentPage: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        totalPages: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        searchQuery: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {currentPage: 1, totalPages: 1};
    },
    changePage: function(button) {
        this.props.changePage(button.target.value);
    },
    render: function() {
        return (
            <div className="btn-group paginator" role="group" aria-label="paginator">
                <button type="button" className="btn btn-secondary" name="pages"
                        value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="previous" onClick={this.changePage}>&lt;</button>
                <button type="button" className="blankOfBlank btn btn-secondary">
                    {this.props.currentPage} of {this.props.totalPages}
                </button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});

var ResultListFrame = React.createClass({
    propTypes: {
        onError: React.PropTypes.func.isRequired,
        changePage: React.PropTypes.func.isRequired,
        resourceType: React.PropTypes.string,
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    getDefaultProps: function() {
        return {resourceType: "any", dontRender: []};
    },
    getNewData: function(resourceType, requestPage, perPage, searchQuery) {
        // default, unchanging things
        var ajaxSettings = {
            type: resourceType
        };

        // TODO: id, fields, sort

        // pagination
        if (undefined === requestPage) {
            ajaxSettings["page"] = 1;
        } else {
            ajaxSettings["page"] = requestPage;
        }

        if (undefined === perPage) {
            ajaxSettings["per_page"] = 10;
        } else {
            ajaxSettings["per_page"] = perPage;
        }

        // submit the request
        if (undefined !== searchQuery && "" !== searchQuery) {
            // search query
            ajaxSettings["any"] = searchQuery;
            this.props.cantus.search(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.props.onError);
        } else {
            // browse query
            this.props.cantus.get(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.props.onError);
        }
    },
    ajaxSuccessCallback: function(response) {
        // Called when an AJAX request returns successfully.
        var headers = response.headers;
        delete response.headers;
        var sortOrder = response.sort_order;
        delete response.sort_order;
        var totalPages = Math.ceil(headers.total_results / headers.per_page);
        this.setState({data: response, headers: headers, page: headers.page, totalPages: totalPages,
                       sortOrder: sortOrder});
    },
    componentDidMount: function() { this.getNewData(this.props.resourceType); },
    componentWillReceiveProps: function(newProps) {
        // check "perPage" is valid
        if (newProps.perPage < 1 || newProps.perPage > 100) {
            return;
        }
        // check if "page" is "last"
        else if ("last" === newProps.page) {
            this.props.changePage(this.state.totalPages);
        }
        // check if "page" is valid
        else if (newProps.page > this.state.totalPages) {
            this.props.changePage(this.state.totalPages);
        }
        // otherwise we can go ahead and update
        else {
            this.getNewData(newProps.resourceType,
                            newProps.page,
                            newProps.perPage,
                            newProps.searchQuery);
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // we'll get another props change in a moment
        if ("last" === nextProps.page) {
            return false;
        // this would produce an invalid result
        } else if (nextProps.page > this.state.totalPages) {
            return false;
        // this wouldn't change anything
        } else if (nextState.data === this.state.data && nextState.headers === this.state.headers &&
                   nextState.page === this.state.page && nextState.totalPages === this.state.totalPages) {
            return false;
        } else {
            return true;
        }
    },
    getInitialState: function() {
        return {data: null, headers: null, page: 1, totalPages: 1};
    },
    render: function() {
        var currentPage = this.state.page;
        var totalPages = this.state.totalPages;
        return (
            <div className="resultListFrame">
                <ResultList data={this.state.data}
                            headers={this.state.headers}
                            dontRender={this.props.dontRender}
                            sortOrder = {this.state.sortOrder} />
                <Paginator changePage={this.props.changePage} currentPage={this.state.page} totalPages={this.state.totalPages} />
            </div>
        );
    }
});

var BasicSearch = React.createClass({
    propTypes: {
        cantusjs: React.PropTypes.object.isRequired,
    },
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
                                           cantus={this.props.cantusjs}
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


let OneboxSearch = React.createClass({
    propTypes: {
        cantusjs: React.PropTypes.object.isRequired,
    },
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
                                           cantus={this.props.cantusjs}
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


let NavbarItem = React.createClass({
    propTypes: {
        // the textual name to display for this navbar entry
        name: React.PropTypes.string.isRequired,
        // a function to execute when the navbar button is clicked
        onClick: React.PropTypes.func,
        // whether this is the currently-active navbar item
        active: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {onClick: null, active: false};
    },
    defaultOnClick: function() {
        alert('That functionality is not implemented yet.');
    },
    render: function() {
        let navbarButton;

        if (this.props.active) {
            navbarButton = (
                <a className="btn btn-primary-outline active">
                    {this.props.name}
                    <span className="sr-only">(current)</span>
                </a>
            );
        } else if (null === this.props.onClick) {
            navbarButton = <a className="btn btn-primary-outline disabled">{this.props.name}</a>;
        } else {
            navbarButton = (
                <a className="btn btn-primary-outline" onClick={this.props.onClick}>
                    {this.props.name}
                </a>
            );
        }

        return (
            <li className="nav-item">{navbarButton}</li>
        );
    }
});


let VitrailNavbar = React.createClass({
    propTypes: {
        // array of objects with the props required for the "NavbarItem" component
        navbarItems: React.PropTypes.arrayOf(React.PropTypes.object)
    },
    getDefaultProps: function() {
        return [];
    },
    render: function() {
        let navbarButtons = [];

        this.props.navbarItems.forEach(function(btn, key) {
            navbarButtons.push(
                <NavbarItem key={key} name={btn.name} onClick={btn.onClick} active={btn.active}/>
            );
        });

        return (
            <nav className="navbar navbar-light bg-faded">
                <div className="navbar-brand">CANTUS Database</div>
                <ul className="nav navbar-nav">
                    {navbarButtons}
                </ul>
            </nav>
        );
    }
});


let Vitrail = React.createClass({
    propTypes: {
        // URL to the root of the Cantus API server
        rootUrl: React.PropTypes.string.isRequired,
    },
    // State Definition
    // ================
    // - activeScreen: Internal name of the currently-active screen; one of:
    //    - 'onebox'  (Onebox Search)
    //    - 'basic'  (Basic Search)
    //    - 'template'  (Template Search)
    //    - 'workspace'  (My Workspace)
    getInitialState: function() {
        return ({
            activeScreen: 'onebox',
            cantusjs: new cantusModule.Cantus(this.props.rootUrl)
        });
    },
    activateOnebox: function() { this.setState({activeScreen: 'onebox'}); },
    activateBasic: function() { this.setState({activeScreen: 'basic'}); },
    activateTemplate: function() { this.setState({activeScreen: 'template'}); },
    activateWorkspace: function() { this.setState({activeScreen: 'workspace'}); },
    render: function() {
        let navbarItems = [
            // {name, onClick, active}
            {name: 'Onebox Search', active: false, onClick: this.activateOnebox},
            {name: 'Basic Search (just for testing)', active: false, onClick: this.activateBasic},
            {name: 'Template Search', active: false, onClick: this.activateTemplate},
            {name: 'My Workspace', active: false, onClick: this.activateWorkspace}
        ];

        let activeScreen = <div className="alert alert-danger" htmlRole="alert">Not implemented!</div>;

        // deal with activating the active screen
        if ('onebox' === this.state.activeScreen) {
            navbarItems[0]['active'] = true;
            navbarItems[0]['onClick'] = null;
            activeScreen = <OneboxSearch cantusjs={this.state.cantusjs}/>
        } else if ('basic' === this.state.activeScreen) {
            navbarItems[1]['active'] = true;
            navbarItems[1]['onClick'] = null;
            activeScreen = <BasicSearch cantusjs={this.state.cantusjs}/>
        } else if ('template' === this.state.activeScreen) {
            navbarItems[2]['active'] = true;
            navbarItems[2]['onClick'] = null;
        } else if ('workspace' === this.state.activeScreen) {
            navbarItems[3]['active'] = true;
            navbarItems[3]['onClick'] = null;
        }

        return (
            <div>
                <VitrailNavbar navbarItems={navbarItems}/>
                <div className="container-fluid">{activeScreen}</div>
            </div>
        );
    }
});


export {SearchBox, TypeRadioButton, TypeSelector, PerPageSelector, ResultColumn, Result, ResultList,
        Paginator, ResultListFrame, BasicSearch, Vitrail, OneboxSearch};
