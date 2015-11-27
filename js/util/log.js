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


import {reactor} from '../nuclear/reactor';
const DEBUG = reactor.debug;


const log = {
    error(msg) {
        // Signal that an error has happened.
        //
        console.error(msg);
    },

    warn(msg) {
        // Signal that something isn't right, but execution will continue.
        //
        console.log(`WARNING: ${msg}`);
    },

    debug(msg) {
        // Debugging output.
        //
        if (DEBUG) {
            console.log(`DEBUG: ${msg}`);
        }
    },
};


export {log};
export default log;
