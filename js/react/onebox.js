// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/onebox.js
// Purpose:                React components for the Vitrail "Onebox Search."
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
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import Input from 'react-bootstrap/lib/Input';
import Modal from 'react-bootstrap/lib/Modal';
import PageHeader from 'react-bootstrap/lib/PageHeader';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';
import {ResultListFrame} from './result_list';
import {AlertView} from './vitrail';


const SearchBox = React.createClass({
    // Generic search box.
    //
    // This component is designed to be used as the primary search box visible for the user at the
    // moment. This box's contents are always given to the SearchQuery store as the "any" field.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchQuery: getters.searchQuery,
        };
    },
    onChange(event) {
        signals.setSearchQuery({'any': event.target.value});
    },
    shouldComponentUpdate(nextProps, nextState) {
        // We should only update if *our* field changes value.
        if (this.state.searchQuery.get('any') !== nextState.searchQuery.get('any')) {
            return true;
        } else {
            return false;
        }
    },
    render() {
        return (
            <Input type="search"
                   id="searchQuery"
                   value={this.state.searchQuery.get('any')}
                   onChange={this.onChange}
                   label="Search Query"
                   buttonAfter={<Button type="submit" value="Search">Search</Button>}
            />
        );
    }
});


const OneboxSearch = React.createClass({
    // Complete OneboxSearch widget.
    //

    componentWillMount() {
        // clear the search query
        signals.setSearchQuery('clear');
    },
    submitSearch(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        signals.submitSearchQuery();
    },
    getInitialState() {
        return {showHelp: false};
    },
    toggleShowHelp() {
        this.setState({showHelp: !this.state.showHelp});
    },
    render() {
        const examples = Immutable.OrderedMap({
            'Phrases': <pre>{'"gloria in excelsis"'}</pre>,
            'Look in a Field': <pre>{'genre:antiphon'}</pre>,
            'Phrase in a Field': <pre>{'genre:"Antiphon Verse"'}</pre>,
            'Boolean Operators (AND)': <pre>{'incipit:gloria AND genre:psalm'}</pre>,
            '(OR)': <pre>{'incipit:gloria OR incipit:deus'}</pre>,
            '(NOT)': <pre>{'incipit:gloria NOT genre:InR'}</pre>,
            'Term Grouping': <pre>{'finalis:C AND (mode:6T OR differentia:A01)'}</pre>,
            'Grouping on a Field': <pre>{'finalis:C AND mode:(5T OR 6T)'}</pre>,
            'Wildcard *': [<pre>{'antiphon*'}</pre>, '(matches "antiphon" and "antiphoner")'],
            'Wildcard ?': [<pre>{'antiphon?'}</pre>, '(matches "antiphone" and "antiphons" but not "antiphon" or "antiphoner")'],
            'Combined Wildcards': [<pre>{'christ?*'}</pre>, '(matches "christe," "christus," "christmas," "christopher," etc.)'],
            'Require a Value in a Field': <pre>{'+type:genre'}</pre>,
            'Forbid a Value in a Field': <pre>{'-type:genre'}</pre>,
            'Require the Field Has any Value': <pre>{'+differentia:*'}</pre>,
        });

        let help = (
            <Modal show={this.state.showHelp} onHide={this.toggleShowHelp} >
                <AlertView class="info" message="Examples of Search Queries" fields={examples}/>
                <Modal.Footer><Button onClick={this.toggleShowHelp}>Close</Button></Modal.Footer>
            </Modal>
        );

        return (
            <div className="container">
                {help}
                <PageHeader>
                    Onebox Search&emsp;
                    <small>
                        <i>Standard search box with advanced capabilities.</i>&emsp;
                        <Button bsStyle="info" onClick={this.toggleShowHelp}>?</Button>
                    </small>
                </PageHeader>
                <form onSubmit={this.submitSearch}>
                    <SearchBox/>
                </form>
                <ResultListFrame/>
            </div>
        );
    }
});


export {OneboxSearch, SearchBox};
export default OneboxSearch;
