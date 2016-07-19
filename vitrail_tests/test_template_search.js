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
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Form from 'react-bootstrap/lib/Form';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Panel from 'react-bootstrap/lib/Panel';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Well from 'react-bootstrap/lib/Well';

import {getters} from '../js/nuclear/getters';
import reactor from '../js/nuclear/reactor';
import ResultList from '../js/react/result_list';
import {SIGNALS as signals} from '../js/nuclear/signals';

jest.dontMock('../js/react/template_search.js');  // module under test
jest.dontMock('../js/react/vitrail.js');  // imported to 'template_search' for AlertView
const vitrail = require('../js/react/vitrail.js');
const template_search = require('../js/react/template_search.js').MODULE_FOR_TESTING;

describe('TemplateSearch', () => {
    it('renders properly', () => {
        const actual = shallow(<template_search.TemplateSearch/>);
        //
        expect(actual).toHaveTagName('div');
        expect(actual).toHaveClassName('container');
        //
        expect(actual.childAt(0).type()).toBe(PageHeader);
        expect(actual).toContainReact(<template_search.TemplateSearchTemplate/>);
        expect(actual).toContainReact(<ResultList/>);
    });

    it('renders "props.children" properly', () => {
        const child = <div className="bogus"/>;
        const actual = shallow(<template_search.TemplateSearch>{child}</template_search.TemplateSearch>);
        expect(actual).toContainReact(child);
    });

    it('resets the search query before mounting', () => {
        // put some stuff in the search query before we start
        reactor.reset();
        signals.setResourceType('genre');
        signals.setSearchQuery({any: 'true crime'});

        // render the component
        mount(<template_search.TemplateSearch/>);

        // check the search query and resource type were reset
        const expectedQuery = Immutable.Map({type: 'chants'})
        expect(reactor.evaluate(getters.searchQuery)).toEqual(expectedQuery);
    });
});


describe('TemplateSearchTemplate', () => {
    beforeEach(() => {
        reactor.reset();
        signals.setResourceType('chant');  // like TemplateSearch component would do
    });

    it('renders properly', () => {
        const actual = shallow(<template_search.TemplateSearchTemplate/>);

        expect(actual.type()).toBe(Panel);
        expect(actual).toHaveClassName('template-search-template');
        //
        expect(actual.prop('header').type).toBe(template_search.TemplateTypeSelector);
        expect(actual.childAt(0).type()).toBe(template_search.TemplateSearchFields);
        const submitButton = actual.prop('footer');
        expect(submitButton.type).toBe(Button);
        expect(submitButton.props.children).toBe('Search');
    });

    it('renders an unsupported resourceType error properly', () => {
        // set to an unsupported resource type
        signals.setResourceType('genre');

        // render
        const actual = mount(<template_search.TemplateSearchTemplate/>);

        // check
        const alertView = actual.find(vitrail.AlertView);
        expect(alertView.prop('class')).toBe('danger');
    });

    it('detects a change in resource type', () => {
        const actual = mount(<template_search.TemplateSearchTemplate/>);

        // check the "chants" fields rendered
        const chantsFields = actual.find(template_search.TemplateSearchFields);
        expect(chantsFields.prop('fieldNames')[0]).toEqual({field: 'incipit', displayName: 'Incipit'});

        // change the resource type
        signals.setResourceType('indexers');

        // check the "indexers" fields rendered
        const indexersFields = actual.find(template_search.TemplateSearchFields);
        expect(indexersFields.prop('fieldNames')[0]).toEqual({field: 'display_name', displayName: 'Full Name'});
    });

    it('submits the search when "Submit" button clicked', () => {
        const actual = mount(<template_search.TemplateSearchTemplate/>);
        const originalSubmit = signals.submitSearchQuery;
        signals.submitSearchQuery = jest.genMockFn();

        // click "Submit"
        const submit = actual.find(Button).at(4);  // 4 buttons for resource types; fifth is "Submit"
        expect(submit).toHaveProp('children', 'Search');  // check it's the right button
        submit.simulate('click');

        // check signals.submitSearchQuery() was called
        expect(signals.submitSearchQuery).toBeCalled();

        signals.submitSearchQuery = originalSubmit;
    });
});


describe('TemplateSearchFields', () => {
    it('renders properly', () => {
        const actual = shallow(<template_search.TemplateSearchFields fieldNames={[]}/>);
        //
        expect(actual.type()).toBe(Well);
        expect(actual).toHaveClassName('template-search-fields');
        expect(actual.childAt(0).type()).toBe(Form);
    });

    it('renders the correct TemplateSearchField subcomponents', () => {
        const fieldNames = [
            {field: 'name', displayName: 'Name'},
            {field: 'description', displayName: 'Description'},
            {field: 'date', displayName: 'Date'},
            {field: 'feast_code', displayName: 'Feast Code'},
        ];
        const actual = mount(<template_search.TemplateSearchFields fieldNames={fieldNames}/>);

        const fields = actual.find(template_search.TemplateSearchField);
        for (const i of [0, 1, 2, 3]) {
            expect(fields.at(i)).toHaveProp('field', fieldNames[i].field);
            expect(fields.at(i)).toHaveProp('displayName', fieldNames[i].displayName);
        }
    });
});


describe('TemplateSearchField', () => {
    beforeEach(() => {
        reactor.reset();
        signals.setResourceType('chant');  // like TemplateSearch component would do
    });

    it('renders properly', () => {
        const displayName = 'Ur so cool';
        const field = 'square';
        const actual = mount(<template_search.TemplateSearchField displayName={displayName} field={field}/>);

        const fieldName = actual.find('label').at(0);
        expect(fieldName.text()).toEqual(displayName);
        const textbox = actual.find(FormControl);
        expect(textbox.prop('type')).toBe('text');
    });

    it('shows "field" if "displayName" is not provided', () => {
        const field = 'square';
        const actual = mount(<template_search.TemplateSearchField field={field}/>);

        const fieldName = actual.find('label').at(0);
        expect(fieldName.text()).toEqual(field);
    });

    it('binds to the proper field from NuclearJS', () => {
        const field = 'incipit';
        const value = '今天爱你，明天 heh';
        signals.setSearchQuery({incipit: value});
        const actual = mount(<template_search.TemplateSearchField field={field}/>);

        const textbox = actual.find('input');
        expect(textbox.prop('value')).toEqual(value);
    });

    it('updates the textbox when the Store is updated', () => {
        // check that shouldComponentUpdate() is working properly
        const field = 'incipit';
        const value1 = '今天爱你，明天 heh';
        signals.setSearchQuery({incipit: value1});
        const actual = mount(<template_search.TemplateSearchField field={field}/>);

        // check initial value
        const textbox = actual.find('input');
        expect(textbox.prop('value')).toEqual(value1);

        // set and check second value
        const value2 = '今天爱你，明天也爱你';
        signals.setSearchQuery({incipit: value2});
        expect(textbox.prop('value')).toEqual(value2);
    });

    it('emits setSearchQuery() when the textbox is edited', () => {
        const field = 'incipit';
        const value1 = 'ab';
        const value2 = 'abc';
        signals.setSearchQuery({incipit: value1});
        const actual = mount(<template_search.TemplateSearchField field={field}/>);

        // simulate writing in the textbox
        const textbox = actual.find('input');
        textbox.simulate('change', {target: {value: value2}});

        // check that the SearchQuery Store was updated
        expect(reactor.evaluate(getters.searchQuery).get(field)).toEqual(value2);
    });
});


describe('TemplateTypeSelector', () => {
    beforeEach(() => {
        reactor.reset();
        signals.setResourceType('chant');  // like TemplateSearch component would do
    });

    it('renders properly', () => {
        const actual = shallow(<template_search.TemplateTypeSelector/>);
        const expButtonIds = ['chantsTypeButton', 'feastsTypeButton', 'indexersTypeButton',
            'sourcesTypeButton'];
        //
        expect(actual.type()).toBe(ButtonGroup);
        const buttons = actual.find(Button);
        for (const i of [0, 1, 2, 3]) {
            expect(buttons.at(i).prop('id')).toBe(expButtonIds[i]);
        }
        // check the "Chants" button is properly activated
        const chantButton = buttons.at(0);
        expect(chantButton.prop('aria-pressed')).toBe('true');
        expect(chantButton.prop('active')).toBe(true);
    });

    it('updates when the type changes', () => {
        const actual = mount(<template_search.TemplateTypeSelector/>);
        const chantButton = actual.find(Button).at(0);
        const feastButton = actual.find(Button).at(1);

        // check the "Chants" button is activated but "Indexers" is not
        expect(chantButton.prop('active')).toBe(true);
        expect(feastButton.prop('active')).toBe(false);

        // change the current resource type
        signals.setResourceType('feasts');

        // check the "Chants" and "Indexers" buttons switched activation
        expect(chantButton.prop('active')).toBe(false);
        expect(feastButton.prop('active')).toBe(true);
    });

    it('sets the type in NuclearJS when one of the buttons is clicked', () => {
        const actual = mount(<template_search.TemplateTypeSelector/>);
        const feastButton = actual.find(Button).at(1);

        // click the "Feasts" button
        feastButton.simulate('click');

        // check the type was set in NuclearJS
        expect(reactor.evaluate(getters.searchQuery)).toEqual(Immutable.Map({type: 'feasts'}));
    });

    it('does not re-set the type when the button for the currently-selected type is clicked', () => {
        const actual = mount(<template_search.TemplateTypeSelector/>);
        const chantButton = actual.find(Button).at(0);

        // set something in the search query to make sure it won't be wiped out
        signals.setSearchQuery({incipit: 'super duper'});

        // click the "Feasts" button
        chantButton.simulate('click');

        // check the type wasn't overwritten in NuclearJS
        const expected = Immutable.Map({type: 'chants', incipit: 'super duper'});
        expect(reactor.evaluate(getters.searchQuery)).toEqual(expected);
    });
});


describe('WrongTypeAlertView', () => {
    it('renders an AlertView', () => {
        const resourceType = 'electricity';
        const actual = shallow(<template_search.WrongTypeAlertView resourceType={resourceType}/>);
        expect(actual.type()).toBe(vitrail.AlertView);
        expect(actual.prop('class')).toBe('danger');
    });
});
