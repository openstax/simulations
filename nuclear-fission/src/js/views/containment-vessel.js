define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');

    var ARROW_COLOR = Colors.parseHex(Constants.ContainmentVesselView.ARROW_COLOR);

    /**
     * A view that represents the containment vessel
     */
    var ContainmentVesselView = PixiView.extend({

        events: {
            
        },

        /**
         * Initializes the new ContainmentVesselView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:radius',   this.draw);
            this.listenTo(this.model, 'change:enabled',  this.updateVisibility);
            this.listenTo(this.model, 'change:exploded', this.explodedChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.containmentVesselGraphics = new PIXI.Graphics();
            this.handle1Graphics = new PIXI.Graphics();
            this.handle2Graphics = new PIXI.Graphics();

            this.drawHandle(this.handle1Graphics);
            this.drawHandle(this.handle2Graphics);

            this.displayObject.addChild(this.containmentVesselGraphics);
            this.displayObject.addChild(this.handle1Graphics);
            this.displayObject.addChild(this.handle2Graphics);

            this.updateMVT(this.mvt);
        },

        drawHandle: function(graphics) {
            var length     = ContainmentVesselView.ARROW_LENGTH;
            var headWidth  = ContainmentVesselView.ARROW_HEAD_WIDTH;
            var headHeight = ContainmentVesselView.ARROW_HEAD_HEIGHT;
            var tailWidth  = ContainmentVesselView.ARROW_TAIL_WIDTH;
            var tailLength = length - headHeight;

            graphics.beginFill(ARROW_COLOR, 1);
            
            // Draw the arrow tail in a special way
            var m = 1; // Margin
            var falloff = 0.5;
            var x = tailLength;
            for (var h = tailLength * falloff; h >= 2 + (m * 2); h *= falloff) {
                var height = Math.floor(h) - (m * 2);
                graphics.drawRect(Math.floor(x - m) - height, -tailWidth / 2, height, tailWidth);

                x -= Math.floor(h);
            }

            graphics.endFill();
        },

        draw: function() {
            
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Update position
            this.displayObject.x = this.mvt.modelToViewX(0);
            this.displayObject.y = this.mvt.modelToViewY(0);

            this.draw();
        },

        update: function(time, deltaTime) {
            if (this.cooldownTimer > 0) {
                this.cooldownTimer -= deltaTime;

                // Check to see if it has cooled down
                if (this.cooldownTimer <= 0) {
                    this.cooldownTimer = 0;
                    this.showUnpressedButtonTexture();
                }
            }
        },

        explodedChanged: function(containmentVessel, exploded) {

        }

    }, Constants.ContainmentVesselView);


    return ContainmentVesselView;
});