define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
                   require('common/v3/pixi/draw-arrow');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * 
     */
    var WiggleMeView = PixiView.extend({

        /**
         * Initializes the new WiggleMeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.fillColor = Colors.parseHex(WiggleMeView.DEFAULT_ARROW_FILL_COLOR);
            this.cycleDuration = WiggleMeView.DEFAULT_CYCLE_DURATION;
            this.cycles = 0;
            this.direction = WiggleMeView.CLOCKWISE;

            this.initGraphics();

            this.listenTo(this.simulation.barMagnet, 'change:position', this.objectMoved);
            this.listenTo(this.simulation.compass,   'change:position', this.objectMoved);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.arrowGraphics = new PIXI.Graphics();

            this.initText();
            this.displayObject.addChild(this.arrowGraphics);          

            this.updateMVT(this.mvt);
        },

        initText: function() {
            this.text = new PIXI.Text('Move me or me', {
                font: WiggleMeView.DEFAULT_TEXT_FONT_SIZE + 'px Helvetica Neue',
                fill: WiggleMeView.DEFAULT_TEXT_COLOR
            });
            this.text.x = -Math.round(this.text.width / 2);
            this.displayObject.addChild(this.text);
        },

        drawArrows: function() {
            var leftX = -this.text.width / 2 - WiggleMeView.TEXT_MARGIN;
            var rightX = this.text.width / 2 + WiggleMeView.TEXT_MARGIN;
            var bottomY = this.text.height + WiggleMeView.TEXT_MARGIN;
            var arrowWidth  = this.mvt.modelToViewDeltaX(40);
            var arrowHeight = this.mvt.modelToViewDeltaX(40);
            var graphics = this.arrowGraphics;
            graphics.beginFill(this.fillColor, 1);
            graphics.drawArrow(
                leftX, bottomY, 
                leftX - arrowWidth, bottomY + arrowHeight, 
                WiggleMeView.ARROW_TAIL_WIDTH, 
                WiggleMeView.ARROW_HEAD_WIDTH, 
                WiggleMeView.ARROW_HEAD_HEIGHT
            );
            graphics.drawArrow(
                rightX, bottomY, 
                rightX + arrowWidth, bottomY + arrowHeight, 
                WiggleMeView.ARROW_TAIL_WIDTH, 
                WiggleMeView.ARROW_HEAD_WIDTH, 
                WiggleMeView.ARROW_HEAD_HEIGHT
            );
            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var viewPosition = this.mvt.modelToView(Constants.BarMagnetSimulation.WIGGLE_ME_LOCATION);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
            this.startX = viewPosition.x;
            this.startY = viewPosition.y;

            this.xRange = this.mvt.modelToViewDeltaX(WiggleMeView.DEFAULT_RANGE.width);
            this.yRange = this.mvt.modelToViewDeltaY(WiggleMeView.DEFAULT_RANGE.height);

            this.drawArrows();
        },

        /**
         * Synchronize the view with the model.
         */
        update: function(time, deltaTime) {
            if (this.displayObject.visible) {
                var delta = deltaTime / this.cycleDuration;
                if (this.direction == WiggleMeView.CLOCKWISE)
                    this.cycles += delta;
                else
                    this.cycles -= delta;
                
                var x = Math.floor(this.startX + (this.xRange * Math.cos(this.cycles)));
                var y = Math.floor(this.startY + (this.yRange * Math.sin(this.cycles)));

                this.displayObject.x = x;
                this.displayObject.y = y;
            }
        },

        /**
         * If one of the objects has moved, hide this view and stop listening to the objects.
         */
        objectMoved: function() {
            this.displayObject.visible = false;
            this.stopListening(this.simulation.barMagnet);
            this.stopListening(this.simulation.compass);
        }

    }, Constants.WiggleMeView);


    return WiggleMeView;
});