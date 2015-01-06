define(function(require) {

    'use strict';

    var Backbone = require('backbone');

    var LightAbsorbingShape = Backbone.Model.extend({

        defaults: {
            shape: null,
            lightAbsorptionCoefficient: 0
        },

        initialize: function(attrs, options) {
            if (!this.get('shape'))
                throw 'LightAbsorbingShapes must be given a shape object';
        },

        getBounds: function() {
            this.get('shape').getBounds();
        },

        contains: function(shape) {
            this.get('shape').contains(shape);
        }

    });

    return LightAbsorbingShape;
});