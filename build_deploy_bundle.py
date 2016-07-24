#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#--------------------------------------------------------------------------------------------------
# Program Name:           vitrail
# Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
#
# Filename:               build_deploy_bundle.py
# Purpose:                Script to build a deployment bundle of Vitrail.
#
# Copyright (C) 2015 Christopher Antila
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#--------------------------------------------------------------------------------------------------
'''
Script to build a deployment bundle of Vitrail.
'''

import pathlib
import subprocess
import tarfile

BROWSERIFY = 'node_modules/.bin/browserify'
UGLIFY = 'node_modules/.bin/uglifyjs'
SW_PRECACHE = 'node_modules/.bin/sw-precache'
SW_PRECACHE_CONFIG = 'sw-precache-config.json'
VITRAIL_SRC = 'js/vitrail-init.js'
VITRAIL_MID = 'js/vitrail-compiled.js'
VITRAIL_OUT = 'js/vitrail.js'
ARCHIVE = 'deploy.xz'
FILES_IN_ARCHIVE = [
    VITRAIL_OUT,
    'css/vitrail.css',
    'css/bootstrap.min.css',
    'fonts/glyphicons-halflings-regular.eot',
    'fonts/glyphicons-halflings-regular.svg',
    'fonts/glyphicons-halflings-regular.ttf',
    'fonts/glyphicons-halflings-regular.woff',
    'fonts/glyphicons-halflings-regular.woff2',
    'browserconfig.xml',
    'index.html',
    'manifest.json',
    'serviceworker.js',
    'img/android-chrome-144x144.png',
    'img/android-chrome-192x192.png',
    'img/android-chrome-36x36.png',
    'img/android-chrome-48x48.png',
    'img/android-chrome-72x72.png',
    'img/android-chrome-96x96.png',
    'img/apple-touch-icon-114x114.png',
    'img/apple-touch-icon-120x120.png',
    'img/apple-touch-icon-144x144.png',
    'img/apple-touch-icon-152x152.png',
    'img/apple-touch-icon-180x180.png',
    'img/apple-touch-icon-57x57.png',
    'img/apple-touch-icon-60x60.png',
    'img/apple-touch-icon-72x72.png',
    'img/apple-touch-icon-76x76.png',
    'img/apple-touch-icon.png',
    'img/apple-touch-icon-precomposed.png',
    'img/favicon-16x16.png',
    'img/favicon-194x194.png',
    'img/favicon-32x32.png',
    'img/favicon-96x96.png',
    'img/favicon.ico',
    'img/mstile-144x144.png',
    'img/mstile-150x150.png',
    'img/mstile-310x150.png',
    'img/mstile-310x310.png',
    'img/mstile-70x70.png',
    'img/safari-pinned-tab.svg',
]


# 1.) build JavaScript asset
print('Compiling with Browserify')
vit_out = pathlib.Path(VITRAIL_OUT)
if vit_out.exists():
    vit_out.unlink()

subprocess.check_call([BROWSERIFY, VITRAIL_SRC, '-o', VITRAIL_MID])


# 2.) minify JavaScript asset
print('Minifying with Uglify')
subprocess.check_call([UGLIFY, VITRAIL_MID, '-o', VITRAIL_OUT])


# 3.) Generate a ServiceWorker script
print('Generating ServiceWorker script')
subprocess.check_call([SW_PRECACHE, '--config', SW_PRECACHE_CONFIG])


# 4.) copy everything we need into a build directory
print('Creating archive')
arch_path = pathlib.Path(ARCHIVE)
if arch_path.exists():
    arch_path.unlink()

archive = tarfile.open(ARCHIVE, 'w:xz')
try:
    for pathname in FILES_IN_ARCHIVE:
        pathname = pathlib.Path(pathname)
        if pathname.is_symlink():
            # symlinks must copy the original file into the symlink's path
            actual = pathname.resolve()
            archive.add(str(actual), arcname=str(pathname))
        else:
            # regular files can be copied normally
            archive.add(str(pathname))
finally:
    archive.close()
