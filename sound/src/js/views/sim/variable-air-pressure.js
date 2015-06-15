define(function (require) {

    'use strict';


    var SoundSimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var VariableAirPressureSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Varying Air Pressure',
                name: 'variable-air-pressure-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return VariableAirPressureSimView;
});
