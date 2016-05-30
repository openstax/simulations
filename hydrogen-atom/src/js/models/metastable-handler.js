define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var RandomUtils = require('common/math/random-utils');

    var Constants = require('constants');

    var MetastableHandler = Backbone.Model.extend({

        defaults: {
            atom: undefined,
            gun: undefined,
            SchroedingerModel: undefined
        },

        initialize: function(attributes, options) {
            this.atom = this.get('atom');
            this.gun = this.get('gun');
            this.SchroedingerModel = this.get('SchroedingerModel');

            this.stuck = 0;     // True indicates that the atom is in the metastable state
            this.stuckTime = 0; // How long the atom has been stuck in the metastable state, in sim time units

            this.listenTo(this.atom, 'change:electronState', this.electronStateChanged);
        },

        update: function(time, deltaTime) {
            if (this.stuck && this.gun.isEnabled() && this.gun.isPhotonsMode() && this.gun.isWhiteLightType()) {
                this.stuckTime += deltaTime;
                if (this.stuckTime >= MetastableHandler.MAX_STUCK_TIME) {
                    console.log('atom has been stuck for ' + this.stuckTime + ' time units');
                    this.fireRandomAbsorbablePhoton();
                    /* 
                     * Restart the timer, but don't clear the stuck flag.
                     * If the photon we fire is not absorbed, we may need to fire another one.
                     */
                    this.stuckTime = 0;
                }
            }
        },

        /**
         * Fires one absorbable photon at the atom's center, higher state chosen at random.
         */
        fireRandomAbsorbablePhoton: function() {
            this.fireAbsorbablePhoton(
                MetastableHandler.METASTABLE_N + 
                1 + 
                RandomUtils.randomInteger(this.SchroedingerModel.getNumberOfStates() - MetastableHandler.METASTABLE_N)
            );
        },

        /*
         * See #2803.
         * Fires one absorbable photon at the atom's center, choosing a higher state that will result in
         * a wavelength that is apt to be visibly obvious to the user.  Specifically, we choose n=3 with
         * wavelength=656nm, which is a red photon. When we get stuck in the metastable state, the user is
         * most likely to be exploring the UV end of the spectrum, so firing a red photon should usually make
         * the photon easy to see. Alternatively we could try to select the higher state that results in the
         * wavelength that is furthest from the gun's current wavelength, but that would be more complicated.
         */
        fireObviousAbsorbablePhoton: function() {
            this.fireAbsorbablePhoton(MetastableHandler.METASTABLE_N + 1);
        },

        fireAbsorbablePhoton: function(n) {
            if (!(n > this.atom.getElectronState()))
                throw 'n must be greater than the atom\'s electronic state';

            // Assumes that the centers of the gun and atom are vertically aligned
            if (this.gun.getX() !== this.atom.getX())
                console.warn('photon will not hit atom, centers of gun and atom are not vertically aligned!');
            
            // Determine the wavelength needed to move the atom to the higher state.
            var wavelength = this.SchroedingerModel.getWavelengthAbsorbed(MetastableHandler.METASTABLE_N, n);
            console.log('firing an absorbable photon, n=' + n + ' wavelength=' + wavelength);
            // Fire a photon with that wavelength at the atom's center.
            this.gun.fireOnePhotonFromCenter(wavelength);
        },

        fireEnteredMetastableState: function() {
            this.trigger('entered-metastable-state');
        },

        fireExitedMetastableState: function() {
            this.trigger('exited-metastable-state');
        },

        electronStateChanged: function(atom, electronState) {
            // the value of n has changed
            if (!this.stuck && this.atom.stateEquals(
                MetastableHandler.METASTABLE_N, 
                MetastableHandler.METASTABLE_L, 
                MetastableHandler.METASTABLE_M
            )) {
                // we have entered the metastable state, set the stuck flag and timer
                this.stuck = true;
                this.stuckTime = 0;
                console.log('atom is stuck in metastable state ' + this.atom.getStateAsString());
                this.fireEnteredMetastableState();
            }
            else if (this.stuck && !this.atom.stateEquals(
                MetastableHandler.METASTABLE_N, 
                MetastableHandler.METASTABLE_L, 
                MetastableHandler.METASTABLE_M
            )) {
                // we have transitioned out of the metastable state, clear the stuck flag and timer
                this.stuck = false;
                this.stuckTime = 0;
                console.log('atom is unstuck, transitioned to state ' + this.atom.getStateAsString());
                this.fireExitedMetastableState();
            }
        }

    }, Constants.MetastableHandler);

    return MetastableHandler;
});
