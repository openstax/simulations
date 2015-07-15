define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var Constants = require('constants');

    /**
     * 
     */
    var CapacitorView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                outlineColor: '#888',
                outlineWidth: 1,
                outlineAlpha: 1
            }, options);

            this.mvt = options.mvt;

            this.outlineColor = options.outlineColor;
            this.outlineWidth = options.outlineWidth;
            this.outlineAlpha = options.outlineAlpha;

            // Initialize graphics
            this.initGraphics();
            this.updateMVT(this.mvt);

            // Listen for model events
            this.listenTo(this.model, 'change:plateSeparation', this.update);
        },

        initGraphics: function() {
            this.shapeCreator = new CapacitorShapeCreator(this.model, this.mvt);

            this.bottomLayer = new PIXI.DisplayObjectContainer();
            this.middleLayer = new PIXI.DisplayObjectContainer();
            this.topLayer    = new PIXI.DisplayObjectContainer();

            this.displayObject.addChild(this.bottomLayer);
            this.displayObject.addChild(this.middleLayer);
            this.displayObject.addChild(this.topLayer);

            this.initPlates();
        },

        initPlates: function() {
            this.topPlate = new PIXI.Graphics();
            this.bottomPlate = new PIXI.Graphics();

            this.topLayer.addChild(this.topPlate);
            this.bottomLayer.addChild(this.bottomPlate);
        },

        drawPlates: function() {
            this.bottomPlate.clear();
            this.shapeCreator.drawBottomPlateShape(this.bottomPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineBottomPlateShape(this.bottomPlate, 1, this.outlineColor, 1);

            this.topPlate.clear();
            this.shapeCreator.drawTopPlateShape(this.topPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineTopPlateShape(this.topPlate, 1, this.outlineColor, 1);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        update: function() {
            this.drawPlates();
        },

        /**
         * Returns the y-value that should be used for sorting.
         */
        getYSortValue: function() {
            return this.mvt.modelToViewY(this.model.getY());
        }

    });

    return CapacitorView;
});