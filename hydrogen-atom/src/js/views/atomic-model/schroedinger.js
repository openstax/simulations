define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    require('common/v3/pixi/draw-stick-arrow');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var AtomicModelView    = require('hydrogen-atom/views/atomic-model');
    var BrightnessCache    = require('hydrogen-atom/views/brightness-cache');
    var BrightnessGridView = require('hydrogen-atom/views/brightness-grid');

    var Constants = require('constants');

    // Cache for Schrödinger brightness values
    var _brightnessCache = new BrightnessCache(
        Constants.SchroedingerModelView.POPULATE_CACHE,
        Constants.SchroedingerModelView.NUMBER_OF_HORIZONTAL_CELLS,
        Constants.SchroedingerModelView.NUMBER_OF_VERTICAL_CELLS,
        Constants.SchroedingerModelView.NUMBER_OF_DEPTH_CELLS,
        Constants.SchroedingerModelView.CELL_WIDTH,
        Constants.SchroedingerModelView.CELL_HEIGHT,
        Constants.SchroedingerModelView.CELL_DEPTH
    );
    
    /**
     * Represents the scene for the SchroedingerModel
     */
    var SchroedingerModelView = AtomicModelView.extend({

        /**
         * Initializes the new SchroedingerModelView.
         */
        initialize: function(options) {
            AtomicModelView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            // Create brightness grid
            this.brightnessGridView = new BrightnessGridView();
            this.displayObject.addChild(this.brightnessGridView.displayObject);

            // Create little axis
            var settings = {
                font: '12px Helvetica Neue',
                fill: '#fff'
            };
            this.axisGraphics = new PIXI.Graphics();
            this.axisLabelX = new PIXI.Text('x', settings);
            this.axisLabelZ = new PIXI.Text('z', settings);
            this.axisLabelX.resolution = this.getResolution();
            this.axisLabelZ.resolution = this.getResolution();
            this.axisLabelX.anchor.x = -0.8;
            this.axisLabelX.anchor.y = 0.56;
            this.axisLabelZ.anchor.x = 0.44;
            this.axisLabelZ.anchor.y = 1.2;

            this.displayObject.addChild(this.axisGraphics);
            this.displayObject.addChild(this.axisLabelX);
            this.displayObject.addChild(this.axisLabelZ);
            
            // Create state label
            this.stateLabel = new PIXI.Text('(n,l,m) = (1,0,0)', {
                font: '12px Helvetica Neue',
                fill: '#fff'
            });
            this.stateLabel.resolution = this.getResolution();
            this.stateLabel.anchor.x = 1;
            this.stateLabel.anchor.y = 1;

            this.displayObject.addChild(this.stateLabel);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            var bottomRightCornerX = this.mvt.modelToViewX(this.simulation.spaceRect.x + this.simulation.spaceRect.w);
            var bottomRightCornerY = this.mvt.modelToViewY(this.simulation.spaceRect.y + this.simulation.spaceRect.h);
            this.stateLabel.x = bottomRightCornerX - 10;
            this.stateLabel.y = bottomRightCornerY - 10;

            var upperLeftCornerX = this.mvt.modelToViewX(this.simulation.spaceRect.x);
            var upperLeftCornerY = this.mvt.modelToViewY(this.simulation.spaceRect.y);
            this.brightnessGridView.displayObject.x = upperLeftCornerX;
            this.brightnessGridView.displayObject.y = upperLeftCornerY;
            this.brightnessGridView.setWidth(bottomRightCornerX - upperLeftCornerX);
            this.brightnessGridView.setHeight(bottomRightCornerY - upperLeftCornerY);

            // Create proton
            if (this.protonSprite)
                this.displayObject.removeChild(this.protonSprite);

            this.protonSprite = ParticleGraphicsGenerator.generateProton(this.particleMVT);

            var atomPosition = this.getViewPosition();
            this.protonSprite.x = atomPosition.x;
            this.protonSprite.y = atomPosition.y;
            
            this.displayObject.addChild(this.protonSprite);

            // Update axis labels
            this.updateAxisLabel();
        },

        updateAxisLabel: function() {
            var margin = 16;
            var x = this.mvt.modelToViewX(this.simulation.spaceRect.x) + margin;
            var y = this.mvt.modelToViewY(this.simulation.spaceRect.y + this.simulation.spaceRect.h) - margin;
            var length = this.mvt.modelToViewDeltaX(this.simulation.spaceRect.w * 0.2);
            var headWidth = 10;
            var headLength = 10;
            var graphics = this.axisGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0xFFFFFF, 1);
            graphics.drawStickArrow(x, y, x, y - length, headWidth, headLength);
            graphics.drawStickArrow(x, y, x + length, y, headWidth, headLength);

            this.axisLabelX.x = x + length;
            this.axisLabelX.y = y;
            this.axisLabelZ.x = x;
            this.axisLabelZ.y = y - length;
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.simulation.updated()) {
                var n = this.getAtom().getElectronState();
                var l = this.getAtom().getSecondaryElectronState();
                var m = Math.abs(this.getAtom().getTertiaryElectronState());

                // Update the state label
                this.stateLabel.text = '(n,\u2113,m) = (' + n + ',' + l + ',' + m + ')';

                // Update the grid
                var brightness = _brightnessCache.getBrightness(n, l, m);
                this.brightnessGridView.setBrightness(brightness);
            }
        }

    }, Constants.SchroedingerModelView);


    return SchroedingerModelView;
});