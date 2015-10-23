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


var ItemView = React.createClass({
    // TODO: description
    //

    propTypes: {
        // a CantusJS instance
        cantusjs: React.PropTypes.object.isRequired,
        // type of the resource to display
        resourceType: React.PropTypes.string,
        // ID of the resource to display
        resourceID: React.PropTypes.string,
        // Whether to display the resource with "compact" or "full" formatting.
        size: React.PropTypes.oneOf(['compact', 'full'])
    },
    getDefaultProps: function() {
        return {resourceType: null, resourceID: null, size: 'full'};
    },
    getInitialState: function() {
        return {response: null, resources: null};
    },
    getNewData: function(resourceType, resourceID) {
        // Request new data from CantusJS.
        //

        let settings = {
            type: resourceType,
            id: resourceID
        };

        this.props.cantusjs.get(settings).then(this.cantusjsThen).catch(this.cantusjsCatch);
    },
    cantusjsThen: function(response) {
        // Called when an AJAX request returns successfully.
        //

        this.setState({
            response:  response[response.sort_order[0]],
            resources: response.resources[response.sort_order[0]]
        });
    },
    cantusjsCatch: function(response) {
        // Called when an AJAX request returns unsuccessfully.
        //

        console.error(response);
        this.setState({response: response.response});
    },
    componentDidMount: function() {
        if (null !== this.props.resourceType && null !== this.props.resourceID) {
            this.getNewData(this.props.resourceType, this.props.resourceID);
        }
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.resourceType !== this.props.resourceType ||
            nextProps.resourceID !== this.props.resourceID) {
            if (null !== nextProps.resourceType && null !== nextProps.resourceID) {
                this.getNewData(nextProps.resourceType, nextProps.resourceID);
            }
            this.setState(this.getInitialState());
        }
    },
    render: function() {
        let type = this.props.resourceType;
        let id = this.props.resourceID;
        let response = this.state.response;

        if (null === type || null === id) {
            return (<div>empty type or ID</div>);
        } else if (null === response) {
            return (<div>waiting on Abbot</div>);
        } else if ('string' === typeof response) {
            return (<div className="alert alert-warning">{response}</div>);
        } else {
            let resources = this.state.resources;
            let rendered = null;  // this holds the rendered component

            switch (type) {
                case 'chants':
                    rendered = <ItemViewChant data={response} resources={resources} size={this.props.size}/>;
                    break;

                case 'feasts':
                    rendered = <ItemViewFeast data={response} resources={resources} size={this.props.size}/>;
                    break;

                case 'indexers':
                    rendered = <ItemViewIndexer data={response} resources={resources} size={this.props.size}/>;
                    break;
            }

            return rendered;
        }
    }
});


var ItemViewDevelWrapper = React.createClass({
    // This is a wrapper for ItemView BUT ONLY DURING INITIAL DEVELOPMENT.
    //

    propTypes: {
        // a CantusJS instance
        cantusjs: React.PropTypes.object.isRequired,
    },
    getInitialState: function() {
        return {type: null, id: null, size: 'full'};
    },
    componentDidMount: function() {
        let fakeEvent = {preventDefault: function() {}};
        this.submitTypeAndId(fakeEvent);
    },
    submitTypeAndId: function(event) {
        // Call this when the "Submit" button is clicked for this wrapper thing.

        // TODO: make this actually use the user-written type and ID
        event.preventDefault();  // stop the default GET form submission
        this.setState({
            type: this.refs.resType.getDOMNode().value,
            id: this.refs.resID.getDOMNode().value
        });
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
                                       placeholder="e.g., chants" defaultValue="chants" ref="resType"/>
                            </fieldset>
                            <fieldset className="form-group">
                                <label htmlFor="#ivdw-type">Resource ID:</label>
                                <input type="text" className="form-control" id="ivdw-type"
                                       placeholder="e.g., 149243" defaultValue="149243" ref="resID"/>
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
                        <ItemView cantusjs={this.props.cantusjs} resourceType={this.state.type}
                                  resourceID={this.state.id} size={this.state.size}/>
                    </div>
                </div>
            </div>
        );
    }
});


export {ItemViewDevelWrapper, ItemView};
export default ItemView;
