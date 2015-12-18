define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var CircuitComponent = require('models/components/circuit-component');
    var Filament         = require('models/components/filament');
    var BranchSet        = require('models/branch-set');

    var LightBulbView = require('views/components/light-bulb');

    var Constants = require('constants');

    /**
     * A bulb
     */
    var Bulb = CircuitComponent.extend({

        defaults: _.extend({}, CircuitComponent.prototype.defaults, {
            width: 0,
            isSchematic: false,
            connectAtLeft: true,
            circuit: undefined
        }),

        initialize: function(attributes, options) {
            this.filament = new Filament({
                startJunction: this.get('startJunction'), 
                endJunction: this.get('endJunction'), 
                numPeaks: 3, 
                pivotToResistorDY: this.get('height') * 0.8, 
                resistorWidth: this.get('width') * 0.8, 
                zigHeight: this.get('height') * 0.061
            });

            CircuitComponent.prototype.initialize.apply(this, [attributes, options]);

            this.branchSet = new BranchSet();

            // Cached objects
            this._delta = new Vector2();
            this._vec   = new Vector2();

            this.on('change:isSchematic',   this.isSchematicChanged);
            this.on('change:connectAtLeft', this.connectAtLeftChanged);
        },

        getPosition: function(x) {
            if (this.get('isSchematic')) {
                return CircuitComponent.prototype.apply.getPosition(this, [x]);
            }
            if (this.containsScalarLocation(x)) {
                return this.filament.getPosition(x);
            }
            else {
                if (isNaN(this.getLength()))
                    throw 'Length was NaN.';
                
                // This occurs when dragging the bulb after splitting.  maybe splitting needs to relayout.
                throw 'Position not within bulb: x=' + x + ', length=' + this.getLength();
            }
        },

        getLength: function() {
            if (this.get('isSchematic'))
                return this.get('startJunction').get('position').distance(this.get('endJunction').get('position'));
            return this.filament.getLength();
        },

        getComponentLength: function() {
            if (this.get('isSchematic'))
                return this.getLength();
            else
                return CircuitComponent.prototype.getLength.apply(this);
        },

        getIntensity: function() {
            var power = Math.abs(this.get('current') * this.get('voltageDrop'));
            var maxPower = 60;
            if (power > maxPower)
                power = maxPower;
            
            return Math.pow(power / maxPower, 0.354);
        },

        flip: function(circuit) {
            this.set('connectAtLeft', !this.get('connectAtLeft'));

            if (circuit) {
                var tilt = LightBulbView.getRotationOffset(this.get('connectAtLeft'));
                var vector = this.getDirectionVector().rotate(tilt * 2);
                var target = vector.add(this.get('startJunction').get('position'));
                var delta = this._delta.set(target).sub(this.get('endJunction').get('position'));

                var strongConnections = circuit.getStrongConnections(this, this.get('endJunction'));

                this.branchSet
                    .clear()
                    .setCircuit(circuit)
                    .addBranches(strongConnections)
                    .addJunction(this.get('endJunction'))
                    .translate(delta);
            }
        },

        startJunctionChanged: function(model, startJunction) {
            CircuitComponent.prototype.startJunctionChanged.apply(this, arguments);
            this.filament.set('startJunction', startJunction);
        },

        endJunctionChanged: function(model, endJunction) {
            CircuitComponent.prototype.endJunctionChanged.apply(this, arguments);
            this.filament.set('endJunction', endJunction);
        },

        _startJunctionChanged: function(model, startJunction) {
            CircuitComponent.prototype._startJunctionChanged.apply(this, arguments);
            this.updateFilament();
        },

        _endJunctionChanged: function(model, endJunction) {
            CircuitComponent.prototype._endJunctionChanged.apply(this, arguments);
            this.updateFilament();
        },

        connectAtLeftChanged: function(model, connectAtLeft) {
            this.filament.set('connectAtRight', connectAtLeft);
        },

        updateFilament: function() {
            this.filament.recompute();
        },

        isSchematicChanged: function(model, isSchematic) {
            // Move junctions if necessary.
            if (isSchematic)
                this.expandToSchematic();
            else
                this.collaspeToLifelike();
        },

        collaspeToLifelike: function() {
            var circuit = this.get('circuit');
            var distBetweenJ = Constants.BULB_DISTANCE_BETWEEN_JUNCTIONS;
            var vector = this.getDirectionVector().normalize().scale(distBetweenJ);
            var dest = vector.add(this.get('startJunction').get('position'));
            var delta = this._delta.set(dest).sub(this.get('endJunction').get('position'));

            if (circuit) {
                var strongConnections = circuit.getStrongConnections(this, this.get('endJunction'));

                this.branchSet
                    .clear()
                    .setCircuit(circuit)
                    .addBranches(strongConnections)
                    .addJunction(this.get('endJunction'))
                    .translate(delta);
            }
            else {
                this.get('endJunction').setPosition(dest.x, dest.y);
            }

            return delta;
        },

        expandToSchematic: function() {
            var circuit = this.get('circuit');
            var vec = this._vec
                .set(this.get('endJunction').get('position'))
                .sub(this.get('startJunction').get('position'));
            var dest = vec
                .normalize()
                .scale(Constants.SCH_BULB_DIST)
                .add(this.get('startJunction').get('position'));
            var delta = this._delta
                .set(dest)
                .sub(this.get('endJunction')
                .get('position'));

            if (circuit) {
                var strongConnections = circuit.getStrongConnections(this, this.get('endJunction'));

                this.branchSet
                    .clear()
                    .setCircuit(circuit)
                    .addBranches(strongConnections)
                    .addJunction(this.get('endJunction'))
                    .translate(delta);
            }
            else {
                this.get('endJunction').setPosition(dest.x, dest.y);
            }
        }

    });

    return Bulb;
});