// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/result_list.js
// Purpose:                ResultList React components for Vitrail.
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

import reactor from './nuclear/reactor';
import getters from './nuclear/getters';
import {ItemView} from './itemview.src';


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
    //
    // Props:
    // - ???
    //
    // NuclearJS State:
    // - renderAs (str) Whether to render the results in a "table" or with "ItemView" components.
    //

    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,
        headers: React.PropTypes.object,
        // the order in which to display results
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string),
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null, sortOrder: []};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {theItem: getters.currentItemView};
    },
    render: function() {
        let tableHeader = [];
        let results;

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (null !== this.props.data && null !== this.props.headers) {
            if ('table' === this.state.renderAs) {
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

                results = (
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
                );

            } else {
                // render with ItemView

                results = (
                    <div className="card-columns">
                        {this.props.sortOrder.map(function(rid) {
                            return <ItemView
                                key={rid}
                                size="compact"
                                data={this.props.data[rid]}
                                resources={this.props.data.resources[rid]}
                                />;
                            }.bind(this)
                        )}
                    </div>
                );
            }
        }

        return (
            <div className="resultList card">
                <div className="card-block">
                    <h2 className="card-title">Results</h2>
                </div>
                {results}
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
        changePage: React.PropTypes.func.isRequired,
        resourceType: React.PropTypes.string,
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        perPage: React.PropTypes.number,
        page: React.PropTypes.number,
        searchQuery: React.PropTypes.string,
        cantus: React.PropTypes.object,

        // When the "searchQuery" is empty and "doGenericGet" is true, this component renders the
        // results of a GET to the resource-type-specific URL. This is true by default.
        doGenericGet: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {resourceType: "any", dontRender: [], doGenericGet: true};
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
            this.props.cantus.search(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.ajaxFailureCallback);
        } else if (this.props.doGenericGet) {
            // browse query
            this.props.cantus.get(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.ajaxFailureCallback);
        } else {
            // Since this function is only called if the query-affecting parameters are changed,
            // we know it's safe at this point to clear the state that's displayed. If we didn't
            // reset our "state," the displayed data would not correspond to our new props.
            this.setState(this.getInitialState);
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
    ajaxFailureCallback: function(response) {
        // Called when an AJAX request returns unsuccessfully.
        if (404 === response.code) {
            this.setState({errorMessage: 404});
        } else {
            this.setState({errorMessage: response.response});
        }
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
        // if the Cantus API query will be different, submit a new query
        else if (newProps.resourceType !== this.props.resourceType ||
                 newProps.searchQuery  !== this.props.searchQuery  ||
                 newProps.perPage      !== this.props.perPage      ||
                 newProps.page         !== this.props.page) {
            this.setState({errorMessage: null});
            this.getNewData(newProps.resourceType,
                            newProps.page,
                            newProps.perPage,
                            newProps.searchQuery);
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // this will always change the output
        if (nextState.errorMessage !== this.state.errorMesssage) {
            return true;
        // we'll get another props change in a moment
        } else if ("last" === nextProps.page) {
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
        return {data: null, headers: null, page: 1, totalPages: 1, errorMessage: null};
    },
    render: function() {
        var currentPage = this.state.page;
        var totalPages = this.state.totalPages;

        if (null === this.state.errorMessage) {
            return (
                <div className="resultListFrame">
                    <ResultList data={this.state.data}
                                headers={this.state.headers}
                                dontRender={this.props.dontRender}
                                sortOrder = {this.state.sortOrder} />
                    <Paginator changePage={this.props.changePage} currentPage={this.state.page} totalPages={this.state.totalPages} />
                </div>
            );
        } else {
            let errorMessage = '';
            if (null !== this.state.errorMessage) {
                if (404 == this.state.errorMessage) {
                    errorMessage = <div className="alert alert-warning">No results were found for your search.</div>;
                } else {
                    errorMessage = <div className="alert alert-danger"><strong>Error:&nbsp;</strong>{this.state.errorMessage}</div>;
                }
            }

            return (
                <div className="resultListFrame">
                    {errorMessage}
                </div>
            );
        }
    }
});


export default ResultListFrame;
