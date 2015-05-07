define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');

    var PhotonAbsorber = require('models/photon-absorber');

    /**
     * 
     */
    var BlackHole = PhotonAbsorber.extend({

        defaults: _.extend({}, PhotonAbsorber.prototype.defaults, {
            model: null,
            eventHorizon: null
        }),

        initialize: function(attributes, options) {
            PhotonAbsorber.prototype.initialize.apply(this, arguments);

            this.set('eventHorizon', new Rectangle(this.get('eventHorizon')));
        },

        update: function(deltaTime) {
            var eventHorizon = this.get('eventHorizon');
            eventHorizon.set(
                this.get('model').bounds().x - 10,
                this.get('model').bounds().y - 10,
                this.get('model').bounds().w + 20,
                this.get('model').bounds().h + 20
            );

            // If photon is way outside the view, delete it
            var photons = this.get('model').photons;
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
