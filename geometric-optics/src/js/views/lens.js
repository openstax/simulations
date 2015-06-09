define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var defineInputUpdateLocks = require('common/locks/define-locks');
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var FOCUS_POINT_COLOR = Colors.parseHex(Constants.LensView.FOCUS_POINT_COLOR);

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var LensView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
        },

        /**
         * Initializes the new LensView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:diameter', this.updateDiameter);
            this.listenTo(this.model, 'change:indexOfRefraction', this.updateIndexOfRefraction);
            this.listenTo(this.model, 'change:radiusOfCurvature', this.updateRadiusOfCurvature);
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:focalLength', this.updateFocusPoints);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initLens();
            this.initFocusPoints();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initLens: function() {
            this.lens = new PIXI.DisplayObjectContainer();
            this.displayObject.addChild(this.lens);

            this.lensFill = Assets.createSprite(Assets.Images.LENS_FILL);
            this.lensFill.anchor.x = this.lensFill.anchor.y = 0.5;
            this.lens.addChild(this.lensFill);

            this.lensOutline = Assets.createSprite(Assets.Images.LENS_OUTLINE);
            this.lensOutline.anchor.x = this.lensOutline.anchor.y = 0.5;
            this.lens.addChild(this.lensOutline);

            this.updateIndexOfRefraction(this.model, this.model.get('indexOfRefraction'));
            this.updateRadiusOfCurvature(this.model, this.model.get('radiusOfCurvature'));
            this.updateDiameter(this.model, this.model.get('diameter'));
        },

        initFocusPoints: function() {
            this.focusPoint1 = this.createFocusPoint();
            this.focusPoint2 = this.createFocusPoint();

            this.displayObject.addChild(this.focusPoint1);
            this.displayObject.addChild(this.focusPoint2);

            this.updateFocusPoints(this.model, this.model.get('focalLength'));
        },

        createFocusPoint: function() {
            var focusPoint = new PIXI.DisplayObjectContainer();

            var marker = new PIXI.Graphics();
            marker.lineStyle(LensView.FOCUS_POINT_LINE_WIDTH, FOCUS_POINT_COLOR, LensView.FOCUS_POINT_ALPHA);

            var halfWidth = LensView.FOCUS_POINT_SIZE / 2;
            marker.moveTo(-halfWidth, -halfWidth);
            marker.lineTo( halfWidth,  halfWidth);
            marker.moveTo( halfWidth, -halfWidth);
            marker.lineTo(-halfWidth,  halfWidth);

            focusPoint.addChild(marker);

            return focusPoint;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition(this.model, this.model.get('position'));
            this.updateRadiusOfCurvature(this.model, this.model.get('radiusOfCurvature'));
            this.updateDiameter(this.model, this.model.get('diameter'));
        },

        updatePosition: function(lens, position) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(position);
                this.displayObject.x = viewPosition.x;
                this.displayObject.y = viewPosition.y;
            });
        },

        updateIndexOfRefraction: function(lens, indexOfRefraction) {
            this.lensFill.alpha = LensView.INDEX_OF_REFRACTION_RANGE.percent(indexOfRefraction);
        },

        updateRadiusOfCurvature: function(lens, radiusOfCurvature) {
            var modelWidth = LensView.radiusToWidth(radiusOfCurvature);
            var viewWidth = this.mvt.modelToViewDeltaX(modelWidth);
            this.lens.scale.x = viewWidth / this.lensFill.texture.width;
        },

        updateDiameter: function(lens, diameter) {
            var diameterInPixels = Math.abs(this.mvt.modelToViewDeltaY(diameter));
            this.lens.scale.y = diameterInPixels / this.lensFill.texture.height;
        },

        updateFocusPoints: function(lens, focalLength) {
            this.focusPoint1.x = -this.mvt.modelToViewDeltaX(focalLength);
            this.focusPoint2.x =  this.mvt.modelToViewDeltaX(focalLength);
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.inputLock(function() {
                    this.model.translate(mdx, mdy);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

    }, Constants.LensView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(LensView);


    return LensView;
});