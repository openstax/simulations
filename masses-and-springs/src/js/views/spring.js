
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

            this.initGraphics();
            this.initSound();

            this.initializeSpringViewModel();
            this.updateSpringViewModel();

            this.listenTo(this.model, 'change:k', this.update);
            this.listenTo(this.model, 'change:y2', this.update);
            this.listenTo(this.model, 'unsnag', this.playSound);

            this.drawPeg();
            this.drawSpring();
        },

        initGraphics: function() {
            this.peg = new PIXI.Graphics();
            this.spring = new PIXI.Graphics();

            this.displayObject.addChild(this.spring);
            this.displayObject.addChild(this.peg);
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
            this.viewModel.pegX = this.viewModel.x;
            this.viewModel.pegY = this.viewModel.y1 - this.viewModel.ringRadius;
       },

        updateSpringViewModel: function(){
            // Things that will change and need to update
            this.viewModel.y2 = this.model.y2 * Constants.Scene.PX_PER_METER;
            this.viewModel.coilsLength = this.viewModel.y2 - this.viewModel.y1;
            this.viewModel.coilHeight = this.viewModel.coilsLength / Spring.COILS;
            this.viewModel.thickness = Spring.K_TO_THICKNESS(this.model.k);

            this.viewModel.ringRadius = Spring.RING_RADIUS * Constants.Scene.PX_PER_METER + 0.5 * this.viewModel.thickness;
        },

        update: function(){
            this.updateSpringViewModel();
            this.drawSpring();
        },

        drawPeg: function(){
            this.peg.beginFill(this.viewModel.pegColor, 0.8);
            this.peg.drawCircle(0, 0, this.viewModel.pegRadius);
            this.peg.endFill();

            this.peg.x = this.viewModel.pegX;
            this.peg.y = this.viewModel.pegY;

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
            this.model.hitArea = new Rectangle(this.viewModel.coilLeft, this.viewModel.y2 - .5 * this.viewModel.ringRadius, 2 * this.viewModel.coilRadius, 1.5 * this.viewModel.ringRadius);
        },

        makeSpringPoints: function(){

            var points = [];
            var coilCount = 0;

            this.makeHangRing(points, this.viewModel.x, this.viewModel.y1);

            while(coilCount < Spring.COILS){
                this.makeCoil(points, this.viewModel.x, this.viewModel.y1, coilCount);
                coilCount ++;
            }

            this.makeSpringEnd(points);

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

        makeSpringEnd: function(points){
            points[points.length - 1] = [this.viewModel.x, this.viewModel.y2];
            points[points.length] = [this.viewModel.x, this.viewModel.y2 + this.viewModel.ringRadius];
        },

        labelSpring: function(){

            var labelText = new PIXI.Text(this._makeLabelText(), {

            });

            this.peg.addChild(labelText);
            this._positionLabelText(labelText);
        },

        _makeLabelText: function(){
            return this.model.collection.indexOf(this.model) + 1;
        },

        _positionLabelText: function(label){
            console.log(label.parent);
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
