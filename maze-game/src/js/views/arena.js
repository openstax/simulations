define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var range     = require('common/math/range');

    var Level = require('models/level');
    var ParticleView = require('views/particle');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * Draws the level and the player particle
     */
    var ArenaView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.sceneWidth = options.sceneWidth;
            this.sceneHeight = options.sceneHeight;

            this.initGraphics();

            this.listenTo(this.model, 'change:level', this.drawLevel);
            this.listenTo(this.model, 'change:collisions', this.collisionsChanged);
            this.listenTo(this.model, 'change:won', this.winStateChanged);
        },

        initGraphics: function() {
            // Create layers
            this.floor   = new PIXI.Container();
            this.shadows = new PIXI.Container();
            this.walls   = new PIXI.Container();
            this.lowerEffects = new PIXI.Container();
            this.upperEffects = new PIXI.Container();

            // Add layers
            this.displayObject.addChild(this.floor);
            this.displayObject.addChild(this.shadows);
            this.displayObject.addChild(this.walls);
            this.displayObject.addChild(this.lowerEffects);

            this.initParticleView();

            this.displayObject.addChild(this.upperEffects);

            this.updateMVT(this.mvt);

            this.startFinishPulse();
        },

        initParticleView: function() {
            this.particleView = new ParticleView({
                model: this.model.particle,
                mvt: this.mvt
            });

            this.displayObject.addChild(this.particleView.displayObject);
        },

        drawLevel: function() {
            // Clear the layer caches
            this.floor.cacheAsBitmap   = false;
            this.shadows.cacheAsBitmap = false;
            this.walls.cacheAsBitmap   = false;

            this.drawFloor();
            this.drawEffects();
            this.drawWalls();

            // Cache each layer because they don't change
            this.floor.cacheAsBitmap   = true;
            this.shadows.cacheAsBitmap = true;
            this.walls.cacheAsBitmap   = true;
        },

        drawFloor: function() {
            this.floor.removeChildren();

            // Draw tiles out to the edges of the scene as a base layer
            var xStartTile = Math.floor(this.mvt.viewToModelX(0) / Constants.TILE_SIZE);
            var yStartTile = Math.floor(this.mvt.viewToModelY(0) / Constants.TILE_SIZE);
            var xEndTile = Math.ceil(this.mvt.viewToModelX(this.sceneWidth)  / Constants.TILE_SIZE);
            var yEndTile = Math.ceil(this.mvt.viewToModelY(this.sceneHeight) / Constants.TILE_SIZE);

            var tileSprite;
            for (var x = xStartTile; x < xEndTile; x++) {
                for (var y = yStartTile; y < yEndTile; y++) {
                    tileSprite = Assets.createSprite(Assets.Images.FLOOR);
                    tileSprite.x = this.mvt.modelToViewX(x * Constants.TILE_SIZE);
                    tileSprite.y = this.mvt.modelToViewY(y * Constants.TILE_SIZE);
                    tileSprite.scale.x = this.tileScale;
                    tileSprite.scale.y = this.tileScale;
                    this.floor.addChild(tileSprite);
                }
            }

            // Create the FINISH tile
            var level = this.model.get('level');
            var finish = level.finishPosition();
            var finishTile = Assets.createSprite(Assets.Images.FINISH);
            finishTile.x = this.mvt.modelToViewX(level.colToX(finish.col));
            finishTile.y = this.mvt.modelToViewY(level.rowToY(finish.row));
            finishTile.scale.x = this.tileScale;
            finishTile.scale.y = this.tileScale;
            this.floor.addChild(finishTile);
            this.finishTile = finishTile;
        },

        drawEffects: function() {
            this.lowerEffects.removeChildren();
            this.upperEffects.removeChildren();

            // Create the closed FINISH tile to draw over the other one
            var finishClosedTile = Assets.createSprite(Assets.Images.FINISH_CLOSED);
            finishClosedTile.x = this.finishTile.x;
            finishClosedTile.y = this.finishTile.y;
            finishClosedTile.scale.x = this.tileScale;
            finishClosedTile.scale.y = this.tileScale;
            finishClosedTile.visible = false;
            this.lowerEffects.addChild(finishClosedTile);
            this.finishClosedTile = finishClosedTile;

            var finishWinTile = Assets.createSprite(Assets.Images.FINISH_WIN);
            finishWinTile.x = this.finishTile.x;
            finishWinTile.y = this.finishTile.y;
            finishWinTile.scale.x = this.tileScale;
            finishWinTile.scale.y = this.tileScale;
            finishWinTile.visible = false;
            this.lowerEffects.addChild(finishWinTile);
            this.finishWinTile = finishWinTile;

            // Create pulsing ring around the finish to get the player's attention
            this.finishPulse = this.createPulseSprite(this.finishTile.x, this.finishTile.y, Assets.Images.FINISH_PULSE);
            this.pulseIntervalCounter = 0;
            this.pulseDurationCounter = null;
            this.pulseScaleRange = range({ min: this.tileScale * 0.2, max: this.tileScale });

            // Create a pulsing ring for when the player wins
            this.finishWinPulse = this.createPulseSprite(this.finishTile.x, this.finishTile.y, Assets.Images.FINISH_WIN_PULSE);;
            this.winPulseDurationCounter = null;
        },

        createPulseSprite: function(tileX, tileY, imageRef) {
            var pulse = Assets.createSprite(imageRef);
            pulse.x = tileX + this.tileSize / 2;
            pulse.y = tileY + this.tileSize / 2;
            pulse.scale.x = this.tileScale;
            pulse.scale.y = this.tileScale;
            pulse.anchor.x = 0.5;
            pulse.anchor.y = 0.5;
            pulse.alpha = 0;
            //pulse.visible = false;
            this.lowerEffects.addChild(pulse);

            return pulse;
        },

        drawWalls: function() {
            this.shadows.removeChildren();
            this.walls.removeChildren();

            var level = this.model.get('level');
            var data = level.data;

            var x, y;
            var wallSprite;
            var shadowSprite;

            for (var r = 0; r < data.length; r++) {
                for (var c = 0; c < data[r].length; c++) {
                    if (data[r][c] === Level.TILE_WALL) {
                        x = this.mvt.modelToViewX(level.colToX(c));
                        y = this.mvt.modelToViewY(level.rowToY(r));

                        // Create wall
                        wallSprite = Assets.createSprite(Assets.Images.WALL);
                        wallSprite.x = x;
                        wallSprite.y = y;
                        wallSprite.scale.x = this.tileScale;
                        wallSprite.scale.y = this.tileScale;
                        this.walls.addChild(wallSprite);

                        // Create wall shadow
                        shadowSprite = Assets.createSprite(Assets.Images.WALL_SHADOW);
                        shadowSprite.x = x;
                        shadowSprite.y = y;
                        shadowSprite.anchor.x = 0.25;
                        shadowSprite.anchor.y = 0.25;
                        shadowSprite.scale.x = this.tileScale;
                        shadowSprite.scale.y = this.tileScale;
                        this.shadows.addChild(shadowSprite);
                    }
                }
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.tileSize = this.mvt.modelToViewDeltaX(Constants.TILE_SIZE);
            this.tileScale = this.tileSize / Assets.Texture(Assets.Images.FLOOR).width;

            this.drawLevel();
        },

        update: function(time, deltaTime, paused) {
            this.particleView.update(time, deltaTime, paused);

            this.pulseIntervalCounter += deltaTime;
            this.winPulseIntervalCounter += deltaTime;

            if (this.pulseIntervalCounter > Constants.PULSE_INTERVAL) {
                this.pulseIntervalCounter -= Constants.PULSE_INTERVAL;
                this.startFinishPulse();
            }

            this.animateFinishPulse(deltaTime);
            this.animateFinishWinPulse(deltaTime);
        },

        startFinishPulse: function() {
            this.pulseDurationCounter = 0;
            this.pulseScaleRange.min = this.tileScale * 0.5;
            this.pulseScaleRange.max = this.tileScale * 1.8;
            this.finishPulse.alpha = 1;
        },

        startFinishWinPulse: function() {
            this.winPulseDurationCounter = 0;
            this.pulseScaleRange.min = this.tileScale * 0.5;
            this.pulseScaleRange.max = this.tileScale * 1.8;
            this.finishWinPulse.alpha = 1;
        },

        animateFinishPulse: function(deltaTime) {
            if (this.pulseDurationCounter !== null) {
                var percent = this.pulseDurationCounter / Constants.PULSE_DURATION;
                var scale = this.pulseScaleRange.lerp(percent);
                this.finishPulse.scale.x = scale;
                this.finishPulse.scale.y = scale;
                this.finishPulse.alpha = 1 - percent;

                this.pulseDurationCounter += deltaTime;
                if (this.pulseDurationCounter > Constants.PULSE_DURATION)
                    this.pulseDurationCounter = null;
            }
            else
                this.finishPulse.alpha = 0;
        },

        animateFinishWinPulse: function(deltaTime) {
            if (this.winPulseDurationCounter !== null) {
                var percent = this.winPulseDurationCounter / Constants.PULSE_DURATION;
                var scale = this.pulseScaleRange.lerp(percent);
                this.finishWinPulse.scale.x = scale;
                this.finishWinPulse.scale.y = scale;
                this.finishWinPulse.alpha = 1 - percent;

                this.winPulseDurationCounter += deltaTime;
                if (this.winPulseDurationCounter > Constants.PULSE_DURATION)
                    this.winPulseDurationCounter = null;
            }
            else
                this.finishWinPulse.alpha = 0;
        },

        collisionsChanged: function(simulation, collisions) {
            if (collisions)
                this.finishClosedTile.visible = true;
            else
                this.finishClosedTile.visible = false;

            this.changeFinishPulseVisibility();
        },

        winStateChanged: function(simulation, won) {
            if (won) {
                this.finishWinTile.visible = true;
                this.startFinishWinPulse();
            }
            else 
                this.finishWinTile.visible = false;

            this.changeFinishPulseVisibility();
        },

        changeFinishPulseVisibility: function() {
            if (this.model.get('won') || this.model.get('collisions'))
                this.finishPulse.visible = false;
            else
                this.finishPulse.visible = true;
        }

    });

    return ArenaView;
});