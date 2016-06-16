define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    require('common/v3/pixi/extensions');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

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
            this.color = options.color;
            this.colorHex = Colors.parseHex(options.color);
            this.mvt = options.mvt;
            this.dotsMode = false;
            this.points = [];

            this.initGraphics();

            this.listenTo(this.model, 'history-added', this.historyAdded);
            this.listenTo(this.model, 'history-removed', this.historyRemoved);
        },

        initGraphics: function() {
            this.lines = new PIXI.Graphics();
            this.displayObject.addChild(this.lines);

            this.dotTexture = PIXI.Texture.generateCircleTexture(this.lineWidth, this.color);
            this.dots = new PIXI.Container();
            this.dots.visible = false;
            this.displayObject.addChild(this.dots);
            this.lastDotTime = 0;

            this.updateMVT(this.mvt);
        },

        drawPoints: function() {
            var time = this.model.get('time');
            var history = this.model.culledStateHistory;
            var start = 0;
            var end = history.length - 1;
            var point;
            
            if (history.length > 0) {
                if (this.dotsMode) {
                    var dots = this.dots;
                    var dot;
                    var dotTexture = this.dotTexture;

                    // Add new dots
                    for (var i = start; i <= end; i += 4) {
                        if (history[i].time > this.lastDotTime) {
                            this.lastDotTime = history[i].time;

                            point = this.mvt.modelToView(history[i].position);
                            dot = new PIXI.Sprite(dotTexture);
                            dot.anchor.x = dot.anchor.y = 0.5;
                            dot.x = point.x;
                            dot.y = point.y;
                            dot.time = history[i].time;
                            dots.addChild(dot);
                        }
                    }

                    // Update the alpha of each dot
                    var children = dots.children;
                    for (var c = 0; c < children.length; c++) {
                        children[c].alpha = this.calculateOpacityForState(time, children[c].time);
                    }
                }
                else {
                    var lines = this.lines;
                    lines.clear();
                    point = this.mvt.modelToView(history[start].position);
                    lines.moveTo(point.x, point.y);

                    for (var i = start; i <= end; i++) {
                        point = this.mvt.modelToView(history[i].position);

                        lines.lineStyle(this.lineWidth, this.colorHex, this.calculateOpacityForState(time, history[i].time));
                        lines.lineTo(point.x, point.y);
                    }
                }
            }
        },

        calculateOpacityForState: function(time, stateTime) {
            var age = time - stateTime;
            if (age >= LadybugTraceView.SECONDS_TO_BE_OLD)
                return LadybugTraceView.OLD_OPACITY;
            else
                return LadybugTraceView.NEW_OPACITY_RANGE.lerp(age / LadybugTraceView.SECONDS_TO_BE_OLD);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            if (this.displayObject.visible)
                this.drawPoints();
        },

        update: function(time, deltaTime, paused) {},

        historyAdded: function() {
            if (this.displayObject.visible)
                this.drawPoints();
        },

        historyRemoved: function() {
            this.clearTraces();
            this.lastDotTime = 0;
        },

        showDots: function() {
            this.dotsMode = true;
            this.dots.visible = true;
            this.lines.visible = false;
            this.drawPoints();
        },

        showLines: function() {
            this.dotsMode = false;
            this.lines.visible = true;
            this.dots.visible = false;
            this.drawPoints();
        },

        hide: function() {
            this.dots.visible = false;
            this.lines.visible = false;
        },

        clearTraces: function() {
            this.lines.clear();
            this.dots.removeChildren();
        }

    }, Constants.LadybugTraceView);

    return LadybugTraceView;
});