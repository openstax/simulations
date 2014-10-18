OpenStax Simulations
===========

This repository holds all simulations that will be embedded into OpenStax textbooks.

## Building and Deploying

### Pre-Build Setup:
  * First install node dependencies by running `npm install`.
  * Install grunt-cli globally by running `npm install -g grunt-cli` to make things simpler.

### Building:
  * To build all the simulations and place their `dist` folders into a single top-level `dist` folder for serving, run `grunt dist` from the repository root.

### Deploying
  * To build and deploy all simulations to github-pages, run `grunt deploy`.

License
-------

This software is subject to the provisions of the GNU Affero General Public License Version 3.0 (AGPL). See license.txt for details. Copyright (c) 2013 Rice University.