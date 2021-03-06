// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/result_list.js
// Purpose:                ResultList React components for Vitrail.
//
// Copyright (C) 2015, 2016, 2017 Christopher Antila
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

import {Immutable} from 'nuclear-js';
import {Link} from 'react-router';
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Modal from 'react-bootstrap/lib/Modal';
import Pagination from 'react-bootstrap/lib/Pagination';
import Panel from 'react-bootstrap/lib/Panel';
import Radio from 'react-bootstrap/lib/Radio';
import Table from 'react-bootstrap/lib/Table';
import Well from 'react-bootstrap/lib/Well';

import {SIGNALS as signals} from '../nuclear/signals';
import {reactor} from '../nuclear/reactor';
import {getters} from '../nuclear/getters';
import {AlertView} from './vitrail';
import {ItemView} from './itemview';
import {AddRemoveCollection} from './workspace';


/** A cell in the ResultListTable.
 *
 * Props:
 * ------
 * @param (string) children - The cell's contents.
 * @param (boolean) header - Whether to render this cell as <th> (otherwise as <td>).
 * @param (string) link - A URL for the table contents. If this starts with "http" then it is used
 *     as the @href attribute for an <a> element; otherwise, this is used as the @to attribute
 *     for a react-router <Link> element.
 */
const ResultCell = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        header: React.PropTypes.bool,
        link: React.PropTypes.string,
    },
    getDefaultProps() {
        return {data: '', header: false, link: ''};
    },
    render() {
        let post;

        // if the text data for this cell is longer than 55 characters, abbreviate it at 50 chars
        let data = this.props.children;
        // let data = this.props.data;
        if ('string' === typeof data && data.length > 55) {
            data = `${data.slice(0, 50)} ... (abbr.)`;
        }

        if (this.props.link) {
            if (this.props.link.startsWith('http')) {
                post = <a href={this.props.link}>{data}</a>;
            }
            else {
                post = <Link to={this.props.link}>{data}</Link>;
            }
        }
        else {
            post = data;
        }
        if (this.props.header) {
            post = <th>{post}</th>;
        }
        else {
            post = <td>{post}</td>;
        }
        return post;
    },
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
 * Props
 * -----
 * @param (array of string) columns - Names of the fields in "data" that should be rendered in this
 *     row. They will be rendered from left to right, in the order of this prop.
 * @param (ImmutableJS.Map) data - Map with data for a resource.
 * @param (ImmutableJS.Map) resources - Map with URLs for a resource.
 */
const ResultRow = React.createClass({
    contextTypes: {
        router: React.PropTypes.object,
    },
    propTypes: {
        // the column names to render, or the fields in "data" to render as columns
        columns: React.PropTypes.instanceOf(Immutable.List).isRequired,
        // the object to render into columns
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        // members here are the URL for the same-name member in "data"
        resources: React.PropTypes.instanceOf(Immutable.Map),
    },
    getDefaultProps() {
        return {resources: {}};
    },
    /** cleanColumn(): Prepare "columnData" to appear in a ResultCell.
     * @param (string or Immutable.List) columnData - Data to prepare.
     * @returns The argument as a well-formatted string.
     */
    cleanColumn(columnData) {
        if (columnData) {
            if (Immutable.List.isList(columnData)) {
                return columnData.join(', ');
            }
            else {
                return columnData.toString();
            }
        }
        return '';
    },
    /** getColumnLink(): Find the resources URL for this column.
     * @param (string) columnName - The column's name.
     * @return The URL for this column, or undefined.
     */
    getColumnLink(columnName) {
        if (columnName === 'name') {
            return this.props.resources.get('self');
        }
        else if (this.props.resources.has(`${columnName}_id`)) {
            return `${this.context.router.location.pathname}/${columnName}/${this.props.resources.get(`${columnName}_id`)}`;
        }
    },
    render() {
        let renderedColumns = this.props.columns.map((columnName) => {
            // if this column is for "folio," try to add "sequence" too
            if (columnName === 'folio' && this.props.data.has('sequence')) {
                return (
                    <ResultCell key={columnName} link={this.getColumnLink(columnName)}>
                        {`${this.cleanColumn(this.props.data.get('folio'))}/${this.cleanColumn(this.props.data.get('sequence'))}`}
                    </ResultCell>
                );
            }
            else {
                return (
                    <ResultCell key={columnName} link={this.getColumnLink(columnName)}>
                        {this.cleanColumn(this.props.data.get(columnName))}
                    </ResultCell>
                );
            }
        });

        // add a button to the ItemViewOverlay, if relevant
        if (this.props.data.get('type') === 'chant' || this.props.data.get('type') === 'source') {
            const url = `${this.context.router.location.pathname}/${this.props.data.get('type')}/${this.props.data.get('id')}`;
            renderedColumns = renderedColumns.push(
                <ResultCell key="itemview">
                    <Link to={url} className="btn btn-default btn-sm">{`View`}</Link>
                </ResultCell>
            );
        }

        // add the Collection add/remove buttons
        if (this.props.data.get('type') === 'chant') {
            renderedColumns = renderedColumns.push(
                <ResultCell key="collection-add">
                    <AddRemoveCollection rid={this.props.data.get('id')}/>
                </ResultCell>
            );
        }

        //
        return (
            <tr className="resultComponent">
                {renderedColumns}
            </tr>
        );
    },
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
            <div className="result-list-item-view">
                {sortOrder.map((rid) => {  /* eslint arrow-body-style: 0 */
                    return (
                        <ItemView
                            key={rid}
                            size="compact"
                            data={this.props.data.get(rid)}
                            resources={this.props.data.get('resources').get(rid)}
                        />
                    ); },
                    this
                )}
            </div>
        );
    },
});


/** ResultList subcomponent that produces a table.
 *
 * State:
 * ------
 * @param () columns - ?
 * @param () data - ?
 * @param () sortOrder - ?
 */
const ResultListTable = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            columns: getters.ResultListTable_columns,
            data: getters.searchResults,
            sortOrder: getters.resultsSortOrder,
        };
    },
    shouldComponentUpdate(nextProps, nextState) {
        // Is there any difference that would necessitate an update?
        if (this.props !== nextProps || this.state !== nextState) {
            // If so, are all the fields in the "sort order" already present in the "data?"
            for (const id of nextState.sortOrder.values()) {
                if (!nextState.data.has(id)) {
                    return false;
                }
            }
            // Reaching here, all the IDs are present
            return true;
        }
        else {
            return false;
        }
    },
    render() {
        const display = this.state.columns.get('display');
        const tableHeader = this.state.columns.get('names').map((name, key) =>
            <ResultCell key={name} header>{display.get(key)}</ResultCell>
        );

        return (
            <Table className="result-list-table" striped hover responsive>
                <thead>
                    <tr className="resultTableHeader">
                        {tableHeader}
                    </tr>
                </thead>
                <tbody>
                    {this.state.sortOrder.map((id) =>
                        <ResultRow key={id}
                            columns={this.state.columns.get('names')}
                            data={this.state.data.get(id)}
                            resources={this.state.data.getIn(['resources', id])}
                        />
                    ,
                        this)
                    }
                </tbody>
            </Table>
        );
    },
});


/** ResultListMultiplexer: container that decides whether to show ResultListTable or ResultListItemView.
 *
 * State:
 * ------
 * @param () searchResultsFormat - ?
 * @param () sortOrder - ?
 * @param () results - ?
 */
const ResultListMultiplexer = React.createClass({
    //
    // NuclearJS State:
    // - searchResultsFormat (str) Whether to render the results in a "table" or with "ItemView" components.
    // - results
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchResultsFormat: getters.searchResultsFormat,
            sortOrder: getters.resultsSortOrder,
            results: getters.searchResults,
        };
    },
    render() {
        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (this.state.results) {
            if ('table' === this.state.searchResultsFormat) {
                return <ResultListTable/>;
            }
            else {
                return <ResultListItemView data={this.state.results} sortOrder={this.state.sortOrder}/>;
            }
        }
        else {
            return <p className="card-block">{'(No results to display).'}</p>;
        }
    },
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
    handleClick(requestedPage) {
        // If the user clicked a page other than the current page, emit the setPage() signal.
        if (requestedPage !== this.state.page) {
            signals.setPage(requestedPage);
            signals.submittedServerRequest();
            signals.submitSearchQuery();
        }
    },
    render() {
        return (
            <Pagination
                bsSize="small"
                items={Math.max(1, this.state.totalPages)}
                activePage={Math.max(1, this.state.page)}
                onSelect={this.handleClick}
                prev={<Glyphicon glyph="chevron-left"/>}
                next={<Glyphicon glyph="chevron-right"/>}
                maxButtons={5}
                boundaryLinks={true}
            />
        );
    },
});


/** Choose the number of search results to display on every page.
 *
 * State (provided by NuclearJS):
 * ------------------------------
 * @param (int) perPage - The number of search results to display on every page.
 * @param (bool) showingCollection - From the "showingCollection" getter.
 */
const PerPageSelector = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {perPage: getters.searchResultsPerPage};
    },
    handleChange(event) {
        signals.setPerPage(Number(event.target.value));
        signals.submitSearchQuery();
    },
    render() {
        return (
            <FormGroup>
                <Col componentClass={ControlLabel} sm={3}>
                    {`Number of Results per Page:`}
                </Col>
                <Col sm={9}>
                    <FormControl
                        type="number"
                        name="perPage"
                        id="perPageSelector"
                        value={this.state.perPage}
                        onChange={this.handleChange}
                    />
                </Col>
            </FormGroup>
        );
    },
});


/** Radio button group for the "SearchResultsFormat" Store.
 */
const RenderAsSelector = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {format: getters.searchResultsFormat};
    },
    handleChange(event) {
        signals.setSearchResultsFormat(event.target.value);
    },
    render() {
        let viewChecked = false;
        let tableChecked = false;

        if ('table' === this.state.format) {
            tableChecked = true;
        }
        else {
            viewChecked = true;
        }

        return (
            <FormGroup>
                <Col componentClass={ControlLabel} sm={3}>
                    {`Show Results in...`}
                </Col>
                <Col sm={9}>
                    <Radio checked={tableChecked} onChange={this.handleChange} id="renderAsTable" value="table">
                        {`a Table`}
                    </Radio>
                    <Radio checked={viewChecked} onChange={this.handleChange} id="renderAsView" value="ItemView">
                        {`Views`}
                    </Radio>
                </Col>
            </FormGroup>
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

    handleCollapse() {
        this.setState({isExpanded: !this.state.isExpanded});
    },

    render() {
        const headerButton = (
            <Button bsSize="xs" bsStyle="primary" onClick={this.handleCollapse}>
                {(this.state.isExpanded) ? 'Hide Display Settings' : 'Show Display Settings'}
            </Button>
        );

        // NB: the .result-list-settings class is indeed needed for style purposes

        return (
            <Panel
                collapsible
                expanded={this.state.isExpanded}
                header={headerButton}
                className="result-list-settings"
            >
                <Form horizontal>
                    <PerPageSelector/>
                    <RenderAsSelector/>
                </Form>
            </Panel>
        );
    },
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
            message = <p>{`The search returned no results.`}</p>;
        }
        else if (502 === this.props.code) {
            technicalInfo = technicalInfo.set('Developer Message', 'Abbot returned 502');
            message = (
                <div>
                    <h2>{`Server Error`}</h2>
                    <p>
                        {`Part of the Cantus server is not working (called "Solr").`}
                    </p>
                    <p>
                        {`Sometimes this is a temporary problem, so you may try your search again in
                        a few minutes. However, if this problem continues for several minutes, please
                        report it to the developers, along with your search query.`}
                    </p>
                </div>
            );
        }
        else if (500 === this.props.code && 'Programmer Error' === this.props.reason) {
            message = (
                <div>
                    <h2>{`Server Error`}</h2>
                    <p>
                        {`The server indicates that it could not provide data because of an unhandled
                        error condition.`}
                    </p>
                    <p>
                        {`You may report this to the developers to help them fix the problem. Please
                        include your search query when you report the issue.`}
                    </p>
                </div>
            );
        }
        else if (this.props.code < 500) {
            technicalInfo = technicalInfo.set('Code', this.props.code);
            technicalInfo = technicalInfo.set('Reason', this.props.reason);
            message = (
                <div>
                    <h2>{`Client Error`}</h2>
                    <p>{`This probably means that something in the browser made a mistake.`}</p>
                </div>
            );
        }
        else {
            technicalInfo = technicalInfo.set('Code', this.props.code);
            technicalInfo = technicalInfo.set('Reason', this.props.reason);
            message = (
                <div>
                    <h2>{`Server Error`}</h2>
                    <p>{`This probably means that something in the server made a mistake.`}</p>
                </div>
            );
        }

        return (
            <AlertView class={alertType} fields={technicalInfo}>
                {message}
            </AlertView>
        );
    },
});


/** TODO
 *
 * State:
 * ------
 * @param () error - ?
 */
const ResultList = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            error: getters.searchError,
            loading: getters.loadingResults,
        };
    },
    render() {
        let errorMessage;
        if (this.state.error) {
            errorMessage = (
                <ErrorMessage
                    code={this.state.error.get('code')}
                    reason={this.state.error.get('reason')}
                    response={this.state.error.get('response')}
                />
            );
        }

        return (
            <Well className="result-list modal-container">
                <Modal container={this} show={this.state.loading}>
                    <Modal.Body className="loading-box">
                        <Glyphicon bsSize="large" glyph="cog"/>
                        {`loading...`}
                    </Modal.Body>
                </Modal>
                {errorMessage}
                <ResultListSettings/>
                <ResultListMultiplexer/>
                <Paginator/>
            </Well>
        );
    },
});


export {ResultList};
export default ResultList;
