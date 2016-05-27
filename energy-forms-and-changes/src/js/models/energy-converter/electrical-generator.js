define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('common/math/vector2');

    var EnergyConverter       = require('models/energy-converter');
    var EnergyChunkCollection = require('models/energy-chunk-collection');
    var EnergyChunkPathMover  = require('models/energy-chunk-path-mover');
    var EnergyChunk           = require('models/energy-chunk');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;



    var ElectricalGenerator = EnergyConverter.extend({

        defaults: _.extend({}, EnergyConverter.prototype.defaults, {
            wheelRotationalAngle:    0, // In radians

            // Flag that controls "direct coupling mode", which means that the
            //   generator wheel turns at a rate that is directly proportionate to the
            //   incoming energy, with no rotational inertia.
            directCouplingMode: false,
        }),
        
        initialize: function(attributes, options) {
            EnergyConverter.prototype.initialize.apply(this, [attributes, options]);

            this.wheelRotationalVelocity = 0; // In radians

            this.electricalEnergyChunks = new EnergyChunkCollection();
            this.hiddenEnergyChunks = new EnergyChunkCollection();

            this.energyChunkMovers = [];

            this._initialChunkPosition = new Vector2();
        },

        update: function(time, deltaTime, incomingEnergy) {
            if (this.active()) {
                // Rotate the wheel based on incoming energy
                this.updateWheelRotation(deltaTime, incomingEnergy);

                // Handle any incoming energy chunks
                this.handleIncomingEnergyChunks();

                // Move the energy chunks and update their state.
                this.updateEnergyChunks(deltaTime);
            }

            return {
                type: EnergyTypes.ELECTRICAL,
                amount: Math.abs((this.wheelRotationalVelocity / ElectricalGenerator.MAX_ROTATIONAL_VELOCITY) * Constants.MAX_ENERGY_PRODUCTION_RATE) * deltaTime
            };
        },

        updateWheelRotation: function(deltaTime, incomingEnergy) {
            // Convention is positive is counter clockwise.
            var incomingEnergyDirectionSign = Math.sin(incomingEnergy.direction) > 0 ? -1 : 1; 

            // Handle different wheel rotation modes
            if (this.get('directCouplingMode')) {
                // Treat the wheel as though it is directly coupled to the
                //   energy source, e.g. through a belt or drive shaft.
                if (incomingEnergy.type === EnergyTypes.MECHANICAL) {
                    this.wheelRotationalVelocity = (incomingEnergy.amount / deltaTime) / Constants.MAX_ENERGY_PRODUCTION_RATE * ElectricalGenerator.MAX_ROTATIONAL_VELOCITY * incomingEnergyDirectionSign; 
                    this.set('wheelRotationalAngle', this.get('wheelRotationalAngle') + this.wheelRotationalVelocity * deltaTime);
                }
            }
            else {
                // Treat the wheel like it is being moved from an external
                //   energy, such as water, and has inertia.
                var torqueFromIncomingEnergy = 0;
                if (incomingEnergy.type === EnergyTypes.MECHANICAL) {
                    var energyToTorqueConstant = 0.5; // Empirically determined to reach max energy after a second or two.
                    torqueFromIncomingEnergy = incomingEnergy.amount * ElectricalGenerator.WHEEL_RADIUS * energyToTorqueConstant * incomingEnergyDirectionSign;
                }
                var torqueFromResistance = -this.wheelRotationalVelocity * ElectricalGenerator.RESISTANCE_CONSTANT;
                var angularAcceleration = (torqueFromIncomingEnergy + torqueFromResistance) / ElectricalGenerator.WHEEL_MOMENT_OF_INERTIA;

                this.wheelRotationalVelocity += angularAcceleration * deltaTime;
                this.wheelRotationalVelocity = Math.min(ElectricalGenerator.MAX_ROTATIONAL_VELOCITY, Math.max(-ElectricalGenerator.MAX_ROTATIONAL_VELOCITY, this.wheelRotationalVelocity));
                
                if (Math.abs(this.wheelRotationalVelocity) < 1E-3) {
                    // Prevent the wheel from moving forever.
                    this.wheelRotationalVelocity = 0;
                }
                this.set('wheelRotationalAngle', this.get('wheelRotationalAngle') + this.wheelRotationalVelocity * deltaTime);
            }
        },

        updateEnergyChunks: function(deltaTime) {
            var energyChunkMover;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                energyChunkMover = this.energyChunkMovers[i];
                energyChunkMover.moveAlongPath(deltaTime);
                if (energyChunkMover.finished()) {
                    var chunk = energyChunkMover.energyChunk;
                    switch (chunk.get('energyType')) {
                        case EnergyTypes.MECHANICAL:
                            // This mechanical energy chunk has traveled to the
                            //   end of its path, so change it to electrical and
                            //   send it on its way.  Also add a "hidden" chunk
                            //   so that the movement through the generator can
                            //   be seen by the user.
                            this.energyChunks.remove(chunk);
                            this.energyChunkMovers.splice(i, 1);
                            chunk.set('energyType', EnergyTypes.ELECTRICAL);
                            this.electricalEnergyChunks.add(chunk);
                            this.energyChunkMovers.push(new EnergyChunkPathMover(
                                chunk,
                                this.createElectricalEnergyChunkPath(this.get('position')),
                                Constants.ENERGY_CHUNK_VELOCITY
                            ));

                            var hiddenChunk = EnergyChunk.create({
                                energyType: EnergyTypes.HIDDEN,
                                position: chunk.get('position')
                            });
                            hiddenChunk.set('zPosition', -Constants.EnergyChunkCollectionView.Z_DISTANCE_WHERE_FULLY_FADED / 2);
                            this.hiddenEnergyChunks.add(hiddenChunk);
                            this.energyChunkMovers.push(new EnergyChunkPathMover(
                                hiddenChunk,
                                this.createHiddenEnergyChunkPath(this.get('position')),
                                Constants.ENERGY_CHUNK_VELOCITY
                            ));
                            break;
                        case EnergyTypes.ELECTRICAL: 
                            // This electrical energy chunk has traveled to the
                            //   end of its path, so transfer it to the next
                            //   energy system.
                            this.energyChunkMovers.splice(i, 1);
                            this.outgoingEnergyChunks.add(chunk);
                            break;
                        case EnergyTypes.HIDDEN:
                            // This hidden energy chunk has traveled to the end
                            //   of its path, so just remove it, because the
                            //   electrical energy chunk to which is corresponds
                            //   should now be visible to the user.
                            this.hiddenEnergyChunks.remove(chunk);
                            this.energyChunkMovers.splice(i, 1);
                            break;
                    }
                }
            }
        },

        handleIncomingEnergyChunks: function() {
            var chunk;
            for (var i = this.incomingEnergyChunks.length - 1; i >= 0; i--) {
                chunk = this.incomingEnergyChunks.models[i];
                if (chunk.get('energyType') === EnergyTypes.MECHANICAL) {
                    this.energyChunks.add(chunk);
                    this.incomingEnergyChunks.remove(chunk);

                    // And a "mover" that will move this energy chunk to
                    //   the center of the wheel.
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        chunk,
                        this.createMechanicalEnergyChunkPath(this.get('position')),
                        Constants.ENERGY_CHUNK_VELOCITY
                    ));
                }
                else {
                    // By design, this shouldn't happen, so warn if it does.
                    console.error('ElectricalGenerator - Warning: Ignoring energy chunk with unexpected type, type = ' + chunk.get('energyType'));
                }
            }
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            this.clearEnergyChunks();
            if (incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyTypes.MECHANICAL) {
                // No energy chunk pre-loading needed
                return;
            }

            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            var energySinceLastChunk = Constants.ENERGY_PER_CHUNK * 0.99;

            // Simulate energy chunks moving through the system
            var preloadingComplete = false;
            while (!preloadingComplete) {
                energySinceLastChunk += incomingEnergyRate.amount * deltaTime;

                // Determine if time to add a new chunk
                if (energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    var initialPosition = this._initialChunkPosition
                        .set(this.get('position'))
                        .add(ElectricalGenerator.LEFT_SIDE_OF_WHEEL_OFFSET);

                    var newChunk = EnergyChunk.create({
                        energyType: EnergyTypes.MECHANICAL,
                        position: initialPosition
                    });

                    // Add a 'mover' for this energy chunk
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        newChunk,
                        this.createMechanicalEnergyChunkPath(this.get('position')),
                        Constants.ENERGY_CHUNK_VELOCITY
                    ));

                    // Update energy since last chunk
                    energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
                }

                this.updateEnergyChunks(deltaTime);

                if (this.outgoingEnergyChunks.length > 0) {
                    // An energy chunk has made it all the way through the system
                    preloadingComplete = true;
                }
            }
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.ELECTRICAL,
                amount: Math.abs(this.wheelRotationalVelocity / ElectricalGenerator.MAX_ROTATIONAL_VELOCITY * Constants.MAX_ENERGY_PRODUCTION_RATE)
            };
        },

        extractOutgoingEnergyChunks: function() {
            var models = this.outgoingEnergyChunks.slice(0, this.outgoingEnergyChunks.length);
            // Remove the models
            this.outgoingEnergyChunks.remove(models);
            this.electricalEnergyChunks.remove(models);
            return models;
        },

        clearEnergyChunks: function() {
            EnergyConverter.prototype.clearEnergyChunks.apply(this);

            this.electricalEnergyChunks.reset();
            this.hiddenEnergyChunks.reset();

            // Destroy the models
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--)
                this.energyChunkMovers[i].energyChunk.destroy();
            this.energyChunkMovers = [];
        },

        createMechanicalEnergyChunkPath: function(panelPosition) {
            return [
                panelPosition.clone().add(ElectricalGenerator.WHEEL_CENTER_OFFSET)
            ];
        },

        createElectricalEnergyChunkPath: function(panelPosition) {
            return [
                panelPosition.clone().add(ElectricalGenerator.START_OF_WIRE_CURVE_OFFSET),
                panelPosition.clone().add(ElectricalGenerator.WIRE_CURVE_POINT_1_OFFSET),
                panelPosition.clone().add(ElectricalGenerator.WIRE_CURVE_POINT_2_OFFSET),
                panelPosition.clone().add(ElectricalGenerator.CENTER_OF_CONNECTOR_OFFSET)
            ];
        },

        createHiddenEnergyChunkPath: function(panelPosition) {
            return [
                // Overlaps with the electrical chunks until it reaches the window, then is done.
                panelPosition.clone().add(ElectricalGenerator.START_OF_WIRE_CURVE_OFFSET),
                panelPosition.clone().add(ElectricalGenerator.WIRE_CURVE_POINT_1_OFFSET)
            ];
        },

    }, Constants.ElectricalGenerator);

    return ElectricalGenerator;
});
