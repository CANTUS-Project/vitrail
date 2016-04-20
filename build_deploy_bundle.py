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
    'index.html',
    'manifest.json',
    'img/favicon.ico',
    'img/apple-touch-icon.png',
    'img/apple-touch-icon-57x57.png',
    'img/apple-touch-icon-72x72.png',
    'img/apple-touch-icon-76x76.png',
    'img/apple-touch-icon-114x114.png',
    'img/apple-touch-icon-120x120.png',
    'img/apple-touch-icon-144x144.png',
    'img/apple-touch-icon-152x152.png',
    'img/apple-touch-icon-180x180.png',
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


# 3.) copy everything we need into a build directory
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
