define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Positionable = require('models/positionable');

    var Constants = require('constants');

    /**
     * 
     */
    var Cloud = Positionable.extend({
        
        defaults: _.extend({}, Positionable.prototype.defaults, {
            existenceStrength: 1,
            width:  Constants.Cloud.CLOUD_WIDTH,
            height: Constants.Cloud.CLOUD_HEIGHT
        }),

        initialize: function(attributes, options) {
            Positionable.prototype.initialize.apply(this, [attributes, options]);
            
            this.initShape();
        },

        initShape: function() {
            var x = this.get('position').x;
            var y = this.get('position').y;
            var h = this.get('height');
            var w = this.get('width');
            
            // Create an ellipse
            this.shape = PiecewiseCurve.createEllipse(x, y, h, w);
        },

        getShape: function() {
            return this.shape;
        },

        translate: function(x, y) {
            if (x instanceof Vector2)
                this.shape.translate(x);
            else
                this.shape.translate(x, y);
            
            Positionable.prototype.translate.apply(this, [x, y]);
        }

    }, Constants.Cloud);

    return Cloud;
});
