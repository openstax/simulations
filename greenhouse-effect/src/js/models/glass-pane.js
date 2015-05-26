define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Rectangle = require('common/math/rectangle');

    /**
     * 
     */
    var GlassPane = Backbone.Model.extend({

        paneThickness: 0.6,

        defaults: {
            productionRate: 0,
            bounds: null
        },

        initialize: function(attributes, options) {
            var bounds = new Rectangle(0, 0, 0, this.paneThickness);

            if (this.get('bounds'))
                bounds.set(this.get('bounds'));
            if (options.x !== undefined)
                bounds.x = options.x;
            if (options.altitude !== undefined)
                bounds.y = options.altitude;
            if (options.width !== undefined)
                bounds.w = options.width;
            if (options.height !== undefined)
                bounds.h = options.height;

            this.set('bounds', bounds);
        },

        width: function() {
            return this.get('bounds').w;
        },

        height: function() {
            return this.get('bounds').h;
        },

        emitPhoton: function(photon) {
            this.trigger('photon-emitted', photon);
        },

        absorbPhoton: function(photon) {
            this.trigger('photon-absorbed', photon);
        }

    });

    return GlassPane;
});
