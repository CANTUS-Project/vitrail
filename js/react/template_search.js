// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
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
// ------------------------------------------------------------------------------------------------

import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Panel from 'react-bootstrap/lib/Panel';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Well from 'react-bootstrap/lib/Well';

import {AlertView} from './vitrail';
import ResultList from './result_list';
import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS as signals} from '../nuclear/signals';


/** TemplateTypeSelector: Resource type selection component for the TemplateSearch.
 *
 * While this component only allows setting the resource type to chants, indexers, sources, or
 * feasts, any other resource type will *not* be corrected.
 *
 * State
 * -----
 * @param (str) resourceType - From NuclearJS, the currently-selected resource type.
 */
const TemplateTypeSelector = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            resourceType: getters.resourceType,
        };
    },
    handleClick(event) {
        const mapperThing = {
            chantsTypeButton: 'chants',
            feastsTypeButton: 'feasts',
            indexersTypeButton: 'indexers',
            sourcesTypeButton: 'sources',
        };

        if (mapperThing[event.target.id] !== this.state.resourceType) {
            signals.setSearchQuery('clear');
            signals.setResourceType(mapperThing[event.target.id]);
        }
    },
    supportedTypes: ['chants', 'feasts', 'indexers', 'sources'],
    render() {
        const buttonProps = {
            chants: {'aria-pressed': 'false', 'active': false},
            indexers: {'aria-pressed': 'false', 'active': false},
            sources: {'aria-pressed': 'false', 'active': false},
            feasts: {'aria-pressed': 'false', 'active': false},
        };

        if (this.supportedTypes.indexOf(this.state.resourceType) >= 0) {
            buttonProps[this.state.resourceType]['aria-pressed'] = 'true';
            buttonProps[this.state.resourceType].active = true;
        }

        return (
            <ButtonGroup role="group" aria-label="resource type selector">
                <Button id="chantsTypeButton" active={buttonProps.chants.active}
                    aria-pressed={buttonProps.chants['aria-pressed']} onClick={this.handleClick}
                    bsStyle="primary"
                >
                    {`Chants`}
                </Button>
                <Button id="feastsTypeButton" active={buttonProps.feasts.active}
                    aria-pressed={buttonProps.feasts['aria-pressed']} onClick={this.handleClick}
                    bsStyle="primary"
                >
                    {`Feasts`}
                </Button>
                <Button id="indexersTypeButton" active={buttonProps.indexers.active}
                    aria-pressed={buttonProps.indexers['aria-pressed']} onClick={this.handleClick}
                    bsStyle="primary"
                >
                    {`Indexers`}
                </Button>
                <Button id="sourcesTypeButton" active={buttonProps.sources.active}
                    aria-pressed={buttonProps.sources['aria-pressed']} onClick={this.handleClick}
                    bsStyle="primary"
                >
                    {`Sources`}
                </Button>
            </ButtonGroup>
        );
    },
});


/** TemplateSearchField: A single field in the TemplateSearch's template.
 *
 * Given the display name and Abbot's field name, this component keeps its contents in sync with
 * the NuclearJS "SearchQuery" Store.
 *
 * Props
 * -----
 * @param (str) displayName - Optional display name to use as the field's label. We use "field" if
 *     this is not provided.
 * @param (str) field - The field name according to Abbot.
 *
 * State
 * -----
 * @param (ImmutableJS.Map) searchQuery - From the NuclearJS "getters.searchQuery" getter.
 */
const TemplateSearchField = React.createClass({
    propTypes: {
        // The field name displayed in the GUI. If omitted, the "field" is displayed.
        displayName: React.PropTypes.string,
        // The field name according to the Cantus API.
        field: React.PropTypes.string.isRequired,
    },
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            searchQuery: getters.searchQuery,
        };
    },
    handleChange(event) {
        const post = {};
        post[this.props.field] = event.target.value;
        signals.setSearchQuery(post);
    },
    shouldComponentUpdate(nextProps, nextState) {
        // We should only update if *our* field changes value.
        const field = this.props.field;
        if (this.state.searchQuery.get(field) !== nextState.searchQuery.get(field)) {
            return true;
        }
        else if (this.props !== nextProps) {
            return true;
        }

        return false;
    },
    render() {
        const displayName = this.props.displayName || this.props.field;
        let contents;

        if (this.state.searchQuery.get(this.props.field)) {
            contents = this.state.searchQuery.get(this.props.field);
        }

        return (
            <FormGroup controlId="formHorizontalEmail">
                <Col componentClass={ControlLabel} xs={2}>
                    {displayName}
                </Col>
                <Col xs={10}>
                    <FormControl type="text" value={contents} onChange={this.handleChange}/>
                </Col>
            </FormGroup>
        );
    },
});


/** TemplateSearchFields: all the fields in a TemplateSearch template.
 *
 * Contained by TemplateSearchTemplate.
 * Contains a bunch of TemplateSearchField.
 *
 * Props
 * -----
 * @param (array of Object) fieldNames - Details about the fields in this template. It's an array
 *     of objects, each of which contains two members that are passed on to a TemplateSearchField
 *     elements: field, displayName.
 *
 * State
 * -----
 * @param (bool) isCollapsed - Whether the fields are actually shown (if "false," the default) or
 *     the component should be collapsed to save space.
 */
const TemplateSearchFields = React.createClass({
    propTypes: {
        fieldNames: React.PropTypes.arrayOf(React.PropTypes.shape({
            field: React.PropTypes.string,
            displayName: React.PropTypes.string,
        })).isRequired,
    },
    getInitialState() {
        return {isCollapsed: false};
    },
    handleCollapse(event) {
        // Toggle this.state.isCollapsed
        if (event.target.className === 'panel-title') {
            this.setState({isCollapsed: !this.state.isCollapsed});
        }
    },
    render() {
        let headerText = this.state.isCollapsed ? 'expand' : 'collapse';
        headerText = `Click or tap this header to ${headerText} the template.`;

        return (
            <Well className="template-search-fields">
                <Form horizontal>
                    {this.props.fieldNames.map((field, index) =>
                        <TemplateSearchField
                            key={`template-field${index}`}
                            field={field.field}
                            displayName={field.displayName}
                        />
                    )}
                </Form>
            </Well>
        );
    },
});


/** WrongTypeAlertView: shown in TemplateSearchTemplate when the resourceType doesn't have a template.
 *
 * Props
 * -----
 * @param (str) resourceType - The resource type for which there isn't a template.
 */
const WrongTypeAlertView = React.createClass({
    propTypes: {
        resourceType: React.PropTypes.string.isRequired,
    },
    render() {
        const message = [
            <h2 key="1"><strong>{`Error`}</strong></h2>,
            `TemplateSearchTemplate doesn't have a template for this resource type.`,
            <br key="3"/>,
            `Please report this to the developers, then choose a resource type above.`,
            <br key="5"/>,
            `Mention the resource type was set to "${this.props.resourceType}"`,
        ];

        return <AlertView class="danger">{message}</AlertView>;
    },
});


/** TemplateSearchTemplate: either renders the template itself or an error message.
 *
 * State
 * -----
 * @param (str) resourceType - "getters.resourceType" from NuclearJS.
 */
const TemplateSearchTemplate = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            resourceType: getters.resourceType,
        };
    },
    handleSubmit() {
        signals.setPage(1);
        signals.submittedServerRequest();
        signals.submitSearchQuery();
    },
    render() {
        let fieldNames = [];

        switch (this.state.resourceType) {
        case 'chants':
            fieldNames = [
                    {field: 'incipit', displayName: 'Incipit'},
                    {field: 'full_text', displayName: 'Full Text (standard spelling)'},
                    {field: 'full_text_manuscript', displayName: 'Full Text (manuscript spelling)'},
                    {field: 'id', displayName: 'ID'},
                    {field: 'source', displayName: 'Source Name'},
                    {field: 'marginalia', displayName: 'Marginalia'},
                    {field: 'feast', displayName: 'Feast'},
                    {field: 'office', displayName: 'Office'},
                    {field: 'genre', displayName: 'Genre'},
                    {field: 'folio', displayName: 'Folio'},
                    {field: 'sequence', displayName: 'Sequence'},
                    {field: 'position', displayName: 'Position'},
                    {field: 'cantus_id', displayName: 'Cantus ID'},
                    {field: 'mode', displayName: 'Mode'},
                    {field: 'differentia', displayName: 'Differentia'},
                    {field: 'finalis', displayName: 'Finalis'},
                    {field: 'volpiano', displayName: 'Volpiano'},
                    {field: 'notes', displayName: 'Notes'},
                    {field: 'siglum', displayName: 'Siglum'},
                    {field: 'proofreader', displayName: 'Proofreader'},
                    {field: 'melody_id', displayName: 'Melody ID'},
            ];
            break;

        case 'feasts':
            fieldNames = [
                    {field: 'name', displayName: 'Name'},
                    {field: 'description', displayName: 'Description'},
                    {field: 'date', displayName: 'Date'},
                    {field: 'feast_code', displayName: 'Feast Code'},
            ];
            break;

        case 'indexers':
            fieldNames = [
                    {field: 'display_name', displayName: 'Full Name'},
                    {field: 'given_name', displayName: 'Given Name'},
                    {field: 'family_name', displayName: 'Family Name'},
                    {field: 'institution', displayName: 'Institution'},
                    {field: 'city', displayName: 'City'},
                    {field: 'country', displayName: 'Country'},
            ];
            break;

        case 'sources':
            fieldNames = [
                    {field: 'title', displayName: 'Title'},
                    {field: 'summary', displayName: 'Summary'},
                    {field: 'description', displayName: 'Description'},
                    {field: 'rism', displayName: 'RISM'},
                    {field: 'siglum', displayName: 'Siglum'},
                    {field: 'provenance', displayName: 'Provenance'},
                    {field: 'date', displayName: 'Date'},
                    {field: 'century', displayName: 'Century'},
                    {field: 'notation_style', displayName: 'Notation Style'},
                    {field: 'editors', displayName: 'Editors'},
                    {field: 'indexers', displayName: 'Indexers'},
                    {field: 'proofreaders', displayName: 'Proofreaders'},
                    {field: 'segment', displayName: 'Database Segment'},
                    {field: 'source_status_desc', displayName: 'Source Status'},
                    {field: 'liturgical_occasions', displayName: 'Liturgical Occasions'},
                    {field: 'indexing_notes', displayName: 'Indexing Notes'},
                    {field: 'indexing_date', displayName: 'Indexing Date'},
            ];
            break;

        default:
            fieldNames = 'error';
        }

        let content;  // the main content---either the template or an error message
        if (fieldNames === 'error') {
            content = <WrongTypeAlertView resourceType={this.state.resourceType}/>;
        }
        else {
            content = <TemplateSearchFields fieldNames={fieldNames}/>;
        }

        return (
            <Panel
                className="template-search-template"
                header={<TemplateTypeSelector/>}
                footer={<Button bsStyle="primary" onClick={this.handleSubmit}>{`Search`}</Button>}
            >
                {content}
            </Panel>
        );
    },
});


/** TemplateSearch: Top-level component for the TemplateSearch and its ResultList.
 *
 * Props
 * -----
 * @param (ReactElement) children - From react-router, an optional ItemViewOverlay.
 */
const TemplateSearch = React.createClass({
    propTypes: {
        children: React.PropTypes.element,
    },
    componentWillMount() {
        // Clear the search query. Must happen in this component, and in this function, to ensure
        // that the template starts with a supported resource type.
        signals.setSearchQuery('clear');
        signals.loadSearchResults('reset');
        signals.setResourceType('chant');
    },
    render() {
        return (
            <div className="container">
                <PageHeader>
                    {`Template Search `}
                    <small><i>{`Describe what you want, we'll fill in the blanks.`}</i></small>
                </PageHeader>
                <TemplateSearchTemplate/>
                <ResultList/>
                {this.props.children}
            </div>
        );
    },
});


const MODULE_FOR_TESTING = {
    TemplateSearch,
    TemplateSearchTemplate,
    TemplateSearchFields,
    TemplateSearchField,
    TemplateTypeSelector,
    WrongTypeAlertView,
};
export {TemplateSearch, MODULE_FOR_TESTING};
export default TemplateSearch;
