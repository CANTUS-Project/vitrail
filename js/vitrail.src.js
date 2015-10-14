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
        // "submitSearch" is called with a single argument, a string, containing the search query.
        submitSearch: React.PropTypes.func.isRequired,
        // "contents" is the initial value in the search box
        contents: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {contents: ""};
    },
    submitSearch: function(changeEvent) {
        this.props.submitSearch(changeEvent.target[0].value);
        changeEvent.preventDefault();  // stop the default GET form submission
    },
    render: function() {
        return (
            <form onSubmit={this.submitSearch}>
                <label>Search Query:&nbsp;
                    <input type="search" name="searchQuery" defaultValue={this.props.contents} />&nbsp;
                    <input type="submit" value="Search" />
                </label>
            </form>
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
        return (
            <label><input type="radio" name="resourceType" value={this.props.value}
                          onChange={this.handleChange} checked={this.props.selected} />
                   {this.props.label}</label>
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
            <div className="typeSelector">
                {renderedButtons}
            </div>
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
        return (
            <label>Results per page: <input type="number"
                                            name="perPage"
                                            value={this.props.perPage}
                                            onChange={this.handleChange}
                                     />
            </label>
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
            <tr>
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
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
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
            <div className="resultList">
                <table>
                    <thead>
                        <tr>
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
        totalPages: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
    },
    getDefaultProps: function() {
        return {currentPage: 1, totalPages: 1};
    },
    changePage: function(button) {
        this.props.changePage(button.target.value);
    },
    render: function() {
        return (
            <div className="paginator">
                <button type="button" name="pages" value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" name="pages" value="previous" onClick={this.changePage}>&lt;</button>
                <div className="blankOfBlank">
                    &nbsp;{this.props.currentPage} of {this.props.totalPages}&nbsp;
                </div>
                <button type="button" name="pages" value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" name="pages" value="last" onClick={this.changePage}>&gt;&gt;</button>
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

var SearchForm = React.createClass({
    propTypes: {
        rootUrl: React.PropTypes.string.isRequired,
    },
    getInitialState: function() {
        var cantus = new cantusModule.Cantus(this.props.rootUrl);
        return {cantus: cantus, resourceType: "all", page: 1, perPage: 10, currentSearch: "",
                errorMessage: null};
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
    submitSearch: function(searchQuery) {
        this.setState({currentSearch: searchQuery, page: 1, errorMessage: null});
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
                                           cantus={this.state.cantus}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm">
                <div className="searchSettings">
                    <h2>Query Settings</h2>
                    <SearchBox contents={this.state.currentSearch} submitSearch={this.submitSearch} />
                    <TypeSelector onUserInput={this.changeResourceType}
                                  types={types}
                                  selectedType={this.state.resourceType} />
                    <PerPageSelector onUserInput={this.changePerPage} perPage={this.state.perPage} />
                </div>
                <div className="searchResults">
                    <h2>Results</h2>
                    {mainScreen}
                </div>
            </div>
        );
    }
});

export {SearchBox, TypeRadioButton, TypeSelector, PerPageSelector, ResultColumn, Result, ResultList,
        Paginator, ResultListFrame, SearchForm};
