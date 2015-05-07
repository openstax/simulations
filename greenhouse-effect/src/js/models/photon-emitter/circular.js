define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var PhotonEmitter = require('models/photon-emitter');
    var Photon        = require('models/photon');

    /**
     * 
     */
    var CircularPhotonEmitter = PhotonEmitter.extend({

        defaults: _.extend({}, PhotonEmitter.prototype.defaults, {
            center: null,
            radius: 0,
            wavelength: 0,
            alpha: 0,
            beta:  Math.PI * 2
        }),

        initialize: function(attributes, options) {
            PhotonEmitter.prototype.initialize.apply(this, [attributes, options]);

            this.set('center', new Vector2(this.get('center')));
        },

        /**
         * Returns a new photon.
         */
        emitPhoton: function() {
            var theta = Math.random() * (this.get('beta') - this.get('alpha')) + this.get('alpha');

            var photon = new Photon({
                wavelength: this.get('wavelength'),
                source: this
            });
            photon.setDirection(theta);
            photon.setPosition(
                this.get('center').x + this.get('radius') * Math.cos(theta),
                this.get('center').y + this.get('radius') * Math.sin(theta)
            );

            return photon;
        },

    });

    return CircularPhotonEmitter;
});
