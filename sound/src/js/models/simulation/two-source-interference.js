define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var SoundSimulation        = require('models/simulation');
    var TwoSourceSoundListener = require('models/two-source-sound-listener');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var TwoSourceInterferenceSimulation = SoundSimulation.extend({

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            SoundSimulation.prototype.initComponents.apply(this, arguments);
            
            this.personListener.setOrigin( 0, -2.7);
            this.personListener.setOrigin2(0,  2.7);

            this.setListenerToPerson();
        },

        /**
         * Returns a new instance of SoundListener to be used as the person
         *   listener.
         */
        createPersonListener: function() {
            return new TwoSourceSoundListener({ simulation: this });
        }

    });

    return TwoSourceInterferenceSimulation;
});
