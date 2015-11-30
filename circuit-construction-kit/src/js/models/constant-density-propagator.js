define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var SmoothData = require('models/smooth-data');

    var Constants = require('constants');
    var FIRE_CURRENT = Constants.ConstantDensityPropagator.FIRE_CURRENT;
    var MIN_CURRENT  = Constants.ConstantDensityPropagator.MIN_CURRENT;
    var MAX_STEP     = Constants.ConstantDensityPropagator.MAX_STEP;

    var locationPool = Pool({
        init: function() {
            return { 
                branch: undefined, 
                x: undefined 
            };
        }
    });

    /**
     * Propagates electrons
     */
    var ConstantDensityPropagator = function(particleSet, circuit) {
        this.particleSet = particleSet;
        this.circuit = circuit;

        this.speedScale = 0.01 / 0.03;
        this.numEqualize = 2;
        this.scale = 0;
        this.smoothData = new SmoothData(30);
        this.timeScalingPercentValue = 0;
    };

    _.extend(ConstantDensityPropagator.prototype, {

        update: function(time, deltaTime) {
            var maxCurrent = this.getMaxCurrent();
            var maxVelocity = maxCurrent * this.speedScale;
            var maxStep = maxVelocity * deltaTime;
            if (maxStep >= MAX_STEP)
                this.scale = MAX_STEP / maxStep;
            else
                this.scale = 1;
            
            this.smoothData.addData(this.scale * 100);
            this.timeScalingPercentValue = this.smoothData.getAverage();

            this.percent = Math.round(this.timeScalingPercentValue);
            if (this.percent === '0')
                this.percent = '1';
            
            // Todo add test for change before notify
            for (var i = 0; i < this.particleSet.numParticles(); i++)
                this.propagate(this.particleSet.particleAt(i), deltaTime);
            // Maybe this should be done in random order, otherwise we may get artefacts.

            for (var j = 0; j < this.numEqualize; j++)
                this.equalize(deltaTime);
        },

        getMaxCurrent: function() {
            var branches = this.circuit.branches;
            var max = 0;
            for (var i = 0; i < branches.length; i++) {
                var current = branches[i].get('current');
                max = Math.max(max, Math.abs(current));
            }
            return max;
        },

        equalize: function(deltaTime) {
            var i;
            var indices = [];
            for (i = 0; i < this.particleSet.numParticles(); i++)
                indices.push(i);
            
            _.shuffle(indices);

            for (i = 0; i < this.particleSet.numParticles(); i++)
                this.equalizeElectron(this.particleSet.particleAt(indices[i]), deltaTime);
        },

        equalizeElectron: function(e, deltaTime) {
            // If it has a lower and upper neighbor, try to get the distance to each to be half of ELECTRON_DX
            var upper = this.particleSet.getUpperNeighborInBranch(e);
            var lower = this.particleSet.getLowerNeighborInBranch(e);
            if (!upper || !lower)
                return;
            
            var sep = upper.get('distAlongWire') - lower.get('distAlongWire');
            var myloc = e.get('distAlongWire');
            var midpoint = lower.get('distAlongWire') + sep / 2;

            var dest = midpoint;
            var distMoving = Math.abs(dest - myloc);
            var vec = dest - myloc;
            var sameDirAsCurrent = vec > 0 && e.get('branch').get('current') > 0;
            var myscale = 1000.0 / 30.0; // To have same scale as 3.17.00
            var correctionSpeed = 0.055 / this.numEqualize * myscale;
            if (!sameDirAsCurrent)
                correctionSpeed = 0.01 / this.numEqualize * myscale;
            
            var maxDX = Math.abs(correctionSpeed * deltaTime);

            if (distMoving > maxDX) {
                //move in the appropriate direction maxDX
                if (dest < myloc)
                    dest = myloc - maxDX;
                else if (dest > myloc)
                    dest = myloc + maxDX;
            }

            if (dest >= 0 && dest <= e.get('branch').getLength())
                e.set('distAlongWire', dest);
        },

        propagate: function(e, deltaTime) {
            var x = e.get('distAlongWire');
            if (isNaN(x)) {
                //TODO fix this
                return;
            }
            var current = e.get('branch').get('current');

            if (current === 0 || Math.abs(current) < MIN_CURRENT)
                return;

            var speed = current * this.speedScale;
            var dx = (speed * deltaTime) * this.scale;
            var newX = x + dx;

            var branch = e.get('branch');
            if (branch.containsScalarLocation(newX)) {
                e.set('distAlongWire', newX);
            }
            else {
                // Need a new branch.
                var overshoot = 0;
                var under = false;
                if (newX < 0) {
                    overshoot = -newX;
                    under = true;
                }
                else {
                    overshoot = Math.abs(branch.getLength() - newX);
                    under = false;
                }

                if (isNaN(overshoot)) // Never happens
                    throw 'Overshoot is NaN';
                
                if (overshoot < 0) // Never happens
                    throw 'Overshoot is <0';
                
                var locations = this.getLocations(e, overshoot, under);
                if (locations.length === 0)
                    return;
                
                // Choose the branch with the furthest away electron
                var chosen = this.chooseDestinationBranch(locations);
                e.setLocation(chosen.branch, Math.abs(chosen.x));

                // Clean up
                locationPool.remove(chosen);
                for (var i = 0; i < locations.length; i++)
                    locationPool.remove(locations[i]);
            }
        },

        chooseDestinationBranch: function(locations) {
            for (var i = 0; i < locations.length; i++) 
                locations[i].density = this.getDensity(locations[i]);
            
            if (!this._densitySortFunction) {
                this._densitySortFunction = function(loc1, loc2) {
                    return loc1.density - loc2.density;
                };
            }

            locations.sort(this._densitySortFunction);

            return locations[0];
        },

        getDensity: function(circuitLocation) {
            return this.particleSet.getDensity(circuitLocation.branch);
        },

        getLocations: function(e, overshoot, under) {
            var branch = e.get('branch');
            var jroot = (under) ? 
                branch.get('startJunction') :
                branch.get('endJunction');
            
            var adj = this.circuit.getAdjacentBranches(jroot);
            var all = [];

            // Keep only those with outgoing current.
            var location;
            for (var i = 0; i < adj.length; i++) {
                var neighbor = adj[i];

                var current = neighbor.get('current');
                if (current > FIRE_CURRENT)
                    current = FIRE_CURRENT;
                else if (current < -FIRE_CURRENT)
                    current = -FIRE_CURRENT;
                
                var distAlongNew;
                if (current > 0 && neighbor.get('startJunction') == jroot) { // Start near the beginning.
                    distAlongNew = overshoot;
                    if ( distAlongNew > neighbor.getLength() ) {
                        distAlongNew = neighbor.getLength();
                    }
                    else if ( distAlongNew < 0 ) {
                        distAlongNew = 0;
                    }

                    location = locationPool.create();
                    location.branch = neighbor;
                    location.x = distAlongNew;
                    all.push(location);
                }
                else if (current < 0 && neighbor.get('endJunction') == jroot) {
                    distAlongNew = neighbor.getLength() - overshoot;
                    if (distAlongNew > neighbor.getLength())
                        distAlongNew = neighbor.getLength();
                    else if (distAlongNew < 0)
                        distAlongNew = 0;
                    
                    location = locationPool.create();
                    location.branch = neighbor;
                    location.x = distAlongNew;
                    all.push(location);
                }
            }

            return all;
        }

    });

    return ConstantDensityPropagator;
});