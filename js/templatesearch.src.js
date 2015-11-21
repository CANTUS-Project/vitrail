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


import React from 'react';
import {ResultListFrame} from './vitrail.src';
import getters from './nuclear/getters';
import reactor from './nuclear/reactor';
import signals from './nuclear/signals';


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

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            resourceType: getters.resourceType,
        };
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

        signals.setSearchQuery('clear');
        signals.setResourceType(newType);
    },
    supportedTypes: ['chants', 'feasts', 'indexers', 'sources'],
    componentWillMount: function() {
        // If the TemplateSearch initializes and the "resourceType" isn't one of the types for which
        // we have a template, we'll set it to "chants." If we set it with the signal, NuclearJS
        // will tell all the other components about it, but our initial rendering will still use the
        // state from before this function was called, and will ignore the updated state NuclearJS
        // offered... so we have to *both* call the signal *and* set our own state.
        if (!this.supportedTypes.includes(this.state.resourceType)) {
            signals.setResourceType('chants');
        }
        this.setState({resourceType: 'chants'});
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

        if (this.supportedTypes.includes(this.state.resourceType)) {
            buttonProps[this.state.resourceType]['aria-pressed'] = 'true';
            buttonProps[this.state.resourceType]['className'] = classNameActive;
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
    },
    getDefaultProps: function() {
        return {displayName: null, contents: ''};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchQuery: getters.searchQuery,
        };
    },
    onChange: function(event) {
        let post = {};
        post[this.props.field] = event.target.value;
        signals.setSearchQuery(post);
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // We should only update if *our* field changes value.
        let field = this.props.field;
        if (this.state.searchQuery.get(field) !== nextState.searchQuery.get(field)) {
            return true;
        } else if (this.props !== nextProps) {
            return true;
        } else {
            return false;
        }
    },
    render: function() {
        let displayName = this.props.displayName || this.props.field;
        let fieldID = `template-field-${this.props.field}`;
        let contents = '';

        if (this.state.searchQuery.has(this.props.field)) {
            contents = this.state.searchQuery.get(this.props.field);
        }

        return (
            <fieldset className="form-group row">
                <label className="col-sm-2 text-right">{displayName}</label>
                <div className="col-sm-10">
                    <input id={fieldID}
                           type="text"
                           className="form-control"
                           value={contents}
                           onChange={this.onChange}
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
    // State:
    // - isCollapsed (bool) Whether the fields are actually shown (if "false," the default) or the
    //   component should be collapsed to save space.

    propTypes: {
        // A list of objects, each with three members: 'field', 'displayName', and 'contents'.
        // These are the internal and GUI names for the fields required in this template, plus the
        // current contents of the field.
        fieldNames: React.PropTypes.arrayOf(React.PropTypes.shape({
            field: React.PropTypes.string,
            displayName: React.PropTypes.string,
            contents: React.PropTypes.string
        })).isRequired,
    },
    getInitialState: function() {
        return {isCollapsed: false};
    },
    toggleCollapsion: function() {
        // Toggle this.state.isCollapsed
        this.setState({isCollapsed: !this.state.isCollapsed});
    },
    render: function() {
        let buttonText = 'Collapse Fields';
        let fieldStyle = {};
        if (this.state.isCollapsed) {
            fieldStyle['display'] = 'none';
            buttonText = 'Expand Fields';
        }

        return (
            <div className="card">
                <div className="card-header">
                    <button className="btn btn-primary-outline" onClick={this.toggleCollapsion}>{buttonText}</button>
                </div>
                <div className="card-block" style={fieldStyle}>
                    <form>
                        {this.props.fieldNames.map((field, index) =>
                            <TemplateSearchField key={`template-field${index}`}
                                                 field={field.field}
                                                 displayName={field.displayName}
                                                 />
                        )}
                    </form>
                </div>
            </div>
        );
    }
});


var TemplateSearchTemplate = React.createClass({
    // For TemplateSearch, this is the template. This just selects the proper sub-component, but it
    // leaves TemplateSearch much cleaner.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            resourceType: getters.resourceType,
        };
    },
    render: function() {
        let fieldNames = [];

        switch (this.state.resourceType) {
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

        return <TemplateSearchFields fieldNames={fieldNames}/> ;
    }
});


var TemplateSearch = React.createClass({
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchQuery: getters.searchQuery,
        };
    },
    getInitialState: function() {
        // - currentSearch: terms of the current search (i.e., what's in the boxes right now)
        return {currentSearch: ''};
    },
    submitSearch: function() {
        let searchFor = this.state.searchQuery
        let query = '';

        for (let field of searchFor.keys()) {
            query += ` ${field}:${encloseWithQuotes(searchFor.get(field))}`;
        }

        // remove leading space
        query = query.slice(1);

        this.setState({currentSearch: query, page: 1, errorMessage: null});
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
                        <TemplateTypeSelector/>
                    </div>
                    <TemplateSearchTemplate/>
                    <div className="card-block">
                        <button className="btn btn-primary-outline" onClick={this.submitSearch}>Search</button>
                    </div>
                </div>
                <div>
                    <ResultListFrame dontRender={dontRender}
                                     searchQuery={this.state.currentSearch}
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
