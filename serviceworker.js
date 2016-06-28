// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               serviceworker.js
// Purpose:                Manage the ServiceWorker for Vitrail.
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

// The Ansible playbook used for deployment will swap out the "<< SERVER URL HERE >>" string with
// the actual URL of the server. At runtime, we check whether the string was replaced; if not, we'll
// supply a default server URL. NOTE that we can't use the full "<< SERVER URL HERE >>" string
// twice because the playbook would replace both instances, leading the default URL to be used every
// time!
var urlToAbbot =
'<< SERVER URL HERE >>'
;
if (urlToAbbot.indexOf('SERVER URL HERE') >= 0) {
    urlToAbbot = 'https://abbot.adjectivenoun.ca:8888/';
}


self.addEventListener('fetch', function(event) {
    // never cache requests for Abbot
    if (event.request.url.startsWith(urlToAbbot)) {
        event.respondWith(fetch(event.request));
    }
    else {
        // try to load from cache first
        event.respondWith(
            caches.match(event.request.url).then(function(response) {
                if (response) {
                    return response;
                }
                else {
                    return fetch(event.request);
                }
            })
        );
    }
});
