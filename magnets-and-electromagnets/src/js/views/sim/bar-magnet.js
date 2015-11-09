define(function (require) {

    'use strict';

    var BarMagnetSimView = require('views/sim/bar-magnet');

    /**
     * "Magnets and Electromagnets" version of the original
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
