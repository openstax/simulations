define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    var PhotonAbsorber = require('models/photon-absorber');

    /**
     * 
     */
    var BlackHole = PhotonAbsorber.extend({

        /**
         * Requires a simulation model instance to be specified in
         *   the options as 'simulation'.
         */
        initialize: function(attributes, options) {
            PhotonAbsorber.prototype.initialize.apply(this, arguments);

            this.simulation = options.simulation;

            this.eventHorizon = new Rectangle(
                this.simulation.bounds.x - 10,
                this.simulation.bounds.y - 10,
                this.simulation.bounds.w + 20,
                this.simulation.bounds.h + 20
            );
        },

        update: function(deltaTime) {
            // If photon is way outside the view, delete it
            var photons = this.simulation.photons;
            for (var i = photons.length - 1; i >= 0; i--) {
                if (!this.eventHorizon.contains(photons.at(i).get('position'))) 
                    photons.at(i).destroy();
            }
        }

    });

    return BlackHole;
});
