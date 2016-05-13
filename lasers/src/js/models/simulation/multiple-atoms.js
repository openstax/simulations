define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var VanillaCollection = require('common/collections/vanilla');

    var BaseLasersSimulation      = require('models/simulation/base');
    var TwoLevelElementProperties = require('models/element-properties/two-level');
    var LaserAtom                 = require('models/atom');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The simulation model for the One Atom tab
     */
    var MultipleAtomsLaserSimulation = BaseLasersSimulation.extend({

        defaults: _.extend(BaseLasersSimulation.prototype.defaults, {
            pumpingPhotonViewMode: Constants.PHOTON_CURTAIN
        }),
        
        initialize: function(attributes, options) {
            BaseLasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BaseLasersSimulation.prototype.initComponents.apply(this, arguments);

            this.initAtoms();
        },

        initAtoms: function() {
            
        },

        initBeams: function() {
            BaseLasersSimulation.prototype.initBeams.apply(this, arguments);

            this.seedBeam.set('beamWidth', this.boxHeight);
            this.seedBeam.set('photonsPerSecond', 1);

            this.pumpingBeam.set('beamWidth', this.tube.getWidth());
            this.pumpingBeam.set('photonsPerSecond', 0); // Start with the pumping beam turned down all the way
            this.pumpingBeam.set('maxPhotonsPerSecond', Constants.MAXIMUM_PUMPING_PHOTON_RATE);

            // Only the pump beam is enabled
            this.seedBeam.set('enabled', false);
            this.pumpingBeam.set('enabled', false);
        },

        getSeedBeamOrigin: function() {
            return this.seedBeamOrigin.set(this.origin);
        },

        getPumpingBeamOrigin: function() {
            return this.pumpingBeamOrigin.set(
                this.tube.getBounds().x + this.tube.getBounds().w / 2,
                this.tube.getBounds().y - 100
            );
        },

        resetComponents: function() {
            BaseLasersSimulation.prototype.resetComponents.apply(this, arguments);

        },

        _update: function(time, deltaTime) {
            BaseLasersSimulation.prototype._update.apply(this, arguments);

            
        }

    });

    return MultipleAtomsLaserSimulation;
});
