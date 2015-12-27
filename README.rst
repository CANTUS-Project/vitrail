Vitrail
=======

*Vitrail* is a JavaScript front-end client for the Cantus API.

.. image:: https://img.shields.io/travis/CANTUS-Project/vitrail.svg?style=flat-square
    :target: https://travis-ci.org/CANTUS-Project/vitrail

License
-------

*Vitrail* is copyrighted according to the terms of the GNU GPLv3+. A copy of the license is held in
the file called "LICENSE."

Name
----

The word *vitrail* in French means "stained glass." The easiest way an outsider can see into a
monastery or abbey is by looking in the windows.

How To: Develop
---------------

When you clone the *Vitrail* repository, you need to build Twitter Bootstrap. If the "bootstrap"
directory is empty, run ``git submodule update`` in the *Vitrail* repository's root directory. Then
setup for building Bootstrap.

1. Ensure you have Node.js and Ruby installed.
1. Ensure you have "Bundler" installed, best with your package manager, but possibly with
   ``gem install bundler``.
1. Ensure you have the "Grunt" command line tools installed. In the bootstrap directory run
   ``npm install grunt-cli``.
1. Then you can use ``grunt`` to build Bootstrap and run the tests, ``grunt dist`` to build without
   the tests, and ``grunt test`` to run the tests without building.

You also need to install the *Vitrail* dependencies. In the repository's root directory, run
``npm install``. You will need Node for this, obviously.

Run the ``devserver`` script, written in Python 3, to run a development server. This script does
the following tasks:

1. Sets *Watchify* to use *Browserify* to automatically rebuild the *Vitrail* JavaScript files
   whenever they're changed.
1. Starts an HTTP server on port 8000.

How To: Upgrade Bootstrap
-------------------------

When there's a new release of Bootstrap, rebuild Bootstrap and *Vitrail* will automatically use it.

1. Change to the ``bootstrap`` directory.
1. Run ``git reset --hard`` to remove your previous build artifacts.
1. Run ``git fetch`` to download new commits and tags.
1. Run ``git tag --list`` for a list of tagged releases.
1. Run something like ``git checkout tags/v4.0.0-alpha.2`` to checkout the desired release.
1. Run ``npm install`` to update NPM dependencies. If it doesn't work, try to remove the
  ``node_modules`` directory and run ``npm install`` again.
1. Run ``bundle install`` to update Ruby dependencies.
1. Run ``grunt dist`` to compile the new release.
1. Because of the symlinks in Vitrail's ``css`` directory, the newly-compiled files will be used
   automatically. However, if you used the ``build_deploy_bundle.py`` script you will obviously
   need to re-run the script to collect the newly-compiled files.

How To: Deploy
--------------

??????????????????????????????????????
