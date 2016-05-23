define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Backbone  = require('backbone');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
                    require('common/math/polyfills');

    var Air                         = require('models/air');
    var IntroElement                = require('models/intro-element');
    var EnergyChunk                 = require('models/energy-chunk');
    var EnergyChunkCollection       = require('models/energy-chunk-collection');
    var EnergyChunkWanderController = require('models/energy-chunk-wander-controller');
    var HorizontalSurface           = require('models/horizontal-surface');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var Burner = IntroElement.extend({

        defaults: _.extend({}, IntroElement.prototype.defaults, {
            position: null,
            heatCoolLevel: 0
        }),

        initialize: function(attributes, options) {
            // Internal object caches
            this._outlineRect  = new Rectangle();
            this._flameIceRect = new Rectangle();

            // Create vectors
            this._energyChunkStartEndPoint = new Vector2();
            this._centerPoint = new Vector2();

            // Energy chunks
            this.energyChunkList = new EnergyChunkCollection();
            this.energyChunkWanderControllers = [];

            // Create and add the top surface.  Some compensation for perspective
            //   is necessary in order to avoid problems with edge overlap when
            //   dropping objects on top of burner.
            var perspectiveCompensation = this.getOutlineRect().h * Burner.EDGE_TO_HEIGHT_RATIO * Math.cos(Burner.PERSPECTIVE_ANGLE);
            this.topSurface = new HorizontalSurface(
                this.getOutlineRect().left() - perspectiveCompensation, 
                this.getOutlineRect().right() + perspectiveCompensation, 
                this.getOutlineRect().top(),
                this
            );

            // Track energy transferred to anything sitting on the burner.
            this.energyExchangedWithObjectSinceLastChunkTransfer = 0;

            // Track build up of energy for transferring chunks to/from the air.
            this.energyExchangedWithAirSinceLastChunkTransfer = 0;

            this.on('change:heatCoolLevel', function(model, heatCoolLevel) {
                if (heatCoolLevel === 0 || (Math.sign(this.previous('heatCoolLevel')) !== Math.sign(heatCoolLevel))) {
                    // If the burner has been turned off or switched modes,
                    //   clear accumulated heat/cool amount.
                    this.energyExchangedWithAirSinceLastChunkTransfer = 0;
                }
            });
        },

        reset: function() {
            IntroElement.prototype.reset.apply(this);

            this.energyChunkList.reset();
            this.energyChunkWanderControllers = [];
            this.energyExchangedWithAirSinceLastChunkTransfer = 0;
            this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
            this.heatCoolLevel = 0;
        },

        update: function(time, deltaTime) {
            // Animate energy chunks.
            var controller;
            for (var i = this.energyChunkWanderControllers.length - 1; i >= 0; i--) {
                controller = this.energyChunkWanderControllers[i];
                controller.updatePosition(deltaTime);

                // Remove controllers that have finished their animation
                if (controller.destinationReached()) {
                    this.energyChunkList.remove(controller.energyChunk);
                    this.energyChunkWanderControllers.splice(i, 1);
                    controller.energyChunk.destroy();
                }
            }
        },

        /**
         * Get a rectangle that defines the outline of the burner.  In the model,
         * the burner is essentially a 2D rectangle.
         *
         * @return Rectangle that defines the outline in model space.
         */
        getOutlineRect: function() {
            return this._outlineRect.set(
                this.get('position').x - Burner.WIDTH / 2,
                this.get('position').y,
                Burner.WIDTH,
                Burner.HEIGHT
            );
        },

        getRawOutlineRect: function() {
            return this._outlineRect.set(
                0 - Burner.WIDTH / 2,
                0,
                Burner.WIDTH,
                Burner.HEIGHT
            );
        },

        getTopSurface: function() {
            return this.topSurface;
        },

        /**
         * Interact with a thermal energy container, adding or removing energy
         * based on the current heat/cool setting.
         *
         * @param thermalEnergyContainer Model object that will get or give energy.
         * @param deltaTime              Amount of time (delta time).
         */
        addOrRemoveEnergyToFromObject: function(thermalEnergyContainer, deltaTime) {
            if (thermalEnergyContainer instanceof Air)
                return;

            if (this.inContactWith(thermalEnergyContainer)) {
                var deltaEnergy = 0;
                if (thermalEnergyContainer.getTemperature() > Constants.FREEZING_POINT_TEMPERATURE)
                    deltaEnergy = Burner.MAX_ENERGY_GENERATION_RATE * this.get('heatCoolLevel') * deltaTime;
                thermalEnergyContainer.changeEnergy(deltaEnergy);
                this.energyExchangedWithObjectSinceLastChunkTransfer += deltaEnergy;
            }
        },

        addOrRemoveEnergyToFromAir: function(air, deltaTime) {
            var deltaEnergy = Burner.MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.get('heatCoolLevel') * deltaTime;
            air.changeEnergy(deltaEnergy);
            this.energyExchangedWithAirSinceLastChunkTransfer += deltaEnergy;
        },

        inContactWith: function(thermalEnergyContainer) {
            var containerThermalArea = thermalEnergyContainer.getThermalContactArea().getBounds();
            return (
                containerThermalArea.center().x > this.getOutlineRect().left()  &&
                containerThermalArea.center().x < this.getOutlineRect().right() &&
                Math.abs(containerThermalArea.bottom() - this.getOutlineRect().top()) < Burner.CONTACT_DISTANCE
            );
        },

        addEnergyChunk: function(chunk) {
            chunk.set('zPosition', 0);
            this.energyChunkList.add(chunk);
            console.log('start: (' + chunk.get('position').x.toFixed(3) + ',' + chunk.get('position').y.toFixed(3) + ') end: (' + this.getEnergyChunkStartEndPoint().x.toFixed(3) + ',' + this.getEnergyChunkStartEndPoint().y.toFixed(3) + ')');
            this.energyChunkWanderControllers.push(new EnergyChunkWanderController(chunk, this.getEnergyChunkStartEndPoint()));
            this.energyExchangedWithAirSinceLastChunkTransfer = 0;
            this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
        },

        getEnergyChunkStartEndPoint: function() {
            return this._energyChunkStartEndPoint.set(this.getCenterPoint().x, this.getCenterPoint().y);
        },

        /**
         * Request an energy chunk from the burner.
         *
         * @param point Point from which to search for closest chunk.
         * @return Closest energy chunk, null if none are contained.
         */
        extractClosestEnergyChunk: function(point) {
            var closestChunk = null;
            if (this.energyChunkList.length) {
                this.energyChunkList.each(function(chunk) {
                    if (chunk.get('position').distance(this.get('position')) > Burner.ENERGY_CHUNK_CAPTURE_DISTANCE && (
                            closestChunk === null || 
                            chunk.get('position').distance(point) < closestChunk.get('position').distance(point) 
                        )
                    ) {
                        // Found a closer chunk.
                        closestChunk = chunk;
                    }
                }, this);

                this.energyChunkList.remove(closestChunk);

                for (var i = 0; i < this.energyChunkWanderControllers.length; i++) {
                    if (this.energyChunkWanderControllers[i].energyChunk === closestChunk) {
                        this.energyChunkWanderControllers.splice(i, 1);
                        break;
                    }
                }
            }

            if (closestChunk === null && this.get('heatCoolLevel') > 0) {
                // Create an energy chunk.
                closestChunk = EnergyChunk.create({
                    energyType: EnergyChunk.THERMAL, 
                    position:   new Vector2(this.getEnergyChunkStartEndPoint())
                });
            }

            if (closestChunk) {
                this.energyExchangedWithAirSinceLastChunkTransfer = 0;
                this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
            }
            else {
                console.error('Burner - Warning: Request for energy chunk from burner when not in heat mode and no chunks contained, returning null.');
            }

            return closestChunk;
        },

        getCenterPoint: function() {
            return this._centerPoint.set(
                this.get('position').x,
                this.get('position').y + Burner.HEIGHT / 2
            );
        },

        areAnyOnTop: function(thermalEnergyContainers) {
            for (var i = 0; i < thermalEnergyContainers.length; i++) {
                if (this.inContactWith(thermalEnergyContainers[i]))
                    return true;
            }
            return false;
        },

        getEnergyChunkCountForAir: function() {
            var count = 0;
            // If there are approaching chunks, and the mode has switched to off or
            //   to heating, the chunks should go back to the air (if they're not
            //   almost to the burner).
            if (this.energyChunkList.length && this.get('heatCoolLevel') >= 0) {
                this.energyChunkList.each(function(chunk) {
                    if (this.get('position').distance(chunk.get('position')) > Burner.ENERGY_CHUNK_CAPTURE_DISTANCE)
                        count++;
                }, this);
            }
            if (count === 0) {
                // See whether the energy exchanged with the air since the last
                //   chunk transfer warrants another chunk.
                count = Math.round(this.energyExchangedWithAirSinceLastChunkTransfer / Constants.ENERGY_PER_CHUNK);
            }
            return count;
        },

        getFlameIceRect: function() {
            // This is the area where the flame and ice appear in the view.  Must
            //   be coordinated with the view.
            var outlineRect = this.getOutlineRect();
            var center = outlineRect.center();
            return this._flameIceRect.set(
                center.x - outlineRect.w / 4,
                center.y,
                outlineRect.w / 2,
                outlineRect.h / 2
            );
        },

        getTemperature: function() {
            // The multiplier is empirically determined for desired behavior. The
            //   low value is limited to the freezing point of water.
            return Math.max(Constants.ROOM_TEMPERATURE + this.get('heatCoolLevel') * 100, Constants.FREEZING_POINT_TEMPERATURE);
        },

        /**
         * Get the number of excess of deficit energy chunks for interaction with
         *   thermal objects (as opposed to air).
         *
         * @return Number of energy chunks that could be supplied or consumed.
         *         Negative value indicates that chunks should come in.
         */
        getEnergyChunkBalanceWithObjects: function() {
            var numChunks = Math.abs(this.energyExchangedWithObjectSinceLastChunkTransfer) / Constants.ENERGY_PER_CHUNK;
            return Math.floor(numChunks) * Math.sign(this.energyExchangedWithObjectSinceLastChunkTransfer);
        },

        canSupplyEnergyChunk: function() {
            return this.get('heatCoolLevel') > 0;
        },

        canAcceptEnergyChunk: function() {
            return this.get('heatCoolLevel') < 0;
        }

    }, Constants.Burner);

    return Burner;
});
