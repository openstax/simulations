define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Rectangle = require('common/math/rectangle');

    /**
     * 
     */
    var GlassPane = Backbone.Model.extend({

        defaults: {
            productionRate: 0,
            bounds: null,
            thickness: 0
        },

        initialize: function(attributes, options) {
            this.set('bounds', new Rectangle(this.get('bounds')));
        },

        width: function() {
            return this.get('bounds').w;
        },

        height: function() {
            return this.get('bounds').h;
        }

    });

    return GlassPane;
});
