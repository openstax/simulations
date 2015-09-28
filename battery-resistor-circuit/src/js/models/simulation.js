define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Vector2                 = require('common/math/vector2');

    var System                  = require('models/system');
    var Circuit                 = require('models/circuit');
    var WirePatch               = require('models/wire-patch');
    var WireSystem              = require('models/wire-system');
    var PatchWireRegion         = require('models/wire-region/patch');
    var SimplePatchRegion       = require('models/wire-region/simple-patch');
    var AndWireRegion           = require('models/wire-region/and');
    var Electron                = require('models/wire-particle/electron');
    var Resistance              = require('models/law/resistance');
    var AverageCurrent          = require('models/law/average-current');
    var CollisionEvent          = require('models/law/collision-event');
    var Collider                = require('models/law/collider');
    var ParticleLaw             = require('models/law/particle');
    var Turnstile               = require('models/law/turnstile');
    var DualJunctionPropagator  = require('models/propagator/dual-junction');
    var CompositePropagator     = require('models/propagator/composite');
    var RangedPropagator        = require('models/propagator/ranged');
    var ResetElectronPropagator = require('models/propagator/reset-electron');
    var SmoothBatteryPropagator = require('models/propagator/smooth-battery');
    var BatteryForcePropagator  = require('models/propagator/battery-force');
    var AccelerationPropagator  = require('models/propagator/acceleration');
    var CrashPropagator         = require('models/propagator/crash');
    var FrictionForce           = require('models/force/friction');
    var CoulombForceParameters  = require('models/force/coulomb-force-parameters');
    var CoulombForce            = require('models/force/coulomb');
    var ResetScatterability     = require('models/listeners/reset-scatterability');
    var OscillateFactory        = require('models/oscillate-factory');
    var AdjacentPatchCoulombForceEndToBeginning = require('models/force/adjacent-patch-coulomb-beginning-to-end');
    var AdjacentPatchCoulombForceBeginningToEnd = require('models/force/adjacent-patch-coulomb-end-to-beginning');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var BRCSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
            coreCount: Constants.RESISTANCE_RANGE.defaultValue,
            voltage: Constants.VOLTAGE_RANGE.defaultValue,
            current: 0
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                frameDuration: Constants.FRAME_DURATION,
                deltaTimePerFrame: Constants.DT_PER_FRAME
            }, options);

            // Not really the way to do it in Backbone, but an easier solution when porting than debugging later
            this.voltageListeners = [];
            this.currentListeners = [];
            this.coreCountListeners = [];

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:voltage',   this.voltageChanged);
            this.on('change:current',   this.currentChanged);
            this.on('change:coreCount', this.coreCountChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // TODO: Break this thing into smaller functions as soon as I know it all works

            var moveRight = Constants.SIM_X_OFFSET;
            var scatInset = 60 + moveRight;
            var battInset = scatInset;
            var topLeftWirePoint     = new Vector2(25  + moveRight, 120); // Top left
            var topRightWirePoint    = new Vector2(700 + moveRight, 120); // Top right
            var bottomRightWirePoint = new Vector2(700 + moveRight, 270); // Bottom right
            var bottomLeftWirePoint  = new Vector2(25  + moveRight, 270); // Bottom left
            var topLeftInset         = new Vector2(topLeftWirePoint    ).add( scatInset - moveRight, 0);
            var topRightInset        = new Vector2(topRightWirePoint   ).add(-scatInset + moveRight, 0);
            var bottomLeftInset      = new Vector2(bottomLeftWirePoint ).add( battInset - moveRight, 0);
            var bottomRightInset     = new Vector2(bottomRightWirePoint).add(-battInset + moveRight, 0);

            // Set up the wire patches
            var loopWirePatch = new WirePatch()
                .startSegmentBetween(bottomLeftInset, bottomLeftWirePoint)
                .appendSegmentAt(topLeftWirePoint)
                .appendSegmentAt(topRightWirePoint)
                .appendSegmentAt(bottomRightWirePoint)
                .appendSegmentAt(bottomRightInset);

            var batteryWirePatch = new WirePatch()
                .startSegmentBetween(bottomRightInset, bottomLeftInset);

            // Patches that will be used for painting (and  aren't actually used in the simulation)
            var scatterPatch = new WirePatch()
                .startSegmentBetween(topLeftInset, topRightInset);

            var leftPatch = new WirePatch()
                .startSegmentBetween(bottomLeftInset, bottomLeftWirePoint)
                .appendSegmentAt(topLeftWirePoint)
                .appendSegmentAt(topLeftInset);

            var rightPatch = new WirePatch()
                .startSegmentBetween(topRightInset, topRightWirePoint)
                .appendSegmentAt(bottomRightWirePoint)
                .appendSegmentAt(bottomRightInset);

            this.scatterPatch = scatterPatch;
            this.leftPatch = leftPatch;
            this.rightPatch = rightPatch;

            // Create the circuit and add the real (used by the simulation) patches
            var circuit = new Circuit()
                .addWirePatch(loopWirePatch)
                .addWirePatch(batteryWirePatch);

            // Set up the wire system
            var wireSystem = new WireSystem();
            this.wireSystem = wireSystem;

            var props = new CompositePropagator();

            // Create the system which will be representative of the resistor
            var system = new System();
            this.system = system;

            var resistance = new Resistance( 
                Constants.CORE_START, 
                Constants.CORE_END, 
                Constants.DEFAULT_NUM_CORES, 
                loopWirePatch, 
                Constants.DEFAULT_AMPLITUDE, 
                Constants.DEFAULT_FREQUENCY, 
                Constants.DEFAULT_DECAY, 
                system
            );
            
            // Battery stuff
            var batteryRegion = new SimplePatchRegion(batteryWirePatch);
            var batteryProps = new CompositePropagator(); // original: cpr
            var batteryRangedProps = new RangedPropagator(); // original: range

            var inset = 50;
            var battL = Constants.CORE_START - inset;
            var battR = Constants.CORE_END + inset;
            var leftBatteryRegion  = new PatchWireRegion(0, battL, loopWirePatch);
            var rightBatteryRegion = new PatchWireRegion(battR, loopWirePatch.getLength(), loopWirePatch);
            this.batteryLeft  = bottomLeftInset.x;
            this.batteryRight = bottomRightInset.x;
            this.batteryY = bottomLeftInset.y;

            var batterySpeed = 35;
            var battery = new SmoothBatteryPropagator(leftBatteryRegion, rightBatteryRegion, wireSystem, batterySpeed, 18);

            batteryRangedProps.addPropagator(batteryRegion, battery);
            batteryRangedProps.addPropagator(batteryRegion, new ResetElectronPropagator());
            batteryProps.addPropagator(batteryRangedProps);
            batteryProps.addPropagator(new CrashPropagator());
            props.addPropagator(batteryProps);

            var coulombForceParameters = new CoulombForceParameters(Constants.K, Constants.COULOMB_POWER, 2); // original: cfp
            var coulombForce = new CoulombForce(coulombForceParameters, wireSystem); // original: cf

            var batteryForcePropagator = new BatteryForcePropagator(0, 10 * Constants.MAX_VEL); // original: fp
            batteryForcePropagator.addForce(coulombForce); 
            // Add a coulomb force from the end of batteryWirePatch onto the beginning of loopWirePatch
            batteryForcePropagator.addForce(new AdjacentPatchCoulombForceEndToBeginning(coulombForceParameters, wireSystem, batteryWirePatch, loopWirePatch));
            batteryForcePropagator.addForce(new AdjacentPatchCoulombForceBeginningToEnd(coulombForceParameters, wireSystem, batteryWirePatch, loopWirePatch));
            batteryForcePropagator.addForce(new FrictionForce(0.9999999));

            var accelInset = 15;
            var coulombInset = 10;
            var accelerationRegion        = new PatchWireRegion(Constants.CORE_START - accelInset,   Constants.CORE_END + accelInset,   loopWirePatch);
            var scatteringRegionNoCoulomb = new PatchWireRegion(Constants.CORE_START - coulombInset, Constants.CORE_END + coulombInset, loopWirePatch);

            var nonCoulombRegion = new AndWireRegion();
            nonCoulombRegion.addRegion(batteryRegion);
            nonCoulombRegion.addRegion(scatteringRegionNoCoulomb);  // PhET Note: Comment out this line to put coulomb interactions into the scattering region

            var accelScale = 1.4;
            var scatProp = new AccelerationPropagator(2, Constants.MAX_VEL * 15, accelScale);
            batteryRangedProps.addPropagator(accelerationRegion, scatProp);
            batteryRangedProps.addInverse(nonCoulombRegion, batteryForcePropagator);
            props.addPropagator(new DualJunctionPropagator(loopWirePatch, batteryWirePatch));
            props.addPropagator(new DualJunctionPropagator(batteryWirePatch, loopWirePatch));

            var resetScatterability = new ResetScatterability(wireSystem); // original: rs

            // Average current calculator
            var averageCurrent = new AverageCurrent(100); // original: current
            this.averageCurrent = averageCurrent;

            // Collider stuff
            resistance.layoutCores();
            var axis = new Vector2(1, 2);
            var oscillateFactory = new OscillateFactory(
                Constants.V_TO_AMP_SCALE, 
                Constants.DEFAULT_DECAY, 
                Constants.DEFAULT_FREQUENCY, 
                Constants.MAX_ACC, 
                axis
            );
            var collisionEvent = new CollisionEvent(Constants.COLLISION_DIST, Constants.AMPLITUDE_THRESHOLD, oscillateFactory);
            system.addLaw(collisionEvent);
            var collider = new Collider(wireSystem, collisionEvent, loopWirePatch);

            // Create and add electrons
            var dx = parseInt(circuit.getLength() / Constants.NUM_ELECTRONS);
            var mod = 0;
            for (var i = 0; i < Constants.NUM_ELECTRONS; i++) {
                var position = dx * i;

                if (position > Constants.CORE_START && position < Constants.CORE_END && mod++ % 2 === 0)
                    continue;

                var electron = new Electron({
                    propagator: props, 
                    wirePatch: circuit.getPatch(position), 
                    collisionEvent: collisionEvent,
                    velocity: 0,
                    position: circuit.getLocalPosition(position, circuit.getPatch(position))
                });

                wireSystem.addParticle(electron);
            }

            // Add some laws
            system.addLaw(wireSystem);
            system.addLaw(collider);
            system.addLaw(new ParticleLaw());
            system.addLaw(averageCurrent);

            // Turnstile (the pinwheel)
            var turnstile = new Turnstile(Constants.TURNSTILE_CENTER, Constants.TURNSTILE_SPEED_SCALE);
            this.turnstile = turnstile;
            system.addLaw(turnstile);

            // Add listeners
            this.voltageListeners.push(battery);
            this.voltageListeners.push(averageCurrent);
            this.voltageListeners.push(scatProp);
            this.voltageListeners.push(batteryForcePropagator);
            this.voltageListeners.push(resetScatterability);

            this.currentListeners.push(turnstile);

            this.coreCountListeners.push(resistance);
            this.coreCountListeners.push(averageCurrent);
            this.coreCountListeners.push(battery);

            // Trigger changes for default values
            this.voltageChanged(this, this.get('voltage'));
            this.currentChanged(this, this.get('current'));
            this.coreCountChanged(this, this.get('coreCount'));
        },

        _update: function(time, deltaTime) {
            this.system.update(deltaTime);

            // TODO: Might need to change this later, but just adding it in here so I don't forget
            this.set('current', this.averageCurrent.getCurrent());
        },

        voltageChanged: function(simulation, voltage) {
            for (var i = 0; i < this.voltageListeners.length; i++)
                this.voltageListeners[i].voltageChanged(voltage);
        },

        currentChanged: function(simulation, current) {
            for (var i = 0; i < this.currentListeners.length; i++)
                this.currentListeners[i].currentChanged(current);
        },

        coreCountChanged: function(simulation, coreCount) {
            for (var i = 0; i < this.coreCountListeners.length; i++)
                this.coreCountListeners[i].coreCountChanged(coreCount);
        }

    });

    return BRCSimulation;
});
