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
jest.dontMock('../js/react/itemview.js');  // module under test
const itemview = require('../js/react/itemview.js').moduleForTesting;

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';


describe('ItemViewMultiplexer', () => {
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
        expect(props.message).toBe(errorMessage);
        expect(props.class).toBe('warning');
        expect(props.fields.get('Component')).toBe('ItemView');
        expect(props.fields.get('Type')).toBe(type.toString());
        expect(props.fields.get('ID')).toBe(rid.toString());
        expect(props.fields.get('Data')).toBe(data.toString());
        expect(props.fields.get('Resources')).toBe(resources.toString());
    });
});


describe('ItemViewOverlay', () => {
    it('works as intended', () => {
        const params = {type: 'chant', rid: '1234'};
        const routes = [{path: '/'}, {path: 'lolz'}, {path: ':type/:rid'}];

        const overlay = TestUtils.renderIntoDocument( <itemview.ItemViewOverlay params={params} routes={routes}/> );
        const overlayNode = ReactDOM.findDOMNode(overlay);

        expect(overlayNode.className).toBe('itemview-overlay');
        expect(overlayNode.children[0].className).toBe('itemview-button-container');
        // just make sure it's an <a> like returned by Link; we'll trust that component did its stuff
        expect(overlayNode.children[0].children[0].tagName).toBe('A');
        // just make sure it's a <div> like returned by ItemView
        expect(overlayNode.children[0].children[1].tagName).toBe('DIV');
        expect(overlayNode.children[0].children[1].className).toBe('itemview');
    });
});


describe('pathToParent()', () => {
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
});
