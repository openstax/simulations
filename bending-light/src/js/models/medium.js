define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var MediumColorFactory = require('models/medium-color-factory');

    /**
     * Holds information for a medium
     */
    var Medium = Backbone.Model.extend({

        defaults: {
            shape: null,
            mediumProperties: null,
            color: null
        },

        initialize: function(attributes, options) {
            this.on('change:mediumProperties', this.mediumPropertiesChanged);

            // Set starting color
            this.mediumPropertiesChanged(this, this.get('mediumProperties'));
        },

        getIndexOfRefraction: function(wavelength) {
            return this.get('mediumProperties').dispersionFunction.getIndexOfRefraction(wavelength);
        },

        mediumPropertiesChanged: function(model, mediumProperties) {
            this.set('color', MediumColorFactory.getRgbaColor(mediumProperties.getIndexOfRefractionForRedLight()));
        }

    });

    return Medium;
});
