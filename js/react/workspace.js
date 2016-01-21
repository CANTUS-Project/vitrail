// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/workspaces.js
// Purpose:                The "Workspace" components for Vitrail.
//
// Copyright (C) 2016 Christopher Antila
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
import {Link} from 'react-router';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Panel from 'react-bootstrap/lib/Panel';
import Popover from 'react-bootstrap/lib/Popover';
import Row from 'react-bootstrap/lib/Row';

import getters from '../nuclear/getters';
import log from '../util/log';
import reactor from '../nuclear/reactor';
import ResultList from './result_list';
import signals from '../nuclear/signals';


/** A collection of database resources, as represented in the Shelf component.
 *
 * Props:
 * ------
 * @param (ImmutableJS.Map) collection - The collection corresponding to this Collection.
 */
const Collection = React.createClass({
    propTypes: {
        collection: React.PropTypes.object.isRequired,  // TODO: put a Map here
    },
    render() {
        const colid = this.props.collection.get('colid');
        const name = this.props.collection.get('name');

        const overlay = (
            <Popover id={`coll-${colid}`} title={name}>
                <ButtonGroup>
                    <Link className="btn btn-default" to={`/workspace/collection/${colid}`}>
                        Open
                    </Link>
                    <Button>Rename</Button>
                    <Button>Delete</Button>
                </ButtonGroup>
            </Popover>
        );

        return (
            <ListGroupItem>
                <OverlayTrigger trigger="click" placement="left" overlay={overlay} rootClose>
                    <Button>{name}</Button>
                </OverlayTrigger>
            </ListGroupItem>
        );
    },
});


/** What pops up when you choose the "Advanced" button on the Desk.
 *
 * Props:
 * ------
 * @param (func) closeFunc - This function can be called without arguments to close the DeskAdvanced.
 */
const DeskAdvanced = React.createClass({
    propTypes: {
        collection: React.PropTypes.object.isRequired,  // TODO: turn this into requiring a Map
        closeFunc: React.PropTypes.func.isRequired,
    },
    render() {
        const title = `Advanced Settings: "${this.props.collection.get('name')}"`;
        let basis = 'list';
        if (this.props.collection.get('query')) {
            basis = 'query';
        }
        basis = `This is a ${basis}-based collection.`;

        let message;

        if (this.props.collection.get('query')) {
            message = this.props.collection.get('query');
        }
        else {  // list-based with "members"
            message = `IDs in this collection: ${this.props.collection.get('members').join(', ')}.`;
        }

        return (
            <Modal show onHide={this.props.closeFunc}>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup>
                        <ListGroupItem>{basis}</ListGroupItem>
                        <ListGroupItem>{message}</ListGroupItem>
                    </ListGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.props.closeFunc}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


/** The main workspace, where users can view a collection.
 *
 * Props:
 * ------
 * @param (str) colid - The collection ID to display.
 *
 * State:
 * ------
 * @param (ImmutableJS.Map) collections - From NuclearJS, all of this user's Collections.
 */
const Desk = React.createClass({
    propTypes: {
        colid: React.PropTypes.string.isRequired,
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return { collections: getters.collectionsList };
    },
    componentWillMount() {
        signals.loadSearchResults('reset');
        this.loadCollection(this.props.colid);
    },
    componentWillReceiveProps(nextProps) {
        this.loadCollection(nextProps.colid);
    },
    getInitialState() {
        return {showAdvanced: false};
    },
    toggleShowAdvanced() {
        this.setState({showAdvanced: !this.state.showAdvanced});
    },
    /** Load the data for the collection given by "colid." */
    loadCollection(colid) {
        if (!this.state.collections.has(colid)) {
            signals.loadSearchResults('reset');
            log.error(`The collection ID (${colid}) does not exist.`);
        }
        else {
            const coll = this.state.collections.get(colid);
            if (coll.get('query')) {
                signals.setSearchQuery({'any': coll.get('query')});
            }
            else {  // has a List of "members"
                signals.setSearchQuery({'any': `+id:(${coll.get('members').join(' OR ')})`});
            }
            signals.submitSearchQuery();
        }
    },
    render() {
        let advanced;
        let openCollectionName = '';
        // only render the collection's name, and the "Advanced" panel, we've loaded the collection
        if (this.state.collections.has(this.props.colid)) {
            openCollectionName = this.state.collections.get(this.props.colid).get('name');
            if (this.state.showAdvanced) {
                advanced = (
                    <DeskAdvanced closeFunc={this.toggleShowAdvanced}
                                  collection={this.state.collections.get(this.props.colid)}
                />);
            }
        }
        const header = [
            <span key="1">{`Desk (viewing "${openCollectionName}")`}</span>,
            <Button key="2" onClick={this.toggleShowAdvanced}>Advanced</Button>
        ];
        // TODO: if we have an invalid collection ID, also don't show the "Advanced" button

        return (
            <Col lg={10}>
                <Panel header={header}>
                    <ResultList/>
                </Panel>
                {advanced}
            </Col>
        );
    },
});


const Shelf = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return { collections: getters.collectionsList };
    },
    render() {
        const collections = this.state.collections.map(value => {
            return <Collection key={value.get('colid')} collection={value}/>;
        }).toArray();

        return (
            <Col lg={2}>
                <Panel header="Shelf">
                    <ListGroup fill>
                        {collections}
                    </ListGroup>
                    <Button bsStyle="warning">Maybe another button to make a new collection?</Button>
                </Panel>
                {this.props.children}
            </Col>
        );
    },
});


/**
 *
 * Props:
 * ------
 * @param (str) params.colid - From NuclearJS, the collection ID to display.
 */
 // TODO: the ItemViewOverlay doesn't work very well here... the way it goes up a level puts ":colid" in the URL!!!
const DeskAndShelf = React.createClass({
    propTypes: {
        params: React.PropTypes.shape({
            colid: React.PropTypes.string.isRequired,
        }).isRequired,
    },
    render() {
        return (
            <div>
                <Desk colid={this.props.params.colid}/>
                <Shelf/>
                {this.props.children}
            </div>
        );
    },
});


const JustShelf = React.createClass({
    render() {
        return (
            <div>
                <Col lg={10}>
                    <Panel header="Desk">
                        <p>
                            Your desk is empty. Good job keeping everything clean!
                        </p>
                        <p>
                            Choose a Collection from your Shelf to start working.
                        </p>
                    </Panel>
                </Col>
                <Shelf/>
            </div>
        );
    },
});


const WorkspaceHelp = React.createClass({
    propTypes: {
        hideHelp: React.PropTypes.func,
    },
    render() {
        return (
            <Modal show={true} onHide={this.props.hideHelp} >
                <Modal.Header>
                    <Modal.Title>About the Workspace</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        In the Workspace, you can create private "Collections" of resources. Store them
                        on the "Shelf" or view them on the "Desk."
                    </p>
                    <p>
                        Collections help you compile resources, and keep track of search results or other
                        groups of resources that you may want to view later.
                    </p>
                    <p>
                        You can name your collections, but remember that they are always private, they
                        cannot be shared, and they are not backed up to a CANTUS server. If you lose your
                        collections, such as by resetting your browser cache, there is unfortunately no
                        way to get them back.
                    </p>
                    <hr/>
                    <p>
                        Collections may either be "Query Based" or "List Based."
                    </p>
                    <dl>
                        <dt>Query-based collection</dt>
                        <dd>
                            If your collection is <dfn>query-based</dfn>, we save a search query.
                            The actual items in the collection may change over time as chants are
                            added to the CANTUS Database, and as our search software improves.
                        </dd>
                    </dl>
                    <p>
                        You might use this to remember a complicated search query. For
                        example, after you figure out the search query that finds the third
                        antiphon on even-numbered <i>folia</i> for Eastertide, you can make
                        the query into a collection. As new manuscripts are added to the
                        database, matching antiphons will automatically appear in your saved collection.
                    </p>
                    <dl>
                        <dt>List-based collection</dt>
                        <dd>
                            If your collection is <dfn>list-based</dfn>, we save the internal ID
                            number for every item in your collection. You will always see the most
                            up-to-date data, but items will not be added to or removed from the
                            collection unless you do so specifically.
                        </dd>
                    </dl>
                    <p>
                        You might use this track a group of items that will never change, or
                        that are related only in ways the database does not understand. For
                        example, you might keep a list-based collection of all the chants
                        mentioned in an article. Or to keep a list of your favourite chants.
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.props.hideHelp}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


const Workspace = React.createClass({
    getInitialState() {
        return {showHelp: false};
    },
    toggleShowHelp() {
        this.setState({showHelp: !this.state.showHelp});
    },
    render() {
        const help = this.state.showHelp ? <WorkspaceHelp hideHelp={this.toggleShowHelp}/> : undefined;

        return (
            <Grid id="vitrail-workspace" fluid>
                <div className="alert alert-danger"><strong>The Workspace is a half-finished draft. It does not work.</strong></div>
                {help}
                <PageHeader>
                    Workspace&emsp;
                    <small>
                        <i>Manage your personal collections.</i>&emsp;
                        <Button bsStyle="info" onClick={this.toggleShowHelp}>?</Button>
                    </small>
                </PageHeader>

                <Row>
                    {this.props.children}
                </Row>
            </Grid>
        );
    },
});


const moduleForTesting = {
    Workspace: Workspace,
};
export {DeskAndShelf, JustShelf, Workspace};
