
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
            this.viewModel.hookRadius = this.viewModel.width * Body.HOOK_TO_BODY_RATIO;

            this.viewModel.color = Colors.parseHex(this.model.color);
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

            var hook = new PiecewiseCurve();

            hook.moveTo(this.viewModel.x, this.viewModel.y);
            hook.curveTo([]);

            this.body.lineStyle(2, this.viewModel.color, 1);
            this.body.drawPiecewiseCurve(hook, 0, 0);

        },

        drawMass: function(){
            this.body.beginFill(this.viewModel.color, 1);
            this.body.drawRect(this.viewModel.x, this.viewModel.y - this.viewModel.height, this.viewModel.width, this.viewModel.height);
            this.body.endFill();
        },

        dragStart: function(data){
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.grabbed = true;
        },

        dragEnd: function(data){
            this.grabbed = false;
            this.dropBody();
        },

        drag: function(data){
            if(this.grabbed){

                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                this.model.set('x', this.displayObject.x/this.sceneWidth);
                this.model.set('y', this.displayObject.y/this.sceneHeight);
            }
        },

        dropBody: function(){

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
