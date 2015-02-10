define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    //var Vector2  = require('common/math/vector2');

    var Constants = require('constants');
    

    var BodyTraceView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                color: '#ddd',
            }, options);

            this.color = Colors.parseHex(options.color);
            this.mvt = options.mvt;

            this.previousPoint = new PIXI.Point();
            this.previousPoint.x = this.mvt.modelToViewX(this.model.get('x'));
            this.previousPoint.y = this.mvt.modelToViewY(this.model.get('y'));

            this.initGraphics();
        },

        initGraphics: function() {
            this.trace = new PIXI.Graphics();
            this.trace.lineStyle(BodyTraceView.LINE_WIDTH, this.color, 1);
                        
            this.displayObject.addChild(this.trace);

            this.updateMVT(this.mvt);
        },

        appendTracePoint: function() {
            var x = this.mvt.modelToViewX(this.model.get('x'));
            var y = this.mvt.modelToViewY(this.model.get('y'));

            this.trace.moveTo(this.previousPoint.x, this.previousPoint.y);
            this.trace.lineTo(x, y);
            
            this.previousPoint.x = x;
            this.previousPoint.y = y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.clear();
        },

        update: function(time, deltaTime, simulationPaused) {
            if (!simulationPaused)
                this.appendTracePoint();
        },

        clear: function() {
            this.trace.clear();
            this.trace.lineStyle(BodyTraceView.LINE_WIDTH, this.color, 1);
            this.previousPoint.x = this.mvt.modelToViewX(this.model.get('x'));
            this.previousPoint.y = this.mvt.modelToViewY(this.model.get('y'));
        }

    }, Constants.BodyTraceView);


    return BodyTraceView;
});