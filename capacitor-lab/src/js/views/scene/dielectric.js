define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var CapacitorLabSceneView = require('views/scene');
    var CircuitView           = require('views/circuit');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var DielectricSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            this.circuitView = new CircuitView({
                model: this.simulation.circuit,
                mvt: this.mvt,
                dielectric: true
            });

            this.stage.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return DielectricSceneView;
});
