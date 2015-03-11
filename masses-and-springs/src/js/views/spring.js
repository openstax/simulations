
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
    var Spring = PixiView.extend({

        initialize: function(options) {

            options = _.extend({
                labelOptions : Constants.LabelSettings
            }, options);

            this.label = this.model.label;
            this.labelOptions = options.labelOptions;

            this.initGraphics();
            this.initSound();

            this.initializeSpringViewModel();
            this._updateSpringViewModel();

            this.positionGraphics();

            this.drawPeg();
            this.drawSpring();

            this.listenTo(this.model, 'change:k', this.updateThickness);
            this.listenTo(this.model, 'change:y2', this.update);
            this.listenTo(this.model, 'snag', this.updateSnaggedState);
            this.listenTo(this.model, 'unsnag', this.playSound);
        },

        initGraphics: function() {
            this.peg = new PIXI.Graphics();
            this.spring = new PIXI.Graphics();

            this.displayObject.addChild(this.peg);
            this.displayObject.addChild(this.spring);
        },

        initSound: function(){
            this.boingSound = new buzz.sound('audio/boing', {
                formats: ['ogg', 'mp3', 'wav']
            });

            this.setVolume(Constants.Scene.SOUNDS_ENABLED);
        },

        initializeSpringViewModel: function(){
            // intializing view model, setting static values
            this.viewModel = {};

            this.viewModel.color = Colors.parseHex(Spring.COLOR);
            this.viewModel.ringRadius = Spring.RING_RADIUS * Constants.Scene.PX_PER_METER;
            this.viewModel.ringOffset = 2 * this.viewModel.ringRadius;
            this.viewModel.coilRadius = (Spring.WIDTH * Constants.Scene.PX_PER_METER)/2;

            this.viewModel.x = this.model.x * Constants.Scene.PX_PER_METER;
            this.viewModel.y1 = this.model.y1 * Constants.Scene.PX_PER_METER;
            this.viewModel.restL = this.model.restL * Constants.Scene.PX_PER_METER;
            this.viewModel.coilLeft = this.viewModel.x - this.viewModel.coilRadius;

            this.viewModel.pegColor = Colors.parseHex(Spring.PEG_COLOR);
            this.viewModel.pegRadius = Spring.RING_RADIUS * Constants.Scene.PX_PER_METER * 0.65;

            this.viewModel.numberOfCoils = Spring.COILS;
            this.viewModel.coilHeightMin = 0.75;

            this._updateThickness();
       },

        _updateSpringViewModel: function(){
            // Things that will change and need to update
            this.viewModel.y2 = this.model.y2 * Constants.Scene.PX_PER_METER;
            this.viewModel.coilsLength = this.viewModel.y2 - this.viewModel.y1;
            this.viewModel.coilHeight = this.viewModel.coilsLength / this.viewModel.numberOfCoils;

            // To prevent spring from rendering weird when it's very very short, let's make the coils square
            if(Math.abs(this.viewModel.coilHeight) > this.viewModel.coilHeightMin){
                this.viewModel.coilDrawStyle = 'Curvy';
            } else {
                this.viewModel.coilDrawStyle = 'Square';
            }
        },

        updateThickness: function(){
            this._updateThickness();
            this.drawSpring();
        },

        _updateThickness: function(){
            this.viewModel.thickness = Spring.K_TO_THICKNESS(this.model.k);
            this.viewModel.ringRadius = Spring.RING_RADIUS * Constants.Scene.PX_PER_METER + 0.5 * this.viewModel.thickness;
        },

        updateSnaggedState: function(){
            this._updateSnaggedState();
            this.drawSpring();
        },

        _updateSnaggedState: function(){
            this.viewModel.color = this.model.isSnagged()? Colors.parseHex(this.model.body.color) : Colors.parseHex(Spring.COLOR);
        },

        update: function(){
            this._updateSpringViewModel();
            this.drawSpring();
        },

        drawPeg: function(){
            this.peg.beginFill(this.viewModel.pegColor, 0.8);
            this.peg.drawCircle(0, 0, this.viewModel.pegRadius);
            this.peg.endFill();

            this.peg.y = -1 * this.viewModel.ringRadius;

            this.labelSpring();
        },

        drawSpring: function(){

            var curve = new PiecewiseCurve();
            var points = this.makeSpringPoints();

            this.spring.clear();
            // set a fill and line style
            this.spring.lineStyle(this.viewModel.thickness, this.viewModel.color, 1);

            // draw curves for spring
            _.each(points, function(point, iter){
                if (iter === 0){
                    curve.moveTo.apply(curve, point);
                }else if (point.length > 4){
                    curve.curveTo.apply(curve, point);
                }else{
                    curve.lineTo.apply(curve, point);
                }
            }, this);

            curve.close();

            this.spring.drawPiecewiseCurve(curve, 0, 0);

            this.model.hitArea = new Rectangle(
                this.viewModel.coilLeft,
                this.viewModel.y2,
                2 * this.viewModel.coilRadius,
                3 * this.viewModel.ringRadius
            );
        },

        makeSpringPoints: function(){

            var points = [];
            var coilCount = 0;

            this.makeHangRing(points, 0, 0);

            while(coilCount < this.viewModel.numberOfCoils){
                this.makeCoil(points, 0, 0, coilCount);
                coilCount ++;
            }

            this.makeSpringEnd(points, 0, this.viewModel.y2 - this.viewModel.y1, this.viewModel.ringRadius);

            return points;
        },

        makeHangRing: function(points, x, y){

            x = x - this.viewModel.ringRadius;
            y = y;

            points.push([
                x + this.viewModel.ringRadius, y
            ]);
            points.push([
                x + (2 * this.viewModel.ringRadius), y,
                x + (2 * this.viewModel.ringRadius), y - (1.5 * this.viewModel.ringRadius),
                x + this.viewModel.ringRadius, y - (1.5 * this.viewModel.ringRadius)
            ]);
            points.push([
                x, y - (1.5 * this.viewModel.ringRadius),
                x, y,
                x + this.viewModel.ringRadius, y
            ]);
        },

        makeCoil: function(points, x, y, coilCount){
            // make coil according to coil style
            this['_make' + this.viewModel.coilDrawStyle + 'Coil'](points, x, y, coilCount);
        },

        _makeCurvyCoil: function(points, x, y, coilCount){
            points.push([
                x, y + (coilCount + 0.25) * this.viewModel.coilHeight,
                x + this.viewModel.coilRadius, y + (coilCount + 0.25) * this.viewModel.coilHeight,
                x + this.viewModel.coilRadius, y + (coilCount + 0.50) * this.viewModel.coilHeight
            ]);
            points.push([
                x, y + (coilCount + 0.75) * this.viewModel.coilHeight,
                x - this.viewModel.coilRadius, y + (coilCount + 0.75) * this.viewModel.coilHeight,
                x - this.viewModel.coilRadius, y + (coilCount + 1) * this.viewModel.coilHeight
            ]);
        },

        _makeSquareCoil: function(points, x, y, coilCount){

            var squishFactor = 1 + Math.abs(this.viewModel.coilHeight/2);

            points.push([x + this.viewModel.coilRadius * squishFactor, y + (coilCount) * this.viewModel.coilHeight]);
            points.push([x + this.viewModel.coilRadius * squishFactor, y + (coilCount + 0.50) * this.viewModel.coilHeight]);
            points.push([x - this.viewModel.coilRadius * squishFactor, y + (coilCount + 0.50) * this.viewModel.coilHeight]);
            points.push([x - this.viewModel.coilRadius * squishFactor, y + (coilCount + 1) * this.viewModel.coilHeight]);

        },

        makeSpringEnd: function(points, x, y, height){
            // make spring end according to coil style
            this['_make' + this.viewModel.coilDrawStyle + 'SpringEnd'](points, x, y, height);
        },

        _makeCurvySpringEnd: function(points, x, y, height){
            points[points.length - 1] = [x, y];
            points[points.length] = [x, y + height];
        },

        _makeSquareSpringEnd: function(points, x, y, height){
            points[points.length] = [x, y];
            points.push([x, y + height]);
        },

        positionGraphics: function(){
            this.displayObject.x = this.viewModel.x;
            this.displayObject.y = this.viewModel.y1;
        },

        labelSpring: function(){

            var labelText = new PIXI.Text(this._makeLabelText(), {
                font : this.labelOptions.font,
                align : this.labelOptions.align,
                fill : Colors.darkenHex(Spring.PEG_COLOR, .2)
            });

            this.peg.addChild(labelText);
            this._positionLabelText(labelText);
        },

        _makeLabelText: function(){
            return this.model.collection.indexOf(this.model) + 1;
        },

        _positionLabelText: function(label){
            label.anchor = new PIXI.Point(0.5, 0.5);
            label.y = -14;
        },

        playSound: function(){
            this.boingSound.play();
        },

        setVolume: function(setting){
            var volumes = {
                mute : 0,
                low : 20,
                high : 50
            };

            var volume = volumes[setting] || 0;

            this.boingSound.setVolume(volume);
        }

    }, Constants.SpringDefaults);

    return Spring;
});
