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

import Label from 'react-bootstrap/lib/Label';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Panel from 'react-bootstrap/lib/Panel';

import {getters} from '../nuclear/getters';
import {reactor} from '../nuclear/reactor';
import {SIGNALS} from '../nuclear/signals';
import {AlertView} from './vitrail';


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

        // Genre and Cantus ID
        let genreAndCantusid = '';
        if (data.get('genre') && data.get('cantus_id')) {
            genreAndCantusid = `${data.get('genre')}\u2014Cantus\u00A0ID\u00A0${data.get('cantus_id')}`;
        } else if (data.get('genre')) {
            genreAndCantusid = data.get('genre');
        } else if (data.get('cantus_id')) {
            genreAndCantusid = data.get('cantus_id');
        }

        // Feast and Office
        let feastAndOffice = '';
        if ('full' === this.props.size) {
            if (data.get('feast') && data.get('feast_desc') && data.get('office')) {
                feastAndOffice = `Chant for ${data.get('feast')} (${data.get('feast_desc')}) office ${data.get('office')}`;
            } else if (data.get('feast') && data.get('office')) {
                feastAndOffice = `Chant for ${data.get('feast')} office ${data.get('office')}`;
            } else if (data.get('feast')) {
                feastAndOffice = `Chant for ${data.get('feast')}`;
            } else if (data.get('office')) {
                feastAndOffice = `Chant for ${data.get('office')} office`;
            }
            if (feastAndOffice.length > 0) {
                feastAndOffice = <li className={liClassName}>{feastAndOffice}</li>;
            }
        } else {
            if (data.get('feast') && data.get('office')) {
                feastAndOffice = `${data.get('feast')} (${data.get('office')})`;
            } else if (data.get('feast')) {
                feastAndOffice = data.get('feast');
            } else if (data.get('office')) {
                feastAndOffice = `(${data.get('office')})`;
            }
        }

        // Source, Folio, and Sequence
        let sourceFolioSequence = '';
        if ('full' === this.props.size) {
            if (data.get('source') && data.get('folio') && data.get('sequence')) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.get('source')}</i> on folio {data.get('folio')}, item {data.get('sequence')}.</li>;
            } else if (data.get('source') && data.get('folio')) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.get('source')}</i> on folio {data.get('folio')}.</li>;
            } else if (data.get('source')) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.get('source')}</i>.</li>;
            }
        } else {
            if (data.get('source')) {
                sourceFolioSequence = data.get('source');
                if (sourceFolioSequence.length > 30) {
                    sourceFolioSequence = sourceFolioSequence.slice(0, 30);
                }
                sourceFolioSequence = <i className="vitrail-source-name">{sourceFolioSequence}&hellip;</i>;
            }
        }

        let mode = '';
        let concordances = '';
        let differentia = '';
        let fullText = '';
        let volpiano = '';
        let notes = '';
        let marginalia = '';
        let siglum = '';
        let proofreader = '';
        let melodyID = '';

        if ('full' === this.props.size) {
            // Mode
            if (data.get('mode')) {
                mode = <li className={liClassName}>Mode {data.get('mode')}</li>;
            }

            // CAO Concordances
            if (data.get('cao_concordances')) {
                concordances = <li className={liClassName}>CAO Concordances: {data.get('cao_concordances')}</li>;
            }

            // Differentia
            if (data.get('differentia')) {
                differentia = <li className={liClassName}>Differentia: {data.get('differentia')}</li>;
            }

            // Full Text
            if (data.get('full_text') && data.get('full_text_manuscript')) {
                // TODO: this
            } else if (data.get('full_text')) {
                fullText = <li className={liClassName}>{data.get('full_text')}</li>;
            }

            // Volpiano
            if (data.get('volpiano')) {
                volpiano = <li className={liClassName}>{data.get('volpiano')}</li>;
            }

            // Notes
            if (data.get('notes')) {
                notes = <li className={liClassName}>Notes: {data.get('notes')}</li>;
            }

            // Marginalia
            if (data.get('marginalia')) {
                marginalia = <li className={liClassName}>Marginalia: {data.get('marginalia')}</li>;
            }

            // Siglum
            if (data.get('siglum')) {
                siglum = <li className={liClassName}>Siglum: {data.get('siglum')}</li>;
            }

            // Proofreader
            if (data.get('proofreader')) {
                proofreader = <li className={liClassName}>Proofreader: {data.get('proofreader')}</li>;
            }

            // Melody ID
            if (data.get('melody_id')) {
                melodyID = <li className={liClassName}>Melody ID: {data.get('melody_id')}</li>;
            }
        }

        // Build the final structure
        let post = '';
        if ('full' === this.props.size) {
            post = (
                <div className="card itemview">
                    <div className="card-block">
                        <h4 className="card-title">
                            {data.get('incipit')}
                            <span className="label label-info pull-right">Chant</span>
                        </h4>
                        <h6 className="card-subtitle text-muted">{genreAndCantusid}</h6>
                    </div>
                    <ul className="list-group list-group-flush">
                        {feastAndOffice}
                        {sourceFolioSequence}
                        {mode}
                        {concordances}
                        {differentia}
                        {fullText}
                        {volpiano}
                        {notes}
                        {marginalia}
                        {siglum}
                        {proofreader}
                        {melodyID}
                    </ul>
                </div>
            );
        } else {
            post = (
                <div className="card itemview">
                    <div className="card-block">
                        <h4 className="card-title">
                            {data.get('incipit')}
                            <span className="label label-info pull-right">Chant</span>
                        </h4>
                        <h6 className="card-subtitle text-muted">{genreAndCantusid}</h6>
                        {feastAndOffice}<br/>
                        {sourceFolioSequence}
                    </div>
                </div>
            );
        }

        return post;
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
        let header = [data.get('name'), <Label bsStyle="info">Feast</Label>];
        if (data.get('date')) {
            header.push(<br/>);
            header.push(<span className="text-muted">{data.get('date')}</span>);
        }

        const description = data.get('description', '');

        let feastCode = data.get('feast_code', '');
        if (feastCode) {
            feastCode = [<br/>, feastCode];
        }

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header}>
                {description}
                {feastCode}
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
        let name = '';
        if (data.get('family_name') && data.get('given_name')) {
            name = `${data.get('given_name')} ${data.get('family_name')}`;
        }
        else {
            name = data.get('display_name');
        }
        const header = [name, <Label bsStyle="info">Indexer</Label>];

        let institution = '';
        let cityAndCountry = '';

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

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header}>
                <ListGroup fill>
                    {institution}
                    {cityAndCountry}
                </ListGroup>
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

        const header = [data.get('name'), <Label bsStyle="info">Genre</Label>];
        const description = data.get('description', '');
        const massOrOffice = <div className="text-muted">({data.get('mass_or_office')})</div>;

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header}>
                {description}
                {massOrOffice}
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
        // - "rism" (siglum)
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

        let header = [data.get('rism'), <Label bsStyle="info">Source</Label>];
        header.push(<div>{`${data.get('title').slice(0, 40)}...`}</div>);
        if (data.get('provenance') && data.get('date')) {
            header.push(<div>{`${data.get('provenance')}\u00A0(${data.get('date')})`}</div>);
        }
        else if (data.get('provenance')) {
            header.push(<div>{data.get('provenance')}</div>);
        }
        else if (data.get('date')) {
            header.push(<div>{data.get('date')}</div>);
        }

        let provenanceDetail = '';
        let status = '';
        let summary = '';
        let occasions = '';
        let indexingInfo = '';
        let description = '';

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
        let notes = '';
        let i_date = '';
        let editors = '';
        let indexers = '';
        let proofreaders = '';

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

        // Build the final structure
        return (
            <Panel collapsible defaultExpanded={this.props.size === 'full'} header={header}>
                <ListGroup>
                    <ListGroupItem>{data.get('title')}</ListGroupItem>
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
        const header = [data.get('name'), <Label bsStyle="info">{type}</Label>];
        const description = data.get('description', '');

        // Build the final structure
        return (
            <Panel collapsible={true} defaultExpanded={this.props.size === 'full'} header={header}>
                {description}
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
                <div className="itemview">
                    <ItemViewError errorMessage={errMsg}
                                                type={this.props.type}
                                                rid={this.props.rid}
                                                data={this.props.data}
                                                resources={this.props.resources}
                    />
                </div>
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
        let post = '';
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
        return (
            <div className="itemview-overlay">
                <div className="itemview-button-container">
                    <Link className="btn btn-primary" to={pathToParent(this.props.routes)}>Close</Link>
                    <ItemView type={this.props.params.type} rid={this.props.params.rid} size={this.state.size}/>
                </div>
            </div>
        );
    }
});


/** This is a wrapper for ItemView BUT ONLY DURING INITIAL DEVELOPMENT. */
const ItemViewDevelWrapper = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {size: getters.itemViewOverlaySize};
    },
    getInitialState: function() {
        return {type: 'source', id: '123723'};
    },
    doNothing: function(event) {
        // Call this when the "Submit" button is clicked for this wrapper thing. It just cancels the
        // default form submission with POST.
        event.preventDefault();  // stop the default GET form submission
    },
    onChangeSizeRadioButton: function(event) {
        SIGNALS.setItemViewOverlaySize(event.target.value);
    },
    onChangeType: function(event) {
        this.setState({type: event.target.value});
    },
    onChangeId: function(event) {
        this.setState({id: event.target.value});
    },
    render: function() {

        // Set @checked for the "size" radio buttons. The first is with default "state."
        let fullSizeChecked = false;
        let compactSizeChecked = false;
        if ('compact' === this.state.size) {
            compactSizeChecked = true;
        }
        else {
            fullSizeChecked = true;
        }

        // Set the URL for the Link
        let linkUrl = `/itemviewdevel/${this.state.type}/${this.state.id}`;

        return (
            <div className="container">
                <div className="alert alert-info">
                    <p><strong>Note:</strong> This is a development wrapper around the proper ItemView.</p>
                    <p>Once &ldquo;Vitrail&rdquo; is deployed, the resource type and ID will be set
                    automatically, and the ItemView will be triggered from search results when you
                    choose a particular resource.</p>
                </div>
                <div className="card">
                    <div className="card-block">
                        <h2 className="card-title">ItemView Development Wrapper</h2>
                        <form onSubmit={this.doNothing}>
                            <fieldset className="form-group">
                                <label htmlFor="#ivdw-type">Resource Type (lowercase):</label>
                                <input type="text" className="form-control" id="ivdw-type"
                                       value={this.state.type} onChange={this.onChangeType}/>
                            </fieldset>
                            <fieldset className="form-group">
                                <label htmlFor="#ivdw-type">Resource ID:</label>
                                <input type="text" className="form-control" id="ivdw-type"
                                       value={this.state.id} onChange={this.onChangeId}/>
                            </fieldset>
                            <fieldset className="form-group">
                                <div className="radio">
                                    <label>
                                        <input type="radio"
                                               name="itemview-size"
                                               className="radio-inline"
                                               value="full"
                                               checked={fullSizeChecked}
                                               onChange={this.onChangeSizeRadioButton}
                                        />
                                        Full View
                                    </label>
                                    <label>
                                        <input type="radio"
                                               name="itemview-size"
                                               className="radio-inline"
                                               value="compact"
                                               checked={compactSizeChecked}
                                               onChange={this.onChangeSizeRadioButton}
                                        />
                                        Compact View
                                    </label>
                                </div>
                            </fieldset>
                            <Link to={linkUrl} className="btn btn-primary">Show</Link>
                        </form>
                    </div>
                    {this.props.children}
                </div>
            </div>
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
export {ItemViewDevelWrapper, ItemView, ItemViewOverlay, moduleForTesting};
