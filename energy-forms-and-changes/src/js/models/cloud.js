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
            relativePosition: null,
            width:  Constants.Cloud.CLOUD_WIDTH,
            height: Constants.Cloud.CLOUD_HEIGHT
        }),

        initialize: function(attributes, options) {
            Positionable.prototype.initialize.apply(this, [attributes, options]);

            if (!options.parentPosition || !this.get('relativePosition'))
                throw 'Cloud model constructor requires a starting relativePosition as well as the parent position passed as an option.';

            this.setPosition(options.parentPosition.clone().add(this.get('relativePosition')));
            
            this.shape         = this.createShape(this.get('position'));
            this.relativeShape = this.createShape(this.get('relativePosition'));
        },

        createShape: function(position) {
            var x = position.x - this.get('width') / 2;
            var y = position.y - this.get('height') / 2;
            var h = this.get('height');
            var w = this.get('width');
            
            // Create an ellipse
            return PiecewiseCurve.createEllipse(x, y, w, h);
        },

        getShape: function() {
            return this.shape;
        },

        getRelativelyPositionedShape: function() {
            return this.relativeShape;
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
