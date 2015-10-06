define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var FaradayObject   = require('models/faraday-object');
    var CompassBehavior = require('models/compass-behavior');

    var Constants = require('constants');

    /**
     * Compass is the model of a compass.
     * 
     * Several types of compass behavior can be specified using setBehavior.
     *   In the case of KINEMATIC_BEHAVIOR, the compass needle attempts to be
     *   physically accurate with respect to force, friction, inertia, etc.
     *   Instead of jumping to an orientation, the needle will overshoot,
     *   then gradually reach equilibrium.
     */
    var Compass = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            behavior: Constants.Compass.SIMPLE_BEHAVIOR
        }),

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            this.magnetModel = options.magnetModel; // Magnet that the compass is observing.

            this.behavior = null; // The rotation behavior.
            this.pausedBehavior = new CompassBehavior.Immediate(this); // Simple behavior, for when clock is paused

            // Cached objects
            this._point = new Vector2();
            this._vec = new Vector2();

            this.on('change:behavior', this.behaviorChanged);

            this.behaviorChanged(this, this.get('behavior'));
        },

        behaviorChanged: function(model, behavior) {
            switch (behavior) {
                case Compass.SIMPLE_BEHAVIOR:
                    this.behavior = new CompassBehavior.Immediate(this);
                    break;
                case Compass.INCREMENTAL_BEHAVIOR:
                    this.behavior = new CompassBehavior.Incremental(this);
                    break;
                case Compass.KINEMATIC_BEHAVIOR:
                    this.behavior = new CompassBehavior.Kinematic(this);
                    break;
            }
        },

        /**
         * Workaround to get the compass moving immediately.
         * In some situations, such as when the magnet polarity is flipped,
         * it can take quite awhile for the compass needle to start moving.
         */
        startMovingNow: function() {
            this.behavior.startMovingNow();
        },

        /**
         * If rotational kinematics is enabled (see setRotationalKinematicsEnabled),
         *   the compass needle's behavior is based on a Verlet algorithm.  The 
         *   algorithm was reused from edu.colorado.phet.microwave.model.WaterMolecule
         *   in Ron LeMaster's "microwaves" simulation, with some minor changes.
         *   The algorithm was verified by Mike Dubson.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled')) {
                var point = this._point.set(this.get('position'));
                var vec = this._vec.set(this.magnetModel.getBField(point));
                if (vec.length() !== 0)
                    this.behavior.setDirection(vec, deltaTime);
            }
        }

    }, Constants.Compass);

    return Compass;
});
