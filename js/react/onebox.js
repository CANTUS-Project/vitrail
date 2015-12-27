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


import React from 'react';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';
import {ResultListFrame} from './result_list';


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
            <fieldset className="form-group row">
                <label htmlFor="#searchQuery" className="col-sm-2">Search Query</label>
                <div className="input-group col-sm-10">
                    <input id="searchQuery"
                           className="form-control form-control-search"
                           onChange={this.onChange}
                           type="search"
                           value={this.state.searchQuery.get('any')}
                    />
                    <span className="input-group-btn">
                        <button className="btn btn-secondary" type="submit" value="Search">Search</button>
                    </span>
                </div>
            </fieldset>
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
    render() {
        return (
            <div className="searchForm col-sm-12">
                <div className="searchSettings card">
                    <div className="card-block">
                        <h2 className="card-title">Onebox Search</h2>
                    </div>
                    <form onSubmit={this.submitSearch}>
                        <SearchBox/>
                    </form>
                </div>
                <div className="searchResults">
                    <ResultListFrame/>
                </div>
            </div>
        );
    }
});


export {OneboxSearch, SearchBox};
export default OneboxSearch;
