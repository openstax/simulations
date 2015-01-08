define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var EnergyConverter       = require('models/energy-converter');
    var EnergyChunkCollection = require('models/energy-chunk-collection');
    var EnergyChunkPathMover  = require('models/energy-chunk-path-mover');
    var EnergyChunk           = require('models/energy-chunk');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;



    var SolarPanel = EnergyConverter.extend({
        
        initialize: function(attributes, options) {
            EnergyConverter.prototype.initialize.apply(this, [attributes, options]);

            this.latestChunkArrivalTime = 0; // Used to prevent clumping of chunks.
            this.energyOutputRate = 0;

            this.energyChunkMovers = [];

            this._initialChunkPosition = new Vector2();
            this._convergencePoint = new Vector2();
            this._lowerLeft = new Vector2();
            this._upperRight = new Vector2();
        },

        update: function(time, deltaTime, incomingEnergy) {
            if (this.active()) {
                // Handle any incoming energy chunks
                this.handleIncomingEnergyChunks(time);

                // Move the energy chunks and update their state.
                this.updateEnergyChunks(deltaTime);
            }

            // Produce the appropriate amount of energy.
            var energyProduced = 0;
            if (this.active() && incomingEnergy.type == EnergyTypes.LIGHT)
                energyProduced = incomingEnergy.amount;
            this.energyOutputRate = energyProduced / deltaTime;

            return {
                type: EnergyTypes.ELECTRICAL,
                amount: energyProduced,
                direction: 0
            };
        },

        updateEnergyChunks: function(deltaTime) {
            // Calculate the convergence point where all the chunks are going
            var convergencePoint = this.getConvergencePoint();

            var energyChunkMover;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                energyChunkMover = this.energyChunkMovers[i];
                energyChunkMover.moveAlongPath(deltaTime);
                if (energyChunkMover.finished()) {
                    this.energyChunkMovers.splice(i, 1);
                    var chunk = energyChunkMover.energyChunk;
                    if (chunk.get('position').equals(convergencePoint, 0.0001)) {
                        this.energyChunkMovers.push(new EnergyChunkPathMover(
                            chunk,
                            this.createPathThroughConverter(this.get('position')),
                            Constants.ENERGY_CHUNK_VELOCITY
                        ));
                    }
                    else {
                        // The energy chunk has traveled across the panel and through
                        //   the converter, so pass it off to the next element in the system.
                        this.outgoingEnergyChunks.add(chunk);
                        this.energyChunks.remove(chunk);
                    }
                }
            }
        },

        handleIncomingEnergyChunks: function(time) {
            var chunk;
            for (var i = this.incomingEnergyChunks.length - 1; i >= 0; i--) {
                chunk = this.incomingEnergyChunks.models[i];
                if (chunk.get('energyType') === EnergyTypes.LIGHT) {
                    // Convert this chunk to electrical energy and add it to
                    // the list of energy chunks being managed.
                    chunk.set('energyType', EnergyTypes.ELECTRICAL);
                    this.energyChunks.add(chunk);
                    this.incomingEnergyChunks.remove(chunk);

                    // And a "mover" that will move this energy chunk to
                    //   to the bottom of the solar panel.
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        chunk,
                        this.createPathToPanelBottom(this.get('position')),
                        this.chooseChunkVelocityOnPanel(time, chunk)
                    ));
                }
                else {
                    // By design, this shouldn't happen, so warn if it does.
                    console.error('SolarPanel - Warning: Ignoring energy chunk with unexpected type, type = ' + chunk.get('energyType'));
                }
            }
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            this.clearEnergyChunks();
            if (incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyTypes.LIGHT) {
                // No energy chunk pre-loading needed
                return;
            }

            var bounds = this.getAbsorptionShape().getBounds();
            var lowerLeftOfPanel = this._lowerLeft.set(bounds.left(), bounds.bottom());
            var upperRightOfPanel = this._upperRight.set(bounds.right(), bounds.top());

            var crossLineLength = lowerLeftOfPanel.distance(upperRightOfPanel);
            var crossLineAngle = upperRightOfPanel.sub(lowerLeftOfPanel).angle(); // note: upperRightOfPanel is now toast, but we don't need it anymore

            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            var energySinceLastChunk = Constants.ENERGY_PER_CHUNK * 0.99;

            // Simulate energy chunks moving through the system
            var preloadingComplete = false;
            while (!preloadingComplete) {
                energySinceLastChunk += incomingEnergyRate.amount * deltaTime;

                // Determine if time to add a new chunk
                if (energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    var initialPosition;
                    if (this.energyChunks.length === 0) {
                        // For predictability of the algorithm, add the first chunk to the center of the panel.
                        initialPosition = this._initialChunkPosition
                            .set(crossLineLength * 0.5, 0)
                            .rotate(crossLineAngle)
                            .add(lowerLeftOfPanel);
                    }
                    else {
                        // Choose a random location along the center portion of the cross line.
                        initialPosition = this._initialChunkPosition
                            .set(crossLineLength * (0.5 * Math.random() + 0.25), 0)
                            .rotate(crossLineAngle)
                            .add(lowerLeftOfPanel);
                    }

                    var newChunk = new EnergyChunk({
                        energyType: EnergyTypes.ELECTRICAL,
                        position: initialPosition
                    });

                    // And a "mover" that will move this energy chunk
                    //   to the bottom of the solar panel.
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        newChunk,
                        this.createPathToPanelBottom(this.get('position')),
                        this.chooseChunkVelocityOnPanel(newChunk)
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

        createPathToPanelBottom: function(panelPosition) {
            return [
                panelPosition.clone().add(SolarPanel.OFFSET_TO_CONVERGENCE_POINT)
            ];
        },

        createPathThroughConverter: function(panelPosition) {
            return [
                panelPosition.clone().add(SolarPanel.OFFSET_TO_FIRST_CURVE_POINT),
                panelPosition.clone().add(SolarPanel.OFFSET_TO_SECOND_CURVE_POINT),
                panelPosition.clone().add(SolarPanel.OFFSET_TO_THIRD_CURVE_POINT),
                panelPosition.clone().add(SolarPanel.OFFSET_TO_CONNECTOR_CENTER)
            ];
        },

        /**
         * Pick a velocity for a newly arrived chunk that won't cause
         *   it to bunch together with other chunks.  We want them to
         *   march in a steady stream towards the exit.
         */
        chooseChunkVelocityOnPanel: function(time, incomingEnergyChunk) {
            // Start with default velocity.
            var chunkVelocity = Constants.ENERGY_CHUNK_VELOCITY;

            // Calculate the convergence point where all the chunks are going
            var convergencePoint = this.getConvergencePoint();

            // Count the number of chunks currently on the panel.
            var numChunksOnPanel = 0;
            var energyChunkMover;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                energyChunkMover = this.energyChunkMovers[i];
                if (energyChunkMover.getFinalDestination().equals(convergencePoint, 0.0001))
                    numChunksOnPanel++;
            }

            // Compute the projected time of arrival at the convergence point.
            var distanceToConvergencePoint = incomingEnergyChunk.get('position').distance(convergencePoint);
            var travelTime = distanceToConvergencePoint / chunkVelocity;
            var projectedArrivalTime = time + travelTime;

            // Calculate the minimum spacing based on the number of chunks on 
            //   the panel.
            var minArrivalTimeSpacing = numChunksOnPanel <= 3 ? SolarPanel.MIN_INTER_CHUNK_TIME : SolarPanel.MIN_INTER_CHUNK_TIME / (numChunksOnPanel - 2);

            // If the projected arrival time is too close to the current last
            //   chunk, slow down so that the minimum spacing is maintained.
            if (this.latestChunkArrivalTime + minArrivalTimeSpacing > projectedArrivalTime)
                projectedArrivalTime = this.latestChunkArrivalTime + minArrivalTimeSpacing;

            this.latestChunkArrivalTime = projectedArrivalTime;

            return distanceToConvergencePoint / (projectedArrivalTime - time);
        },

        clearEnergyChunks: function() {
            EnergyConverter.prototype.clearEnergyChunks.apply(this);

            this.latestChunkArrivalTime = 0;
            this.energyChunkMovers = [];
        },

        getAbsorptionShape: function() {
            return SolarPanel.ABSORPTION_SHAPE.clone().translate(
                this.get('position').x + SolarPanel.SOLAR_PANEL_OFFSET.x,
                this.get('position').y + SolarPanel.SOLAR_PANEL_OFFSET.y
            );
        },

        getConvergencePoint: function() {
            return this._convergencePoint
                .set(this.get('position'))
                .add(SolarPanel.OFFSET_TO_CONVERGENCE_POINT);
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.ELECTRICAL,
                amount: this.energyOutputRate
            };
        },
        
    }, Constants.SolarPanel);

    return SolarPanel;
});
