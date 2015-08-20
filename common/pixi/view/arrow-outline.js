define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var ArrowView = require('./arrow');

    var Colors  = require('../../colors/colors');
    var Vector2 = require('../../math/vector2');


    var ArrowOutlineView = ArrowView.extend({

        initialize: function(options) {
            options = _.extend({
                lineWidth: 1,
                lineColor: '#000',
                lineAlpha: 1
            }, options);

            ArrowView.prototype.initialize.apply(this, [options]);

            this.lineWidth = options.lineWidth;
            this.lineColor = options.lineColor;
            this.lineAlpha = options.lineAlpha;
        },

        drawArrow: function() {
            var origin = this._originVector.set(this.model.get('originX'), this.model.get('originY'));
            var target = this._targetVector.set(this.model.get('targetX'), this.model.get('targetY'));

            var angle  = this._direction.set(target).sub(origin).angle();
            var scale  = 1;
            var length = origin.distance(target);
            if (length < this.headLength) {
                scale = length / this.headLength;
                length = this.headLength;
            }

            this.model.set('length', length);

            var tail = this.tailGraphics;
            var head = this.headGraphics;

            // Draw it pointing straight to the right and then rotate it.
            tail.clear();
            head.clear();

            tail.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);
            head.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);

            tail.moveTo(length - this.headLength,  this.tailWidth / 2);
            tail.lineTo(0,  this.tailWidth / 2);
            tail.lineTo(0, -this.tailWidth / 2);
            tail.lineTo(length - this.headLength, -this.tailWidth / 2);

            head.moveTo(length - this.headLength,  this.headWidth / 2);
            head.lineTo(length, 0);
            head.lineTo(length - this.headLength, -this.headWidth / 2);

            this.displayObject.x = origin.x;
            this.displayObject.y = origin.y;
            this.transformFrame.rotation = angle;
            this.transformFrame.scale.x = scale;
            this.transformFrame.scale.y = scale;
        }

    });

    return ArrowOutlineView;
});
