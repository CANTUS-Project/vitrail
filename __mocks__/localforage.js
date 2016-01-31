// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               __mocks__/localforage.js
// Purpose:                Localforage mock for Vitrail.
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

// Mock on "localforage."
//
// This mock ensures a Promise is returned from every localforage function.


const localforage = {
    getItem: jest.genMockFn(),
    setItem: jest.genMockFn(),
    removeItem: jest.genMockFn(),
    clear: jest.genMockFn(),
    length: jest.genMockFn(),
    key: jest.genMockFn(),
    keys: jest.genMockFn(),
    iterate: jest.genMockFn(),
};

localforage.getItem.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.setItem.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.removeItem.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.clear.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.length.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.key.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.keys.mockReturnValue(new Promise(()=>{}, ()=>{}));
localforage.iterate.mockReturnValue(new Promise(()=>{}, ()=>{}));


module.exports = localforage;
