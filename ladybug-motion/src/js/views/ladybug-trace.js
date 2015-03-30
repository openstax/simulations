define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var Pool = require('object-pool');

    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var LadybugMover = require('models/ladybug-mover');

    var Assets = require('assets');

    var Constants = require('constants');
    var UpdateMode = Constants.UpdateMode;

    /**
     * Object pooling
     */
    var pointPool = Pool({
        init: function() {
            return new PIXI.Point();
        }
    });

    /**
     * A view that represents the player particle
     */
    var LadybugTraceView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                color: '#000',
                lineWidth: 3
            }, options);

            this.lineWidth = options.lineWidth;
            this.color = Colors.parseHex(options.color);
            this.mvt = options.mvt;
            this.dotsMode = false;
            this.points = [];

            // Add the first point
            this.appendTracePoint();

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.updateMVT(this.mvt);
        },

        appendTracePoint: function() {
            var point = pointPool.create();
            point.x = this.mvt.modelToViewX(this.model.get('x'));
            point.y = this.mvt.modelToViewY(this.model.get('y'));

            this.points.push(point);
        },

        drawPoints: function() {
            this.lines.moveTo(this.previousPoint.x, this.previousPoint.y);
            this.lines.lineTo(x, y);

            this.dots.beginFill(this.color, 1);
            this.dots.drawCircle(this.previousPoint.x, this.previousPoint.y, this.lineWidth);
            this.dots.endFill();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            if (this.displayObject.visible)
                this.drawPoints();
        },

        update: function(time, deltaTime, paused, recording) {
            if (!paused && recording) {
                this.appendTracePoint();

                if (this.displayObject.visible)
                    this.drawPoints();
            }
        },

        showDots: function() {
            this.dotsMode = true;
            this.displayObject.visible = false;
            this.drawPoints();
        },

        showLines: function() {
            this.dotsMode = false;
            this.displayObject.visible = false;
            this.drawPoints();
        },

        hide: function() {
            this.displayObject.visible = true;
        },

        clearTraces: function() {
            
        }

    });

    return LadybugTraceView;
});