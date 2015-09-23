define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    var PixiView = require('../view');

    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');


    var ArrowViewModel = Backbone.Model.extend({
        defaults: {
            originX: 0,
            originY: 0,

            targetX: 50,
            targetY: 0,

            minLength: 25,
            maxLength: null,
            length: 0
        },

        initialize: function() {
            this._settings = {};
        },

        translate: function(x, y) {
            this._settings.originX = this.get('originX') + x;
            this._settings.originY = this.get('originY') + y;
            this._settings.targetX = this.get('targetX') + x;
            this._settings.targetY = this.get('targetY') + y;
            this.set(this._settings);
        },

        moveTo: function(x, y) {
            this._settings.originX = x;
            this._settings.originY = y;
            this._settings.targetX = x + (this.get('targetX') - this.get('originX'));
            this._settings.targetY = y + (this.get('targetY') - this.get('originY'));
            this.set(this._settings);
        }
    });


    var ArrowView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                tailWidth: 8,

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

            this.transformFrame = new PIXI.Container();
            this.transformFrame.addChild(this.tailGraphics);
            this.transformFrame.addChild(this.headGraphics);

            this.displayObject.addChild(this.transformFrame);

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

            this.model.set('length', length);

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

            this.displayObject.x = origin.x;
            this.displayObject.y = origin.y;
            this.transformFrame.rotation = angle;
            this.transformFrame.scale.x = scale;
            this.transformFrame.scale.y = scale;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        getRotation: function() {
            return this.transformFrame.rotation;
        }

    }, {

        ArrowViewModel: ArrowViewModel

    });

    return ArrowView;
});
