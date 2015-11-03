define(function (require) {

    'use strict';

    var BarMagnetSimView = require('views/sim/bar-magnet');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var MEBarMagnetSimView = BarMagnetSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'magnets-and-electromagnets',
                includeEarth: true
            }, options);

            BarMagnetSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return MEBarMagnetSimView;
});
