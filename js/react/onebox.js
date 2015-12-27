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

import {ResultListFrame} from './result_list';


const SearchBox = React.createClass({
    propTypes: {
        // "contents" is the initial value in the search box
        contents: React.PropTypes.string
    },
    getDefaultProps() {
        return {contents: ''};
    },
    render() {
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


const OneboxSearch = React.createClass({
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


export {OneboxSearch, SearchBox};
export default OneboxSearch;
