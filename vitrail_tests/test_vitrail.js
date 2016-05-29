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

// import init from '../js/nuclear/init';

import {mount, shallow} from 'enzyme';
import {Immutable} from 'nuclear-js';
import React from 'react';

import Alert from 'react-bootstrap/lib/Alert';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';

// import {getters} from '../js/nuclear/getters';
// import reactor from '../js/nuclear/reactor';
// import ResultList from '../js/react/result_list';
// import {SIGNALS as signals} from '../js/nuclear/signals';

jest.dontMock('../js/react/vitrail.js');  // module under test
const vitrail = require('../js/react/vitrail.js').MODULE_FOR_TESTING;


describe('AlertView', () => {
    it('renders properly', () => {
        const classProp = 'success';
        const children = 'rawr!';
        const actual = shallow(<vitrail.AlertView class={classProp}>{children}</vitrail.AlertView>);

        expect(actual.type()).toBe(Panel);
        expect(actual.childAt(0).type()).toBe(Alert);
        expect(actual.childAt(0).prop('bsStyle')).toBe(classProp);
        expect(actual.childAt(0).children().text()).toBe(children);
        expect(actual.childAt(1).type()).toBe(vitrail.AlertFieldList);
    });
});


describe('AlertFieldList', () => {
    it('renders when no fields are given', () => {
        const actual = shallow(<vitrail.AlertFieldList/>);
        expect(actual.html()).toBe(null);
    });

    it('renders when three fields are given', () => {
        const fields = Immutable.Map({
            'Power Rating': '20-275W',
            'Frequency Response': '30Hz-25kHz',
            'Nominal Impedance': '8 Ohms',
        });
        const actual = shallow(<vitrail.AlertFieldList fields={fields}/>);

        expect(actual.type()).toBe(Table);
        expect(actual.childAt(0).type()).toBe('tbody');
        const rows = actual.find('tr');
        expect(rows.length).toBe(3);
        rows.forEach((row) => {
            const key = row.childAt(0).text().slice(0, -1);
            expect(fields.get(key)).toEqual(row.childAt(1).text());
        });
    });
});
