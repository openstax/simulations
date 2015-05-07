define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    var PhotonEmitter = require('models/photon-emitter');
    var Photon        = require('models/photon');

    /**
     * 
     */
    var HorizontalPhotonEmitter = PhotonEmitter.extend({

        defaults: _.extend({}, PhotonEmitter.prototype.defaults, {
            bounds: null,
            wavelength: 0,
        }),

        initialize: function(attributes, options) {
            PhotonEmitter.prototype.initialize.apply(this, [attributes, options]);

            this.set('bounds', new Rectangle(this.get('bounds')));
        },

        /**
         * Returns a new photon.
         */
        emitPhoton: function() {
            var photon = new Photon({
                wavelength: this.get('wavelength'),
                source: this
            });
            photon.setDirection(3 * Math.PI / 2);
            photon.setPosition(
                this.get('bounds').x + this.get('bounds').w * Math.random(),
                this.get('bounds').y + this.get('bounds').h * Math.random()
            );

            return photon;
        },

    });

    return HorizontalPhotonEmitter;
});
