define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    var PixiView = require('../view');

    var Colors    = require('../../colors/colors');
    var Vector2   = require('../../math/vector2');
    var Rectangle = require('../../math/rectangle');


    var ArrowViewModel = Backbone.Model.extend({
        defaults: {
            originX: 0,
            originY: 0,

            targetX: 50,
            targetY: 0,

            minLength: 25,
            maxLength: null
        }
    });


    var ArrowView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                tailWidth: 10,

                headWidth: 20,
                headLength: 20,

                fillColor: '#ff0000',
                fillAlpha: 1
            }, options);

            this.tailWidth = options.tailWidth;

            this.headWidth = options.headWidth;
            this.headLength = options.headLength;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            this._originVector = new Vector2();
            this._targetVector = new Vector2();
            this._direction    = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:originX change:originY change:targetX change:targetY', this.drawArrow);
        },

        initGraphics: function() {
            this.tailGraphics = new PIXI.Graphics();
            this.headGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.tailGraphics);
            this.displayObject.addChild(this.headGraphics);

            this.drawArrow();
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

            var tail = this.tailGraphics;
            var head = this.headGraphics;
            
            // Draw it pointing straight to the right and then rotate it.
            tail.clear();
            head.clear();

            tail.beginFill(this.fillColor, this.fillAlpha);
            tail.drawRect(0, -this.tailWidth / 2, length - this.headLength, this.tailWidth);
            tail.endFill();

            head.beginFill(this.fillColor, this.fillAlpha);
            head.moveTo(length, 0);
            head.lineTo(length - this.headLength,  this.headWidth / 2);
            head.lineTo(length - this.headLength, -this.headWidth / 2);
            head.endFill();

            this.displayObject.rotation = angle;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    }, {

        ArrowViewModel: ArrowViewModel

    });

    return ArrowView;
});
