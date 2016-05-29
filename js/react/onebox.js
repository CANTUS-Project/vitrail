// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/onebox.js
// Purpose:                React components for the Vitrail "Onebox Search."
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

import {Immutable} from 'nuclear-js';
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import PageHeader from 'react-bootstrap/lib/PageHeader';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';
import ResultList from './result_list';
import {AlertView} from './vitrail';


const searchFieldExamples = Immutable.OrderedMap({
    'Phrases': <pre>{'"gloria in excelsis"'}</pre>,
    'Look in a Field': <pre>{'genre:antiphon'}</pre>,
    'Phrase in a Field': <pre>{'genre:"Antiphon Verse"'}</pre>,
    'Boolean Operators (AND)': <pre>{'incipit:gloria AND genre:psalm'}</pre>,
    '(OR)': <pre>{'incipit:gloria OR incipit:deus'}</pre>,
    '(NOT)': <pre>{'incipit:gloria NOT genre:InR'}</pre>,
    'Term Grouping': <pre>{'finalis:C AND (mode:6T OR differentia:A01)'}</pre>,
    'Grouping on a Field': <pre>{'finalis:C AND mode:(5T OR 6T)'}</pre>,
    'Wildcard *': [<pre key="1">{'antiphon*'}</pre>, '(matches "antiphon" and "antiphoner")'],
    'Wildcard ?': [<pre key="1">{'antiphon?'}</pre>, '(matches "antiphone" and "antiphons" but not "antiphon" or "antiphoner")'],
    'Combined Wildcards': [<pre key="1">{'christ?*'}</pre>, '(matches "christe," "christus," "christmas," "christopher," etc.)'],
    'Require a Value in a Field': <pre>{'+type:genre'}</pre>,
    'Forbid a Value in a Field': <pre>{'-type:genre'}</pre>,
    'Require the Field Has any Value': <pre>{'+differentia:*'}</pre>,
});


/** SearchBox: primary textual search field for the user.
 *
 * This component connects to the "SearchQuery" store by putting its contents in the "any" field.
 *
 * State
 * -----
 * @param (str) searchQuery - value of getters.searchQuery
 */
const SearchBox = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {searchQuery: getters.searchQuery};
    },
    handleChange(event) {
        signals.setSearchQuery({any: event.target.value});
    },
    shouldComponentUpdate(nextProps, nextState) {
        // We should only update if *our* field changes value.
        if (this.state.searchQuery.get('any') === nextState.searchQuery.get('any')) {
            return false;
        }

        return true;
    },
    render() {
        return (
            <FormControl
                type="search"
                id="searchQuery"
                value={this.state.searchQuery.get('any')}
                onChange={this.handleChange}
                label="Search Query"
                buttonAfter={<Button type="submit" value="Search">{`Search`}</Button>}
            />
        );
    },
});


/** OneboxSearch: full "onebox search" widget, with search box, settings, and results.
 *
 * Props
 * -----
 * @param (ReactElement) children - Provided by react-router, expected to be ItemViewOverlay.
 *
 * State
 * -----
 * @param (bool) showHelp - Whether to display the AlertView modal subcomponent with help on the
 *     permitted query syntax.
 */
const OneboxSearch = React.createClass({
    // Complete OneboxSearch widget.
    //

    propTypes: {
        children: React.PropTypes.element,
    },
    componentWillMount() {
        // clear the search query and previously-loaded results
        signals.setSearchQuery('clear');
        signals.loadSearchResults('reset');
    },
    handleSubmit(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        signals.submitSearchQuery();
    },
    getInitialState() {
        return {showHelp: false};
    },
    handleShowHelp() {
        this.setState({showHelp: !this.state.showHelp});
    },
    render() {
        const help = (
            <Modal show={this.state.showHelp} onHide={this.handleShowHelp} >
                <AlertView class="info" fields={searchFieldExamples}>
                    {`Examples of Search Queries`}
                </AlertView>
                <Modal.Footer><Button onClick={this.handleShowHelp}>{`Close`}</Button></Modal.Footer>
            </Modal>
        );

        return (
            <div className="container">
                {help}
                <PageHeader>
                    {`Onebox Search\u2003`}
                    <small>
                        <i>{`Standard search box with advanced capabilities.\u2003`}</i>
                        <Button bsStyle="info" onClick={this.handleShowHelp}>
                            <Glyphicon glyph="question-sign"/>
                        </Button>
                    </small>
                </PageHeader>
                <form onSubmit={this.handleSubmit}>
                    <SearchBox/>
                </form>
                <ResultList/>
                {this.props.children}
            </div>
        );
    },
});


export {OneboxSearch, SearchBox};
export default OneboxSearch;
