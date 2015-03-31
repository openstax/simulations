define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
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
            this.color = Colors.parseHex(options.color);
            this.mvt = options.mvt;
            this.dotsMode = false;
            this.points = [];

            this.initGraphics();

            this.listenTo(this.model, 'history-changed', this.historyChanged);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.displayObject.addChild(this.graphics);

            this.updateMVT(this.mvt);
        },

        drawPoints: function() {
            var graphics = this.graphics;
            var time = this.model.get('time');
            var history = this.model.culledStateHistory;
            var start = 0;
            var end = history.length - 1;
            var point;

            graphics.clear();
            if (history.length > 0) {
                if (this.dotsMode) {
                    for (var i = start; i <= end; i++) {
                        point = this.mvt.modelToView(history[i].position);

                        graphics.beginFill(this.color, this.calculateOpacityForState(time, history[i]));
                        graphics.drawCircle(point.x, point.y, this.lineWidth);
                        graphics.endFill();
                    }
                }
                else {
                    point = this.mvt.modelToView(history[start].position);
                    graphics.moveTo(point.x, point.y);

                    for (var i = start; i <= end; i++) {
                        point = this.mvt.modelToView(history[i].position);

                        graphics.lineStyle(this.lineWidth, this.color, this.calculateOpacityForState(time, history[i]));
                        graphics.lineTo(point.x, point.y);
                    }
                }
            }
        },

        calculateOpacityForState: function(time, state) {
            var age = time - state.time;
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

        historyChanged: function() {
            if (this.displayObject.visible)
                this.drawPoints();
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

    }, Constants.LadybugTraceView);

    return LadybugTraceView;
});