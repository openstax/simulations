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
            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.barMagnet;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initFieldMeter();
            this.initPickupCoil();
            this.initTurbine();
            this.initCompass();
        },

        initTurbine: function() {
            this.turbineView = new TurbineView({
                mvt: this.mvt,
                model: this.simulation.turbine,
                simulation: this.simulation
            });
            this.middleLayer.addChild(this.turbineView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.pickupCoilView.update(time, deltaTime, paused);
            this.turbineView.update(time, deltaTime, paused);
        }

    });

    return GeneratorSceneView;
});
