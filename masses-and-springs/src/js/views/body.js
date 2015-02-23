
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Rectangle = require('common/math/rectangle');


    var buzz = require('buzz');
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
            // this.mvt = options.mvt;

            this.initGraphics();
            this.initSound();

            this.listenTo(this.model, 'change:y', this.updatePosition);
            this.listenTo(this.model, 'change:top', this.updateTopPosition);
            this.listenTo(this.model, 'change:center', this.updateCenterPosition);
            this.listenTo(this.model, 'hitGround', this.playSound);

            this.drawBody();
        },

        initGraphics: function() {
            // reference point for drag delta x and y
            this._dragOffset   = new PIXI.Point();

            this.body = new PIXI.Graphics();
            this.displayObject.addChild(this.body);
        },

        initSound: function(){
            this.thudSound = new buzz.sound('audio/thud', {
                formats: ['ogg', 'mp3', 'wav']
            });

            this.setVolume(Constants.Scene.SOUNDS_ENABLED);
        },

        updateBodyViewModel: function(){

            if(!this.viewModel){
                this.initializeBodyViewModel();
            }

            this.viewModel.left = this.model.x * Constants.Scene.PX_PER_METER;
            this.viewModel.bottom = this.model.y * Constants.Scene.PX_PER_METER;

            this.viewModel.top = this.viewModel.bottom - this.viewModel.height;
            this.viewModel.center = this.viewModel.left + this.viewModel.width / 2;
        },

        initializeBodyViewModel: function(){
            this.viewModel = {};

            this.viewModel.width = Body.MASS_TO_WIDTH(this.model.mass) * Constants.Scene.PX_PER_METER;
            this.viewModel.height = Body.MASS_TO_HEIGHT(this.model.mass) * Constants.Scene.PX_PER_METER;
            this.viewModel.radius = this.viewModel.width / 2;

            this.viewModel.color = Colors.parseHex(this.model.color);
            this.viewModel.borderColor = Colors.parseHex(Colors.darkenHex(this.model.color, .1));

            this.viewModel.hookThickness = 3;
            this.viewModel.hookRadius = Body.WIDTH_TO_HOOK_RADIUS(this.viewModel.width) * Constants.Scene.PX_PER_METER;
            this.viewModel.hookHeight = 2.75 * this.viewModel.hookRadius;

            this.viewModel.totalHeight = this.viewModel.height + this.viewModel.hookHeight;
            this.viewModel.snapPointBuffer = this.viewModel.hookRadius/2;
        },

        drawBody : function(){
            this.updateBodyViewModel();
            this.clearPositionOffsets();

            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';

            this.drawHook();
            this.drawBlock();
        },

        drawHook: function(){
            this.model.hook = this.makeHook(this.viewModel.center, this.viewModel.top);
            this.model.set('hook', this.model.hook);

            this.body.lineStyle(this.viewModel.hookThickness, this.viewModel.borderColor, 1);
            this.body.drawPiecewiseCurve(this.model.hook, 0, 0);
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
            this.model.set('resting', true);
        },

        dragEnd: function(data){

            // TODO will need figure out updating model so that hook intercept
            // works on drag and not just one drag end
            this.updateModelPosition();
            this.dropBody();
        },

        drag: function(data){

            if(this.grabbed && this.model.isHung()){
                this.model.unhang();
                return;
            }

            if(this.grabbed){
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;

                this.displayObject.x += dx;
                this.displayObject.y += dy;
            }
        },

        updateModelPosition: function(){
            this.model.set('x', this._calcXFromLeftDrag());
            this.model.set('y', this._calcYFromBottomDrag());
        },

        clearPositionOffsets: function(){
            // clear position offsets
            this.displayObject.x = 0;
            this.displayObject.y = 0;
        },

        updatePosition: function(){
            this.drawBody();
        },

        updateTopPosition: function(model, top){
            this.model.set('y', this._calcYFromSpringY2(top));
        },

        updateCenterPosition: function(model, center){
            this.model.set('x', this._calcXFromViewCenter(center));
        },

        _calcXFromLeftDrag: function(){
            return (this.viewModel.left + this.displayObject.x)/Constants.Scene.PX_PER_METER;
        },

        _calcYFromBottomDrag: function(){
            return (this.viewModel.bottom + this.displayObject.y)/Constants.Scene.PX_PER_METER;
        },

        _calcYFromSpringY2: function(springY2){
            return springY2 + (this.viewModel.totalHeight - this.viewModel.snapPointBuffer)/Constants.Scene.PX_PER_METER;
        },

        _calcXFromViewCenter: function(center){
            return center - this.viewModel.radius / Constants.Scene.PX_PER_METER;
        },

        dropBody: function(){
            this.grabbed = false;
            this.model.set('resting', false);
        },

        playSound: function(){
            this.setVolumeByVelocity();
            this.thudSound.play();
        },

        setVolume: function(setting){
            this.volumeSetting = setting;
        },

        setVolumeByVelocity: function(){
            this.thudSound.setVolume(this._calcVolume());
        },

        _calcVolume: function(){

            var factors = {
                mute : 0,
                low : 20,
                high : 100
            };

            var volumeFactor = factors[this.volumeSetting] || 0;
            var volume = volumeFactor * (this.model.velocityY / 2.6) * (this.model.velocityY / 2.6);

            return volume;
        }

    }, Constants.BodyDefaults);

    return Body;
});
