// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/util/log.js
// Purpose:                Logging and error handling for vitrail.
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
/* eslint no-console: 0 */


import {reactor} from '../nuclear/reactor';
const DEBUG = reactor.debug;


const log = {
    error(msg) {
        // Signal that an error has happened.
        //
        msg = `ERROR: ${msg}`;
        console.error(msg);
        alert(msg);
    },

    warn(msg) {
        // Signal that something isn't right, but execution will continue.
        //
        msg = `WARNING: ${msg}`;
        console.warn(msg);
        alert(msg);
    },

    debug(msg) {
        // Debugging output.
        //
        if (DEBUG) {
            msg = `DEBUG: ${msg}`;
            console.debug(msg);
        }
    },
};


export {log};
export default log;
