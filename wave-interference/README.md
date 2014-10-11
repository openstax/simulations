Water Interference
===========

This simulation is based off PhET's Wave Interference Simulation, which can be [found here](http://phet.colorado.edu/en/simulation/wave-interference).

Original simulation Copyright 2002-2011, University of Colorado.

## Development and Building

### Installing

1. If necessary, install [Node.js](http://nodejs.org) and npm (included with Node.js).
2. Run `npm install -g grunt-cli` in the command line to install [grunt-cli](https://github.com/gruntjs/grunt-cli) globally--it's nice to have grunt installed globally to make it easier to run grunt tasks from the command line.
3. From the root `wave-interference` directory, run `npm install` in the command line to install test and build dependencies.
  * `npm install` fetches npm dependencies found in package.json and runs `bower install` as well which fetches front-end dependencies.

### Testing

To run command-line tests, run `grunt test` from the root `wave-interference` directory.

### Building

From the root `wave-interference` directory, run `grunt dist`.  This will create a directory called `dist` containing the single index.html file that contains everything necessary to run the simulation on- or offline.  (Behind the scenes it creates a temporary localhost server on port 8090 and uses a command-line tool to crawl the hosted application and convert it all into inline CSS, JavaScript, image data, and font data, so if the build is failing, it could be a conflict with another localhost server.)

### Updating

From the root `wave-interference` directory, run `npm run-script upgrade`, which executes the following commands:

1. `npm update`
2. `bower update`

### Development

Running `grunt dev` or just `grunt` on the root of `wave-interference` will create a localhost server at [http://localhost:8080](http://localhost:8080).  It will also listen for changes to the JavaScript and LESS files and automatically rebuild.


License
-------

This software is subject to the provisions of the GNU Affero General Public License Version 3.0 (AGPL). See license.txt for details. Copyright (c) 2013 Rice University.