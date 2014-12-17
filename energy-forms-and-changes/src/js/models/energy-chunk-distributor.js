define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var Pool      = require('object-pool');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Static caching objects
     */
    var boundingRect    = new Rectangle();
    var lengthBounds    = new Rectangle();
    var vectorToEdge    = new Vector2();
    var edgePosition    = new Vector2();
    var edgeForce       = new Vector2();
    var vectorToOther   = new Vector2();
    var vectorToCenter  = new Vector2();
    var dragForceVector = new Vector2();
    var velocity        = new Vector2();
    var randomLocation  = new Vector2();
    var newVelocity     = new Vector2();
    var scaledForceVector = new Vector2();

    var forceVectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var EnergyChunkDistributor = {};

    /**
     * Apply static constants
     */
    _.extend(EnergyChunkDistributor, Constants.EnergyChunkDistributor);

    /**
     * Functions
     */
    _.extend(EnergyChunkDistributor, {

        /**
         * Redistribute a set of energy chunks that are contained in energy chunk
         *   "slices".  This is done in this way because all of the energy chunks in
         *   a set of slices interact with each other, but the container for each is
         *   defined by the boundary of its containing slice.
         */
        updatePositions: function(slices, deltaTime) {
            var i;
            var j;

            // Determine a rectangle that bounds all of the slices.
            var bounds = EnergyChunkDistributor.calculateBounds(slices);

            // Create a map that tracks the force applied to each energy chunk.
            var energyChunkForceVectors = EnergyChunkDistributor.initEnergyChunkForceVectors(slices);

            // Get list of all the chunks so we can easily cycle through them.
            var chunks = EnergyChunkDistributor.getChunksFromSlices(slices);

            // Make sure that there is actually something to distribute.
            if (!chunks.length)
                return;

            // Determine the minimum distance that is allowed to be used in the
            //   force calculations.  This prevents hitting infinities that can
            //   cause run time issues or unreasonably large forces.
            var minDistance = Math.min(bounds.w, bounds.h) / 20; // Divisor empirically determined.

            // The particle repulsion force varies inversely with the density of
            //   particles so that we don't end up with hugely repulsive forces that
            //   tend to push the particles out of the container.  This formula was
            //   made up, and can be adjusted if needed.
            var forceConstant = EnergyChunkDistributor.ENERGY_CHUNK_MASS * bounds.w * bounds.h * 0.1 / chunks.length;

            // Loop once for each max time step plus any remainder.
            var slice;
            var containerShape;
            var chunk;
            var forceVector;

            var particlesRedistributed = false;
            var numForceCalcSteps = Math.floor(deltaTime / EnergyChunkDistributor.MAX_TIME_STEP);
            var extraTime = deltaTime - numForceCalcSteps * EnergyChunkDistributor.MAX_TIME_STEP;

            for (var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++) {
                var timeStep = forceCalcStep < numForceCalcSteps ? EnergyChunkDistributor.MAX_TIME_STEP : extraTime;

                // The energy of the chunk with the highest energy
                var maxEnergy = 0;

                // Update the forces acting on the particle due to its bounding
                //   container, other particles, and drag.
                for (i = 0; i < slices.length; i++) {
                    slice = slices[i];
                    containerShape = slice.getShape();

                    // Determine the max possible distance to an edge.
                    var maxDistance = Math.sqrt( 
                        Math.pow(containerShape.getBounds().w, 2) +
                        Math.pow(containerShape.getBounds().h, 2) 
                    );

                    for (j = 0; j < slice.energyChunkList.length; j++) {
                        chunk = slice.energyChunkList.models[j];
                        forceVector = energyChunkForceVectors[i][j];

                        // Reset accumulated forces.
                        forceVector.set(0, 0);

                        // Determine forces on each energy chunk.
                        EnergyChunkDistributor.calculateEnergyChunkForces(chunk, forceVector, chunks, bounds, containerShape, minDistance, maxDistance, forceConstant);
                        //console.log(forceVector); // the force vectors are different here
                    }
                }

                
                // Update energy chunk velocities, drag force, and position.
                for (i = 0; i < slices.length; i++) {
                    slice = slices[i];

                    for (j = 0; j < slice.energyChunkList.length; j++) {
                        chunk = slice.energyChunkList.models[j];
                        forceVector = energyChunkForceVectors[i][j];
                        //console.log(forceVector); // but the force vectors are the same here
                        var energy = EnergyChunkDistributor.updateChunk(chunk, timeStep, forceVector);
                        if (energy > maxEnergy)
                            maxEnergy = energy;

                        
                    }
                }

                // See if anything actually changed
                particlesRedistributed = maxEnergy > EnergyChunkDistributor.REDISTRIBUTION_THRESHOLD_ENERGY;

                if (particlesRedistributed) {
                    // Update position of each energy chunk
                    for (j = 0; j < chunks.length; j++) {
                        chunk = chunks[j];
                        velocity.set(chunk.get('velocity'));
                        //console.log(velocity);
                        chunk.translate(velocity.scale(timeStep));
                    }
                }
            }

            // Clean the pool now that we're done with it.
            EnergyChunkDistributor.releaseEnergyChunkForceVectors(slices, energyChunkForceVectors);

            return particlesRedistributed;
        },

        initEnergyChunkForceVectors: function(slices) {
            var energyChunkForceVectors = [];
            for (var i = 0; i < slices.length; i++) {
                energyChunkForceVectors[i] = [];
                for (var j = 0; j < slices[i].energyChunkList.length; j++)
                    energyChunkForceVectors[i][j] = forceVectorPool.create();
            }
            return energyChunkForceVectors;
        },

        releaseEnergyChunkForceVectors: function(slices, energyChunkForceVectors) {
            for (var i = 0; i < slices.length; i++) {
                for (var j = 0; j < slices[i].energyChunkList.length; j++)
                    forceVectorPool.remove(energyChunkForceVectors[i][j]);
            }
        },

        getChunksFromSlices: function(slices) {
            var chunks = [];
            for (var i = 0; i < slices.length; i++) {
                for (var j = 0; j < slices[i].energyChunkList.length; j++) {
                    chunks.push(slices[i].energyChunkList.models[j]);
                }
            }
            return chunks;
        },

        calculateEnergyChunkForces: function(chunk, forceVector, chunks, bounds, containerShape, minDistance, maxDistance, forceConstant) {
            if (containerShape.contains(chunk.get('position'))) {
                EnergyChunkDistributor.addContainerEdgeForces(chunk, forceVector, containerShape, minDistance, maxDistance, forceConstant);
                EnergyChunkDistributor.addForcesFromOtherChunks(chunk, forceVector, chunks, minDistance, forceConstant);
                //console.log('chunk inside shape--force vector: ' + forceVector.x.toFixed(4) + ',' + forceVector.y.toFixed(4));
            }
            else {
                // Point is outside container, move it towards center of shape.
                vectorToCenter
                    .set(
                        bounds.center().x,
                        bounds.center().y
                    )
                    .sub(chunk.get('position'));
                forceVector.set(
                    vectorToCenter
                        .normalize()
                        .scale(EnergyChunkDistributor.OUTSIDE_CONTAINER_FORCE)
                );
                // console.log(containerShape.contains(chunk.get('position')) !== containerShape.getBounds().contains(chunk.get('position')));
                // console.log('chunk outside shape--force vector: ' + forceVector.x.toFixed(4) + ',' + forceVector.y.toFixed(4));
                // console.log(containerShape.getBounds());
                // console.log(chunk.get('position'));
            }
            //console.log(forceVector);
        },

        updateChunk: function(chunk, timeStep, forceVector) {
            // Calculate the energy chunk's velocity as a result of forces acting on it.
            newVelocity
                .set(chunk.get('velocity'))
                .add(
                    scaledForceVector
                        .set(forceVector)
                        .scale(timeStep / EnergyChunkDistributor.ENERGY_CHUNK_MASS)
                );
            
            // Calculate drag force.  Uses standard drag equation.
            var dragMagnitude = 0.5 
                * EnergyChunkDistributor.FLUID_DENSITY 
                * EnergyChunkDistributor.DRAG_COEFFICIENT 
                * EnergyChunkDistributor.ENERGY_CHUNK_CROSS_SECTIONAL_AREA 
                * newVelocity.lengthSq();

            if (dragMagnitude > 0) {
                // This will cause bugs if the chunk's velocity is a zero vector
                dragForceVector
                    .set(newVelocity)
                    .rotate(Math.PI)
                    .normalize()
                    .scale(dragMagnitude);
            }
            else
                dragForceVector.set(0, 0);

            // Update velocity based on drag force.
            newVelocity.add(dragForceVector.scale(timeStep / EnergyChunkDistributor.ENERGY_CHUNK_MASS));
            chunk.get('velocity').set(newVelocity); // Too much overhead when the event system picks it up
            //console.log(newVelocity.y.toFixed(4) + ',' + newVelocity.y.toFixed(4));

            // Return the new total energy
            return 0.5
                * EnergyChunkDistributor.ENERGY_CHUNK_MASS
                * newVelocity.lengthSq()
                + forceVector.length() * Math.PI / 2;
        },

        /**
         * Returns the bounding box that contains all slices
         */
        calculateBounds: function(slices) {
            var bounds;

            var minX = Number.POSITIVE_INFINITY;
            var minY = Number.POSITIVE_INFINITY;
            var maxX = Number.NEGATIVE_INFINITY;
            var maxY = Number.NEGATIVE_INFINITY;

            for (var i = 0; i < slices.length; i++) {
                bounds = slices[i].getBounds();
                minX  = Math.min(bounds.left(),   minX);
                maxX  = Math.max(bounds.right(),  maxX);
                minY  = Math.min(bounds.bottom(), minY);
                maxY  = Math.max(bounds.top(),    maxY);
            }

            return boundingRect.set(
                minX,
                minY,
                maxX - minX,
                maxY - minY
            );
        },

        /**
         * Applies forces exerted by the container's edge to each energy
         *   chunk contained in the container's shape.
         */
        addContainerEdgeForces: function(chunk, forceVector, containerShape, minDistance, maxDistance, forceConstant) {
            // Loop on several angles, calculating the forces from the
            //   edges at the given angle.
            for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                var edgeDetectSteps = 8;

                lengthBounds.x = 0;
                lengthBounds.w = maxDistance;

                for (var step = 0; step < edgeDetectSteps; step++) {
                    vectorToEdge
                        .set(lengthBounds.center().x, 0)
                        .rotate(angle);

                    edgePosition
                        .set(chunk.get('position'))
                        .add(vectorToEdge);

                    var min;
                    var max;
                    if (containerShape.contains(edgePosition)) {
                        min = lengthBounds.center().x;
                        max = lengthBounds.right();
                    }
                    else {
                        min = lengthBounds.left();
                        max = lengthBounds.center().x;
                    }
                    lengthBounds.x = min;
                    lengthBounds.w = max;
                }

                // Handle case where point is too close to the container's edge.
                if (lengthBounds.center().x < minDistance) {
                    lengthBounds.x = minDistance;
                    lengthBounds.w = minDistance;
                }

                // Apply the force due to this edge.
                edgeForce
                    .set(forceConstant / Math.pow(lengthBounds.center().x, 2))
                    .rotate(angle + Math.PI);
                forceVector.add(edgeForce);
                //console.log(edgeForce.length());
                //console.log('edge force magnitude: ' + edgeForce.length().toFixed(3));
            }
        },

        /**
         * Adds forces exerted by other chunks to this chunk but
         *   has limits on the maximum force that can be applied.
         */
        addForcesFromOtherChunks: function(chunk, forceVector, chunks, minDistance, forceConstant) {
            // Now apply the force from each of the other
            //   particles, but set some limits on the max force
            //   that can be applied.
            var otherChunk;
            for (var i = 0; i < chunks.length; i++) {
                otherChunk = chunks[i];
                if (chunk === otherChunk)
                    continue;

                // Calculate force vector, but handle cases where too close.
                vectorToOther
                    .set(chunk.get('position'))
                    .sub(otherChunk.get('position'));

                if (vectorToOther.length() < minDistance) {
                    //console.log(minDistance);
                    if (vectorToOther.length() === 0) {
                        // Create a random vector of min distance
                        var randomAngle = Math.random() * Math.PI * 2;
                        vectorToOther.set(
                            minDistance * Math.cos(randomAngle), 
                            minDistance * Math.sin(randomAngle)
                        );
                    }
                    else {
                        // Give it a magnitude equal to the min distance
                        vectorToOther
                            .normalize()
                            .scale(minDistance);
                    }
                }

                // Add the force to the accumulated forces on this energy chunk.
                var sqrMagnitude = vectorToOther.lengthSq();
                forceVector.add(
                    vectorToOther
                        .normalize()
                        .scale(forceConstant / sqrMagnitude)
                );
                //console.log(vectorToOther);
            }
            //console.log(forceVector);
        },

        /**
         * Returns a random location within the specified rectangle.
         */
        generateRandomLocation: function(rect) {
            return randomLocation.set(
                rect.left()   + (Math.random() * rect.w),
                rect.bottom() + (Math.random() * rect.h)
            );
        }

    });

    return EnergyChunkDistributor;
});
