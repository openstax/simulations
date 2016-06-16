define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var BaseLasersSimulation = require('models/simulation/base');
    var LaserAtom            = require('models/atom');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The simulation model for the One Atom tab
     */
    var OneAtomLasersSimulation = BaseLasersSimulation.extend({

        defaults: _.extend({}, BaseLasersSimulation.prototype.defaults, {
            photonSpeedScale: Constants.ONE_ATOM_PHOTON_SPEED,
            pumpingPhotonViewMode: Constants.PHOTON_DISCRETE
        }),

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BaseLasersSimulation.prototype.initComponents.apply(this, arguments);

            this.initAtom();
        },

        resetComponents: function() {
            BaseLasersSimulation.prototype.resetComponents.apply(this, arguments);

            this.seedBeam.set('photonsPerSecond', 1);
            this.pumpingBeam.set('photonsPerSecond', 1);

            this.seedBeam.set('enabled', true);
            this.pumpingBeam.set('enabled', false);
        },

        initAtom: function() {
            // Add an atom
            var atom = new LaserAtom({}, {
                simulation: this,
                elementProperties: this.get('elementProperties')
            });

            atom.setPosition(
                this.laserOrigin.x + this.boxWidth / 2,
                this.laserOrigin.y + this.boxHeight / 2
            );
            atom.setVelocity(0, 0);

            this.addAtom(atom);
        },

        initBeams: function() {
            BaseLasersSimulation.prototype.initBeams.apply(this, arguments);

            this.seedBeam.set('beamWidth', 0.5);
            this.seedBeam.set('photonsPerSecond', 1); // Start the beam with a very slow rate

            this.pumpingBeam.set('fanout', (Math.PI / 180) * Constants.SEED_BEAM_FANOUT * 2 * 1000);
            this.pumpingBeam.set('beamWidth', this.seedBeam.get('beamWidth') * 100);
            this.pumpingBeam.set('photonsPerSecond', 1); // Start with the pumping beam turned down all the way
            this.pumpingBeam.set('maxPhotonsPerSecond', Math.floor(this.pumpingBeam.get('maxPhotonsPerSecond') / 2));

            // Enable only the stimulating beam to start with
            this.seedBeam.set('enabled', true);
            this.pumpingBeam.set('enabled', false);
        },

        getSeedBeamOrigin: function() {
            return this.seedBeamOrigin.set(
                this.tube.getBounds().x - 100,
                this.tube.getBounds().y + this.tube.getBounds().h / 2
            );
        },

        getPumpingBeamOrigin: function() {
            return this.pumpingBeamOrigin.set(
                this.tube.getBounds().x + this.tube.getBounds().w / 2,
                this.tube.getBounds().y - 100
            );
        }

    });

    return OneAtomLasersSimulation;
});
