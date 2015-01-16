define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    var Vector2  = require('common/math/vector2');

    var EnergyChunk  = require('models/energy-chunk');
    var EnergySource = require('models/energy-source');
    var EnergyChunkCollection = require('models/energy-chunk-collection');
    var Cloud = require('models/cloud');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var Sun = EnergySource.extend({

        defaults: _.extend({}, EnergySource.prototype.defaults, {
            cloudiness: 0,
            solarPanel: null
        }),
        
        initialize: function(attributes, options) {
            EnergySource.prototype.initialize.apply(this, [attributes, options]);

            // Cached objects
            this._translation = new Vector2();

            // Energy chunk emission
            this.energyChunkEmissionCountdownTimer = Sun.ENERGY_CHUNK_EMISSION_PERIOD;
            this.currentSectorIndex = 0;
            this.sectorList = [];
            for (var i = 0; i < Sun.NUM_EMISSION_SECTORS; i++)
                this.sectorList.push(i);
            _.shuffle(this.sectorList);

            // Clouds
            this.energyChunksPassingThroughClouds = new EnergyChunkCollection();
            this.clouds = new Backbone.Collection([], { model: Cloud });
            this.addClouds();
            this.on('change:cloudiness', this.cloudinessChanged);
            this.cloudinessChanged(this, this.get('cloudiness'));

            // Position
            this.sunPosition = new Vector2(this.get('position')).add(Sun.OFFSET_TO_CENTER_OF_SUN);
            this.on('change:position', function(sun, position) {
                this.sunPosition.set(position).add(Sun.OFFSET_TO_CENTER_OF_SUN);

                // Move the clouds
                var translation = this._translation.set(position).sub(this.previous('position'));
                for (var i = 0; i < this.clouds.length; i++)
                    this.clouds.models[i].translate(translation);
            });

            // Cached things
            this._sunPosition = new Vector2();
            this._sunToChunk = new Vector2();
            this._reflectionAngle = new Vector2();
            this._velocity = new Vector2();
            this._initialPosition = new Vector2();
            this._initialVelocity = new Vector2();
            this._radialLine = new Vector2();
        },

        addClouds: function() {
            this.clouds.add(new Cloud({ relativePosition: new Vector2( 0.020, 0.1050) }, { parentPosition: this.get('position') }));
            this.clouds.add(new Cloud({ relativePosition: new Vector2( 0.017, 0.0875) }, { parentPosition: this.get('position') }));
            this.clouds.add(new Cloud({ relativePosition: new Vector2(-0.010, 0.0800) }, { parentPosition: this.get('position') }));
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            this.clearEnergyChunks();
            var preloadTime = 6; // In simulated seconds, empirically determined.
            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            this.energyChunkEmissionCountdownTimer = 0;

            // Simulate energy chunks moving through the system.
            while (preloadTime > 0) {
                this.energyChunkEmissionCountdownTimer -= deltaTime;
                if (this.energyChunkEmissionCountdownTimer <= 0) {
                    this.emitEnergyChunk();
                    this.energyChunkEmissionCountdownTimer += Sun.ENERGY_CHUNK_EMISSION_PERIOD;
                }
                this.updateEnergyChunks(0, deltaTime);
                preloadTime -= deltaTime;
            }

            // Remove any chunks that actually made it to the solar panel.
            this.outgoingEnergyChunks.reset();
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.LIGHT,
                amount: Constants.MAX_ENERGY_PRODUCTION_RATE * (1 - this.get('cloudiness'))
            };
        },

        update: function(time, deltaTime) {
            var energyProduced = 0;

            if (this.active()) {
                // See if it is time to emit a new energy chunk.
                this.energyChunkEmissionCountdownTimer -= deltaTime;
                if (this.energyChunkEmissionCountdownTimer <= 0) {

                    // Create a new chunk and start it on its way.
                    this.emitEnergyChunk();
                    this.energyChunkEmissionCountdownTimer += Sun.ENERGY_CHUNK_EMISSION_PERIOD;
                }

                // Move the energy chunks.
                this.updateEnergyChunks(time, deltaTime);

                // Calculate the amount of energy produced.
                energyProduced = Constants.MAX_ENERGY_PRODUCTION_RATE * (1 - this.get('cloudiness')) * deltaTime;
            }

            return { 
                type: EnergyTypes.LIGHT, 
                amount: energyProduced
            };
        },

        updateEnergyChunks: function(time, deltaTime) {
            var sunPosition = this._sunPosition.set(this.sunPosition);

            // Check for bouncing and absorption of the energy chunks.
            var chunk;
            for (var i = this.energyChunks.length - 1; i >= 0; i--) {
                chunk = this.energyChunks.models[i];

                if (this.get('solarPanel').active() && this.get('solarPanel').getAbsorptionShape().contains(chunk.get('position'))) {
                    // This energy chunk was absorbed by the solar panel, so
                    //   put it on the list of outgoing chunks.
                    this.outgoingEnergyChunks.add(chunk);
                }
                else if (chunk.get('position').distance(sunPosition) > Sun.MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN) {
                    // This energy chunk is out of visible range, so remove it.
                    this.energyChunks.remove(chunk);
                    this.energyChunksPassingThroughClouds.remove(chunk);
                    chunk.destroy();
                }
                else {
                    var cloud;
                    for (var j = this.clouds.length - 1; j >= 0; j--) {
                        cloud = this.clouds.models[j];

                        var angleFromSunToChunk = this._sunToChunk
                            .set(chunk.get('position'))
                            .sub(this.sunPosition)
                            .angle();

                        if (cloud.getShape().contains(chunk.get('position')) && 
                            !this.energyChunksPassingThroughClouds.get(chunk) &&
                            Math.abs(chunk.get('velocity').angle() - angleFromSunToChunk < Math.PI / 10)
                        ) {
                            // Decide whether this energy chunk should pass
                            //   through the clouds or be reflected.
                            if (Math.random() < cloud.get('existenceStrength')) {
                                // Reflect the energy chunk.  It looks a little
                                //   weird if they go back to the sun, so the
                                //   code below tries to avoid that.
                                var angleTowardsSun = chunk.get('velocity').angle() + Math.PI;
                                var reflectionAngle = this._reflectionAngle
                                    .set(chunk.get('position'))
                                    .sub(cloud.get('position'))
                                    .angle();

                                var angle;
                                if (reflectionAngle < angleTowardsSun)
                                    angle = 0.7 * Math.PI + Math.random() * Math.PI / 8;
                                else
                                    angle = -0.7 * Math.PI - Math.random() * Math.PI / 8;

                                var velocity = this._velocity.set(chunk.get('velocity')).rotate(angle);
                                chunk.setVelocity(velocity);
                            }
                            else {
                                // Let is pass through the cloud.
                                this.energyChunksPassingThroughClouds.add(chunk);
                            }
                        }
                    }
                }
            }

            // Move all the energy chunks away from the sun (or wherever)
            for (i = this.energyChunks.length - 1; i >= 0; i--)
                this.energyChunks.models[i].translateBasedOnVelocity(deltaTime);
        },

        emitEnergyChunk: function() {
            var directionAngle = this.chooseNextEmissionAngle();
            var initialPosition = this._initialPosition
                .set(this.sunPosition)
                .add(
                    this._radialLine
                        .set(Sun.RADIUS / 2, 0)
                        .rotate(directionAngle)
                );
            var initialVelocity = this._initialVelocity
                .set(Constants.ENERGY_CHUNK_VELOCITY, 0)
                .angle(directionAngle);

            var chunk = new EnergyChunk({
                energyType: EnergyTypes.LIGHT,
                position: initialPosition,
                velocity: initialVelocity
            });

            this.energyChunks.add(chunk);
        },

        /** 
         * Choose the angle for the emission of an energy chunk from the sun.
         *   This uses history and probability to make the distribution somewhat
         *   even but still random looking.
         */
        chooseNextEmissionAngle: function() {
            var sector = this.sectorList[this.currentSectorIndex];
            this.currentSectorIndex++;
            if (this.currentSectorIndex >= Sun.NUM_EMISSION_SECTORS)
                this.currentSectorIndex = 0;

            // Angle is a function of the selected sector and a random offset
            //   within the sector.
            return sector * Sun.EMISSION_SECTOR_SPAN + (Math.random() * Sun.EMISSION_SECTOR_SPAN) + Sun.EMISSION_SECTOR_OFFSET;
        },

        activate: function() {
            EnergySource.prototype.activate.apply(this);

            // Pre-populate the space around the sun with energy chunks.  The
            //   number of iterations is chosen carefully such that there chunks
            //   that are close, but not quite reaching, the solar panel.
            for (var i = 0; i < 100; i++)
                this.update(0, Constants.SIM_TIME_PER_TICK_NORMAL);
        },

        deactivate: function() {
            EnergySource.prototype.deactivate.apply(this);

            this.set('cloudiness', 0);
        },

        cloudinessChanged: function(sun, cloudiness) {
            for (var i = 0; i < this.clouds.length; i++) {
                // Stagger the existence strength of the clouds.
                var existenceStrength = cloudiness * this.clouds.length - i;
                this.clouds.at(i).set('existenceStrength', Math.min(1, Math.max(0, existenceStrength)));
            }
        }

    }, Constants.Sun);

    return Sun;
});
