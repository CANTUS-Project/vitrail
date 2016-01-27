// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/result_list.js
// Purpose:                ResultList React components for Vitrail.
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
//-------------------------------------------------------------------------------------------------

import {Immutable} from 'nuclear-js';
import {Link} from 'react-router';
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Input from 'react-bootstrap/lib/Input';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';

import {SIGNALS as signals} from '../nuclear/signals';
import {reactor} from '../nuclear/reactor';
import {getters} from '../nuclear/getters';
import {AlertView} from './vitrail';
import {ItemView, makeLinkToItemView} from './itemview';
import {AddRemoveCollection} from './workspace';


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
        data: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]).isRequired,
        header: React.PropTypes.bool,
        link: React.PropTypes.string,
    },
    getDefaultProps() {
        return {data: '', header: false, link: ''};
    },
    render() {
        let post;

        // if the text data for this cell is longer than 55 characters, abbreviate it at 50 chars
        let data = this.props.data;
        if ('string' === typeof data && data.length > 55) {
            data = `${data.slice(0, 50)} ... (abbr.)`;
        }

        if (this.props.link) {
            post = <a href={this.props.link}>{data}</a>;
        } else {
            post = data;
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
 * @param (string) colid - The collection ID being displayed, if applicable.
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
        //
        let renderedColumns = [];
        this.props.columns.forEach(columnName => {
            let columnData = this.props.data.get(columnName);
            if (columnData) {
                if (Immutable.List.isList(columnData)) {
                    // a few fields are given as lists
                    columnData = columnData.join(', ');
                }
                else {
                    columnData = columnData.toString();
                }
            }

            let columnLink;
            if (columnName === 'name')
                columnLink = this.props.resources['self'];
            else {
                columnLink = this.props.resources[columnName];
            }

            renderedColumns.push(<ResultCell key={columnName} data={columnData} link={columnLink}/>);
        }, this);

        //
        if (this.props.data.get('type') === 'chant' || this.props.data.get('type') === 'source') {
            const to = makeLinkToItemView(this.props.data.get('type'), this.props.data.get('id'));
            renderedColumns.push(
                <ResultCell key="itemview" data={(
                    <Link to={to} className="btn btn-default btn-sm">
                        View
                    </Link>
                )}/>
            );
        }

        // add the Collection add/remove buttons
        if (this.props.data.get('type') === 'chant') {
            renderedColumns.push(
                <ResultCell key="collection-add" data={(
                    <AddRemoveCollection rid={this.props.data.get('id')} colid={this.props.colid}/>
                )}/>
            );
        }

        //
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
            <div className="row">
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
 * @param (string) colid - The collection ID being displayed, if applicable.
 * @param (ImmutableJS.Map) headers - ???
 * @param (ImmutableJS.Map) data - ???
 * @param (ImmutableJS.List) sortOrder - ???
 */
const ResultListTable = React.createClass({
    propTypes: {
        colid: React.PropTypes.string,
        data: React.PropTypes.instanceOf(Immutable.Map),
        headers: React.PropTypes.instanceOf(Immutable.Map),
        sortOrder: React.PropTypes.instanceOf(Immutable.List),
    },
    getDefaultProps: function() {
        return {data: null, headers: null, sortOrder: []};
    },
    render() {
        let tableHeader = [];
        let columns = this.props.headers.get('fields').split(',');
        let extraFields = this.props.headers.get('extra_fields');
        if (null !== extraFields) {
            extraFields = extraFields.split(',');
            columns = columns.concat(extraFields);
        }

        // Remove the "id" field and, if the resource types are all the same, remove "type" too.
        // First find out whether all the "types" are the same.
        let dontInclude = ['id'];
        const firstResType = this.props.data.get(this.props.sortOrder.get(0)).get('type');
        let foundDifferent = false;
        for (let id of this.props.sortOrder.values()) {
            if (this.props.data.get(id).get('type') !== firstResType) {
                foundDifferent = true;
                break;
            }
        }
        if (!foundDifferent) {
            dontInclude.push('type');
        }

        // If all the fields are "chant" or "source" then we'll use predetermined order of columns.
        let columnsAlreadyAdjusted = false;
        if (!foundDifferent) {
            // we'll show only the fields called "primary" in the ItemView
            if ('chant' === firstResType) {
                columnsAlreadyAdjusted = true;
                //
                columns = [
                    'incipit',
                    'genre',
                    'office',
                    'feast',
                    'position',
                    'siglum',
                    'folio',
                    'sequence',
                    'mode',
                    'differentia',
                ];
            }
            else if ('source' === firstResType) {
                columnsAlreadyAdjusted = true;
                //
                columns = [
                    'rism',
                    'title',
                    'date',
                    'provenance',
                    'summary',
                ];
            }
        }

        // Now remove the unncessary fields.
        if (!columnsAlreadyAdjusted) {
            columns = columns.reduce((prev, curr) => {
                if (dontInclude.indexOf(curr) >= 0) {
                    return prev;
                }
                else {
                    prev.push(curr);
                    return prev;
                }
            }, []);
        }

        // Prepare the table header.
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
            <Table hover responsive>
                <thead>
                    <tr className="resultTableHeader">
                        {tableHeader}
                    </tr>
                </thead>
                <tbody>
                    {this.props.sortOrder.map(id => {
                        return (
                            <ResultRow key={id}
                                       colid={this.props.colid}
                                       columns={columns}
                                       data={this.props.data.get(id)}
                                       resources={this.props.data.get('resources').get(id)}
                            />
                        );
                        },
                        this)
                    }
                </tbody>
            </Table>
        );
    },
});


/** TODO
 *
 * Props:
 * ------
 * @param (string) colid - The collection ID being displayed, if applicable.
 */
const ResultList = React.createClass({
    //
    // NuclearJS State:
    // - searchResultsFormat (str) Whether to render the results in a "table" or with "ItemView" components.
    // - results
    //

    propTypes: {
        colid: React.PropTypes.string,
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
                results = <ResultListTable colid={this.props.colid}
                                           data={this.state.results}
                                           headers={this.state.results.get('headers')}
                                           sortOrder={this.state.results.get('sort_order')}/>;
            }
            else {
                results = <ResultListItemView data={this.state.results} sortOrder={this.state.results.get('sort_order')}/>;
            }
        }

        return (
            <Panel>
                {results}
            </Panel>
        );
    }
});


/** Pagination component for search results.
 *
 * State (provided by NuclearJS):
 * ------------------------------
 * @param (int) page - Currently displayed page in the search results.
 * @param (int) totalPages - Total number of pages in the currently displayed search results.
 */
const Paginator = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            page: getters.searchResultsPage,
            totalPages: getters.searchResultsPages,
        };
    },
    changePage(button) {
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
    render() {
        return (
            <ButtonGroup role="group" aria-label="paginator">
                <Button name="pages" value="first" onClick={this.changePage}>&lt;&lt;</Button>
                <Button name="pages" value="previous" onClick={this.changePage}>&lt;</Button>
                <Button>
                    {this.state.page} of {this.state.totalPages}
                </Button>
                <Button name="pages" value="next" onClick={this.changePage}>&gt;</Button>
                <Button name="pages" value="last" onClick={this.changePage}>&gt;&gt;</Button>
            </ButtonGroup>
        );
    }
});


/** Choose the number of search results to display on every page.
 *
 * State (provided by NuclearJS):
 * ------------------------------
 * @param (int) perPage - The number of search results to display on every page.
 */
const PerPageSelector = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {perPage: getters.searchResultsPerPage};
    },
    onChange(event) {
        signals.setPerPage(Number(event.target.value));
        signals.submitSearchQuery();
    },
    render() {
        // NOTE: the <div> down there only exists to help keep the <input> within col-sm-10
        return (
            <form>
                <Input type="number"
                       name="perPage"
                       id="perPageSelector"
                       value={this.state.perPage}
                       onChange={this.onChange}
                       label="Number of Results per Page"
                />
            </form>
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
                <Input type="radio"
                       label="Render as Views"
                       checked={viewChecked}
                       onChange={this.onChange}
                       id="renderAsView"
                       value="ItemView"
                />
                <Input type="radio"
                       label="Render as a Table"
                       checked={tableChecked}
                       onChange={this.onChange}
                       id="renderAsTable"
                       value="table"
                />
            </form>
        );
    }
});


/** Use AlertView to show an error message.
 *
 * This component returns an AlertView directly (that is, without "wrapping" it in anything). The
 * HTTP response code and reason are used to determine what message to show. The component currently
 * uses the following categories:
 * - 404: no results;
 * - 500: when the reason is "Programmer Error" we know this means a bug in Abbot;
 * - 502: this means Solr is on the fritz
 * - 4xx: generically says "the user agent made an error"
 * - 5xx: generically says "the server made an error"
 *
 * Props:
 * ------
 * @param (number) code - The HTTP response code.
 * @param (string) reason - The HTTP response reason.
 * @param (string) response - The body of the HTTP response.
 */
const ErrorMessage = React.createClass({
    propTypes: {
        code: React.PropTypes.number,
        reason: React.PropTypes.string,
        response: React.PropTypes.string,
    },
    render() {
        let alertType = 'danger';
        let message;
        let technicalInfo = Immutable.Map();

        if (404 === this.props.code) {
            alertType = 'warning';
            message = <p>The search returned no results.</p>;
        }
        else if (502 === this.props.code) {
            technicalInfo = technicalInfo.set('Developer Message', 'Abbot returned 502');
            message = (
                <div>
                    <h2>Server Error</h2>
                    <p>
                        Part of the CANTUS server is not working (called "Solr").
                    </p>
                    <p>
                        Sometimes this is a temporary problem, so you may try your search again in
                        a few minutes. However, if this problem continues for several minutes, please
                        report it to the developers, along with your search query.
                    </p>
                </div>
            );
        }
        else if (500 === this.props.code && 'Programmer Error' === this.props.reason) {
            message = (
                <div>
                    <h2>Server Error</h2>
                    <p>
                        The server indicates that it could not provide data because of an unhandled
                        error condition.
                    </p>
                    <p>
                        You may report this to the developers to help them fix the problem. Please
                        include your search query when you report the issue.
                    </p>
                </div>
            );
        }
        else if (this.props.code < 500) {
            technicalInfo = technicalInfo.set('Code', this.props.code);
            technicalInfo = technicalInfo.set('Reason', this.props.reason);
            message = (
                <div>
                    <h2>Client Error</h2>
                    <p>This probably means that something in the browser made a mistake.</p>
                </div>
            );
        }
        else {
            technicalInfo = technicalInfo.set('Code', this.props.code);
            technicalInfo = technicalInfo.set('Reason', this.props.reason);
            message = (
                <div>
                    <h2>Server Error</h2>
                    <p>This probably means that something in the server made a mistake.</p>
                </div>
            );
        }

        return (
            <AlertView class={alertType}
                       message={message}
                       fields={technicalInfo}
            />
        );
    },
});


/** Settings for the ResultList (per-page, render-as, etc.)
 *
 * State
 * -----
 * @param (bool) isExpanded - Whether the settings are all shown (if "true") or only the title is
 *     shown (if "false," the default).
 */
const ResultListSettings = React.createClass({
    getInitialState() {
        return {isExpanded: false};
    },
    toggleCollapsion(event) {
        // Toggle this.state.isExpanded
        if (event.target.className === 'panel-title') {
            this.setState({isExpanded: !this.state.isExpanded});
        }
    },
    render() {
        return (
            <ListGroupItem>
                <Panel collapsible expanded={this.state.isExpanded} onClick={this.toggleCollapsion} header="Display Settings">
                    <PerPageSelector/>
                    <RenderAsSelector/>
                </Panel>
            </ListGroupItem>
        );
    },
});


/** TODO: rename this to "ResultList" and the other component to something else
 *
 * @param (string) colid - The collection ID being displayed, if relevant.
 */
const ResultListFrame = React.createClass({
    propTypes: {
        colid: React.PropTypes.string,
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return { error: getters.searchError };
    },
    render() {

        let errorMessage;
        if (null !== this.state.error) {
            errorMessage = <ErrorMessage code={this.state.error.get('code')}
                                         reason={this.state.error.get('reason')}
                                         response={this.state.error.get('response')}
                                         />;
        }

        return (
            <Panel>
                <ListGroup fill>
                    {errorMessage}
                    <ResultListSettings/>
                    <ListGroupItem><ResultList colid={this.props.colid}/></ListGroupItem>
                    <ListGroupItem><Paginator/></ListGroupItem>
                </ListGroup>
            </Panel>
        );
    }
});


export {ResultListFrame};
export default ResultListFrame;
