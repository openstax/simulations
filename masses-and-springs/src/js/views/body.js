
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Rectangle = require('common/math/rectangle');


    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var Body = PixiView.extend({

        events: {
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',
        },

        initialize: function(options) {
            this.mvt = options.mvt;

            // TODO will move this out...I don't think this belongs in here.
            this.sceneWidth = options.sceneWidth;
            this.sceneHeight = options.sceneHeight;

            this.initGraphics();

            this.listenTo(this.model, 'change:y', this.updatePosition);

            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            // reference point for drag delta x and y
            this._dragOffset   = new PIXI.Point();

            this.body = new PIXI.Graphics();
            this.displayObject.addChild(this.body);
        },

        calculateBodyViewModel: function(){

            if(!this.viewModel){
                this.viewModel = {};

                // TODO need a non-linear equation for mass to dimensions because the 
                // lightest weights are tiny right now.
                this.viewModel.width = this.model.mass * 2 * Body.MASS_TO_RADIUS_RATIO;
                this.viewModel.height = this.model.mass * Body.MASS_TO_HEIGHT_RATIO;

                this.viewModel.color = Colors.parseHex(this.model.color);

                this.viewModel.hookThickness = 2.5;
                this.viewModel.hookRadius = this.viewModel.width * Body.HOOK_TO_BODY_RATIO;
                this.viewModel.hookHeight = 2.75 * this.viewModel.hookRadius;
            }

            this.viewModel.left = this.model.x * this.sceneWidth;
            this.viewModel.bottom = this.model.y * this.sceneHeight;

            this.viewModel.top = this.viewModel.bottom - this.viewModel.height;
            this.viewModel.center = this.viewModel.left + this.viewModel.width / 2;
        },

        drawBody : function(){
            this.calculateBodyViewModel();
            this.clearPositionOffsets();

            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';

            this.drawHook();
            this.drawBlock();
        },

        drawHook: function(){
            this.hook = this.makeHook(this.viewModel.center, this.viewModel.top);

            this.body.lineStyle(this.viewModel.hookThickness, this.viewModel.color, 1);
            this.body.drawPiecewiseCurve(this.hook, 0, 0);
        },

        makeHook: function(center, hookBase){
            var hookTop = hookBase - this.viewModel.hookHeight;
            var hookBottom = hookTop + 2 * this.viewModel.hookRadius;
            var hookLeft = center - this.viewModel.hookRadius;
            var hookRight = center + this.viewModel.hookRadius;
            var hookMiddle = hookTop + this.viewModel.hookRadius;

            return new PiecewiseCurve()
                .moveTo(center, hookBase)
                .lineTo(center, hookBottom)
                .curveTo(
                    hookLeft, hookBottom,
                    hookRight, hookBottom,
                    hookRight, hookMiddle
                )
                .curveTo(
                    hookRight, hookTop,
                    hookLeft, hookTop,
                    hookLeft, hookMiddle
                )
                .close();
        },

        drawBlock: function(){
            this.body.beginFill(this.viewModel.color, 1);
            this.body.drawRect(this.viewModel.left, this.viewModel.top, this.viewModel.width, this.viewModel.height);
            this.body.endFill();
        },

        dragStart: function(data){
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.grabbed = true;
        },

        dragEnd: function(data){
            this.updateModelPosition();
            this.checkIntersect();
            this.dropBody();
        },

        drag: function(data){
            if(this.grabbed){
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;

                this.displayObject.x += dx;
                this.displayObject.y += dy;
            }
        },

        updateModelPosition: function(){
            var newX = this.viewModel.left + this.displayObject.x;
            var newY = this.viewModel.bottom + this.displayObject.y;

            this.model.set('x', newX/this.sceneWidth);
            this.model.set('y', newY/this.sceneHeight);
        },

        clearPositionOffsets: function(){
            // clear position offsets
            this.displayObject.x = 0;
            this.displayObject.y = 0;
        },

        updatePosition: function(){
            this.drawBody();
        },

        checkIntersect: function(){
            // TODO broadcast event to global system for it to check intersect.

        },

        dropBody: function(){
            this.grabbed = false;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // this.updatePosition();
            this.drawBody();
        }

    }, Constants.BodyDefaults);

    return Body;
});
