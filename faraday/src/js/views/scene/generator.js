define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView = require('views/scene');
    var TurbineView      = require('views/turbine');

    var Constants = require('constants');

    /**
     *
     */
    var GeneratorSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            options = _.extend({
                pickupCoilDraggable: false
            }, options);

            FaradaySceneView.prototype.initialize.apply(this, [options]);

            this.magnetModel = this.simulation.turbine;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initFieldMeter();
            this.initPickupCoil();
            this.initTurbine();
            this.initCompass();

            this.hideOutsideField();
        },

        initTurbine: function() {
            this.turbineView = new TurbineView({
                mvt: this.mvt,
                model: this.simulation.turbine,
                simulation: this.simulation
            });
            this.middleLayer.addChild(this.turbineView.displayObject);
        },

        reset: function() {
            FaradaySceneView.prototype.reset.apply(this, arguments);

            this.pickupCoilView.reset();
            this.hideOutsideField();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.pickupCoilView.update(time, deltaTime, paused);
            this.turbineView.update(time, deltaTime, paused);
        }

    });

    return GeneratorSceneView;
});
