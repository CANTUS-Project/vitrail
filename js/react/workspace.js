// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
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
// -----------------------------------------------------------------------------------------------

import {Immutable} from 'nuclear-js';
import React from 'react';
import {Link} from 'react-router';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
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


// for the "add to collection" and "remove from collection" buttons
const addToCollTooltip = 'Save Chant in a Collection';
const removeFromCollTooltip = 'Remove Chant from this Collection';


/** Displays existing collections, asking the user which collection a resource should be added to.
 *
 * NuclearJS State
 * ---------------
 * @param (ImmutableJS.Map) collections - The collections that exist.
 */
const AddToCollection = React.createClass({
    propTypes: {
        rid: React.PropTypes.string,
        close: React.PropTypes.func.isRequired,
    },
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {collections: getters.collections};
    },
    handleClick(event) {
        const startOfSlice = 4;  // after the "col-" part
        signals.addToCollection(event.target.id.slice(startOfSlice), this.props.rid);
        this.handleHide();
    },
    handleHide() {
        this.props.close();
    },
    render() {
        return (
            <Modal show onHide={this.handleHide}>
                <Modal.Header>
                    {`Add resource to which collection?`}
                </Modal.Header>
                <Modal.Body>
                    {this.state.collections.map((value, key) =>
                        <Button onClick={this.handleClick} id={`col-${key}`} key={key} block>
                            {value.get('name')}
                        </Button>
                    ).toList()}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.handleHide}>{`Cancel`}</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


/** Produces a <ButtonGroup> with buttons for adding/removing a resource to a collection, as applicable.
 *
 * Props
 * -----
 * @param (string) rid - The resource ID to add or remove.
 *
 * State
 * -----
 * @param {bool} showAddToCollection - Whether to render the AddToCollection subcomponent.
 * @param (bool) showingCollection - From the "showingCollection" getter.
 *
 * Note that a "remove" button will only be produced if "state.showingCollection" is not false.
 * Otherwise, we don't know from which collection to remove the resource.
 *
 * The "add" button is always shown because you might want a resource to be in many collections.
 */
const AddRemoveCollection = React.createClass({
    propTypes: {
        rid: React.PropTypes.string.isRequired,
    },
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {showingCollection: getters.showingCollection};
    },
    getInitialState() {
        return {showAddToCollection: false};
    },
    handleRemove() {
        signals.removeFromCollection(this.state.showingCollection, this.props.rid);
    },
    openAddToCollection() {
        this.setState({showAddToCollection: true});
    },
    closeAddToCollection() {
        this.setState({showAddToCollection: false});
    },
    render() {
        let removeButton;
        if (this.state.showingCollection) {
            removeButton = (
                <Button onClick={this.handleRemove} bsSize="small" title={removeFromCollTooltip}>
                    <Glyphicon glyph="minus"/>
                    <span className="sr-only">{removeFromCollTooltip}</span>
                </Button>
            );
        }

        let addToCollection;
        if (this.state.showAddToCollection) {
            addToCollection = <AddToCollection rid={this.props.rid} close={this.closeAddToCollection}/>;
        }

        return (
            <ButtonGroup>
                {addToCollection}
                <Button onClick={this.openAddToCollection} bsSize="small" title={addToCollTooltip}>
                    <Glyphicon glyph="save"/>
                    <span className="sr-only">{addToCollTooltip}</span>
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
 * @param (function) handleHide - This function is called to hide the component.
 * @param (function) chooseName - This function is called with the newly-chosen name.
 *
 * State:
 * ------
 * @param (string) name - The new name for the collection, as it's typed.
 */
const CollectionRename = React.createClass({
    propTypes: {
        chooseName: React.PropTypes.func.isRequired,
        collection: React.PropTypes.instanceOf(Immutable.Map),
        handleHide: React.PropTypes.func.isRequired,
    },
    getInitialState() {
        if (this.props.collection) {
            return {name: this.props.collection.get('name')};
        }
        return {name: ''};
    },
    handleNameChange(event) {
        this.setState({name: event.target.value});
    },
    handleRename() {
        this.props.chooseName(this.state.name); this.props.handleHide();
    },
    render() {
        let header;
        if (this.props.collection) {
            header = `Rename "${this.props.collection.get('name')}"`;
        }
        else {
            header = 'New collection';
        }

        return (
            <Modal show onHide={this.props.handleHide}>
                <Modal.Header>
                    {header}
                </Modal.Header>
                <Modal.Body>
                    <FormGroup controlId="formControlsTextarea">
                        <ControlLabel>{`New name for the collection`}</ControlLabel>
                        <FormControl type="text" value={this.state.name} onChange={this.handleNameChange}/>
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.props.handleHide}>{`Cancel`}</Button>
                    <Button bsStyle="primary" onClick={this.handleRename}>{`Choose Name`}</Button>
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
    handleDelete() {
        signals.deleteCollection(this.props.collection.get('colid'));
    },
    handleShowRenamer() {
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
                    <Link className="btn btn-primary" to={`/workspace/collection/${colid}`}>
                        {`Open`}
                    </Link>
                    <Button bsStyle="primary" onClick={this.handleShowRenamer}>{`Rename`}</Button>
                    <Button bsStyle="primary" onClick={this.handleDelete}>{`Delete`}</Button>
                </ButtonGroup>
            </Popover>
        );

        if (this.state.showRenamer) {
            // TODO: the extra <div> causes the space between the buttons to disappear; either way,
            //       I need a better way to be doing this renaming!
            return (
                <div>
                    <CollectionRename
                        collection={this.props.collection}
                        handleHide={this.handleShowRenamer}
                        chooseName={this.submitRename}
                    />
                    <OverlayTrigger trigger="click" placement="left" overlay={overlay} rootClose>
                        <Button block>{name}</Button>
                    </OverlayTrigger>
                </div>
            );
        }
        else {
            return (
                <OverlayTrigger trigger="click" placement="left" overlay={overlay} rootClose>
                    <Button block>{name}</Button>
                </OverlayTrigger>
            );
        }
    },
});

/** The main workspace, where users can view a collection.
 *
 * State:
 * ------
 * @param (ImmutableJS.Map) collections - From NuclearJS, all of this user's Collections.
 * @param (bool) showingCollection - From the "showingCollection" getter.
 */
const Desk = React.createClass({
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {
            collections: getters.collections,
            showingCollection: getters.showingCollection
        };
    },
    render() {
        let header;
        if (this.state.collections.has(this.state.showingCollection)) {
            header = `Desk (viewing collection "${this.state.collections.get(this.state.showingCollection).get('name')}")`;
        }

        return (
            <Col lg={10}>
                <Panel header={header}>
                    <ResultList/>
                </Panel>
            </Col>
        );
    },
});


/** Confirm with the user that they want to reset the NuclearJS reactor.
 *
 * @param (function) handleHide - This function is called to hide the component.
 */
const ReactorResetter = React.createClass({
    propTypes: {
        handleHide: React.PropTypes.func.isRequired,
    },
    handleClear() {
        signals.clearShelf();
        this.props.handleHide();
    },
    render() {
        return (
            <Modal show onHide={this.props.handleHide}>
                <Modal.Header>{`Really clear your shelf?`}</Modal.Header>
                <Modal.Body>
                    {`When you clear your shelf:`}
                    <ul>
                        <li>{`all your collections are deleted,`}</li>
                        <li>{`all your saved collections are deleted, and`}</li>
                        <li>{`all your saved chants are deleted too.`}</li>
                    </ul>
                    {`This does not affect data on the server. Only your local data are affected.`}
                    <div className="alert alert-danger">
                        <strong>{`NOTE`}</strong>
                        {`: it does not fully work, so you have to refresh the page after you clear`}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.handleClear}>{`Clear`}</Button>
                    <Button bsStyle="success" onClick={this.props.handleHide}>{`Keep Shelf`}</Button>
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
    propTypes: {
        children: React.PropTypes.element,
    },
    mixins: [reactor.ReactMixin],
    getDataBindings() {
        return {collections: getters.collections};
    },
    getInitialState() {
        return {addingNewCollection: false, showResetter: false};
    },
    toggleAddingCollection() {
        this.setState({addingNewCollection: !this.state.addingNewCollection});
    },
    toggleShowResetter() {
        this.setState({showResetter: !this.state.showResetter});
    },
    addCollection(newName) {
        signals.newCollection(newName);
    },
    render() {
        const collections = this.state.collections.map((value) =>
            <Collection key={value.get('colid')} collection={value}/>
        ).toArray();

        let renamer;
        if (this.state.addingNewCollection) {
            renamer = (
                <CollectionRename
                    handleHide={this.toggleAddingCollection}
                    chooseName={this.addCollection}
                />
            );
        }

        let resetter;
        if (this.state.showResetter) {
            resetter = <ReactorResetter handleHide={this.toggleShowResetter}/>;
        }

        return (
            <Col lg={2}>
                {renamer}
                {resetter}
                <Panel header="Shelf">
                    {collections}
                    <hr/>
                    <ButtonGroup block vertical>
                        <Button bsStyle="primary" onClick={this.toggleAddingCollection}>
                            <Glyphicon glyph="plus"/>{` New Collection`}
                        </Button>
                        <Button bsStyle="primary" onClick={this.toggleShowResetter}>
                            <Glyphicon glyph="trash"/>{` Clear Shelf`}
                        </Button>
                    </ButtonGroup>
                </Panel>
                {this.props.children}
            </Col>
        );
    },
});


/**
 *
 * NOTE: this component is responsible for setting the current collection ID
 *
 * Props:
 * ------
 * @param (str) params.colid - From NuclearJS, the collection ID to display.
 */
const DeskAndShelf = React.createClass({
    propTypes: {
        children: React.PropTypes.element,
        params: React.PropTypes.shape({
            colid: React.PropTypes.string.isRequired,
        }).isRequired,
    },
    componentWillMount() {
        this.loadCollection(this.props.params.colid);
    },
    componentWillUpdate(nextProps) {
        if (this.props.params.colid !== nextProps.params.colid) {
            loadCollection(colid);
        }
    },
    componentWillUnmount() {
        signals.setShowingCollection(false);
    },
    /** Load the data for the collection given by "colid."
     *
     * @param {str} colid - The collection ID to load.
     */
    loadCollection(colid) {
        if (colid) {
            signals.setShowingCollection(colid);
            signals.setPage(1);
            signals.loadCollection(colid);
        }
    },
    render() {
        return (
            <div>
                <Desk/>
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
                            {`Choose a Collection from the Shelf to see its contents on the Desk.`}
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
        handleHide: React.PropTypes.func,
    },
    render() {
        return (
            <Modal show onHide={this.props.handleHide} >
                <Modal.Header>
                    <Modal.Title>{`About the Workspace`}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        {`Use the Workspace to save "Collections" of chants to view offline. Your
                        collections are held on the "Shelf." Click or tap a collection on the Shelf
                        to open its chants on the "Desk."`}
                    </p>
                    <p>
                        {`You can name your collections and use them to keep track of search results
                        or any other group of chants you may want to view later. However, your
                        collections are only stored in your browser, so nobody else can see them.`}
                    </p>
                    <p>
                        {`When you add chants to a collection, they're automatically saved in your
                        browser. This means you can view the chants in your collections even if
                        you're not connected to the internet. Refer to our `}
                        <Link to="/offline">{`offline page `}</Link>{`for more information.`}
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.props.handleHide}>{`Close`}</Button>
                </Modal.Footer>
            </Modal>
        );
    },
});


const Workspace = React.createClass({
    propTypes: {
        children: React.PropTypes.element,
    },
    getInitialState() {
        return {showHelp: false};
    },
    handleHelp() {
        this.setState({showHelp: !this.state.showHelp});
    },
    render() {
        const help = this.state.showHelp ? <WorkspaceHelp handleHide={this.handleHelp}/> : undefined;

        return (
            <Grid id="vitrail-workspace" fluid>
                {help}
                <PageHeader>
                    {`Workspace\u2003`}
                    <small>
                        <i>{`Manage your personal collections.\u2003`}</i>
                        <Button bsStyle="info" onClick={this.handleHelp}>
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
export {AddToCollection, AddRemoveCollection, DeskAndShelf, JustShelf, Workspace, moduleForTesting};
