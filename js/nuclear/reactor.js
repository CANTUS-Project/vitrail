// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/reactor.src.js
// Purpose:                NuclearJS Reactor for Vitrail.
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


import {Reactor} from 'nuclear-js';
import {SIGNAL_NAMES} from './signals';


const reactor = new Reactor({
    debug: true,
    // dispatch: function(signal, payload) {
    //     // This is a wrapper over our parent method that double-checks the signal name exists.
    //     //
    //     // TODO: see if you can get this to work
    //
    //     if (undefined === signal) {
    //         console.error('Signal is undefined!');
    //     } else {
    //         this.__prototype__.dispatch(signal, payload);
    //     }
    // },
});


export default reactor;
