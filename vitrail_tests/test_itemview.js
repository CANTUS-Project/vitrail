// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_itemview.js
// Purpose:                Tests for the ItemView (and related) React components.
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

import init from '../js/nuclear/init';

import {Immutable} from 'nuclear-js';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

import Button from 'react-bootstrap/lib/Button';

import reactor from '../js/nuclear/reactor';
import {SIGNAL_NAMES} from '../js/nuclear/signals';

jest.dontMock('../js/react/itemview.js');  // module under test
jest.dontMock('../js/react/vitrail.js');  // imported to 'itemview' for AlertView
const itemview = require('../js/react/itemview.js').moduleForTesting;


describe('DrupalButton', () => {
    it('renders a button when given a "drupalPath" prop', () => {
        const renderer = TestUtils.createRenderer();
        const actualComponent = renderer.render(
            <itemview.DrupalButton drupalPath="a"/>
        );
        const actual = renderer.getRenderOutput(actualComponent);

        expect(actual.type).toBe(Button);
        expect(actual.props.target).toBe('_blank');
        expect(actual.props.bsStyle).toBe('primary');
        expect(actual.props.children).toBe('View on Drupal');
    });

    it('renders an empty <div> when not given a "drupalPath" prop', () => {
        const renderer = TestUtils.createRenderer();
        const actualComponent = renderer.render(
            <itemview.DrupalButton drupalPath={undefined}/>
        );
        const actual = renderer.getRenderOutput(actualComponent);

        expect(actual.type).toBe('div');
        expect(actual.props).toEqual({});
    });
});


describe('ItemView', () => {
    beforeEach(() => { reactor.reset(); });

    describe('ItemView.whatShouldWeDisplay()', () => {
        it('detects NuclearJS as the data source', () => {
            const type = 'source';
            const rid = '123723';
            const data = undefined;
            const resources = undefined;

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.whatShouldWeDisplay()).toBe('nuclearjs');
        });

        it('detects props as the data source', () => {
            const type = undefined;
            const rid = undefined;
            const data = Immutable.Map({type: 'source', id: '123723'});
            const resources = Immutable.Map();

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.whatShouldWeDisplay()).toBe('props');
        });

        it('detects a mis-specified data source', () => {
            const type = 'source';
            const rid = '123723';
            const data = Immutable.Map({left: 'right'});
            const resources = Immutable.Map({right: 'left'});

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.whatShouldWeDisplay()).toBe('error');
        });
    });

    describe('ItemView.canWeDisplaySomething()', () => {
        it('works with NuclearJS but without results yet', () => {
            const type = 'source';
            const rid = '123723';
            const data = undefined;
            const resources = undefined;

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.canWeDisplaySomething()).toBe(false);
        });

        it('works with NuclearJS and it has results', () => {
            const type = 'source';
            const rid = '123723';
            const data = undefined;
            const resources = undefined;
            const result = Immutable.Map({
                sort_order: Immutable.List(['123723']),
                resources: Immutable.Map({'123723': Immutable.Map({link: 'http'})}),
                123723: Immutable.Map({type: 'source', id: '123723'}),
            });
            // send results to render!
            reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, result);

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.canWeDisplaySomething()).toBe(true);
        });

        it('works with props', () => {
            const type = undefined;
            const rid = undefined;
            const data = Immutable.Map({left: 'right'});
            const resources = Immutable.Map({right: 'left'});

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.canWeDisplaySomething()).toBe(true);
        });

        it('works with neither props nor NuclearJS', () => {
            const type = 'source';
            const rid = '123723';
            const data = Immutable.Map({left: 'right'});
            const resources = Immutable.Map({right: 'left'});

            const actual = TestUtils.renderIntoDocument(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );

            expect(actual.canWeDisplaySomething()).toBe(false);
        });
    });

    describe('ItemView.render()', () => {
        it('gives an ItemViewError when there is nothing to display', () => {
            const type = undefined;
            const rid = undefined;
            const data = undefined;
            const resources = undefined;

            const renderer = TestUtils.createRenderer();
            const actualComponent = renderer.render(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources}/>
            );
            const actual = renderer.getRenderOutput(actualComponent);

            expect(actual.type.displayName).toBe('ItemViewError');
        });

        it('gives an ItemViewMultiplexer when there are props to display', () => {
            const type = undefined;
            const rid = undefined;
            const data = Immutable.Map({type: 'source', id: '123723'});
            const resources = Immutable.Map({link: 'http'});
            const size = 'compact';

            const renderer = TestUtils.createRenderer();
            const actualComponent = renderer.render(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources} size={size}/>
            );
            const actual = renderer.getRenderOutput(actualComponent);

            expect(actual.type.displayName).toBe('ItemViewMultiplexer');
            expect(actual.props.data).toBe(data);
            expect(actual.props.resources).toBe(resources);
            expect(actual.props.size).toBe(size);
        });

        it('gives an ItemViewMultiplexer when there is NuclearJS stuff to display', () => {
            const type = 'source';
            const rid = '123723';
            const data = undefined;
            const resources = undefined;
            const size = 'compact';
            const result = Immutable.Map({
                sort_order: Immutable.List(['123723']),
                resources: Immutable.Map({'123723': Immutable.Map({link: 'http'})}),
                123723: Immutable.Map({type: 'source', id: '123723'}),
            });
            // Send results to render! I tried doing this after, but the test goes too fast and there
            // isn't time to re-render before the assertions. Not really worth waiting, methinks.
            reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, result);

            const renderer = TestUtils.createRenderer();
            const actualComponent = renderer.render(
                <itemview.ItemView type={type} rid={rid} data={data} resources={resources} size={size}/>
            );
            const actual = renderer.getRenderOutput(actualComponent);

            expect(actual.type.displayName).toBe('ItemViewMultiplexer');
            expect(actual.props.data).toBe(result.get('123723'));
            expect(actual.props.resources).toBe(result.get('resources').get('123723'));
            expect(actual.props.size).toBe(size);
        });
    });
});


describe('ItemViewMultiplexer', () => {
    beforeEach(() => { reactor.reset(); });

    /** Resource type of data; component type of resulting React component. */
    function multiplexerTester(resourceType, componentType) {
        const data = Immutable.Map({type: resourceType});
        const resources = Immutable.Map();
        const size = 'compact';

        // shallow render---we just want to make sure it delegates properly to a subcomponent
        const renderer = TestUtils.createRenderer();
        const actualComponent = renderer.render( <itemview.ItemViewMultiplexer
            data={data} resources={resources} size={size}/> );
        const actual = renderer.getRenderOutput(actualComponent);

        expect(actual.type.displayName).toBe(componentType);
        if (componentType !== 'ItemViewError') {
            const props = actual.props;
            expect(props.data).toBe(data);
            expect(props.resources).toBe(resources);
        }
    }

    it('works for chants', () => {
        multiplexerTester('chant', 'ItemViewChant');
    });

    it('works for feasts', () => {
        multiplexerTester('feast', 'ItemViewFeast');
    });

    it('works for indexers', () => {
        multiplexerTester('indexer', 'ItemViewIndexer');
    });

    it('works for genres', () => {
        multiplexerTester('genre', 'ItemViewGenre');
    });

    it('works for sources', () => {
        multiplexerTester('source', 'ItemViewSource');
    });

    it('works for simple resources', () => {
        const types = ['century', 'notation', 'office', 'portfolio', 'provenance', 'siglum',
            'segment', 'source_status'];
        for (let type of types) {
            multiplexerTester(type, 'ItemViewSimpleResource');
        }
    });

    it('works for errors', () => {
        multiplexerTester('vegetable', 'ItemViewError');
    });
});


describe('ItemViewError', () => {
    beforeEach(() => { reactor.reset(); });

    it('works as intended', () => {
        const errorMessage = 'This sucks!';
        const type = Immutable.fromJS({prop: 'type'});
        const rid = Immutable.fromJS({prop: 'rid'});
        const data = Immutable.fromJS({prop: 'data'});
        const resources = Immutable.fromJS({prop: 'resources'});

        // shallow render---we just want to make sure it delegates properly to AlertView
        const renderer = TestUtils.createRenderer();
        const actualComponent = renderer.render( <itemview.ItemViewError
            errorMessage={errorMessage} type={type} rid={rid} data={data} resources={resources}/> );
        const actual = renderer.getRenderOutput(actualComponent);

        expect(actual.type.displayName).toBe('AlertView');
        const props = actual.props;
        expect(props.children).toBe(errorMessage);
        expect(props.class).toBe('warning');
        expect(props.fields.get('Component')).toBe('ItemView');
        expect(props.fields.get('Type')).toBe(type.toString());
        expect(props.fields.get('ID')).toBe(rid.toString());
        expect(props.fields.get('Data')).toBe(data.toString());
        expect(props.fields.get('Resources')).toBe(resources.toString());
    });
});


describe('ItemViewOverlay', () => {
    beforeEach(() => { reactor.reset(); });

    // NOTE:
    // react-bootstrap renders the Modal component in a weird way that prevents ReactDOM from
    // knowing about it, so we need to use document.getElementsByClassName() to find the rendered
    // component. For more information, please visit our website at:
    // https://stackoverflow.com/questions/35086297/testing-a-react-modal-component

    it('works as intended', () => {
        const params = {type: 'chant', rid: '1234'};
        const routes = [{path: '/'}, {path: 'lolz'}, {path: ':type/:rid'}];

        const overlay = TestUtils.renderIntoDocument(
            <itemview.ItemViewOverlay params={params} routes={routes}/>
        );

        // prove the Modal component rendered
        const outModal = document.getElementsByClassName('modal')[0];
        expect(outModal.tagName).toBe('DIV');

        // prove the ItemView rendered an ItemViewError inside the Modal (there is no data, so a
        // full ItemView can't render)
        const outAlert = outModal.getElementsByClassName('alert')[0];
        expect(outAlert.getAttribute('role')).toBe('alert');
    });
});


describe('pathToParent()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works with a zero-element array', () => {
        const routes = [];
        const expected = '/';
        const actual = itemview.pathToParent(routes);
        expect(actual).toBe(expected);
    });

    it('works with a one-element array', () => {
        const routes = [{path: '/'}];
        const expected = '/';
        const actual = itemview.pathToParent(routes);
        expect(actual).toBe(expected);
    });

    it('works with a two-element array', () => {
        const routes = [{path: '/'}, {path: 'search'}];
        const expected = '/';
        const actual = itemview.pathToParent(routes);
        expect(actual).toBe(expected);
    });

    it('works with a three-element array (expected usual situation)', () => {
        const routes = [{path: '/'}, {path: 'search'}, {path: ':type/:rid'}];
        const expected = '/search';
        const actual = itemview.pathToParent(routes);
        expect(actual).toBe(expected);
    });

    it('works with a many-element array', () => {
        const routes = [{path: '/'}, {path: 'search'}, {path: 'results'}, {path: 'subset'},
                        {path: 'whatever'}, {path: ':type/:rid'}];
        const expected = '/search/results/subset/whatever';
        const actual = itemview.pathToParent(routes);
        expect(actual).toBe(expected);
    });

    it('replaces remaining params', () => {
        const routes = [{path: '/'}, {path: 'search'}, {path: 'results'}, {path: ':subset'},
                        {path: 'whatever'}, {path: ':type/:rid'}];
        const params = {rid: '123', type: '456', subset: 'fff'};
        const expected = '/search/results/fff/whatever';
        const actual = itemview.pathToParent(routes, params);
        expect(actual).toBe(expected);
    });
});
