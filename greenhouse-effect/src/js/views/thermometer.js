define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var ThermometerView = require('common/pixi/view/thermometer');

    var Constants = require('constants');

    /**
     * A view that represents a photon
     */
    var GreenhouseThermometerView = ThermometerView.extend({

        /**
         * Initializes the new GreenhouseThermometerView.
         */
        initialize: function(options) {
            options = _.extend({
                bulbDiameter: 70,
                tubeWidth:    32,
                tubeHeight:   200,

                numberOfTicks: 9,
                minorTicksPerTick: 1,

                lineColor: '#222',
                lineWidth: 2,
                // lineAlpha: 1,

                fillColor: '#fff',
                fillAlpha: 0.8,

                //liquidColor: '#ff3c00',
                liquidPadding: 3,

                tickColor: '#222',
                tickWidth: 2
            }, options);

            ThermometerView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            ThermometerView.prototype.initGraphics.apply(this, arguments);

            this.initLabel();
        },

        initLabel: function() {

        }

    });

    return GreenhouseThermometerView;
});