define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');

    var Constants = require('constants');
    

    var BodyTraceView = PixiView.extend({

        initialize: function(options) {
            this.color = Colors.parseHex(this.model.get('color'));
            this.mvt = options.mvt;


            this.previousPoint = this.mvt.modelToView(this.model.get('position')).clone();

            this.initGraphics();
        },

        initGraphics: function() {
            this.trace = new PIXI.Graphics();
            this.trace.lineStyle(BodyTraceView.LINE_WIDTH, this.color, 1);
                        
            this.displayObject.addChild(this.trace);

            this.updateMVT(this.mvt);
        },

        appendTracePoint: function() {
            var viewPosition = this.mvt.modelToView(this.model.get('position'));

            this.trace.moveTo(this.previousPoint.x, this.previousPoint.y);
            this.trace.lineTo(viewPosition.x, viewPosition.y);
            
            this.previousPoint.x = viewPosition.x;
            this.previousPoint.y = viewPosition.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.clear();
        },

        update: function(time, deltaTime, simulationPaused) {
            if (!simulationPaused && !this.model.get('exploded'))
                this.appendTracePoint();
        },

        clear: function() {
            this.trace.clear();
            this.trace.lineStyle(BodyTraceView.LINE_WIDTH, this.color, 1);

            var viewPosition = this.mvt.modelToView(this.model.get('position'));
            this.previousPoint.x = viewPosition.x;
            this.previousPoint.y = viewPosition.y;
        }

    }, Constants.BodyTraceView);


    return BodyTraceView;
});