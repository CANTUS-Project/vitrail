Vitrail
=======

*Vitrail* is a JavaScript front-end client for the Cantus API.

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

How To: Deploy
--------------

??????????????????????????????????????
