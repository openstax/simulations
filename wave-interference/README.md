Water Interference
===========

This simulation is based off PhET's Wave Interference Simulation, which can be [found here](http://phet.colorado.edu/en/simulation/wave-interference).

Original simulation Copyright 2002-2011, University of Colorado.

## Development and Building



### Installing & Hosting

#### Installing

1. If necessary, install [Node.js](http://nodejs.org) and npm (included with Node.js).
2. Run `npm install -g grunt-cli bower` in the command line to install [grunt-cli](https://github.com/gruntjs/grunt-cli) and [bower](http://bower.io/).
3. From the root `wave-interference` directory, run `npm install` in the command line to install test and build dependencies.
  * `npm install` fetches npm dependencies found in package.json and runs `bower install` as well which fetches front-end dependencies

##### Testing

From the root `wave-interference` directory, run `grunt test`.

##### Building

From the root `wave-interference` directory, run `grunt dist`.

The `dist` directory containing the built site will be added to the root `wave-interference` directory.

##### Updating

From the root `wave-interference` directory, run `npm run-script upgrade`, which executes the following commands:
1. `npm update`
2. `bower update`

#### Hosting

##### For Development

1. Install [nginx](http://nginx.org/)
2. Set up a virtual host pointing to your `wave-interference/dist/` directory. You can follow a tutorial like [this one](http://gerardmcgarry.com/2010/setting-up-a-virtual-host-in-nginx/), but when you get to the part where you're defining a server config, it can be as simple as this one:

```
server {
    listen 8000;
    server_name $hostname;
    root /path-to-simulations/simulations/wave-interference/dist/;
    index index.html;
}
```
3. Run `sudo nginx` to start the server.
4. Open up [http://localhost:8000](http://localhost:8000) in your browser to view the simulation.


License
-------

This software is subject to the provisions of the GNU Affero General Public License Version 3.0 (AGPL). See license.txt for details. Copyright (c) 2013 Rice University.