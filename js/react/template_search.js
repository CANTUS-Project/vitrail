// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/template_search.js
// Purpose:                TemplateSearch React component for Vitrail.
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
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Input from 'react-bootstrap/lib/Input';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Panel from 'react-bootstrap/lib/Panel';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import PageHeader from 'react-bootstrap/lib/PageHeader';

import {AlertView} from './vitrail';
import {ResultListFrame} from './result_list';
import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';


const TemplateTypeSelector = React.createClass({
    // Type selection component for the TemplateSearch.

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            resourceType: getters.resourceType,
        };
    },
    chooseNewType(event) {
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
    render() {
        const className = '';
        const classNameActive = 'active';

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
            <ButtonGroup role="group" aria-label="resource type selector">
                <Button id="chantsTypeButton" className={buttonProps.chants.className}
                        aria-pressed={buttonProps.chants['aria-pressed']} onClick={this.chooseNewType}>
                        Chants</Button>
                <Button id="feastsTypeButton" className={buttonProps.feasts.className}
                        aria-pressed={buttonProps.feasts['aria-pressed']} onClick={this.chooseNewType}>
                        Feasts</Button>
                <Button id="indexersTypeButton" className={buttonProps.indexers.className}
                        aria-pressed={buttonProps.indexers['aria-pressed']} onClick={this.chooseNewType}>
                        Indexers</Button>
                <Button id="sourcesTypeButton" className={buttonProps.sources.className}
                        aria-pressed={buttonProps.sources['aria-pressed']} onClick={this.chooseNewType}>
                        Sources</Button>
            </ButtonGroup>
        );
    }
});


const TemplateSearchField = React.createClass({
    // A single field in the TemplateSearch template.
    //

    propTypes: {
        // The field name according to the Cantus API.
        field: React.PropTypes.string.isRequired,
        // The field name displayed in the GUI. If omitted, the "field" is displayed.
        displayName: React.PropTypes.string,
    },
    getDefaultProps() {
        return {displayName: null, contents: ''};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            searchQuery: getters.searchQuery,
        };
    },
    onChange(event) {
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
    render() {
        const displayName = this.props.displayName || this.props.field;
        const fieldID = `template-field-${this.props.field}`;
        let contents;

        if (this.state.searchQuery.get(this.props.field)) {
            contents = this.state.searchQuery.get(this.props.field);
        }

        return (
            <Input id={fieldID}
                   type="text"
                   value={contents}
                   onChange={this.onChange}
                   label={displayName}
                   labelClassName="col-xs-2"
                   wrapperClassName="col-xs-10"
            />
        );
    }
});


const TemplateSearchFields = React.createClass({
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
    getInitialState() {
        return {isCollapsed: false};
    },
    toggleCollapsion(event) {
        // Toggle this.state.isCollapsed
        if (event.target.className === 'panel-title') {
            this.setState({isCollapsed: !this.state.isCollapsed});
        }
    },
    render() {
        let headerText = this.state.isCollapsed ? 'expand' : 'collapse';
        headerText = `Click or tap this header to ${headerText} the template.`

        return (
            <Panel header={headerText} collapsible expanded={!this.state.isCollapsed} onClick={this.toggleCollapsion}>
                <form className="form-horizontal">
                    {this.props.fieldNames.map((field, index) =>
                        <TemplateSearchField key={`template-field${index}`}
                                             field={field.field}
                                             displayName={field.displayName}
                                             />
                    )}
                </form>
            </Panel>
        );
    }
});


const TemplateSearchTemplate = React.createClass({
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
    render() {
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

            default:
                fieldNames = 'error';

        }

        if (fieldNames === 'error') {
            const message = [
                <h2><strong>Error</strong></h2>,
                'TemplateSearchTemplate received an invalid resource type.',
                <br/>,
                'Please report this to the developers, then choose a resource type above.'
            ];

            fieldNames = (
                <ListGroupItem>
                    <AlertView class="danger"
                               message={message}
                               fields={Immutable.Map({'getters.resourceType': this.state.resourceType})}
                    />
                </ListGroupItem>
            );
        }
        else {
            fieldNames = (
                <ListGroupItem>
                    <TemplateSearchFields fieldNames={fieldNames}/>
                </ListGroupItem>
            );
        }

        return (
            <Panel>
                <ListGroup fill>
                    <ListGroupItem><TemplateTypeSelector/></ListGroupItem>
                    {fieldNames}
                    <ListGroupItem><Button bsStyle="primary" onClick={signals.submitSearchQuery}>Search</Button></ListGroupItem>
                </ListGroup>
            </Panel>
        );
    }
});


const TemplateSearch = React.createClass({
    //

    componentWillMount() {
        // clear the search query
        signals.setSearchQuery('clear');
        signals.setResourceType('chant');
    },
    render() {
        return (
            <div className="container">
                <PageHeader>Template Search <small><i>{"Describe what you want, we'll fill in the blanks."}</i></small></PageHeader>
                <PanelGroup>
                    <TemplateSearchTemplate/>
                    <ResultListFrame/>
                </PanelGroup>
                {this.props.children}
            </div>
        );
    }
});


export {TemplateSearch, TemplateSearchTemplate, TemplateSearchFields, TemplateSearchField,
        TemplateTypeSelector};
export default TemplateSearch;
