define(function(require) {

    'use strict';

    var PIXI = require('pixi');

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
            this.brightnessGridView.setWidth(this.mvt.modelToViewDeltaX(bottomRightCornerX - upperLeftCornerX));
            this.brightnessGridView.setHeight(this.mvt.modelToViewDeltaY(bottomRightCornerY - upperLeftCornerY));

            // Create proton
            if (this.protonSprite)
                this.displayObject.removeChild(this.protonSprite);

            this.protonSprite = ParticleGraphicsGenerator.generateProton(this.particleMVT);

            var atomPosition = this.getViewPosition();
            this.protonSprite.x = atomPosition.x;
            this.protonSprite.y = atomPosition.y;
            
            this.displayObject.addChild(this.protonSprite);
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.simulation.updated()) {
                var n = this.getAtom().getElectronState();
                var l = this.getAtom().getSecondaryElectronState();
                var m = Math.abs(this.getAtom().getTertiaryElectronState());

                // Update the state label
                this.stateLabel.text = '(n,l,m) = (' + n + ',' + l + ',' + m + ')';

                // Update the grid
                var brightness = _brightnessCache.getBrightness(n, l, m);
                this.brightnessGridView.setBrightness(brightness);
            }
        }

    }, Constants.SchroedingerModelView);


    return SchroedingerModelView;
});