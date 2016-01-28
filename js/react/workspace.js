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

import localforage from 'localforage';
import {Immutable} from 'nuclear-js';
import React from 'react';
import {Link} from 'react-router';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Grid from 'react-bootstrap/lib/Grid';
import Input from 'react-bootstrap/lib/Input';
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
import {localforageKey, reactor} from '../nuclear/reactor';
import ResultList from './result_list';
import signals from '../nuclear/signals';


/** Displays existing collections, asking the user which collection a resource should be added to.
 *
 * NuclearJS State
 * ---------------
 * @param (ImmutableJS.Map) collections - The collections that exist.
 */
const AddToCollection = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            collections: getters.collectionsList,
            show: getters.showAddToCollection,
            candidate: getters.candidateForCollection,
        };
    },
    addToCollection(event) {
        signals.addResourceIDToCollection(event.target.id.slice(4), this.state.candidate);
        this.justHide();
    },
    justHide() {
        signals.toggleAddToCollection();
    },
    render() {
        return(
            <Modal show={this.state.show} onHide={this.justHide}>
                <Modal.Header>
                    Add resource to which collection?
                </Modal.Header>
                <Modal.Body>
                    {this.state.collections.map((value, key) => {
                        return (
                            <Button onClick={this.addToCollection} id={`col-${key}`} key={key} block>
                                {value.get('name')}
                            </Button>
                        );
                    }).toList()}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.justHide}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


/** Produces a <ButtonGroup> with buttons for adding/removing a resource to a collection, as applicable.
 *
 * Props:
 * ------
 * @param (string) rid - The resource ID to add or remove.
 * @param (string) colid - The collection ID this resource is in, if applicable.
 *
 * Note that a "remove" button will only be produced if the "colid" prop is given. Otherwise, we
 * don't know from which collection to remove the resource.
 *
 * The "add" button is always shown because you might want a resource to be in many collections.
 */
const AddRemoveCollection = React.createClass({
    propTypes: {
        rid: React.PropTypes.string.isRequired,
        colid: React.PropTypes.string,
    },
    addToCollection() {
        signals.askWhichCollection(this.props.rid);
    },
    removeFromCollection() {
        signals.removeResourceIDFromCollection(this.props.colid, this.props.rid);
    },
    render() {
        let removeButton;
        if (this.props.colid) {
            removeButton = (
                <Button onClick={this.removeFromCollection} bsSize="small">
                    <Glyphicon glyph="minus"/>
                    <span className="sr-only">Remove from Collection</span>
                </Button>
            );
        }

        return (
            <ButtonGroup>
                <Button onClick={this.addToCollection} bsSize="small">
                    <Glyphicon glyph="plus"/>
                    <span className="sr-only">Add to a Collection</span>
                </Button>
                {removeButton}
            </ButtonGroup>
        );
    },
});


/** Sub-component of Collection that allows renaming.
 *
 * Props:
 * ------
 * @param (ImmutableJS.Map) collection - Optional. The collection corresponding to this Collection.
 *     If this is omitted, we assume this is for a new collection.
 * @param (function) hideMe - This function is called to hide the component.
 * @param (function) chooseName - This function is called with the newly-chosen name.
 *
 * State:
 * ------
 * @param (string) name - The new name for the collection, as it's typed.
 */
const CollectionRename = React.createClass({
    propTypes: {
        collection: React.PropTypes.instanceOf(Immutable.Map),
        hideMe: React.PropTypes.func.isRequired,
        chooseName: React.PropTypes.func.isRequired,
    },
    getInitialState() {
        if (this.props.collection) {
            return {name: this.props.collection.get('name')};
        }
        else {
            return {name: ''};
        }
    },
    updateName(event) { this.setState({name: event.target.value}); },
    submitRename() { this.props.chooseName(this.state.name); this.props.hideMe(); },
    render() {
        let header;
        if (this.props.collection) {
            header = `Rename "${this.props.collection.get('name')}"`
        }
        else {
            header = 'New collection';
        }

        return (
            <Modal show onHide={this.props.hideMe}>
                <Modal.Header>
                    {header}
                </Modal.Header>
                <Modal.Body>
                    <Input
                        type="text"
                        label="New name for the collection"
                        ref="input"
                        value={this.state.name}
                        onChange={this.updateName}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.props.hideMe}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.submitRename}>Choose Name</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


/** A collection of database resources, as represented in the Shelf component.
 *
 * Props:
 * ------
 * @param (ImmutableJS.Map) collection - The collection corresponding to this Collection.
 *
 * State:
 * ------
 * @param (bool) showRenamer - Whether to show the <CollectionRename> component.
 */
const Collection = React.createClass({
    propTypes: {
        collection: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    },
    getInitialState() {
        return {showRenamer: false};
    },
    delete() {
        signals.deleteCollection(this.props.collection.get('colid'));
    },
    toggleRenamer() {
        this.setState({showRenamer: !this.state.showRenamer});
    },
    submitRename(newName) {
        signals.renameCollection(this.props.collection.get('colid'), newName);
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
                    <Button onClick={this.toggleRenamer}>Rename</Button>
                    <Button onClick={this.delete}>Delete</Button>
                </ButtonGroup>
            </Popover>
        );

        let renamer;
        if (this.state.showRenamer) {
            renamer = (
                <CollectionRename collection={this.props.collection}
                                  hideMe={this.toggleRenamer}
                                  chooseName={this.submitRename}
            />);
        }

        return (
            <ListGroupItem>
                {renamer}
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
        const message = `IDs in this collection: ${this.props.collection.get('members').join(', ')}.`;

        return (
            <Modal show onHide={this.props.closeFunc}>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup>
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
    componentWillUpdate(nextProps, nextState) {
        // When the props.colid is changing, or *our* collection changes, we need to ask
        // loadCollection() to help us update.
        if (nextProps.colid !== this.props.colid) {
            this.loadCollection(nextProps.colid);
        }
        else if (!nextState.collections.getIn([this.props.colid, 'members']).equals(this.state.collections.getIn([this.props.colid, 'members']))) {
            this.loadCollection(nextProps.colid, nextState);
        }
    },
    getInitialState() {
        return {showAdvanced: false};
    },
    toggleShowAdvanced() {
        this.setState({showAdvanced: !this.state.showAdvanced});
    },
    /** Load the data for the collection given by "colid."
     *
     * @param (str) colid - The collection ID to load.
     * @param (ImmutableJS.Map) nextState - If updating the collection to a value not yet in
     *     "this.state" then this argument should be "nextState."
     */
    loadCollection(colid, nextState) {
        let state = this.state;
        if (nextState) {
            state = nextState;
        }

        if (!state.collections.has(colid)) {
            signals.loadSearchResults('reset');
            log.error(`The collection ID (${colid}) does not exist.`);
        }
        else {
            const members = state.collections.getIn([colid, 'members']);
            signals.setSearchQuery({'any': `+id:(${members.join(' OR ')})`});
            signals.submitSearchQuery();
        }
    },
    render() {
        let advanced;
        let openCollectionName;
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
                    <ResultList colid={this.props.colid}/>
                </Panel>
                {advanced}
            </Col>
        );
    },
});


/** Confirm with the user that they want to reset the NuclearJS reactor.
 *
 * @param (function) hideMe - This function is called to hide the component.
 */
const ReactorResetter = React.createClass({
    propTypes: {
        hideMe: React.PropTypes.func.isRequired,
    },
    doTheReset() {
        signals.clearShelf();
        this.props.hideMe();
    },
    render() {
        return(
            <Modal show onHide={this.props.hideMe}>
                <Modal.Header>
                    Really clear your shelf?
                </Modal.Header>
                <Modal.Body>
                    When you clear your shelf:
                    <ul>
                        <li>all your collections are deleted,</li>
                        <li>all your saved collections are deleted, and</li>
                        <li>all your saved chants are deleted too.</li>
                    </ul>
                    This does not affect data on the server. Only your local data are affected.
                    <div className="alert alert-danger"><strong>NOTE</strong>: it does not fully work, so you have to refresh the page after you clear</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.doTheReset}>Clear</Button>
                    <Button bsStyle="success" onClick={this.props.hideMe}>Keep Shelf</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


/** TODO
 *
 * State:
 * ------
 * @param (ImmutableJS.Map) collections - From NuclearJS. The collections that exist.
 * @param (bool) addingNewCollection - Whether we are currently adding a new collection, and the
 *     "CollectionRename" component should therefore be shown.
 * @param (bool) showResetter - Whether we are currently asking the user whether they want to reset
 *     the NuclearJS Reactor, and should therefore show the "ReactorResetter" component.
 */
const Shelf = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return { collections: getters.collectionsList };
    },
    getInitialState() { return {addingNewCollection: false, showResetter: false}; },
    toggleAddingCollection() { this.setState({addingNewCollection: !this.state.addingNewCollection}); },
    toggleShowResetter() { this.setState({showResetter: !this.state.showResetter}); },
    addCollection(newName) { signals.addNewCollection(newName); },
    saveShelf() { localforage.setItem(localforageKey, reactor.serialize()); },
    render() {
        const collections = this.state.collections.map(value => {
            return <Collection key={value.get('colid')} collection={value}/>;
        }).toArray();

        let renamer;
        if (this.state.addingNewCollection) {
            renamer = <CollectionRename hideMe={this.toggleAddingCollection} chooseName={this.addCollection}/>;
        }

        let resetter;
        if (this.state.showResetter) {
            resetter = <ReactorResetter hideMe={this.toggleShowResetter}/>;
        }

        return (
            <Col lg={2}>
                {renamer}
                {resetter}
                <Panel header="Shelf">
                    <ListGroup fill>
                        {collections}
                    </ListGroup>
                    <Button bsStyle="success" block onClick={this.toggleAddingCollection}>
                        <Glyphicon glyph="plus"/>&nbsp;New Collection
                    </Button>
                    <Button bsStyle="success" block onClick={this.saveShelf}>
                        <Glyphicon glyph="save"/>&nbsp;Save Shelf
                    </Button>
                    <Button bsStyle="warning" block onClick={this.toggleShowResetter}>
                        <Glyphicon glyph="trash"/>&nbsp;Clear Shelf
                    </Button>
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
                        Soon, you will be able to save collections, and all the resources in them,
                        in your browser across restarts. That way, you can access the CANTUS Database
                        offline.
                    </p>
                    <p>
                        You can name your collections, but remember that they are always private, they
                        cannot be shared, and they are not backed up to a CANTUS server. If you lose your
                        collections, such as by resetting your browser cache, there is unfortunately no
                        way to get them back.
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
                <div className="alert alert-warning"><strong>The Workspace is a draft. It only sort of works.</strong></div>
                {help}
                <PageHeader>
                    Workspace&emsp;
                    <small>
                        <i>Manage your personal collections.</i>&emsp;
                        <Button bsStyle="info" onClick={this.toggleShowHelp}>
                            <Glyphicon glyph="question-sign"/>
                        </Button>
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
export {AddToCollection, AddRemoveCollection, DeskAndShelf, JustShelf, Workspace};
