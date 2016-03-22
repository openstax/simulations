define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var IsotopeSymbolGenerator    = require('views/isotope-symbol-generator');
    var NucleusView               = require('views/nucleus');

    var Constants = require('constants');
    var EXPLOSION_OUTLINE_COLOR = Colors.parseHex(Constants.ExplodingNucleusView.EXPLOSION_OUTLINE_COLOR);
    var EXPLOSION_FILL_COLOR    = Colors.parseHex(Constants.ExplodingNucleusView.EXPLOSION_FILL_COLOR);

    /**
     * 
     */
    var ExplodingNucleusView = NucleusView.extend({

        /**
         * Initializes the new ExplodingNucleusView.
         */
        initialize: function(options) {
            options = _.extend({
                showNucleus: true
            }, options);

            this.showNucleus = options.showNucleus;

            NucleusView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.explosionGraphics = new PIXI.Graphics();
            this.explosionGraphics.visible = false;
            this.displayObject.addChild(this.explosionGraphics);
            
            NucleusView.prototype.initGraphics.apply(this, arguments);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            NucleusView.prototype.updateMVT.apply(this, arguments);


        },

        updateSprite: function() {
            if (this.showNucleus)
                NucleusView.prototype.updateSprite.apply(this, arguments);
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
                var explosionGraphics = this.explosionGraphics;

                if (this._exploding) {
                    var progression = this._explosionTime / ExplodingNucleusView.EXPLOSION_TIME;
                    var alpha = (1 - progression) * ExplodingNucleusView.EXPLOSION_MAX_ALPHA;
                    var finalRadius = this.mvt.modelToViewDeltaX(this.model.get('diameter')) * ExplodingNucleusView.EXPLOSION_RADIUS_SCALE;
                    var radius = progression * finalRadius;
                    var ringWidth = ExplodingNucleusView.EXPLOSION_OUTLINE_WIDTH;
                    var ringRadius = (radius > ringWidth) ? radius - ringWidth : 1;

                    explosionGraphics.visible = true;
                    explosionGraphics.alpha = alpha;
                    explosionGraphics.clear();
                    explosionGraphics.beginFill(EXPLOSION_FILL_COLOR, 1);
                    explosionGraphics.drawCircle(0, 0, radius);
                    explosionGraphics.endFill();
                    explosionGraphics.lineStyle(ringWidth, EXPLOSION_OUTLINE_COLOR, 1);
                    explosionGraphics.drawCircle(0, 0, ringRadius);

                    this._explosionTime += deltaTime;
                    if (this._explosionTime >= ExplodingNucleusView.EXPLOSION_TIME)
                        this._exploding = false;
                }
                else {
                    explosionGraphics.visible = false;
                }    
            }
        },

        nucleusChanged: function(nucleus, byProducts) {
            NucleusView.prototype.nucleusChanged.apply(this, arguments);
            
            if (nucleus.hasDecayed()) {
                // Kick off the explosion graphic.
                this.explosionGraphics.clear();
                this._explosionTime = 0;
                this._exploding = true;
            }
            else {
                this.explosionGraphics.visible = false;
                this._exploding = false;
            }
        }

    }, Constants.ExplodingNucleusView);


    return ExplodingNucleusView;
});