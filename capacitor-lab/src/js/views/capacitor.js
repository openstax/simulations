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

        events: {
            'touchstart      .plateAreaHandle': 'dragPlateAreaStart',
            'mousedown       .plateAreaHandle': 'dragPlateAreaStart',
            'touchmove       .plateAreaHandle': 'dragPlateArea',
            'mousemove       .plateAreaHandle': 'dragPlateArea',
            'touchend        .plateAreaHandle': 'dragPlateAreaEnd',
            'mouseup         .plateAreaHandle': 'dragPlateAreaEnd',
            'touchendoutside .plateAreaHandle': 'dragPlateAreaEnd',
            'mouseupoutside  .plateAreaHandle': 'dragPlateAreaEnd',

            'touchstart      .plateSeparationHandle': 'dragPlateSeparationStart',
            'mousedown       .plateSeparationHandle': 'dragPlateSeparationStart',
            'touchmove       .plateSeparationHandle': 'dragPlateSeparation',
            'mousemove       .plateSeparationHandle': 'dragPlateSeparation',
            'touchend        .plateSeparationHandle': 'dragPlateSeparationEnd',
            'mouseup         .plateSeparationHandle': 'dragPlateSeparationEnd',
            'touchendoutside .plateSeparationHandle': 'dragPlateSeparationEnd',
            'mouseupoutside  .plateSeparationHandle': 'dragPlateSeparationEnd'
        },

        initialize: function(options) {
            options = _.extend({
                outlineColor: '#888',
                outlineWidth: 1,
                outlineAlpha: 1,

                labelFontFamily: 'Helvetica Neue',
                labelFontSize: '16px',
                labelColor: '#000',
                labelAlpha: 1
            }, options);

            this.mvt = options.mvt;

            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineWidth = options.outlineWidth;
            this.outlineAlpha = options.outlineAlpha;

            this.labelFontFamily = options.labelFontFamily;
            this.labelFontSize = options.labelFontSize;
            this.labelColor = options.labelColor;
            this.labelAlpha = options.labelAlpha;

            // Cached objects
            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._position = new Vector2();

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);
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
            this.initResizeHandles();
            this.initDielectric();
            
            this.updateMVT(this.mvt);
        },

        initPlates: function() {
            this.topPlate = new PIXI.Graphics();
            this.bottomPlate = new PIXI.Graphics();

            this.topLayer.addChild(this.topPlate);
            this.bottomLayer.addChild(this.bottomPlate);
        },

        initResizeHandles: function() {
            var plateAreaHandle = new PIXI.Graphics();

            plateAreaHandle.buttonMode = true;
            plateAreaHandle.defaultCursor = 'move';

            this.plateAreaHandle = plateAreaHandle;

            var plateSeparationHandle = new PIXI.Graphics();

            plateSeparationHandle.buttonMode = true;
            plateSeparationHandle.defaultCursor = 'move';

            this.plateSeparationHandle = plateSeparationHandle;

            // var textSettings = {
            //     font: this.labelFontSize + ' ' + this.labelFontFamily,
            //     fill: this.labelColor
            // };

            // var label = new PIXI.Text(this.labelText, textSettings);
            // label.anchor.x = 0.5;
            // label.anchor.y = 0.47;
            // label.x = 0;
            // label.y = 0;
        },

        initDielectric: function() {
            
        },

        drawPlates: function() {
            this.bottomPlate.clear();
            //this.bottomPlate.lineStyle(1, 0x000000, 1);
            // this.bottomPlate.beginFill(0xFF5555, 1);
            // this.bottomPlate.drawPiecewiseCurve(this.shapeCreator.createBottomPlateShape());
            // this.bottomPlate.endFill();
            this.shapeCreator.drawBottomPlateShape(this.bottomPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineBottomPlateShape(this.bottomPlate, 1, this.outlineColor, 1);

            this.topPlate.clear();
            // this.topPlate.lineStyle(1, 0x000000, 1);
            // this.topPlate.beginFill(0x5555FF, 1);
            // this.topPlate.drawPiecewiseCurve(this.shapeCreator.createTopPlateShape());
            // this.topPlate.endFill();
            this.shapeCreator.drawTopPlateShape(this.topPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineTopPlateShape(this.topPlate, 1, this.outlineColor, 1);
        },

        moveToTop: function() {
            var parent = this.displayObject.parent;
            parent.setChildIndex(this.displayObject, parent.children.length - 1);
        },

        updatePosition: function(model, position) {
            // var viewPos = this.mvt.modelToView(position);
            // this.displayObject.x = viewPos.x;
            // this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawPlates();
            this.updatePosition(this.model, this.model.get('position'));
        },

        dragPlateAreaStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingPlateArea = true;
        },

        dragPlateArea: function(data) {
            if (this.draggingPlateArea) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);

            }
        },

        dragPlateAreaEnd: function(data) {
            this.draggingPlateArea = false;
        },

        dragPlateSeparationStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingPlateSeparation = true;
        },

        dragPlateSeparation: function(data) {
            if (this.draggingPlateSeparation) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);

            }
        },

        dragPlateSeparationEnd: function(data) {
            this.draggingPlateSeparation = false;
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