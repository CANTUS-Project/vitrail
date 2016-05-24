// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_onebox.js
// Purpose:                Tests for the OneboxSearch (and related) React components.
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
// ------------------------------------------------------------------------------------------------

import init from '../js/nuclear/init';

import {mount, shallow} from 'enzyme';
import {Immutable} from 'nuclear-js';
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';

import {getters} from '../js/nuclear/getters';
import reactor from '../js/nuclear/reactor';
import {SIGNALS as signals} from '../js/nuclear/signals';

jest.dontMock('../js/react/onebox.js');  // module under test
jest.dontMock('../js/react/vitrail.js');  // imported to 'itemview' for AlertView
const onebox = require('../js/react/onebox.js');


describe('SearchBox', () => {
    beforeEach(() => { reactor.reset(); });

    it('renders a search box', () => {
        // set a value to display in the search box
        const expectedQuery = 'hello';
        signals.setSearchQuery({any: expectedQuery});

        // render the component
        const actual = shallow(<onebox.SearchBox/>);

        // for the search field iteself
        expect(actual.type()).toBe(FormControl);
        expect(actual.props().type).toBe('search');
        expect(actual.props().value).toBe(expectedQuery);
        // for the "Submit" button
        const buttonAfter = actual.props().buttonAfter;
        expect(buttonAfter.type).toBe(Button);
        expect(buttonAfter.props.type).toBe('submit');
        expect(buttonAfter.props.value).toBe('Search');
    });

    it('updates when the Store is changed', () => {
        // set the first value to display in the search box
        const firstQuery = 'hello';
        signals.setSearchQuery({any: firstQuery});

        // render the component
        const actualSearchBox = mount(<onebox.SearchBox/>);
        const actual = actualSearchBox.find(FormControl);

        // make sure the first value is set
        expect(actual.props().value).toBe(firstQuery);

        // set the second value to display in the search box
        const secondQuery = 'turbofan';
        signals.setSearchQuery({any: secondQuery});

        // make sure the second value is set
        expect(actual.props().value).toBe(secondQuery);
    });

    it('updates the Store when the value is changed', () => {
        // set the first value to display in the search box
        const firstQuery = 'hello';
        signals.setSearchQuery({any: firstQuery});

        // render the component
        const actualSearchBox = mount(<onebox.SearchBox/>);
        const actual = actualSearchBox.find(FormControl);

        // make sure the first value is set
        expect(actual.props().value).toBe(firstQuery);

        // write the second value into the search box
        const secondQuery = 'turbofan';
        actual.simulate('change', {target: {value: secondQuery}});

        // make sure the second value is set in the Store
        const expected = Immutable.Map({type: 'all', any: secondQuery});
        expect(reactor.evaluate(getters.searchQuery)).toEqual(expected);
    });
});
