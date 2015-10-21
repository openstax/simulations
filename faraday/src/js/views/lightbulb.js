define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var LightRaysView = require('views/light-rays');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var LightbulbView = PixiView.extend({

        /**
         * Initializes the new LightbulbView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.glassGlowScale = LightbulbView.DEFAULT_GLASS_GLOW_SCALE;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.bulb = Assets.createSprite(Assets.Images.LIGHTBULB_BULB);
            this.cap  = Assets.createSprite(Assets.Images.LIGHTBULB_CAP);
            this.base = Assets.createSprite(Assets.Images.LIGHTBULB_BASE);

            this.base.anchor.x = 0.5;
            this.base.anchor.y = 1;
            this.cap.anchor.x = 0.5;
            this.cap.anchor.y = 1;
            this.cap.y = -(this.base.texture.height - LightbulbView.DISTANCE_BULB_IS_SCREWED_INTO_BASE);
            this.bulb.anchor.x = 0.5;
            this.bulb.anchor.y = 1;
            this.bulb.y = -(this.base.texture.height + this.cap.texture.height - LightbulbView.DISTANCE_BULB_IS_SCREWED_INTO_BASE);

            this.lightRaysView = new LightRaysView({ mvt: this.mvt, bulbRadius: LightbulbView.BULB_RADIUS });
            this.lightRaysView.displayObject.y = -90;

            this.displayObject.addChild(this.bulb);
            this.displayObject.addChild(this.cap);
            this.displayObject.addChild(this.base);
            this.displayObject.addChild(this.lightRaysView.displayObject);

            this.updateMVT(this.mvt);
        },

        /**
         * Sets the scaling factor that determines how much the bulb glows.
         * Larger values will cause the bulb to reach it's maximum glow sooner.
         * 
         * @param scale
         */
        setGlassGlowScale: function(scale) {
            if (scale !== this.glassGlowScale) {
                this.glassGlowScale = scale;
                this.forceUpdate();
            }
        },
        
        /**
         * Gets the scaling factor that determines how much the bulb glows.
         * Larger values will cause the bulb to reach it's maximum glow sooner.
         * 
         * @return
         */
        getGlassGlowScale: function() {
            return this.glassGlowScale;
        },
        
        //----------------------------------------------------------------------------
        // SimpleObserver implementation
        //----------------------------------------------------------------------------

        forceUpdate: function() {
            this.previousIntensity = -1;
            this.update();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(LightbulbView.BULB_RADIUS * 2);
            var scale = targetWidth / this.bulb.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        /**
         * Synchronize the view with the model.
         */
        update: function() {
            this.displayObject.visible = this.model.get('enabled');
            
            if (this.displayObject.visible) {
                // Get the light intensity, a value in the range 0...+1.
                var intensity = this.model.getIntensity();
                if (intensity != this.previousIntensity) {
                    
                    this.lightRaysView.setIntensity(intensity);
                    
                    // Modulate alpha channel of the glass to make it appear to glow
                    var alpha = (LightbulbView.GLASS_MIN_ALPHA + (this.glassGlowScale * (1 - LightbulbView.GLASS_MIN_ALPHA) * intensity));
                    if (alpha > 1)
                        alpha = 1;
                    
                    this.bulb.alpha = alpha;
                    
                    this.previousIntensity = intensity;
                }
            }
        }

    }, Constants.LightbulbView);


    return LightbulbView;
});