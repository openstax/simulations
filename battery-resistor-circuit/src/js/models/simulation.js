define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var BRCSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            var moveRight = 68;
            var scatInset = 60 + moveRight;
            var battInset = scatInset;
            var topLeftWirePoint     = new Vector2(25  + moveRight, 120); // Top left
            var topRightWirePoint    = new Vector2(700 + moveRight, 120); // Top right
            var bottomRightWirePoint = new Vector2(700 + moveRight, 270); // Bottom right
            var bottomLeftWirePoint  = new Vector2(25  + moveRight, 270); // Bottom left
            var topLeftInset         = new Vector2(topLeftWirePoint    ).add( scatInset - moveRight, 0);
            var topRightInset        = new Vector2(topRightWirePoint   ).add(-scatInset + moveRight, 0);
            var bottomLeftInset      = new Vector2(bottomLeftWirePoint ).add( battInset - moveRight, 0);
            var bottomRightInset     = new Vector2(bottomRightWirePoint).add(-battInset + moveRight, 0);

            // Set up the wire patches
            var loopWirePatch = new WirePatch()
                .startSegmentBetween(bottomLeftInset, bottomLeftWirePoint)
                .appendSegmentAt(topLeftWirePoint)
                .appendSegmentAt(topRightWirePoint)
                .appendSegmentAt(bottomRightWirePoint)
                .appendSegmentAt(bottomRightInset);

            var batteryWirePatch = new WirePatch()
                .startSegmentBetween(bottomRightInset, bottomLeftInset);

            // Patches that will be used for painting (and  aren't actually used in the simulation)
            var.scatterPatch = new WirePatch()
                .startSegmentBetween(topLeftInset, topRightInset);

            var leftPatch = new WirePatch()
                .startSegmentBetween(bottomLeftInset, bottomLeftWirePoint)
                .appendSegmentAt(topLeftWirePoint)
                .appendSegmentAt(topLeftInset);

            var rightPatch = new WirePatch()
                .startSegmentBetween(topRightInset, topRightWirePoint)
                .appendSegmentAt(bottomRightWirePoint)
                .appendSegmentAt(bottomRightInset);

            this.scatterPatch = scatterPatch;
            this.leftPatch = leftPatch;
            this.rightPatch = rightPatch;

            // Create the circuit and add the real (used by the simulation) patches
            var circuit = new Circuit()
                .addWirePatch(loopWirePatch)
                .addWirePatch(batteryWirePatch);

            // Set up the wire system
            var wireSystem = new WireSystem();

            var props = new CompositePropagator();

            var coulombForceParameters = new CoulombForceParameters(Constants.K, Constants.COULOMB_POWER, 2);
            var coulombForce = new CoulombForce(coulombForceParameters, wireSystem);
            
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return BRCSimulation;
});
