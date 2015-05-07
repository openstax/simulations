define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');

    var PhotonAbsorber = require('models/photon-absorber');

    /**
     * 
     */
    var BlackHole = PhotonAbsorber.extend({

        defaults: _.extend({}, PhotonAbsorber.prototype.defaults, {
            eventHorizon: null
        }),

        /**
         * Requires a simulation model instance to be specified in
         *   the options as 'simulation'.
         */
        initialize: function(attributes, options) {
            PhotonAbsorber.prototype.initialize.apply(this, arguments);

            this.simulation = options.simulation;

            this.set('eventHorizon', new Rectangle(this.get('eventHorizon')));
        },

        update: function(deltaTime) {
            var eventHorizon = this.get('eventHorizon');
            eventHorizon.set(
                this.simulation.bounds().x - 10,
                this.simulation.bounds().y - 10,
                this.simulation.bounds().w + 20,
                this.simulation.bounds().h + 20
            );

            // If photon is way outside the view, delete it
            var photons = this.simulation.photons;
            var photon;
            while (photon = photons.first()) {
                if (!eventHorizon.contains(photon.get('position'))) 
                    photon.destroy();
            }
        },

        absorbPhoton: function() {}

    });

    return BlackHole;
});
