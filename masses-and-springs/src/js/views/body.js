
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

            this._dragOffset   = new PIXI.Point();
            this.initGraphics();

            // this.listenTo(this.model, 'change:state', this.updateState);

            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.body = new PIXI.Graphics();
            this.displayObject.addChild(this.body);
        },

        calculateBodyViewModel: function(){

            this.viewModel = this.viewModel || {};

            this.viewModel.x = this.model.x * this.sceneWidth;
            this.viewModel.y = this.model.y * this.sceneHeight;

            this.viewModel.width = this.model.mass * 2 * Body.MASS_TO_RADIUS_RATIO;
            this.viewModel.height = this.model.mass * Body.MASS_TO_HEIGHT_RATIO;

            this.viewModel.left = this.viewModel.x;
            this.viewModel.center = this.viewModel.left + this.viewModel.width / 2;
            this.viewModel.top = this.viewModel.y - this.viewModel.height;
            this.viewModel.color = Colors.parseHex(this.model.color);

            this.viewModel.hookThickness = 2.5;
            this.viewModel.hookRadius = this.viewModel.width * Body.HOOK_TO_BODY_RATIO;
            this.viewModel.hookHeight = 2.75 * this.viewModel.hookRadius;
        },

        drawBody : function(){

            this.calculateBodyViewModel();

            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';

            this.drawHook();
            this.drawMass();
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

        drawMass: function(){
            this.body.beginFill(this.viewModel.color, 1);
            this.body.drawRect(this.viewModel.left, this.viewModel.top, this.viewModel.width, this.viewModel.height);
            // this.body.drawRect(this.sceneWidth/2, this.sceneHeight/2, 200, 200);
            this.body.endFill();
        },

        dragStart: function(data){
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.grabbed = true;
        },

        dragEnd: function(data){
            this.checkIntersect();
            this.dropBody();
        },

        drag: function(data){
            if(this.grabbed){

                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;

                this.displayObject.x += dx;
                this.displayObject.y += dy;

                // this.updateModelPosition();
            }
        },

        updateModelPosition: function(){
            // TODO
            // this is probably wrong.  will need to check this.
            this.model.set('x', this.displayObject.x/this.sceneWidth);
            this.model.set('y', this.displayObject.y/this.sceneHeight);
        },

        checkIntersect: function(){

            // TODO broadcast event to global system for it to check intersect.

        },

        dropBody: function(){

            this.grabbed = false;

            if(this.model.isHung()){

            }else{

            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // this.updatePosition();
            this.drawBody();
        }

    }, Constants.BodyDefaults);

    return Body;
});
