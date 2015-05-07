define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var HorizontalPhotonEmitter = require('models/photon-emitter/horizontal');

    var Constants = require('constants');

    /**
     * Represents a photon-emitting star.
     */
    var Star = HorizontalPhotonEmitter.extend({

        defaults: _.extend({}, HorizontalPhotonEmitter.prototype.defaults, {
            wavelength: Constants.SUNLIGHT_WAVELENGTH
            radius: 0,
            position: null
        }),

        initialize: function(attributes, options) {
            HorizontalPhotonEmitter.prototype.initialize.apply(this, [attributes, options]);

            this.set('position', new Vector2(this.get('position')));
        }

    });

    return Star;
});
