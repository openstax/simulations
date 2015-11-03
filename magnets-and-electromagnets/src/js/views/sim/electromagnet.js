define(function (require) {

    'use strict';

    var ElectromagnetSimView = require('views/sim/electromagnet');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var MEBarElectromagnetSimView = ElectromagnetSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'magnets-and-electromagnets'
            }, options);

            ElectromagnetSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return MEBarElectromagnetSimView;
});
