
define(function(require) {

    'use strict';

    var PIXI = require('common/pixi/extensions');

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

            options = _.extend({
                labelOptions : Constants.LabelSettings
            }, options);

            this.label = this.model.label;
            this.labelOptions = options.labelOptions;

            this.initGraphics();
            this.initSound();

            this.initializeBodyViewModel();
            this.updateBodyViewModel();

            this.positionBody();
            this.drawBody();
            this.labelBody();

            this.listenTo(this.model, 'change:y', this.updatePosition);
            this.listenTo(this.model, 'change:top', this.updateTopPosition);
            this.listenTo(this.model, 'change:center', this.updateCenterPosition);
            this.listenTo(this.model, 'hitGround', this.hitGround);
        },

        initGraphics: function() {
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
            this.viewModel.borderColor = Colors.parseHex(Colors.darkenHex(this.model.color, 0.1));

            this.viewModel.hookThickness = 3;
            this.viewModel.hookRadius = Body.WIDTH_TO_HOOK_RADIUS(this.viewModel.width) * Constants.Scene.PX_PER_METER;
            this.viewModel.hookHeight = 2.75 * this.viewModel.hookRadius;

            this.viewModel.totalHeight = this.viewModel.height + this.viewModel.hookHeight;
        },

        drawBody : function(){
            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';

            this.drawHook();
            this.drawBlock();
        },

        labelBody: function(){
            var labelText;

            if(this.label){
                labelText = new PIXI.Text(this._makeLabelText(), {
                    font : this.labelOptions.font,
                    align : this.labelOptions.align,
                    wordWrap: true,
                    wordWrapWidth: this.viewModel.width,
                    fill : Colors.darkenHex(this.model.color, .2)
                });

                this._centerLabel(labelText);

                labelText.blendMode = PIXI.blendModes.MULTIPLY;
                this.displayObject.addChild(labelText);
            }
        },

        _makeLabelText: function(){
            return (this.model.mass * 1000).toFixed(0) + ' ' + this.model.units;
        },

        _centerLabel: function(label){

            label.anchor = new PIXI.Point(0.45, 0.5);

            label.x = this.viewModel.radius;
            label.y = this.viewModel.height / 2;
        },

        positionBody: function(){
            this.model.hook = this.makeHook(this.viewModel.center, this.viewModel.top);

            this.displayObject.x = this.viewModel.left;
            this.displayObject.y = this.viewModel.top;
        },

        drawHook: function(){
            var hook = this.makeHook(this.viewModel.radius, 0);

            this.body.lineStyle(this.viewModel.hookThickness, this.viewModel.borderColor, 1);
            this.body.drawPiecewiseCurve(hook, 0, 0);
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
            this.body.drawRect(0, 0, this.viewModel.width, this.viewModel.height);
            this.body.endFill();
        },

        dragStart: function(data){
            this.bringToFront();
            this.dragOffset = data.getLocalPosition(this.displayObject);
            this.model.grabbed = true;
            this.model.set('resting', true);
        },

        dragEnd: function(data){
            this.dropBody();
        },

        drag: function(data){

            var newBodyLeft;
            var newBodyBottom;

            if(this.model.grabbed){

                newBodyLeft = data.global.x - this.dragOffset.x;
                newBodyBottom = data.global.y - this.dragOffset.y;

                if(this.model.isHung() && this.isSidewaysDrag(newBodyLeft)){
                    this.model.unhang();
                }

                this.displayObject.x = newBodyLeft;
                this.displayObject.y = newBodyBottom;

                this.updateModelPosition();
            }
        },

        isSidewaysDrag: function(newX){
            // is the drag outside the bounds of the spring's attachment area?
            return !this.model.hook.intersects(this.model.spring.hitArea);
        },

        bringToFront: function(){
            var originalParentIndex;

            if(!this.originalParent){
                originalParentIndex = this.displayObject.parent.parent.getChildIndex(this.displayObject.parent);
            }

            this.displayObject.parent.parent.children[this.displayObject.parent.parent.children.length - 1].addChild(this.displayObject);

            if(!this.originalParent){
                this.originalParent = this.displayObject.parent.parent.children[originalParentIndex];
            }
        },

        returnToOriginalLayer: function(){
            this.originalParent.addChild(this.displayObject);
        },

        getFrontBodiesIndex: function(){
            return this.displayObject.parent.children.length - 1;
        },

        updateModelPosition: function(dx, dy){
            this.model.set('x', this._calcXFromLeftDrag(dx));
            this.model.set('y', this._calcYFromBottomDrag(dy));

            this.model.set('top', this._calcSpringY2FromY());
        },

        updatePosition: function(){
            this.updateBodyViewModel();
            this.positionBody();
        },

        updateTopPosition: function(model, top){
            this.model.set('y', this._calcYFromSpringY2(top));
        },

        updateCenterPosition: function(model, center){
            this.model.set('x', this._calcXFromViewCenter(center));
        },

        _calcXFromLeftDrag: function(dx){
            return this.displayObject.x/Constants.Scene.PX_PER_METER;
        },

        _calcYFromBottomDrag: function(dy){
            return (this.displayObject.y + this.viewModel.height)/Constants.Scene.PX_PER_METER;
        },

        _calcYFromSpringY2: function(springY2){
            return springY2 + this.viewModel.totalHeight/Constants.Scene.PX_PER_METER;
        },

        _calcSpringY2FromY: function(){
            return this.model.y - this.viewModel.totalHeight/Constants.Scene.PX_PER_METER;
        },

        _calcXFromViewCenter: function(center){
            return center - this.viewModel.radius / Constants.Scene.PX_PER_METER;
        },

        dropBody: function(){
            this.model.grabbed = false;
            this.model.set('resting', false);
        },

        hitGround: function(){
            this.setVolumeByVelocity();
            this.thudSound.play();

            this.returnToOriginalLayer();
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
