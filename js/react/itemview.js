// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/itemview.js
// Purpose:                ItemView React component for Vitrail.
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
import {Link} from 'react-router';

import Button from 'react-bootstrap/lib/Button';
import Label from 'react-bootstrap/lib/Label';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Modal from 'react-bootstrap/lib/Modal';
import Panel from 'react-bootstrap/lib/Panel';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS} from '../nuclear/signals';
import {AlertView} from './vitrail';


/** Make the URL to an ItemViewOverlay over the current component.
 *
 * @param (str) type - The type of the resource.
 * @param (str) id - The ID of the resource.
 *
 * This function uses "window.location" to determine the current URL, in order to figure out which
 * path to request as the "to" prop to a react-router <Link> component.
 *
 * This function does not check the validity of the type or id.
 */
function makeLinkToItemView(type, id) {
    // TODO: this function is untested
    // looks something like: #/onebox?_k=5hhcl3
    const current = window.location.hash;
    // ... so we want to put our stuff just before the ?
    const indexOfQMark = current.indexOf('?');

    if (-1 === indexOfQMark || current.length < 3) {
        return '';
    }

    return `${current.slice(1, indexOfQMark)}/${type}/${id}`;
}


/** A button linking to a resource on Drupal. */
const DrupalButton = React.createClass({
    propTypes: {
        drupalPath: React.PropTypes.string,
    },
    render() {
        if (this.props.drupalPath) {
            return (
                <Button block bsStyle="primary" href={this.props.drupalPath} target="_blank">
                    View on Drupal
                </Button>
            );
        }
        else {
            return '';
        }
    },
});


/** ItemView sub-component for Chants. */
const ItemViewChant = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        let liClassName = 'list-group-item';
        const data = this.props.data;
        const resources = this.props.resources;

        // Primary Fields:
        // ---------------
        // - incipit
        // - {genre} for {office} during {feast}
        // - position
        // - siglum
        // - folio and sequence number
        // - mode
        // - differentia
        //
        // Secondary Fields ("hideable"):
        // ------------------------------
        // - marginalia
        // - notes
        // - proofreader
        // - melody_id
        // - volpiano
        // - full_text & full_text_manuscript
        // - cao_concordances
        // - cantus ID
        // - finalis


        // primary fields -----------------------------------------------------
        let header = [data.get('incipit', '?'), <Label bsStyle="info">Chant</Label>];

        // genre, office, feast
        header.push(<div>{`${data.get('genre', '?')} for ${data.get('office', '?')} during ${data.get('feast', '?')}`}</div>);

        // siglum, folio, sequence
        if (data.get('folio') && data.get('sequence')) {
            header.push(<div>{`${data.get('siglum')}: f. ${data.get('folio')} #${data.get('sequence')}`}</div>);
        }
        else if (data.get('folio')) {
            header.push(<div>{`${data.get('siglum')}: f. ${data.get('folio')}`}</div>);
        }
        else if (data.get('sequence')) {
            header.push(<div>{`${data.get('siglum')}: seq. ${data.get('sequence')}`}</div>);
        }
        else {
            header.push(<div>{`${data.get('siglum')}`}</div>);
        }

        // mode, differentia
        if (data.get('mode') && data.get('differentia')) {
            header.push(<div>{`Mode: ${data.get('mode')}; differentia: ${data.get('differentia')}`}</div>);
        }
        else if (data.get('mode')) {
            header.push(<div>{`Mode: ${data.get('mode')}`}</div>);
        }
        else if (data.get('differentia')) {
            header.push(<div>{`Differentia: ${data.get('differentia')}`}</div>);
        }

        // secondary fields ---------------------------------------------------
        let concordances;
        let fullText;
        let volpiano;
        let notes;
        let marginalia;
        let siglum;
        let proofreader;
        let melodyID;
        let cantusID;
        let finalis;
        let drupalPath;

        // CAO Concordances
        if (data.get('cao_concordances')) {
            concordances = <ListGroupItem>CAO Concordances: {data.get('cao_concordances')}</ListGroupItem>;
        }

        // Full Text
        if (data.get('full_text') && data.get('full_text_manuscript')) {
            fullText = [
                <ListGroupItem>Full Text: {data.get('full_text')}</ListGroupItem>,
                <ListGroupItem>Full Text (manuscript spelling):{data.get('full_text_manuscript')}</ListGroupItem>
            ];

        } else if (data.get('full_text')) {
            fullText = <ListGroupItem>Full Text: {data.get('full_text')}</ListGroupItem>;
        }

        // Volpiano
        if (data.get('volpiano')) {
            volpiano = <ListGroupItem>Volpiano: {data.get('volpiano')}</ListGroupItem>;
        }

        // Notes
        if (data.get('notes')) {
            notes = <ListGroupItem>Notes: {data.get('notes')}</ListGroupItem>;
        }

        // Marginalia
        if (data.get('marginalia')) {
            marginalia = <ListGroupItem>Marginalia: {data.get('marginalia')}</ListGroupItem>;
        }

        // Siglum
        if (data.get('siglum')) {
            siglum = <ListGroupItem>Siglum: {data.get('siglum')}</ListGroupItem>;
        }

        // Proofreader
        if (data.get('proofreader')) {
            proofreader = <ListGroupItem>Proofreader: {data.get('proofreader')}</ListGroupItem>;
        }

        // Melody ID
        if (data.get('melody_id')) {
            melodyID = <ListGroupItem>Melody ID: {data.get('melody_id')}</ListGroupItem>;
        }

        // Cantus ID
        if (data.get('cantus_id')) {
            cantusID = <ListGroupItem>Cantus ID: {data.get('cantus_id')}</ListGroupItem>;
        }

        // Finalis
        if (data.get('finalis')) {
            finalis = <ListGroupItem>Finalis: {data.get('finalis')}</ListGroupItem>;
        }

        // Link to Drupal
        if (data.get('drupal_path')) {
            drupalPath = (
                <Button block bsStyle="primary" href={data.get('drupal_path')} target="_blank">
                    View on Drupal
                </Button>
            );
        }

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-5';
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                <ListGroup>
                    {concordances}
                    {fullText}
                    {volpiano}
                    {notes}
                    {marginalia}
                    {proofreader}
                    {melodyID}
                    {cantusID}
                    {finalis}
                </ListGroup>
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** ItemView sub-component for Feasts. */
const ItemViewFeast = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        const data = this.props.data;
        const resources = this.props.resources;

        // Fields Available:
        // - name
        // - description
        // - date
        // - feast code

        // Name and Feast Code
        let header = [data.get('name', ''), <Label bsStyle="info">Feast</Label>];
        if (data.get('date')) {
            header.push(<br/>);
            header.push(<span className="text-muted">{data.get('date')}</span>);
        }

        const description = data.get('description', '');

        let feastCode = data.get('feast_code', '');
        if (feastCode) {
            feastCode = [<br/>, feastCode];
        }

        // Link to Drupal
        let drupalPath;
        if (data.get('drupal_path')) {
            drupalPath = (
                <Button block bsStyle="primary" href={data.get('drupal_path')} target="_blank">
                    View on Drupal
                </Button>
            );
        }

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-4';
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                {description}
                {feastCode}
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** ItemView sub-component for Indexers. */
const ItemViewIndexer = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        const data = this.props.data;
        const resources = this.props.resources;

        // Fields Available:
        // - display_name
        // - given_name
        // - family_name
        // - institution
        // - city
        // - country

        // Name
        let name;
        if (data.get('family_name') && data.get('given_name')) {
            name = `${data.get('given_name')} ${data.get('family_name')}`;
        }
        else {
            name = data.get('display_name', '');
        }
        const header = [name, <Label bsStyle="info">Indexer</Label>];

        let institution;
        let cityAndCountry;

        // Institution
        if (data.get('institution')) {
            institution = <ListGroupItem>{data.get('institution')}</ListGroupItem>;
        }

        // City and Country
        if (data.get('city') && data.get('country')) {
            cityAndCountry = `${data.get('city')}, ${data.get('country')}`;
        }
        else if (data.get('city')) {
            cityAndCountry = data.get('city');
        }
        else if (data.get('country')) {
            cityAndCountry = data.get('country');
        }
        if (cityAndCountry) {
            cityAndCountry = <ListGroupItem>{cityAndCountry}</ListGroupItem>;
        }

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-4';
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                <ListGroup fill>
                    {institution}
                    {cityAndCountry}
                </ListGroup>
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** ItemView sub-component for Genres. */
const ItemViewGenre = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        const data = this.props.data;
        const resources = this.props.resources;

        // Fields Available:
        // - name
        // - description
        // - mass_or_office

        const header = [data.get('name', ''), <Label bsStyle="info">Genre</Label>];
        const description = data.get('description', '');
        const massOrOffice = <div className="text-muted">({data.get('mass_or_office', '')})</div>;

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-3';
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                {description}
                {massOrOffice}
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** ItemView sub-component for Sources. */
const ItemViewSource = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        const liClassName = 'list-group-item';
        const data = this.props.data;
        const resources = this.props.resources;

        // Primary Fields:
        // ---------------
        // - "rism" (siglum)  // TODO: should the siglum actually be cross-referenced with the Siglum resource?
        // - abbr. full name
        // - date
        // - provenance
        // - summary (abbreviated, if there's space) (CRA: there isn't)
        //
        // Secondary Fields ("hideable"):
        // ------------------------------
        // - full name (not abbreviated)
        // - provenance detail
        // - editors
        // - indexers
        // - proofreaders
        // - source _status
        // - liturgical occasions
        // - indexing_notes
        // - indexing_date
        // - notation_style
        // - century
        // - segment
        //
        // NB: \u00A0 is &nbsp; and \u2014 is an em dash

        let header = [data.get('rism', ''), <Label bsStyle="info">Source</Label>];
        header.push(<div>{`${data.get('title', '').slice(0, 40)}...`}</div>);
        if (data.get('provenance') && data.get('date')) {
            header.push(<div>{`${data.get('provenance')}\u00A0(${data.get('date')})`}</div>);
        }
        else if (data.get('provenance')) {
            header.push(<div>{data.get('provenance')}</div>);
        }
        else if (data.get('date')) {
            header.push(<div>{data.get('date')}</div>);
        }

        let provenanceDetail;
        let status;
        let summary;
        let occasions;
        let indexingInfo;
        let description;

        // Provenance Detail
        if (data.get('provenance_detail') && data.get('provenance_detail') !== data.get('provenance')) {
            provenanceDetail = <ListGroupItem>{data.get('provenance_detail')}</ListGroupItem>;
        }

        // Source Status
        if (data.get('source_status')) {
            status = <ListGroupItem>{`Status: ${data.get('source_status')}`}</ListGroupItem>;
        }

        // Summary
        if (data.get('summary')) {
            summary = <ListGroupItem><Panel header="Summary">{data.get('summary')}</Panel></ListGroupItem>;
        }

        // Occasions
        if (data.get('liturgical_occasions')) {
            occasions = (
                <ListGroupItem>
                    <Panel header="Liturgical Occasions">
                        {data.get('liturgical_occasions')}
                    </Panel>
                </ListGroupItem>
            );
        }

        // Indexing Information -----------------------
        let notes;
        let i_date;
        let editors;
        let indexers;
        let proofreaders;

        // Indexing Date
        if (data.get('indexing_date')) {
            i_date = <ListGroupItem>{`Indexed ${data.get('indexing_date')}`}</ListGroupItem>;
        }

        // Notes
        if (data.get('indexing_notes')) {
            notes = <ListGroupItem>{`Indexing Notes: ${data.get('indexing_notes')}`}</ListGroupItem>;
        }

        // Indexers
        if (data.get('indexers')) {
            indexers = <ListGroupItem>{`Indexers: ${data.get('indexers').join(', ')}`}</ListGroupItem>;
        }

        // Editors
        if (data.get('editors')) {
            editors = <ListGroupItem>{`Editors: ${data.get('editors').join(', ')}`}</ListGroupItem>;
        }

        // Proofreaders
        if (data.get('proofreaders')) {
            proofreaders = <ListGroupItem>{`Proofreaders: ${data.get('proofreaders').join(', ')}`}</ListGroupItem>;
        }

        // Description --------------------------------
        if (data.get('description')) {
            // TODO: format this better (e.g., convert the newline chars to <br/> ?)
            description = (
                <ListGroupItem>
                    <Panel header="Description">{data.get('description')}</Panel>
                </ListGroupItem>
            );
        }

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-5';
        }

        // Build the final structure
        return (
            <Panel collapsible defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                <ListGroup>
                    <ListGroupItem>{data.get('title', '')}</ListGroupItem>
                    {status}
                    {summary}
                    {provenanceDetail}
                    {indexers}
                    {editors}
                    {proofreaders}
                    {notes}
                    {occasions}
                    {description}
                </ListGroup>
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** ItemView sub-component for Simple Resources. */
const ItemViewSimpleResource = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    render() {
        const data = this.props.data;

        // Fields Available:
        // - name
        // - description

        const type = data.get('type').slice(0, 1).toLocaleUpperCase() + data.get('type').slice(1);
        const header = [data.get('name', ''), <Label bsStyle="info">{type}</Label>];
        const description = data.get('description', '');

        // Choose the column size
        let className;
        if (this.props.size === 'compact') {
            className = 'col-md-3';
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header} className={className}>
                {description}
                <DrupalButton drupalPath={data.get('drupal_path')}/>
            </Panel>
        );
    }
});


/** Chooses the proper, type-specific ItemView component.
 *
 * This component is intended for use only by ItemView.
 *
 * Props
 * -----
 * @param (ImmutableJS.Map) data - The resource's data fields.
 * @param (ImmutableJS.Map) resources - The resource's URL links.
 * @param (string) size - Whether to display the "full" or "compact" view.
 *
 */
const ItemViewMultiplexer = React.createClass({
    propTypes: {
        data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        resources: React.PropTypes.instanceOf(Immutable.Map),
        size: React.PropTypes.oneOf(['full', 'compact']),
    },
    getDefaultProps() {
        return ({resource: Immutable.Map(), size: 'full'});
    },
    render() {
        let rendered;
        switch (this.props.data.get('type')) {
            case 'chant':
                rendered = <ItemViewChant data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            case 'feast':
                rendered = <ItemViewFeast data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            case 'indexer':
                rendered = <ItemViewIndexer data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            case 'genre':
                rendered = <ItemViewGenre data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            case 'source':
                rendered = <ItemViewSource data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            case 'century':
            case 'notation':
            case 'office':
            case 'portfolio':
            case 'provenance':
            case 'siglum':
            case 'segment':
            case 'source_status':
                rendered = <ItemViewSimpleResource data={this.props.data} resources={this.props.resources} size={this.props.size}/>;
                break;

            default:
                rendered = <ItemViewError errorMessage="Resource type not implemented."
                                          type={this.props.data.get('type')}
                           />;
                break;
        }

        return rendered;
    },
});


/** Used by the "ItemView" component to display information about an error.
 *
 * This component is not intended for use outside the "itemview" module.
 *
 * Props
 * -----
 * @param (str) errorMessage - The error message to display to the user.
 * @param (any) type - The "type" prop given to ItemView.
 * @param (any) rid - The "rid" prop given to ItemView.
 * @param (any) data - A stringified version of the "data" prop given to ItemView.
 * @param (any) resources - A stringified version of the "resources" prop given to ItemView.
 *
 * All the props (except "errorMessage") are stringified before being displayed.
 */
const ItemViewError = React.createClass({
    propTypes: {
        errorMessage: React.PropTypes.string.isRequired,
        type: React.PropTypes.node,
        rid: React.PropTypes.node,
        data: React.PropTypes.node,
        resources: React.PropTypes.node,
    },
    getDefaultProps() {
        return {type: '', rid: '', data: '', resources: ''};
    },
    render() {
        return (
            <AlertView message={this.props.errorMessage}
                       class="warning"
                       fields={Immutable.Map({
                           'Component': 'ItemView',
                           'Type': this.props.type.toString(),
                           'ID': this.props.rid.toString(),
                           'Data': this.props.data.toString(),
                           'Resources': this.props.resources.toString(),
                       })}
            />
        );
    },
});


/** ItemView
 *
 * React Component Selection
 * -------------------------
 *
 * From outside the "itemview" module, only the ItemView and ItemViewOverlay components should be
 * used directly. The other components are deployed automatically by ItemView and ItemViewOverlay.
 *
 * ItemViewOverlay displays the data of a single resource in such a way that the rest of the
 * interface is inaccessible until the ItemViewOverlay is closed. The top-level rendered component
 * has className="itemview-overlay".
 *
 * ItemView displays the data of a single resource so it may be used in a table, result list, or
 * other similar context. The top-level rendered component is a <div> with className="card itemview".
 *
 * Data Source Selection
 * ---------------------
 *
 * If the "type" and "rid" props are provided, this component emits the signal that causes
 * NuclearJS and CantusJS to load the required data. If the "data" and "resources" props are
 * provided, this component provides them directly to the appropriate subcomponent, and ignores any
 * data provided by NuclearJS.
 *
 * To help with debugging, the component displays an error message if it receives incomplete or
 * potentially ambiguous props.
 *
 * This component also chooses the proper subcomponent. The result is outputted in the page as
 * expected. Use ItemViewOverlay for an ItemView that appears in front of other content.
 *
 * Props:
 * ------
 * @param (str) size - "compact" or "full" for the corresponding representation. Default is "full."
 * @param (str) type - The type of resource to display.
 * @param (str) rid - The resource ID to display.
 * @param (ImmutableJS.Map) data - A resource's data fields.
 * @param (ImmutableJS.Map) resources - A resource's resource URLs.
 *
 */
const ItemView = React.createClass({
    // NOTE for Developers:
    // The ItemView component itself does not render anything. ItemView itself decides whether to
    // use NuclearJS or props as the data source, then uses ItemViewMultiplexer to render the
    // resource. If an error occurs during data source selection, or during the request to the
    // CANTUS API server, this component instead uses ItemViewError to render information about
    // the error.
    //

    propTypes: {
        size: React.PropTypes.oneOf(['compact', 'full']),
        type: React.PropTypes.string,
        rid: React.PropTypes.string,
        data: React.PropTypes.instanceOf(Immutable.Map),
        resources: React.PropTypes.instanceOf(Immutable.Map),
    },
    getDefaultProps() {
        return {size: 'full'};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        // Not sure when this is called in relation to componentWillMount().
        if ('nuclearjs' === this.whatShouldWeDisplay()) {
            return {theItem: getters.currentItemView};
        }
    },
    componentDidMount() {
        // Ask the NuclearJS reactor to load our data.
        // TODO: will it work if we do this in componentWillMount() ?
        if ('nuclearjs' === this.whatShouldWeDisplay()) {
            SIGNALS.loadInItemView(this.props.type, this.props.rid);
        }
    },
    componentWillReceiveProps(nextProps) {
        // Ask the NuclearJS reactor to load our data.
        if (nextProps.type !== this.props.type || nextProps.ris !== this.props.rid) {
            SIGNALS.loadInItemView(nextProps.type, nextProps.rid);
        }
    },
    whatShouldWeDisplay() {
        // Examine the props to determine whether we should connect to "nuclearjs" state, display
        // the "props" data already provided, or there is an "error" in the props.
        //
        if (undefined !== this.props.type && undefined !== this.props.rid &&
            undefined === this.props.data && undefined === this.props.resources) {
            return 'nuclearjs';
        }
        else if (undefined === this.props.type && undefined === this.props.rid &&
            undefined !== this.props.data && undefined !== this.props.resources) {
            return 'props';
        }
        else {
            return 'error';
        }
    },
    canWeDisplaySomething() {
        // Check the props and state to determine whether we have enough information to display.
        //

        let answer = false;
        let whatToDisplay = this.whatShouldWeDisplay();

        if ('nuclearjs' === whatToDisplay) {
            if (this.state && this.state.theItem && this.state.theItem.size > 0) {
                answer = true;
            }
            else {
                answer = false;
            }
        }
        else if ('props' === whatToDisplay) {
            answer = true;
        }
        else {
            answer = false;
        }

        return answer;
    },
    render() {
        let rendered;  // this holds the rendered component
        let dataFormat = this.whatShouldWeDisplay();

        if (!this.canWeDisplaySomething()) {
            let errMsg;
            if ('error' === dataFormat) {
                errMsg = 'Developer error with the props.';
            }
            else {
                errMsg = 'No data: maybe waiting on the Cantus server?';
            }
            rendered = (
                <ItemViewError errorMessage={errMsg}
                               type={this.props.type}
                               rid={this.props.rid}
                               data={this.props.data}
                               resources={this.props.resources}
                />
            );
        } else {
            // "item" will contain only fields for this item
            // "resources" will contain only URLs for this item
            let item, resources;
            if ('nuclearjs' === dataFormat) {
                let itemID = this.state.theItem.get('sort_order').get(0);
                item = this.state.theItem.get(itemID);
                resources = this.state.theItem.get('resources').get(itemID);
            }
            else {
                item = this.props.data;
                resources = this.props.resources;
            }

            rendered = <ItemViewMultiplexer data={item} resources={resources} size={this.props.size}/>;
        }

        return rendered;
    }
});


/** Make the URL to the "parent" of an ItemViewOverlay component.
 *
 * @param (array) routes - An array of objects that have a "path" member, which is a string
 *        containing part of the URL of a resource. Note that this should be the "routes" prop
 *        given to an ItemViewOverlay component.
 * @returns A string that is the URL to the "parent."
 *
 * **Example**
 *
 * > let routes = [{path: '/'}, {path: 'search'}, {path: 'results'}, {path: ':type/:rid'}];
 * > console.log(pathToParent(routes));
 * '/search/results'
 */
function pathToParent(routes) {
    const routesLength = routes.length;
    if (routesLength > 2) {
        let post;
        for (let i = 1; i < routesLength - 1; i++) {
            post = `${post}/${routes[i].path}`;
        }
        return post;
    } else {
        return '/';
    }
};


/** Wrapper for the ItemView component that causes its content to appear in front of all other
 *  content on the page.
 *
 * When the ItemView is closed, the URL is changed to navigate away from the item-specific page.
 *
 * Props (NOTE: all provided by react-router)
 * @param (str) params.type - The type of resource to display. Provided by react-router from the URL.
 * @param (str) params.rid - The resource ID to display. Provided by react-router from the URL.
 * @param (array) routes - An array of objects that have a "path" member, which is a string
 *        containing part of the URL of this resource.
 *
 * NOTE: The "routes" prop is an undocumented feature of react-router, provided by their RouterContext
 *       component. Of course I don't like using undocumented features, and especially not when it's
 *       in a third-party library with which I already have trust issues, but I can't really think
 *       of a better way at this point, and there are bigger problems to solve!
 * https://github.com/rackt/react-router/blob/3dd0cdf517e5c4d981113fad83f95939ae50cb60/modules/RouterContext.js
 */
const ItemViewOverlay = React.createClass({
    propTypes: {
        params: React.PropTypes.shape({
            type: React.PropTypes.string.isRequired,
            rid: React.PropTypes.string.isRequired,
        }).isRequired,
        routes: React.PropTypes.arrayOf(React.PropTypes.shape({
            path: React.PropTypes.string.isRequired,
        })).isRequired,
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {size: getters.itemViewOverlaySize};
    },
    render() {
        // When the <Modal> is just set to "show" all the time, it won't close itself... so it's
        // changing the URL that will trigger the ItemViewOverlay to go away!
        //
        return (
            <Modal show>
                <Modal.Header>
                    <Link className="btn btn-danger" to={pathToParent(this.props.routes)}>X</Link>
                </Modal.Header>
                <ItemView type={this.props.params.type} rid={this.props.params.rid} size={this.state.size}/>
            </Modal>
        );
    }
});


const moduleForTesting = {
    ItemViewError: ItemViewError,
    ItemView: ItemView,
    pathToParent: pathToParent,
    ItemViewOverlay: ItemViewOverlay,
    ItemViewMultiplexer: ItemViewMultiplexer,
};
export {ItemView, ItemViewOverlay, moduleForTesting, makeLinkToItemView};
