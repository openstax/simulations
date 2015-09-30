define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView  = require('common/v3/app/app');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');
    
    var Assets = require('assets');
    var Constants = require('constants');
    var NEEDLE_COLOR = Colors.parseHex(Constants.AmmeterView.NEEDLE_COLOR);
    var TICK_COLOR   = Colors.parseHex(Constants.AmmeterView.TICK_COLOR);

    /**
     * A view that represents an electron
     */
    var AmmeterView = PixiView.extend({

        /**
         * Initializes the new AmmeterView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.needleLength = 48;
            this.tickRadius = 52;
            this.tickLength =  8;
            this.startAngle = -Math.PI * (5 / 16);
            this.endAngle   =  Math.PI * (5 / 16);
            this.numTicks   = 10;

            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.simulation, 'change:current', this.updateNeedle);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.box = Assets.createSprite(Assets.Images.AMMETER_BOX);
            this.ticks = new PIXI.Graphics();
            this.labels = new PIXI.Container();
            this.needle = new PIXI.Graphics();

            this.needle.x = this.ticks.x = this.labels.x = this.box.texture.width / 2;
            this.needle.y = this.ticks.y = this.labels.y = 91;

            this.displayObject.addChild(this.box);
            this.displayObject.addChild(this.ticks);
            this.displayObject.addChild(this.labels);
            this.displayObject.addChild(this.needle);

            this.drawTicks();
            this.drawNeedle();
            this.initLabels();

            this.updateMVT(this.mvt);
        },

        drawTicks: function() {
            var graphics = this.ticks;
            graphics.clear();

            var angle;
            var angleStep = (this.endAngle - this.startAngle) / this.numTicks;
            var vec = this._vec;

            // Light ones
            graphics.lineStyle(1, TICK_COLOR, 1);
            for (var i = 0; i <= this.numTicks; i++) {
                angle = this.startAngle + (i * angleStep);
                vec.set(0, -this.tickRadius).rotate(angle);
                graphics.moveTo(vec.x, vec.y);
                vec.set(0, -this.tickRadius + 6).rotate(angle);
                graphics.lineTo(vec.x, vec.y);
            }

            // Dark ones
            graphics.lineStyle(2, 0x3A3A3A, 1);
            var numDarkTicks = 3;
            angleStep = (this.endAngle - this.startAngle) / (numDarkTicks - 1);
            for (var i = 0; i <= numDarkTicks - 1; i++) {
                angle = this.startAngle + (i * angleStep);
                vec.set(0, -this.tickRadius).rotate(angle);
                graphics.moveTo(vec.x, vec.y);
                vec.set(0, -this.tickRadius + 8).rotate(angle);
                graphics.lineTo(vec.x, vec.y);
            }
        },

        drawNeedle: function() {
            var w = 2;
            var h = this.needleLength;
            var graphics = this.needle;
            graphics.clear();
            graphics.beginFill(NEEDLE_COLOR, 1);
            graphics.drawCircle(0, 0, 5);
            graphics.drawRect(-w / 2, -h, w, h);
            graphics.endFill();
        },

        initLabels: function() {
            var settings = {
                font: 'bold 10px Helvetica Neue',
                fill: '#000'
            };

            var left   = new PIXI.Container();
            var right  = new PIXI.Container();
            var center = new PIXI.Container();

            left.x  = Math.round(-this.tickRadius + 12);
            right.x = Math.round( this.tickRadius - 12);

            var negFifty = new PIXI.Text('50', settings);
            var posFifty = new PIXI.Text('50', settings);
            var negSign  = new PIXI.Text('-', settings);
            var posSign  = new PIXI.Text('+', settings);
            var zero     = new PIXI.Text('0', settings);
            var amps     = new PIXI.Text('Amps', settings);

            negFifty.y = posFifty.y = -20;
            negSign.y  = posSign.y  = -12;
            zero.y = -44;
            amps.y = -20;
            left.addChild(negFifty);
            left.addChild(negSign);
            right.addChild(posFifty);
            right.addChild(posSign);
            center.addChild(zero);
            center.addChild(amps);

            this.labels.addChild(left);
            this.labels.addChild(center);
            this.labels.addChild(right);

            for (var i = 0; i < this.labels.children.length; i++) {
                var container = this.labels.children[i];
                for (var j = 0; j < container.children.length; j++) {
                    var label = container.children[j];
                    label.x = Math.round(-label.width / 2);
                }
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(AmmeterView.MODEL_WIDTH));
            var scale = targetWidth / this.box.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            var x;
            var y;

            if (AppView.windowIsShort()) {
                x = AmmeterView.SHORT_SCREEN_MODEL_X;
                y = AmmeterView.SHORT_SCREEN_MODEL_Y;
            }
            else {
                x = AmmeterView.MODEL_X;
                y = AmmeterView.MODEL_Y;
            }

            this.displayObject.x = Math.round(this.mvt.modelToViewX(x));
            this.displayObject.y = Math.round(this.mvt.modelToViewY(y));

            this.update();
        },

        updateNeedle: function(simulation, current) {
            var percentage = current / AmmeterView.MAX_CURRENT;
            this.needle.rotation = this.endAngle * percentage;
        },

        update: function() {
            this.updateNeedle(this.simulation, this.simulation.get('current'));
        }

    }, Constants.AmmeterView);


    return AmmeterView;
});