
define(function(require) {

    'use strict';

    // var PIXI = require('pixi');
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

            this.boingSound = new buzz.sound('audio/boing', {
                formats: ['ogg', 'mp3', 'wav']
            });

            this.setVolume(Constants.Scene.SOUNDS_ENABLED);


            this.drawSpring();

            this.listenTo(this.model, 'change:k', this.drawSpring);
            this.listenTo(this.model, 'change:y2', this.drawSpring);
            this.listenTo(this.model, 'unsnag', function(){
                this.boingSound.play();
            });
        },

        initGraphics: function() {
            this.spring = new PIXI.Graphics();
            this.displayObject.addChild(this.spring);
        },

        updateSpringViewModel: function(){

            if(!this.viewModel){
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
            }

            // Things that will change and need to update
            this.viewModel.y2 = this.model.y2 * Constants.Scene.PX_PER_METER;
            this.viewModel.coilsLength = this.viewModel.y2 - this.viewModel.y1 - 3 * this.viewModel.ringRadius;
            this.viewModel.coilHeight = this.viewModel.coilsLength / Spring.COILS;
            this.viewModel.thickness = Spring.K_TO_THICKNESS(this.model.k);
        },

        drawSpring: function(){

            var curve = new PiecewiseCurve();
            var points;

            this.updateSpringViewModel();
            points = this.makeSpringPoints();

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
            if(!this.model.isSnagged()){
                this.model.hitArea = new Rectangle(this.viewModel.coilLeft, this.viewModel.y2 - .5 * this.viewModel.ringRadius, 2 * this.viewModel.coilRadius, 1.5 * this.viewModel.ringRadius);
            }else{
                this.model.hitArea = undefined;
            }
        },

        makeSpringPoints: function(){

            var points = [];
            var coilCount = 0;

            this.makeHangRing(points, this.viewModel.x, this.viewModel.y1);

            while(coilCount < Spring.COILS){
                this.makeCoil(points, this.viewModel.x, this.viewModel.y1 + this.viewModel.ringOffset, coilCount);
                coilCount ++;
            }

            this.makeSpringEnd(points);

            return points;
        },

        makeHangRing: function(points, x, y){

            x = x - this.viewModel.ringRadius;
            y = y + 2 * this.viewModel.ringRadius;

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
                x + this.viewModel.coilRadius, y + (coilCount + 0.5) * this.viewModel.coilHeight
            ]);
            points.push([
                x, y + (coilCount + 0.75) * this.viewModel.coilHeight,
                x - this.viewModel.coilRadius, y + (coilCount + 0.75) * this.viewModel.coilHeight,
                x - this.viewModel.coilRadius, y + (coilCount + 1) * this.viewModel.coilHeight
            ]);
        },

        makeSpringEnd: function(points){
            points[points.length - 1] = [this.viewModel.x, this.viewModel.y2 - this.viewModel.ringRadius];
            points[points.length] = [this.viewModel.x, this.viewModel.y2];
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
