// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/templatesearch.src.js
// Purpose:                TemplateSearch React component for Vitrail.
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
import {ResultListFrame} from "./vitrail.src";


function encloseWithQuotes(query) {
    // Given a string with a search query, remove surrounding whitespace. Then if there is a space
    // character in the string, ensure the first and last characters are a double quote.

    query = query.trim();
    if (query.includes(' ')) {
        if ('"' !== query.slice(0, 1)) {
            query = '"' + query;
        }
        if ('"' !== query.slice(-1)) {
            query = query + '"';
        }
    }
    return query
};


var TemplateTypeSelector = React.createClass({
    // Type selection component for the TemplateSearch.
    propTypes: {
        // A function that deals with changing the resource type when it is called with a string,
        // either "chants", "sources", "indexers", or "feasts".
        chooseNewType: React.PropTypes.func.isRequired,
        activeType: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {activeType: null};
    },
    chooseNewType: function(event) {
        let newType = 'chants';

        switch (event.target.id) {
            case 'indexersTypeButton':
                newType = 'indexers';
                break;

            case 'sourcesTypeButton':
                newType = 'sources';
                break;

            case 'feastsTypeButton':
                newType = 'feasts';
                break;
        }

        this.props.chooseNewType(newType);
    },
    render: function() {
        let className = 'btn btn-secondary-outline';
        let classNameActive = 'btn btn-secondary-outline active';

        let buttonProps = {
            'chants': {'className': className, 'aria-pressed': 'false'},
            'indexers': {'className': className, 'aria-pressed': 'false'},
            'sources': {'className': className, 'aria-pressed': 'false'},
            'feasts': {'className': className, 'aria-pressed': 'false'}
        };

        if (null !== this.props.activeType) {
            buttonProps[this.props.activeType]['aria-pressed'] = 'true';
            buttonProps[this.props.activeType]['className'] = classNameActive;
        }

        return (
            <div>
                <div className="btn-group" htmlRole="group" aria-label="resource type selector">
                    <button id="chantsTypeButton" type="button" className={buttonProps.chants.className}
                            aria-pressed={buttonProps.chants['aria-pressed']} onClick={this.chooseNewType}>
                            Chants</button>
                    <button id="feastsTypeButton" type="button" className={buttonProps.feasts.className}
                            aria-pressed={buttonProps.feasts['aria-pressed']} onClick={this.chooseNewType}>
                            Feasts</button>
                    <button id="indexersTypeButton" type="button" className={buttonProps.indexers.className}
                            aria-pressed={buttonProps.indexers['aria-pressed']} onClick={this.chooseNewType}>
                            Indexers</button>
                    <button id="sourcesTypeButton" type="button" className={buttonProps.sources.className}
                            aria-pressed={buttonProps.sources['aria-pressed']} onClick={this.chooseNewType}>
                            Sources</button>
                </div>
            </div>
        );
    }
});


var TemplateSearchField = React.createClass({
    // A single field in the TemplateSearch template.
    //

    propTypes: {
        // The field name according to the Cantus API.
        field: React.PropTypes.string.isRequired,
        // The field name displayed in the GUI. If omitted, the "field" is displayed.
        displayName: React.PropTypes.string,
        // You know... the field contents.
        contents: React.PropTypes.string,
        // And a function to call when the contents change!
        updateFieldContents: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {displayName: null, contents: ''};
    },
    render: function() {
        let displayName = this.props.displayName || this.props.field;
        let fieldID = `template-field-${this.props.field}`;

        return (
            <fieldset className="form-group row">
                <label className="col-sm-2">{displayName}</label>
                <div className="col-sm-10">
                    <input id={fieldID}
                           type="text"
                           className="form-control"
                           value={this.props.contents}
                           onChange={this.props.updateFieldContents}
                           />
                </div>
            </fieldset>
        );
    }
});


var TemplateSearchFields = React.createClass({
    // All the fields in a TemplateSearch template.
    //
    // Contained by TemplateSearchTemplate.
    // Contains a bunch of TemplateSearchField.
    //

    propTypes: {
        // A function that accepts two arguments: field name (according to the Cantus API) and its
        // new contents.
        updateField: React.PropTypes.func.isRequired,
        // A list of objects, each with three members: 'field', 'displayName', and 'contents'.
        // These are the internal and GUI names for the fields required in this template, plus the
        // current contents of the field.
        fieldNames: React.PropTypes.arrayOf(React.PropTypes.shape({
            field: React.PropTypes.string,
            displayName: React.PropTypes.string,
            contents: React.PropTypes.string
        })).isRequired
    },
    updateFieldContents: function(event) {
        // Accepts change event for one of the "TemplateSearchField" components, then calls the
        // updateField() function with appropriate arguments to pass changes "up."

        // Find the proper name of the modified field. Target is a TemplateSearchField, and its
        // @id starts with "template-field-".
        let fieldName = event.target.id.slice('template-field-'.length);

        // Now let our bosses know that a field changed!
        this.props.updateField(fieldName, event.target.value);
    },
    render: function() {
        let renderedFields = [];
        let fieldNames = this.props.fieldNames;
        fieldNames.forEach(function(field, index) {
            let fieldKey = `template-field-${index}`;

            renderedFields.push(<TemplateSearchField key={fieldKey}
                                                     field={field.field}
                                                     displayName={field.displayName}
                                                     contents={field.contents}
                                                     updateFieldContents={this.updateFieldContents}
                                                     />);
        }, this);

        return (
            <div className="card">
                <div className="card-block">
                    <form>{renderedFields}</form>
                </div>
            </div>
        );
    }
});


var TemplateSearchTemplate = React.createClass({
    // For TemplateSearch, this is the template. This just selects the proper sub-component, but it
    // leaves TemplateSearch much cleaner.
    //

    propTypes: {
        // A function that accepts two arguments: field name (according to the Cantus API) and its
        // new contents.
        updateField: React.PropTypes.func.isRequired,
        // The resource type for the template.
        type: React.PropTypes.oneOf(['chants', 'feasts', 'indexers', 'sources'])
    },
    updateField: function(name, value) {
        // Given the name of a field that was modified, and its new value, update our internal state
        // then tell our boss it was updated.
        let contents = this.state.contents;
        contents[name] = value;
        this.setState({contents: contents});
        this.props.updateField(name, value);
    },
    getInitialState: function() {
        // - contents: An object to store template field contents. This starts off empty, and has
        //             members added as this.updateField() is called. When this.props.type is
        //             changed, "contents" is replaced with an empty object.
        return {contents: {}};
    },
    getFieldContents: function(name) {
        // Return the currently-held contens of the "name" field or an empty string if the field has
        // not been set.
        if (undefined !== this.state.contents[name]) {
            return this.state.contents[name];
        } else {
            return '';
        }
    },
    componentWillReceiveProps: function(nextProps) {
        // If the nextProps.type is different from this.props.type, we should empty this.contents.
        if (nextProps.type !== this.props.type) {
            this.setState({contents: {}});
        }
    },
    render: function() {
        let fieldNames = [];

        switch (this.props.type) {
            case 'chants':
                fieldNames = [
                    {'field': 'incipit', 'displayName': 'Incipit'},
                    {'field': 'full_text', 'displayName': 'Full Text (standard spelling)'},
                    {'field': 'full_text_manuscript', 'displayName': 'Full Text (manuscript spelling)'},
                    {'field': 'id', 'displayName': 'ID'},
                    {'field': 'source', 'displayName': 'Source Name'},
                    {'field': 'marginalia', 'displayName': 'Marginalia'},
                    {'field': 'feast', 'displayName': 'Feast'},
                    {'field': 'office', 'displayName': 'Office'},
                    {'field': 'genre', 'displayName': 'Genre'},
                    {'field': 'folio', 'displayName': 'Folio'},
                    {'field': 'sequence', 'displayName': 'Sequence'},
                    {'field': 'position', 'displayName': 'Position'},
                    {'field': 'cantus_id', 'displayName': 'Cantus ID'},
                    {'field': 'mode', 'displayName': 'Mode'},
                    {'field': 'differentia', 'displayName': 'Differentia'},
                    {'field': 'finalis', 'displayName': 'Finalis'},
                    {'field': 'volpiano', 'displayName': 'Volpiano'},
                    {'field': 'notes', 'displayName': 'Notes'},
                    {'field': 'cao_concordances', 'displayName': 'CAO Concordances'},
                    {'field': 'siglum', 'displayName': 'Siglum'},
                    {'field': 'proofreader', 'displayName': 'Proofreader'},
                    {'field': 'melody_id', 'displayName': 'Melody ID'}
                ];
                break;

            case 'feasts':
                fieldNames = [
                    {'field': 'name', 'displayName': 'Name'},
                    {'field': 'description', 'displayName': 'Description'},
                    {'field': 'date', 'displayName': 'Date'},
                    {'field': 'feast_code', 'displayName': 'Feast Code'}
                ];
                break;

            case 'indexers':
                fieldNames = [
                    {'field': 'display_name', 'displayName': 'Full Name'},
                    {'field': 'given_name', 'displayName': 'Given Name'},
                    {'field': 'family_name', 'displayName': 'Family Name'},
                    {'field': 'institution', 'displayName': 'Institution'},
                    {'field': 'city', 'displayName': 'City'},
                    {'field': 'country', 'displayName': 'Country'},
                ];
                break;

            case 'sources':
                fieldNames = [
                    {'field': 'title', 'displayName': 'Title'},
                    {'field': 'summary', 'displayName': 'Summary'},
                    {'field': 'description', 'displayName': 'Description'},
                    {'field': 'rism', 'displayName': 'RISM'},
                    {'field': 'siglum', 'displayName': 'Siglum'},
                    {'field': 'provenance', 'displayName': 'Provenance'},
                    {'field': 'date', 'displayName': 'Date'},
                    {'field': 'century', 'displayName': 'Century'},
                    {'field': 'notation_style', 'displayName': 'Notation Style'},
                    {'field': 'editors', 'displayName': 'Editors'},
                    {'field': 'indexers', 'displayName': 'Indexers'},
                    {'field': 'proofreaders', 'displayName': 'Proofreaders'},
                    {'field': 'segment', 'displayName': 'Database Segment'},
                    {'field': 'source_status_desc', 'displayName': 'Source Status'},
                    {'field': 'liturgical_occasions', 'displayName': 'Liturgical Occasions'},
                    {'field': 'indexing_notes', 'displayName': 'Indexing Notes'},
                    {'field': 'indexing_date', 'displayName': 'Indexing Date'},
                ];
                break;
        }

        // Map the "contents" into every field
        fieldNames.map(function (field) {
            field['contents'] = this.getFieldContents(field.field);
            return field;
        }, this);

        return <TemplateSearchFields updateField={this.updateField}
                                     fieldNames={fieldNames}
                                     /> ;
    }
});


var TemplateSearch = React.createClass({
    getInitialState: function() {
        // - searchFor (object): members are fields with strings as values
        // - page
        // - perPage
        // - resourceType: the currently-active template ('chants', 'sources', 'indexers', 'feasts')
        // - currentSearch: terms of the current search (i.e., what's in the boxes right now)
        return {page: 1, perPage: 10, searchFor: {}, resourceType: 'chants', currentSearch: ''};
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        let newPage = 1;
        let curPage = this.state.page;

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
        // A function that deals with changing the resource type when it is called with a string,
        // either "chants", "sources", "indexers", or "feasts".
        // TODO: rewrite this
        // TODO: when you rewrite this, make sure you clear the "searchFor" object when you change type
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null,
                       searchFor: {}});
    },
    submitSearch: function() {
        let searchFor = this.state.searchFor;
        let query = '';

        for (let field in searchFor) {
            query += ` ${field}:${encloseWithQuotes(searchFor[field])}`;
        }

        // remove leading space
        query = query.slice(1);

        this.setState({currentSearch: query, page: 1, errorMessage: null});
    },
    updateField: function(fieldName, newContents) {
        // Update the searched-for value of "fieldName" to "newContents".
        let searchFor = this.state.searchFor;
        searchFor[fieldName] = newContents;
        this.setState({'searchFor': searchFor});
    },
    render: function() {
        // TODO: find a better way to manage the state, because this is stupid.

        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        let dontRender = ['id', 'type'];

        // TODO: refactor "ResultListFrame" so it doesn't show anything if the "searchQuery" is null or sthg
        return (
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-block">
                        <h2 className="card-title">Template Search</h2>
                        <TemplateTypeSelector chooseNewType={this.changeResourceType}
                                              activeType={this.state.resourceType}
                                              />
                    </div>
                    <TemplateSearchTemplate type={this.state.resourceType} updateField={this.updateField}/>
                    <div className="card-block">
                        <button className="btn btn-primary-outline" onClick={this.submitSearch}>Search</button>
                    </div>
                </div>
                <div>
                    <ResultListFrame resourceType={this.state.resourceType}
                                     dontRender={dontRender}
                                     perPage={this.state.perPage}
                                     page={this.state.page}
                                     searchQuery={this.state.currentSearch}
                                     changePage={this.changePage}
                                     cantus={window['temporaryCantusJS']}
                                     doGenericGet={false}
                    />
                </div>
            </div>
        );
    }
});


export {TemplateSearch, TemplateSearchTemplate, TemplateSearchFields, TemplateSearchField,
        TemplateTypeSelector};
export default TemplateSearch;
