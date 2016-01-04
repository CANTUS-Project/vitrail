// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/result_list.js
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

import {Immutable} from 'nuclear-js';
import {Link} from 'react-router';
import React from 'react';

import {SIGNALS as signals} from '../nuclear/signals';
import {reactor} from '../nuclear/reactor';
import {getters} from '../nuclear/getters';
import {ItemView} from './itemview';


/** A cell in the ResultListTable.
 *
 * Props:
 * ------
 * @param (string) data - The cell's textual contents.
 * @param (boolean) header - Whether to render this cell as <th> (otherwise as <td>).
 * @param (string) link - A URL for the table contents.
 */
const ResultCell = React.createClass({
    propTypes: {
        data: React.PropTypes.string.isRequired,
        header: React.PropTypes.bool,
        link: React.PropTypes.string,
    },
    getDefaultProps() {
        return {data: '', header: false, link: ''};
    },
    render() {
        let post;
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


/** A row in the ResultListTable.
 *
 * The "columns" prop determines which table cells to render, and the order. Cells are rendered from
 * left to right, in the order specified by "columns." Column names for which there is no data in
 * "data" will be rendered with an empty cell. Fields in "data" that do not appear in "columns" will
 * be ignored.
 *
 * If a column name appears in both "data" and "resources," the rendered table cell will have a
 * hyperlink to the URL given in "resources."
 *
 * @param (array of string) columns - Names of the fields in "data" that should be rendered in this
 *     row. They will be rendered from left to right, in the order of this prop.
 * @param (ImmutableJS.Map) data - Map with data for a resource.
 * @param (ImmutableJS.Map) resources - Map with URLs for a resource.
 */
const ResultRow = React.createClass({
    propTypes: {
        // the column names to render, or the fields in "data" to render as columns
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        // the object to render into columns
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        // members here are the URL for the same-name member in "data"
        resources: React.PropTypes.instanceOf(Immutable.Map),
    },
    getDefaultProps() {
        return {resources: {}};
    },
    render() {
        let renderedColumns = [];
        this.props.columns.forEach(columnName => {
            let columnData = this.props.data.get(columnName);
            if (columnData) {
                columnData = columnData.toString();
            }

            let columnLink = '';
            if (columnName === 'name')
                columnLink = this.props.resources['self'];
            else {
                columnLink = this.props.resources[columnName];
            }

            renderedColumns.push(<ResultCell key={columnName} data={columnData} link={columnLink}/>);
        }, this);
        if (this.props.data.get('drupal_path')) {
            renderedColumns.push(<ResultCell key="drupal_path" data="Show" link={this.props.data.get('drupal_path')}/>);
        }
        return (
            <tr className="resultComponent">
                {renderedColumns}
            </tr>
        );
    }
});


/** ResultList subcomponent that produces ItemView components.
 *
 * Props:
 * ------
 * @param (ImmutableJS.Map) data - The resource data provided by CantusJS.
 * @param (ImmutableJS.List of string) sortOrder - The order in which to display resources.
 *
 */
const ResultListItemView = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map),
        sortOrder: React.PropTypes.instanceOf(Immutable.List),
    },
    getDefaultProps() {
        return {data: Immutable.Map, sortOrder: Immutable.List()};
    },
    render() {
        const sortOrder = this.props.sortOrder.toJS();

        return (
            <div className="card-columns">
                {sortOrder.map(rid => {
                    return <ItemView
                        key={rid}
                        size="compact"
                        data={this.props.data.get(rid)}
                        resources={this.props.data.get('resources').get(rid)}
                    />;
                    },
                    this
                )}
            </div>
        );
    },
});


/** ResultList subcomponent that produces a table.
 *
 * Props:
 * ------
 * @param (ImmutableJS.Map) headers - ???
 * @param (ImmutableJS.Map) data - ???
 * - dontRender : TODO: replace this with the proper "doRender" thing, in the proper order
 * @param (ImmutableJS.List) sortOrder - ???
 */
const ResultListTable = React.createClass({
    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.instanceOf(Immutable.Map),
        headers: React.PropTypes.instanceOf(Immutable.Map),
        sortOrder: React.PropTypes.instanceOf(Immutable.List),
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null, sortOrder: []};
    },
    render() {
        let tableHeader = [];
        let columns = this.props.headers.get('fields').split(',');
        let extraFields = this.props.headers.get('extra_fields');
        if (null !== extraFields) {
            extraFields = extraFields.split(',');
            columns = columns.concat(extraFields);
        }

        // remove the field names in "dontRender"
        for (let field in this.props.dontRender) {
            let pos = columns.indexOf(this.props.dontRender[field]);
            if (pos >= 0) {
                columns.splice(pos, 1);
            }
        };

        columns.forEach(function(columnName) {
            // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
            let working = columnName.split("_");
            let polishedName = "";
            for (let i in working) {
                let rawr = working[i][0];
                rawr = rawr.toLocaleUpperCase();
                polishedName += rawr;
                polishedName += working[i].slice(1) + " ";
            }
            polishedName = polishedName.slice(0, polishedName.length);

            // now we can make the <th> cell itself
            tableHeader.push(<ResultCell key={columnName} data={polishedName} header={true} />);
        });

        return (
            <table className="table table-hover">
                <thead>
                    <tr className="resultTableHeader">
                        {tableHeader}
                    </tr>
                </thead>
                <tbody>
                    {this.props.sortOrder.map(id => {
                        return (
                            <ResultRow key={id}
                                       columns={columns}
                                       data={this.props.data.get(id)}
                                       resources={this.props.data.get('resources').get(id)}
                            />
                        );
                        },
                        this)
                    }
                </tbody>
            </table>
        );
    },
});


/** TODO
 *
 */
const ResultList = React.createClass({
    //
    // Props:
    // - dontRender
    // - data
    // - headers
    // - sortOrder
    //
    // NuclearJS State:
    // - searchResultsFormat (str) Whether to render the results in a "table" or with "ItemView" components.
    //

    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
    },
    getDefaultProps() {
        return {dontRender: []};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchResultsFormat: getters.searchResultsFormat,
            results: getters.searchResults
        };
    },
    render() {
        let results = <p className="card-block">(No results to display).</p>;

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (this.state.results) {
            if ('table' === this.state.searchResultsFormat) {
                results = <ResultListTable dontRender={this.props.dontRender}
                                           data={this.state.results}
                                           headers={this.state.results.get('headers')}
                                           sortOrder={this.state.results.get('sort_order')}/>;
            }
            else {
                results = <ResultListItemView data={this.state.results} sortOrder={this.state.results.get('sort_order')}/>;
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
    //
    // State:
    // - page (int) Current page in the search results.
    // - totalPages (int) Total number of result pages.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            page: getters.searchResultsPage,
            totalPages: getters.searchResultsPages,
        };
    },
    changePage: function(button) {
        // Determine which page-change button was clicked then emit the setPage() signal.
        //

        let newPage = this.state.page;

        switch (button.target.value) {
            case 'previous':
                newPage -= 1;
                break;
            case 'next':
                newPage += 1;
                break;
            case 'first':
                newPage = 1;
                break;
            case 'last':
                newPage = this.state.totalPages;
                break;
        }

        if (newPage < 1 || newPage > this.state.totalPages) { /* do nothing! */ }
        else { signals.setPage(newPage); signals.submitSearchQuery(); }
    },
    render: function() {
        return (
            <div className="btn-group paginator" role="group" aria-label="paginator">
                <button type="button" className="btn btn-secondary" name="pages"
                        value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="previous" onClick={this.changePage}>&lt;</button>
                <button type="button" className="blankOfBlank btn btn-secondary">
                    {this.state.page} of {this.state.totalPages}
                </button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});


var PerPageSelector = React.createClass({
    // Allows users to choose the number of search results shown on a page.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {perPage: getters.searchResultsPerPage};
    },
    onChange(event) {
        signals.setPerPage(Number(event.target.value));
        signals.submitSearchQuery();
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
                           value={this.state.perPage}
                           onChange={this.onChange}
                           />
                </div>
            </fieldset>
        );
    }
});


/** Radio button group for the "SearchResultsFormat" Store.
 */
const RenderAsSelector = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {format: getters.searchResultsFormat};
    },
    onChange(event) {
        signals.setSearchResultsFormat(event.target.value);
    },
    render() {
        let viewChecked = false;
        let tableChecked = false;

        if ('table' === this.state.format) {
            tableChecked = true;
        } else {
            viewChecked = true;
        }

        return (
            <form>
                <div className="radio">
                    <label>
                        <input type="radio" name="renderAs" id="renderAsView" value="ItemView"
                               checked={viewChecked} onChange={this.onChange}/>
                        Render as Views
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" name="renderAs" id="renderAsTable" value="table"
                               checked={tableChecked} onChange={this.onChange}/>
                        Render as a Table
                    </label>
                </div>
            </form>
        );
    }
});


var ErrorMessage = React.createClass({
    //

    propTypes: {
        code: React.PropTypes.number,
        reason: React.PropTypes.string,
        response: React.PropTypes.string,
    },
    render() {
        let alertType = 'warning';
        let message = '';

        if (404 === this.props.code) {
            message = <p>The search returned no results.</p>;
        } else if (502 === this.props.code) {
            message = (
                <div>
                    <p>
                        Part of the CANTUS server is not working. You may try the same search
                        again in a few minutes, but it may also be a programming error.
                    </p>
                    <p>
                        Technical information: Abbot returned 502.
                    </p>
                </div>
            );
        } else if (this.props.code < 500) {
            alertType = 'danger';
            message = (
                <div>
                    <strong>Client Error</strong>
                    <p>This probably means that something in the browser made a mistake.</p>
                    <p>Technical information: {this.props.response}</p>
                </div>
            );
        } else {
            alertType = 'danger';
            message = (
                <div>
                    <strong>Server Error</strong>
                    <p>This probably means that something in the server made a mistake.</p>
                    <p>Technical information: {this.props.response}</p>
                </div>
            );
        }

        alertType = `alert alert-${alertType}`;
        return <div className={alertType}>{message}</div>;
    },
});


/** TODO: rename this to "ResultList" and the other component to something else
 *
 * TODO: this.props.dontRender (where does it come from? How to specify it? Should be NuclearJS.
 */
const ResultListFrame = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return { error: getters.searchError };
    },
    render() {

        let errorMessage = '';
        if (null !== this.state.error) {
            // TODO: this causes a 24px high empty space in the output
            // TODO: use AlertView for this *sometimes* (depending on what the error is)
            // TODO: maybe I should move the "404" responsibility to ResultList, and everything else happens here with AlertView?
            errorMessage = <ErrorMessage code={this.state.error.get('code')}
                                         reason={this.state.error.get('reason')}
                                         response={this.state.error.get('response')}
                                         />;
        }

        let results = '';
        if (null !== this.state.results) {
            results = <ResultList dontRender={this.props.dontRender}/> ;
        }

        return (
            <div className="resultListFrame">
                {errorMessage}
                {results}
                <Paginator/>
                <PerPageSelector/>
                <RenderAsSelector/>
            </div>
        );
    }
});


export {ResultListFrame};
export default ResultListFrame;
