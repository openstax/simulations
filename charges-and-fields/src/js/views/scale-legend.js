define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var ArrowView = require('common/pixi/view/arrow');

    var Constants = require('constants');

    /**
     * Double-arrow that shows how big a meter is.
     */
    var ScaleLegend = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                arrowLength: 1,
                units: 'meter'
            }, options);

            this.mvt = options.mvt;
            this.arrowLength = options.arrowLength;
            this.units = options.units;

            this.initGraphics();

            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            var arrowWidth      = 6;
            var arrowHeadWidth  = 14;
            var arrowHeadLength = 12;
            var fillColor = '#000';
            var fillAlpha = 0.6;

            this.leftArrowViewModel = new ArrowView.ArrowViewModel();
            this.rightArrowViewModel = new ArrowView.ArrowViewModel();

            var leftArrowView = new ArrowView({
                model:      this.leftArrowViewModel,
                fillColor:  fillColor,
                fillAlpha:  fillAlpha,
                tailWidth:  arrowWidth,
                headWidth:  arrowHeadWidth,
                headLength: arrowHeadLength
            });

            var rightArrowView = new ArrowView({
                model:      this.rightArrowViewModel,
                fillColor:  fillColor,
                fillAlpha:  fillAlpha,
                tailWidth:  arrowWidth,
                headWidth:  arrowHeadWidth,
                headLength: arrowHeadLength
            });

            this.displayObject.addChild(leftArrowView.displayObject);
            this.displayObject.addChild(rightArrowView.displayObject);

            var text = new PIXI.Text(this.arrowLength + ' ' + this.units, {
                font: '14px Helvetica Neue',
                fill: '#000',
                stroke: '#fff',
                strokeThickness: 2
            });
            text.anchor.x = 0.5;
            text.anchor.y = -0.2;
            this.displayObject.addChild(text);

            this.hide();
        },

        resizeArrows: function() {
            var halfLength = this.mvt.modelToViewDeltaX(this.arrowLength) / 2;
            this.leftArrowViewModel.set('targetX', -halfLength);
            this.rightArrowViewModel.set('targetX', halfLength);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.resizeArrows();
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

    }, Constants.ScaleLegend);

    return ScaleLegend;
});