define(function (require) {

    'use strict';

    var BarMagnetSimView = require('views/sim/bar-magnet');

    /**
     * "Generator" version of the original
     */
    var GeneratorBarMagnetSimView = BarMagnetSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'generator'
            }, options);

            BarMagnetSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return GeneratorBarMagnetSimView;
});
