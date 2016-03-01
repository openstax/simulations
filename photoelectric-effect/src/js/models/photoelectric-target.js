define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');
    var Plate            = require('common/quantum/models/plate');
    var Electron         = require('common/quantum/models/electron');
    
    var TargetMaterials               = require('models/target-materials');
    var InitialElectronSpeedStrategy  = require('models/initial-electron-speed-strategy');
    var MetalEnergyAbsorptionStrategy = require('models/metal-energy-absorption-strategy');

    var Constants = require('constants');
    var SPEED_SCALE_FACTOR = Constants.PhotoelectricTarget.SPEED_SCALE_FACTOR;
    var MINIMUM_SPEED      = Constants.PhotoelectricTarget.MINIMUM_SPEED;

    /**
     * The plate in the photoelectric model that is bombarded with light. It is primarily
     *   an ElectronSource, but it also adds an ElectronSink to the model that removes
     *   electrons that are bent back into it when the battery voltage is high enough to
     *   prevent the electrons emitted from the target from reaching the anode.
     */
    var PhotoelectricTarget = Plate.extend({

        defaults: _.extend({}, Plate.prototype.defaults, {
            targetMaterial: undefined
        }),

        uniformInitialElectronSpeedStrategy: new InitialElectronSpeedStrategy.Uniform(SPEED_SCALE_FACTOR),
        randomInitialElectronSpeedStrategy:  new InitialElectronSpeedStrategy.Randomized(SPEED_SCALE_FACTOR, MINIMUM_SPEED),

        /**
         * Initializes the PhotoelectricTarget
         */
        initialize: function(attributes, options) {
            Plate.prototype.initialize.apply(this, [attributes, options]);

            this.initialElectronSpeedStrategy = this.uniformInitialElectronSpeedStrategy;

            // Cached objects
            this._newElectronVelocity = new Vector2();
        },

        /**
         * Produces an electron of appropriate energy if the specified photon has enough energy.
         */
        handlePhotonCollision: function(photon) {
            // Determine if the photon has enough energy to dislodge an electron from the target
            var de = 0;
            if (this.get('targetMaterial').getEnergyAbsorptionStrategy() instanceof MetalEnergyAbsorptionStrategy)
                de = this.get('targetMaterial').getEnergyAbsorptionStrategy().energyAfterPhotonCollision(photon);
            else
                de = photon.getEnergy() - this.get('targetMaterial').getWorkFunction();

            // If the photon has enough energy to dislodge an electron, then do it
            if (de > 0) {
                // Determine where the electron will be emitted from
                // The location of the electron is coincident with where the photon hit the plate
                var point = LineIntersection.lineIntersection(
                    this.get('point1').x, this.get('point1').y,
                    this.get('point2').x, this.get('point2').y,
                    photon.getPosition().x, photon.getPosition().y,
                    photon.getPreviousPosition().x, photon.getPreviousPosition().y
                );

                if (point instanceof Vector2) {
                    var electron = new Electron();
                    // Offset the electron to the right of the plate. Ths keeps the plate from
                    // thinking the electron hit it in the electron's first time step.
                    var offset = 1;
                    electron.setPosition(point.x + offset, point.y);

                    // Determine the speed of the new electron
                    var velocity = this.determineNewElectronVelocity(de);
                    electron.setVelocity(velocity);

                    // Tell all the listeners
                    this.getSource().trigger('electron-produced', this, electron);
                }
                else {
                    throw 'Lines do not intersect';
                }
            }
        },

        /**
         * Used if electrons can be emitted through a range of
         */
        determineNewElectronVelocity: function(energy) {
            var speed = this.initialElectronSpeedStrategy.determineNewElectronSpeed(energy);
            var dispersionAngle = 0;
            var angle = Math.random() * dispersionAngle - dispersionAngle / 2;
            var vx = speed * Math.cos(angle);
            var vy = speed * Math.sin(angle);
            return this._newElectronVelocity.set(vx, vy);
        },

        /**
         * Tells if the target has been hit by a specified photon in the last time step
         */
        isHitByPhoton: function(photon) {
            return LineIntersection.linesIntersect(
                this.get('point1').x, this.get('point1').y,
                this.get('point2').x, this.get('point2').y,
                photon.getPosition().x, photon.getPosition().y,
                photon.getPreviousPosition().x, photon.getPreviousPosition().y
            );
        },

        setUniformInitialElectronSpeedStrategy: function() {
            this.initialElectronSpeedStrategy = this.uniformInitialElectronSpeedStrategy;
        },

        setRandomizedInitialElectronSpeedStrategy: function() {
            this.initialElectronSpeedStrategy = this.randomInitialElectronSpeedStrategy;
        }

    }, _.extend({}, Constants.PhotoelectricTarget, TargetMaterials));

    return PhotoelectricTarget;
});