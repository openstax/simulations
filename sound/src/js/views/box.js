
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView          = require('common/pixi/view');
    var PressureGaugeView = require('common/pixi/view/pressure-gauge');
    var Colors            = require('common/colors/colors');
    var Vector2           = require('common/math/vector2');

    var Constants = require('constants');
    var Assets = require('assets');

    /**
     * A box that surrounds the speaker that we can drain air
     *   from and that has a pressure gauge. 
     */
    var BoxView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                thickness: 8,
                color: '#21366b'
            }, options);

            this.thickness = options.thickness;
            this.colorString = options.color;
            this.color = Colors.parseHex(options.color);

            this.mvt = options.mvt;
            this.simulation = this.model;
            this.densityPercent = 1;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBox();
            this.initPressureGauge();

            this.updateMVT(this.mvt);
        },

        initBox: function() {
            this.boxFill    = Assets.createSprite(Assets.Images.BOX_FILL);
            this.boxOutline = Assets.createSprite(Assets.Images.BOX_OUTLINE);

            this.boxFill.anchor.x = this.boxOutline.anchor.x = 0.1798;
            this.boxFill.anchor.y = this.boxOutline.anchor.y = 0.5;
            this.boxFill.alpha = 0;

            this.displayObject.addChild(this.boxFill);
            this.displayObject.addChild(this.boxOutline);
        },

        initPressureGauge: function() {
            this.pressureGaugeView = new PressureGaugeView({
                value: 1,
                readoutFont: '11px Arial',
                unitsFont:   'bold 8px Arial',
                decimals: 2,

                allowOverload: false,

                radius: 48,
                outlineColor: this.colorString,
                outlineThickness: 5,

                tickMargin: 9,

                connectorLength: 12,
                connectorWidth:  24,
                connectorColor1: '#000',
                connectorColor2: this.colorString
            });
            
            this.displayObject.addChild(this.pressureGaugeView.displayObject);
        },

        /**
         * 
         */
        update: function(time, deltaTime, paused) {
            if (!paused) {
                if (this.removingAir) {
                    this.densityPercent -= BoxView.DENSITY_CHANGE_PER_SECOND * deltaTime;

                    if (this.densityPercent < 0) {
                        this.densityPercent = 0;
                        this.removingAir = false;
                    }

                    this.densityPercentChanged();
                }
                else if (this.addingAir) {
                    this.densityPercent += BoxView.DENSITY_CHANGE_PER_SECOND * deltaTime;

                    if (this.densityPercent < 0) {
                        this.densityPercent = 0;
                        this.addingAir = false;
                    }

                    this.densityPercentChanged();
                }
            }
        },

        densityPercentChanged: function() {
            this.pressureGaugeView.val(this.densityPercent);
            this.boxFill.alpha = 1 - this.densityPercent;
            this.simulation.set('densityPercent', this.densityPercent);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(BoxView.HEIGHT_IN_METERS));
            var scale = targetSpriteHeight / this.boxFill.texture.height;
            this.boxFill.scale.x = scale;
            this.boxFill.scale.y = scale;
            this.boxOutline.scale.x = scale;
            this.boxOutline.scale.y = scale;
            
            this.positionPressureGauge();
        },

        positionPressureGauge: function() {
            var height     = Math.abs(this.mvt.modelToViewDeltaY(BoxView.HEIGHT_IN_METERS));
            var width      = this.mvt.modelToViewDeltaX(BoxView.WIDTH_IN_METERS);
            var leftOffset = this.mvt.modelToViewDeltaX(BoxView.LEFT_OFFSET_IN_METERS);

            this.pressureGaugeView.displayObject.x = leftOffset + width / 2;
            this.pressureGaugeView.displayObject.y = Math.round(-height / 2) + this.thickness / 2;
        },

        addAir: function() {
            this.addingAir = true;
        },

        removeAir: function() {
            this.removingAir = true;
        }

    }, Constants.BoxView);

    return BoxView;
});
