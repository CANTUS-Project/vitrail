// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/nuclear/signals.js
// Purpose:                ActionTypes and Actions for NuclearJS in Vitrail.
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


import reactor from './reactor';


// TODO: switch over to a CantusJS instance maintained in this file only
// const cantusjs = new cantusModule.Cantus('http://abbot.adjectivenoun.ca:8888/');
// const cantusjs = window['temporaryCantusJS'];


const SIGNAL_NAMES = {
    LOAD_IN_ITEMVIEW: 1,
};


const SIGNALS = {
    loadInItemView: function(type, id) {
        if (undefined === type || undefined === id) {
            let msg = 'loadInItemView() requires "type" and "id" arguments';
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: make this not be stupid
        let cantusjs = window['temporaryCantusJS'];

        let settings = {type: type, id: id};
        cantusjs.get(settings)
        .then(function(response) {reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, response)})
        .catch(function(response) {console.error(response)});  // TODO: handle the error better

        // TODO: make the request here, and do the dispatch as part of the then() function
        // reactor.dispatch(SIGNAL_NAMES.LOAD_IN_ITEMVIEW, {});
    },
};


export {SIGNAL_NAMES, SIGNALS};
export default SIGNALS;
