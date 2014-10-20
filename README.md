OpenStax Simulations
===========

This repository holds all simulations that will be embedded into OpenStax textbooks.

## <a name="deploying-and-building"></a>Building and Deploying

### <a name="pre-build-setup"></a>Pre-Build Setup:
  * First install node dependencies by running `npm install`.
  * Install grunt-cli globally by running `npm install -g grunt-cli` to make things simpler.

### Building:
  * To build all the simulations and place their `dist` folders into a single top-level `dist` folder for serving, run `grunt dist` from the repository root.

### Deploying
  * To build and deploy all simulations to github-pages, run `grunt deploy`.

## Development

### Hosting

The simulations can be hosted for development with any web host, but two options are documented here:

1. [Using Node.js](#node-hosting)
2. [Using Nginx](#nginx-hosting)

Both methods will create a server whose web root is this repository root; therefore, to access a specific simulation in dev mode, simply point your browser to

    `http://localhost:PORT/simulations/SIM-NAME/src` where PORT and SIM-NAME are replaced by appropriate values

Example:

    `http://localhost:8080/simulations/wave-interference/src`

#### <a name="node-hosting"></a>Node.js Hosting

1. Follow the [Pre-Build Setup](#pre-build-setup) under [Building and Deploying](#deploying-and-building)
2. Run `grunt dev` from the repository root.

#### <a name="nginx-hosting"></a>Nginx Hosting

1. Install [nginx](http://nginx.org/)
2. Set up a virtual host pointing to your `moving-man/src` directory. You can follow a tutorial like [this one](http://gerardmcgarry.com/2010/setting-up-a-virtual-host-in-nginx/), but when you get to the part where you're defining a server config, do something like this (replacing `path-to-simulations` appropriately):

        server {
          listen 8080;
          server_name $hostname;
          root /path-to-simulations/simulations/;
          index index.html;
          try_files $uri $uri/ /index.html;
        }

3. Run `sudo nginx` to start the server.
4. Open up [http://localhost:8080](http://localhost:8080) in your browser to view a list of simulations.

License
-------

This software is subject to the provisions of the GNU Affero General Public License Version 3.0 (AGPL). See license.txt for details. Copyright (c) 2013 Rice University.