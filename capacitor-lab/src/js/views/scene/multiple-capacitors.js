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
    var MultipleCapacitorsSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            this.circuitView = new CircuitView({
                mvt:                            this.mvt,
                model:                          this.simulation.circuit,
                maxDielectricEField:            this.simulation.getMaxDielectricEField(),
                maxPlateCharge:                 this.simulation.getMaxPlateCharge(),
                maxExcessDielectricPlateCharge: this.simulation.getMaxExcessDielectricPlateCharge(),
                maxEffectiveEField:             this.simulation.getMaxEffectiveEField()
            });

            this.stage.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        showPlateCharges: function() {
            this.circuitView.showPlateCharges();
        },

        hidePlateCharges: function() {
            this.circuitView.hidePlateCharges();
        }

    });

    return MultipleCapacitorsSceneView;
});
