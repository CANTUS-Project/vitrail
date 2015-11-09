// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/itemview.src.js
// Purpose:                ItemView React component for Vitrail.
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

import getters from './nuclear/getters';
import reactor from './nuclear/reactor';
import {SIGNALS} from './nuclear/signals';


var ItemViewChant = React.createClass({
    // TODO: description
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Feast and Office
        let feastAndOffice = '';
        if ('full' === this.props.size) {
            if (undefined !== data.feast && undefined !== data.feast_desc && undefined !== data.office) {
                feastAndOffice = `Chant for ${data.feast} (${data.feast_desc}) office ${data.office}`;
            } else if (undefined !== data.feast && undefined !== data.office) {
                feastAndOffice = `Chant for ${data.feast} office ${data.office}`;
            } else if (undefined !== data.feast) {
                feastAndOffice = `Chant for ${data.feast}`;
            } else if (undefined !== data.office) {
                feastAndOffice = `Chant for ${data.office} office`;
            }
            if (feastAndOffice.length > 0) {
                feastAndOffice = <li className={liClassName}>{feastAndOffice}</li>;
            }
        } else {
            if (undefined !== data.feast && undefined !== data.office) {
                feastAndOffice = `${data.feast} (${data.office})`;
            } else if (undefined !== data.feast) {
                feastAndOffice = data.feast;
            } else if (undefined !== data.office) {
                feastAndOffice = `(${data.office})`;
            }
        }

        // Source, Folio, and Sequence
        let sourceFolioSequence = '';
        if ('full' === this.props.size) {
            if (undefined !== data.source && undefined !== data.folio && undefined !== data.sequence) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.source}</i> on folio {data.folio}, item {data.sequence}.</li>;
            } else if (undefined !== data.source && undefined !== data.folio) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.source}</i> on folio {data.folio}.</li>;
            } else if (undefined !== data.source) {
                sourceFolioSequence = <li className={liClassName}>From <i className="vitrail-source-name">{data.source}</i>.</li>;
            }
        } else {
            if (undefined !== data.source) {
                sourceFolioSequence = data.source;
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
            if (undefined !== data.mode) {
                mode = <li className={liClassName}>Mode {data.mode}</li>;
            }

            // CAO Concordances
            if (undefined !== data.cao_concordances) {
                concordances = <li className={liClassName}>CAO Concordances: {data.cao_concordances}</li>;
            }

            // Differentia
            if (undefined !== data.differentia) {
                differentia = <li className={liClassName}>Differentia: {data.differentia}</li>;
            }

            // Full Text
            if (undefined !== data.full_text && undefined !== data.full_text_manuscript) {
                // TODO: this
            } else if (undefined !== data.full_text) {
                fullText = <li className={liClassName}>{data.full_text}</li>;
            }

            // Volpiano
            if (undefined !== data.volpiano) {
                volpiano = <li className={liClassName}>{data.volpiano}</li>;
            }

            // Notes
            if (undefined !== data.notes) {
                notes = <li className={liClassName}>Notes: {data.notes}</li>;
            }

            // Marginalia
            if (undefined !== data.marginalia) {
                marginalia = <li className={liClassName}>Marginalia: {data.marginalia}</li>;
            }

            // Siglum
            if (undefined !== data.siglum) {
                siglum = <li className={liClassName}>Siglum: {data.siglum}</li>;
            }

            // Proofreader
            if (undefined !== data.proofreader) {
                proofreader = <li className={liClassName}>Proofreader: {data.proofreader}</li>;
            }

            // Melody ID
            if (undefined !== data.melody_id) {
                melodyID = <li className={liClassName}>Melody ID: {data.melody_id}</li>;
            }
        }

        // Build the final structure
        let post = '';
        if ('full' === this.props.size) {
            post = (
                <div className="card">
                    <div className="card-block">
                        <h4 className="card-title">{data.incipit}</h4>
                        <h6 className="card-subtitle text-muted">
                            {data.genre}&mdash;Cantus&nbsp;ID&nbsp;{data.cantus_id}
                        </h6>
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
                <div className="card">
                    <div className="card-block">
                        <h4 className="card-title">{data.incipit}</h4>
                        <h6 className="card-subtitle text-muted">
                            {data.genre}&mdash;Cantus&nbsp;ID&nbsp;{data.cantus_id}
                        </h6>
                        {feastAndOffice}<br/>
                        {sourceFolioSequence}
                    </div>
                </div>
            );
        }

        return post;
    }
});


var ItemViewFeast = React.createClass({
    // An ItemView that displays a Feast resource.
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Fields Available:
        // - name
        // - description
        // - date
        // - feast code

        // Name and Feast Code
        let codeAndDate = '';
        if (undefined !== data.feast_code && undefined !== data.date) {
            codeAndDate = <h6 className="card-subtitle text-muted">{data.feast_code}&mdash;{data.date}</h6>;
        } else if (undefined !== data.feast_code) {
            codeAndDate = <h6 className="card-subtitle text-muted">{data.feast_code}</h6>;
        } else if (undefined !== data.date) {
            codeAndDate = <h6 className="card-subtitle text-muted">{data.date}</h6>;
        }

        // Description and Date
        let description = '';
        if ('full' === this.props.size && undefined !== data.description) {
            description = data.description;
        }

        // Build the final structure
        let post = (
            <div className="card">
                <div className="card-block">
                    <h4 className="card-title">{data.name}</h4>
                    {codeAndDate}
                    {description}
                </div>
            </div>
        );

        return post;
    }
});


var ItemViewIndexer = React.createClass({
    // An ItemView that displays an Indexer resource.
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Fields Available:
        // - display_name
        // - given_name
        // - family_name
        // - institution
        // - city
        // - country

        // Name
        let name = '';
        if (undefined !== data.family_name && undefined !== data.given_name) {
            name = <h4 className="card-title">{data.given_name}&nbsp;{data.family_name}</h4>;
        } else {
            name = <h4 className="card-title">{data.display_name}</h4>;
        }

        let institution = '';
        let cityAndCountry = '';

        if ('full' === this.props.size) {
            // Institution
            if (undefined !== data.institution) {
                institution = <h6 className="card-subtitle text-muted">{data.institution}</h6>;
            }

            // City and Country
            if (undefined !== data.city && undefined !== data.country) {
                cityAndCountry = `${data.city}, ${data.country}`;
            } else if (undefined !== data.city) {
                cityAndCountry = data.city;
            } else if (undefined !== data.country) {
                cityAndCountry = data.country;
            }
        }

        // Build the final structure
        let post = (
            <div className="card">
                <div className="card-block">
                    {name}
                    {institution}
                    {cityAndCountry}
                </div>
            </div>
        );

        return post;
    }
});


var ItemViewGenre = React.createClass({
    // An ItemView that displays a Genre resource.
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Fields Available:
        // - name
        // - description
        // - mass_or_office

        let description = '';
        let massOrOffice = '';

        if ('full' === this.props.size) {
            // Mass or Office
            if (undefined !== data.mass_or_office) {
                massOrOffice = <h6 className="card-subtitle text-muted">{data.mass_or_office}</h6>;
            }

            // Description
            if (undefined !== data.description) {
                description = data.description;
            }
        }

        // Build the final structure
        let post = (
            <div className="card">
                <div className="card-block">
                    <h4 className="card-title">{data.name}</h4>
                    {massOrOffice}
                    {description}
                </div>
            </div>
        );

        return post;
    }
});


var ItemViewSource = React.createClass({
    // An ItemView that displays a Source resource.
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Fields Available:
        // - title (string) – Full Manuscript Identification (City, Archive, Shelf-mark)
        // - rism (string) – RISM number
        // - provenance (string) – Provenance
        // - provenance_detail (string) – More detail about the provenance
        // - date (string) – Date
        // IGNORED: - century (string) – Century
        // IGNORED: - notation_style (string) – Notation used for the source
        // - editors (string) – List of "display_name" of indexers who edited this manuscript
        // - indexers (string) – List of "display_name" of indexers who entered this manuscript
        // - proofreaders (string) – List of "display_name" of indexers who proofread this manuscript
        // IGNORED: - segment (string) – Segment (i.e., source database)
        // - source_status (string) – Status of this source
        // - summary (string) – Summary
        // - liturgical_occasions (string) – Liturgical occasions
        // - description (string) – Description
        // - indexing_notes (string) – Indexing notes
        // - indexing_date (string) – Indexing date

        // Siglum ("rism" field), Provenance, and Date
        // NB: \u00A0 is &nbsp; and \u2014 is an em dash
        let siglumProvenanceDate = '';
        if (undefined !== data.rism && undefined !== data.provenance) {
            if (undefined !== data.date) {
                siglumProvenanceDate = `${data.rism}\u00A0(${data.provenance})\u00A0${data.date}`;
            } else {
                siglumProvenanceDate = `${data.rism}\u00A0(${data.provenance})`;
            }
        } else if (undefined !== data.rism) {
            if (undefined !== data.date) {
                siglumProvenanceDate = `${data.rism}\u2014${data.date}`;
            } else {
                siglumProvenanceDate = data.rism;
            }
        } else if (undefined !== data.provenance) {
            if (undefined !== data.date) {
                siglumProvenanceDate = `${data.provenance}\u2014${data.date}`;
            } else {
                siglumProvenanceDate = data.provenance;
            }
        }
        if (siglumProvenanceDate.length > 0) {
            siglumProvenanceDate = <h6 className="card-subtitle text-muted">{siglumProvenanceDate}</h6>;
        }

        let provenanceDetail = '';
        let status = '';
        let summary = '';
        let occasions = '';
        let indexingInfo = '';
        let description = '';

        if ('full' === this.props.size) {
            // Provenance Detail
            if (undefined !== data.provenance_detail && data.provenance_detail !== data.provenance) {
                provenanceDetail = <li className={liClassName}>{data.provenance_detail}</li>;
            }

            // Source Status
            if (undefined !== data.source_status) {
                status = `Status: ${data.source_status}`;
                status = <li className={liClassName}>{status}</li>;
            }

            // Summary
            if (undefined !== data.summary) {
                summary = <li className={liClassName}>{data.summary}</li>;
            }

            // Occasions
            if (undefined !== data.liturgical_occasions) {
                occasions = `Liturgical Occasions: ${data.liturgical_occasions}`;
                occasions = <li className={liClassName}>{occasions}</li>;
            }

            // Indexing Information -----------------------
            let notes = '';
            let i_date = '';
            let editors = '';
            let indexers = '';
            let proofreaders = '';

            // Indexing Date
            if (undefined !== data.indexing_date) {
                i_date = `Indexed ${data.indexing_date}`;
                i_date = <p>{i_date}</p>;
            }

            // Notes
            if (undefined !== data.indexing_notes) {
                notes = `Indexing Notes: ${data.indexing_notes}`;
                notes = <p>{notes}</p>;
            }

            // Indexers
            if (undefined !== data.indexers) {
                indexers = `Indexers: ${data.indexers.join(', ')}`;
                indexers = <p>{indexers}</p>;
            }

            // Editors
            if (undefined !== data.editors) {
                editors = `Editors: ${data.editors.join(', ')}`;
                editors = <p>{editors}</p>;
            }

            // Proofreaders
            if (undefined !== data.proofreaders) {
                proofreaders = `Proofreaders: ${data.proofreaders.join(', ')}`;
                proofreaders = <p>{proofreaders}</p>;
            }

            if (true) {
            // if (notes.length > 0 || i_date.length > 0 || editors.length > 0 || indexers.length > 0 || proofreaders.length > 0) {
                indexingInfo = (
                    <div className="card-block">
                        <h5 className="card-subtitle">Indexing Information</h5>
                        <div className="card-block">
                            {i_date}
                            {notes}
                            {editors}
                            {indexers}
                            {proofreaders}
                        </div>
                    </div>
                );
            }

            // Description --------------------------------
            if (undefined !== data.description) {
                // TODO: format this better (e.g., convert the newline chars to <br/> ?)
                description = (
                    <div className="card-block">
                        <h5 className="card-subtitle">Description</h5>
                        <p className="card-block">{data.description}</p>
                    </div>
                );
            }
        }

        // Build the final structure
        let post;
        let commonHeader = (
            <div className="card-block">
                <h4 className="card-title">{data.title}</h4>
                {siglumProvenanceDate}
            </div>
        );

        if ('full' === this.props.size) {
            post = (
                <div className="card">
                    {commonHeader}
                    <ul className="list-group list-group-flush">
                        {provenanceDetail}
                        {status}
                        {summary}
                        {occasions}
                    </ul>
                    {indexingInfo}
                    {description}
                </div>
            );
        } else {
            post = (
                <div className="card">
                    {commonHeader}
                </div>
            );
        }

        return post;
    }
});


var ItemViewSimpleResource = React.createClass({
    // An ItemView that displays what the Cantus API calls "simple resources": century, notation,
    // office, portfolio categories, provenance, RISM siglum (pl. sigla), segment, source status
    //

    propTypes: {
        data: React.PropTypes.object.isRequired,
        resources: React.PropTypes.object.isRequired,
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {size: 'full'};
    },
    render: function() {
        let liClassName = 'list-group-item';
        let data = this.props.data;
        let resources = this.props.resources;

        // Fields Available:
        // - name
        // - description

        let description = '';

        if ('full' === this.props.size) {
            // Description
            if (undefined !== data.description) {
                description = <h6 className="card-subtitle text-muted">{data.description}</h6>;
            }
        }

        // Build the final structure
        let post = (
            <div className="card">
                <div className="card-block">
                    <h4 className="card-title">{data.name}</h4>
                    {description}
                </div>
            </div>
        );

        return post;
    }
});


var ItemView = React.createClass({
    // TODO: description
    //

    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {theItem: getters.currentItemView};
    },
    render: function() {

        // TODO: professionalize this
        if (0 === this.state.theItem.size) {
            return (<div>empty lolz</div>);
        }

        // "item" will contain only fields for this item
        // "resources" will contain only URLs for this item
        let itemID = this.state.theItem.get('sort_order').get(0);
        // console.log(itemID);
        let item = this.state.theItem.get(itemID).toObject();
        // console.log(item);
        // console.log(item.get('type'));
        let resources = this.state.theItem.get('resources').get(itemID).toObject();
        // console.log(resources);

        if (null === item.type || null === item.id) {
            return (<div>empty type or ID</div>);
        } else if (null === item) {
            return (<div>waiting on Abbot</div>);
        } else if ('string' === typeof item) {
            return (<div className="alert alert-warning">{item}</div>);
        } else {
            let rendered = null;  // this holds the rendered component

            switch (item.type) {
                case 'chant':
                    rendered = <ItemViewChant data={item} resources={resources} size={this.props.size}/>;
                    break;

                case 'feast':
                    rendered = <ItemViewFeast data={item} resources={resources} size={this.props.size}/>;
                    break;

                case 'indexer':
                    rendered = <ItemViewIndexer data={item} resources={resources} size={this.props.size}/>;
                    break;

                case 'genre':
                    rendered = <ItemViewGenre data={item} resources={resources} size={this.props.size}/>;
                    break;

                case 'source':
                    rendered = <ItemViewSource data={item} resources={resources} size={this.props.size}/>;
                    break;

                case 'century':
                case 'notation':
                case 'office':
                case 'portfolio':
                case 'provenance':
                case 'siglum':
                case 'segment':
                case 'source_status':
                    rendered = <ItemViewSimpleResource data={item} resources={resources} size={this.props.size}/>;
                    break;

                default:
                    rendered = <div className="alert alert-info">Resource type not implemented: {item.type}.</div>;
                    break;
            }

            return rendered;
        }
    }
});


var ItemViewDevelWrapper = React.createClass({
    // This is a wrapper for ItemView BUT ONLY DURING INITIAL DEVELOPMENT.
    //

    getInitialState: function() {
        return {size: 'full'};
    },
    componentDidMount: function() {
        let fakeEvent = {preventDefault: function() {}};
        this.submitTypeAndId(fakeEvent);
    },
    submitTypeAndId: function(event) {
        // Call this when the "Submit" button is clicked for this wrapper thing.

        // TODO: make this actually use the user-written type and ID
        event.preventDefault();  // stop the default GET form submission
        SIGNALS.loadInItemView(this.refs.resType.value, this.refs.resID.value);
    },
    onChangeSizeRadioButton: function(event) {
        this.setState({size: event.target.value});
    },
    render: function() {

        // Set @checked for the "size" radio buttons. The first is with default "state."
        let fullSizeChecked = true;
        let compactSizeChecked = false;
        if ('compact' === this.state.size) {
            fullSizeChecked = false;
            compactSizeChecked = true;
        }

        return (
            <div>
                <div className="alert alert-info">
                    <p><strong>Note:</strong> This is a development wrapper around the proper ItemView.</p>
                    <p>Once &ldquo;Vitrail&rdquo; is deployed, the resource type and ID will be set
                    automatically, and the ItemView will be triggered from search results when you
                    choose a particular resource.</p>
                </div>
                <div className="card">
                    <div className="card-block">
                        <h2 className="card-title">ItemView Development Wrapper</h2>
                        <form onSubmit={this.submitTypeAndId}>
                            <fieldset className="form-group">
                                <label htmlFor="#ivdw-type">Resource Type (lowercase plural):</label>
                                <input type="text" className="form-control" id="ivdw-type"
                                       placeholder="e.g., chants" defaultValue="sources" ref="resType"/>
                            </fieldset>
                            <fieldset className="form-group">
                                <label htmlFor="#ivdw-type">Resource ID:</label>
                                <input type="text" className="form-control" id="ivdw-type"
                                       placeholder="e.g., 149243" defaultValue="123723" ref="resID"/>
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
                            <button type="submit" className="btn btn-primary">Show</button>
                        </form>
                    </div>
                    <div className="card-block">
                        <ItemView size={this.state.size}/>
                    </div>
                </div>
            </div>
        );
    }
});


export {ItemViewDevelWrapper, ItemView};
export default ItemView;
