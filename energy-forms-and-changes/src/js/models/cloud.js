define(function (require) {

    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    
    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    /**
     * 
     */
    var Cloud = Backbone.Model.extend({
        
        defaults: {
            existenceStrength: 1,
            relativePosition: null,
            width:  Constants.Cloud.CLOUD_WIDTH,
            height: Constants.Cloud.CLOUD_HEIGHT
        },

        initialize: function(attributes, options) {
            if (!this.get('relativePosition'))
                throw 'Cloud needs a relative position specified at the beginning.';
           
            this.initShape();
        },

        initShape: function() {
            var x = this.get('relativePosition').x;
            var y = this.get('relativePosition').y;
            var h = this.get('height');
            var w = this.get('width');
            
            // Create an ellipse
            this.shape = PiecewiseCurve.createEllipse(x, y, h, w);
        },

        getShape: function() {
            return this.shape;
        }

    }, Constants.Cloud);

    return Cloud;
});
