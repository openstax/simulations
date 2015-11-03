define(function (require) {

    'use strict';

    var PickupCoilSimView = require('views/sim/pickup-coil');

    /**
     * "Generator" version of the original
     */
    var GeneratorPickupCoilSimView = PickupCoilSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'generator'
            }, options);

            PickupCoilSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return GeneratorPickupCoilSimView;
});
