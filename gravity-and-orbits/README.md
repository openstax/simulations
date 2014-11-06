Water Interference
===========

This simulation is based off PhET's Gravity and Orbits simulation, which can be [found here](http://phet.colorado.edu/en/simulation/gravity-and-orbits).

Original simulation Copyright 2002-2011, University of Colorado.

## Installing

1. If necessary, install [Node.js](http://nodejs.org) and npm (included with Node.js).
2. Run `npm install -g grunt-cli` in the command line to install [grunt-cli](https://github.com/gruntjs/grunt-cli).
3. From the root `gravity-and-orbits` directory, run `npm install` in the command line to install test and build dependencies.
  * `npm install` fetches npm dependencies found in package.json and runs `bower install` as well which fetches front-end dependencies.

## Building & Testing

### Building

From the root `gravity-and-orbits` directory, run `grunt dist`.

The `dist` directory containing the built site will be added to the root `gravity-and-orbits` directory.

### Testing

To run command-line tests, run `grunt test` from the root `gravity-and-orbits` directory.

To view tests in a browser, you first need to

1. set up a server (check out the Hosting section below)
2. build the test index file by running `grunt build_tests` or `grunt test` (which runs `build_tests`) 
3. then go to [http://localhost:8000/test/](http://localhost:8000/test/). 

## Development

### Hosting

To host a development server for this project, follow the instructions found in the repository root's README.

### Updating

From the root `gravity-and-orbits` directory, run `npm run-script upgrade`, which executes the following commands:

1. `npm update`
2. `bower update`

License
-------

This software is subject to the provisions of the GNU Affero General Public License Version 3.0 (AGPL). See license.txt for details. Copyright (c) 2013 Rice University.