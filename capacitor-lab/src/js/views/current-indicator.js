define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView = require('common/app/app');
    
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var ArrowView  = require('common/pixi/view/arrow');
    var Vector2    = require('common/math/vector2');
    var Colors     = require('common/colors/colors');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var CurrentIndicatorView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                positivePointsRight: false
            }, options);

            this.mvt = options.mvt;
            this.defaultDirection = options.positivePointsRight ? 1 : -1;

            // Initialize graphics
            this.initGraphics();

        },

        initGraphics: function() {
            this.initArrow();
            this.initMinus();

            this.displayObject.alpha = 0;
            
            this.updateMVT(this.mvt);
        },

        initArrow: function() {
            var arrowViewModel = new ArrowView.ArrowViewModel({
                originX: -60,
                targetX:  60
            });

            this.arrowView = new ArrowView({
                model: arrowViewModel,

                tailWidth: 20,

                headWidth: 47,
                headLength: 47,

                fillColor: '#2875B6',
                fillAlpha: 1
            });

            this.displayObject.addChild(this.arrowView.displayObject);
        },

        initMinus: function() {
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0xFFFFFF, 1);
            graphics.drawCircle(0, 0, 7);
            graphics.moveTo(-3, 0);
            graphics.lineTo( 3, 0);

            this.displayObject.addChild(graphics);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        update: function(time, deltaTime) {
            this.updateOrientation(this.model.get('currentAmplitude'));
            this.updateTransparency(this.model.get('currentAmplitude'), deltaTime);
        },

        updateOrientation: function(currentAmplitude) {
            if (currentAmplitude !== 0)
                this.displayObject.scale.x = (currentAmplitude > 0) ? this.defaultDirection : -this.defaultDirection;
        },

        updateTransparency: function(currentAmplitude, deltaTime) {
            if (currentAmplitude !== 0)
                this.displayObject.alpha = CurrentIndicatorView.TRANSPARENCY;
            else {
                var alpha = this.displayObject.alpha - (deltaTime / CurrentIndicatorView.FADEOUT_DURATION);
                if (alpha < 0)
                    this.displayObject.alpha = 0;
                else
                    this.displayObject.alpha = alpha;
            }
        },

        currentAmplitudeChanged: function(circuit, currentAmplitude) {
            this.updateOrientation(currentAmplitude);
        },

        setPosition: function(x, y) {
            this.displayObject.x = x;
            this.displayObject.y = y;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    }, Constants.CurrentIndicatorView);

    return CurrentIndicatorView;
});