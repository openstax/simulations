define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var ThermometerView = require('common/pixi/view/thermometer');
    var range           = require('common/math/range');

    var Constants = require('constants');

    /**
     * A view that represents a thermometer
     */
    var GreenhouseThermometerView = ThermometerView.extend({

        /**
         * Initializes the new GreenhouseThermometerView.
         */
        initialize: function(options) {
            options = _.extend({
                bulbDiameter: 70,
                tubeWidth:    32,
                tubeHeight:   180,

                numberOfTicks: 9,
                minorTicksPerTick: 1,

                lineColor: '#222',
                lineWidth: 2,

                fillColor: '#fff',
                fillAlpha: 0.8,

                liquidPadding: 3,

                tickColor: '#222',
                tickWidth: 2
            }, options);

            this.temperatureRange = range({
                min: Constants.Earth.BASE_TEMPERATURE,
                max: Constants.Earth.BASE_TEMPERATURE + 64
            });

            ThermometerView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:temperature', this.updateTemperature);
        },

        initGraphics: function() {
            ThermometerView.prototype.initGraphics.apply(this, arguments);

            this.initLabels();
        },

        initLabels: function() {
            var options = {
                font: '14px Arial',
                fill: '#fff'
            };

            var kelvinLabel = new PIXI.Text('295K', options);
            kelvinLabel.anchor.x = 0.5;
            kelvinLabel.y = -16;
            this.kelvinLabel = kelvinLabel;
            this.displayObject.addChild(kelvinLabel);

            var degreesLabel = new PIXI.Text('69℉', options);
            degreesLabel.anchor.x = 0.5;
            degreesLabel.y = 2;
            this.degreesLabel = degreesLabel;
            this.displayObject.addChild(degreesLabel);
        },

        updateTemperature: function(thermometer, temperature) {
            this.kelvinLabel.setText(Math.round(temperature) + 'K');

            if (this.celsiusMode)
                this.degreesLabel.setText(Math.round(this.kelvinToCelsius(temperature)) + '℃');
            else
                this.degreesLabel.setText(Math.round(this.kelvinToFahrenheight(temperature)) + '℉');

            this.val(this.temperatureRange.constrainedPercent(temperature));
        },

        kelvinToFahrenheight: function(k) {
            return ((k - 273.15) * 1.8) + 32;
        },

        kelvinToCelsius: function(k) {
            return k - 273.15;
        },

        showCelsius: function() {
            this.celsiusMode = true;
            this.updateTemperature(this.model, this.model.get('temperature'));
        },

        showFahrenheit: function() {
            this.celsiusMode = false;
            this.updateTemperature(this.model, this.model.get('temperature'));
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });

    return GreenhouseThermometerView;
});