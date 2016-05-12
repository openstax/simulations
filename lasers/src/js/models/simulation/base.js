define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var VanillaCollection = require('common/collections/vanilla');
    var Tube              = require('common/quantum/models/tube');
    var Photon            = require('common/quantum/models/photon');
    var Atom              = require('common/quantum/models/atom');
    var Beam              = require('common/quantum/models/beam');
    var QuantumConfig     = require('common/quantum/config');
    var Vector2           = require('common/math/vector2');
    var Rectangle         = require('common/math/rectangle');

    var LasersSimulation           = require('models/simulation');
    var BandPassReflectionStrategy = require('models/reflection-strategy/band-pass');
    var LeftReflectionStrategy     = require('models/reflection-strategy/left');
    var RightReflectionStrategy    = require('models/reflection-strategy/right');
    var PartialMirror              = require('models/partial-mirror');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var BaseLasersSimulation = LasersSimulation.extend({

        origin: Constants.ORIGIN,
        boxHeight: 120,
        boxWidth: 300,
        laserOffsetX: 50,
        defaultMiddleStateMeanLifetime: Constants.MAXIMUM_STATE_LIFETIME,
        defaultHighStateMeanLifetime: Constants.MAXIMUM_STATE_LIFETIME / 4,

        defaults: _.extend(LasersSimulation.prototype.defaults, {
            lasingPhotonViewMode:  Constants.PHOTON_DISCRETE,
            pumpingPhotonViewMode: Constants.PHOTON_CURTAIN,
            displayHighLevelEmissions: false,
            mirrorsEnabled: false
        }),
        
        initialize: function(attributes, options) {
            LasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:mirrorsEnabled', this.mirrorsEnabledChanged);
            this.on('change:elementProperties', this.elementPropertiesChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            LasersSimulation.prototype.initComponents.apply(this, arguments);

            this.setBounds(new Rectangle(0, 0, 1000, 800));

            this.laserOrigin = new Vector2(this.origin.x + this.laserOffsetX, this.origin.y);
            this.seedBeamOrigin = new Vector2();
            this.pumpingBeamOrigin = new Vector2();

            this.initTube();
            this.initBeams();
            this.initMirrors();

            this.listenTo(this.atoms, 'photon-emitted', this.photonEmitted)

            this.elementPropertiesChanged(this, this.get('elementProperties'));
        },

        initTube: function() {
            this.addModel(new Tube({
                origin: this.laserOrigin,
                width: this.boxWidth,
                height: this.boxHeight
            }));
        },

        initBeams: function() {
            var seedBeam = new Beam({
                wavelength:          Photon.RED,
                position:            this.getSeedBeamOrigin(),
                length:              this.boxWidth + this.laserOffsetX * 2,
                beamWidth:           this.boxHeight - Photon.RADIUS,           
                maxPhotonsPerSecond: Constants.MAXIMUM_SEED_PHOTON_RATE,
                fanout:              Constants.SEED_BEAM_FANOUT, 
                speed:               this.get('photonSpeedScale'),
                enabled:             true
            }, {
                direction: new Vector2(1, 0)
            });

            var pumpingBeam = new Beam({
                wavelength:          Photon.BLUE,
                position:            this.getPumpingBeamOrigin(),
                length:              1000,
                beamWidth:           this.tube.get('width'),           
                maxPhotonsPerSecond: Constants.MAXIMUM_SEED_PHOTON_RATE,
                fanout:              Constants.PUMPING_BEAM_FANOUT, 
                speed:               this.get('photonSpeedScale'),
                enabled:             true
            }, {
                direction: new Vector2(0, 1)
            });

            this.setSeedBeam(seedBeam);
            this.setPumpingBeam(pumpingBeam);

            this.listenTo(seedBeam,    'photon-emitted', this.photonEmitted);
            this.listenTo(pumpingBeam, 'photon-emitted', this.photonEmitted);
        },

        initMirrors: function() {
            // If there already mirrors in the model, get rid of them
            for (var i = this.mirrors.length - 1; i >= 0; i--)
                this.removeModel(this.mirrors[i]);

            // The right mirror is a partial mirror
            var p1 = new Vector2(
                this.tube.getX() + this.tube.get('width'),
                this.tube.getY()
            );
            var p2 = new Vector2(
                this.tube.getX() + this.tube.get('width'),
                this.tube.getY() + this.tube.get('height')
            );
            var bandPass = new BandPassReflectionStrategy(QuantumConfig.MIN_WAVELENGTH, QuantumConfig.MAX_WAVELENGTH);
            this.rightMirror = new PartialMirror({}, {
                start: p1, 
                end:   p2
            });
            this.rightMirror.addReflectionStrategy(bandPass);
            this.rightMirror.addReflectionStrategy(new LeftReflectionStrategy());

            // The left mirror is 100% reflecting
            var p3 = new Vector2(
                this.tube.getX(),
                this.tube.getY()
            );
            var p4 = new Vector2(
                this.tube.getX(),
                this.tube.getY() + this.tube.get('height')
            );
            this.leftMirror = new PartialMirror({}, {
                start: p3, 
                end:   p4
            });
            this.leftMirror.addReflectionStrategy(bandPass);
            this.leftMirror.addReflectionStrategy(new RightReflectionStrategy());
            this.leftMirror.setReflectivity(1);
        },

        getSeedBeamOrigin: function() {
            return this.seedBeamOrigin.set(this.origin);
        },

        getPumpingBeamOrigin: function() {
            return this.pumpingBeamOrigin.set(this.origin.x + this.laserOffsetX, this.origin.y - this.laserOffsetX);
        },

        resetComponents: function() {
            LasersSimulation.prototype.resetComponents.apply(this, arguments);

        },

        _update: function(time, deltaTime) {
            LasersSimulation.prototype._update.apply(this, arguments);

            
        },

        photonEmitted: function(source, photon) {
            this.addPhoton(photon);
            var photonVisible = true;

            // Was the photon emitted by an atom?
            if (source instanceof Atom) {
                // Don't show certain photons
                if (source.getStates().length > 2 && 
                    source.getCurrentState().equals(source.getStates()[2]) && 
                    !this.get('displayHighLevelEmissions')
                ) {
                    photonVisible = false;
                }
                else {
                    var middleEnergyLevel = this.getMiddleEnergyState().getEnergyLevel();
                    var groundEnergyLevel = this.getGroundState().getEnergyLevel();
                    var energyLevelDiff = middleEnergyLevel - groundEnergyLevel;
                    if (Math.abs(photon.getEnergy() - energyLevelDiff) <= QuantumConfig.ENERGY_TOLERANCE)
                        photonVisible = (this.get('lasingPhotonViewMode') === Constants.PHOTON_DISCRETE);
                }
            }

            // Is it a photon from the seed beam?
            if (source === this.seedBeam)
                photonVisible = true;

            // Is it a pumping beam photon, and are we viewing discrete photons?
            if (source === this.pumpingBeam)
                photonVisible = (this.get('pumpingPhotonViewMode') === Constants.PHOTON_DISCRETE);

            // Set whether the photon's view will be visible
            photon.set('visible', photonVisible);
        },

        mirrorsEnabledChanged: function(simulation, mirrorsEnabled) {
            // Regardless of the value of mirrorsEnabled, we should remove the model
            // elements.  If mirrorsEnabled is true, we want to try remove them
            // first, so they don't get added twice if they were already there
            this.removeModel(this.leftMirror);
            this.removeModel(this.rightMirror);

            if (mirrorsEnabled) {
                this.addModel(this.leftMirror);
                this.addModel(this.rightMirror);
            }

            this.seedBeam.set('enabled', !mirrorsEnabled);
        },

        elementPropertiesChanged: function(simulation, elementProperties) {
            this.getMiddleEnergyState().set('meanLifetime', this.defaultMiddleStateMeanLifetime);
            this.getHighEnergyState().set('meanLifetime', this.defaultHighStateMeanLifetime);
        }

    }, Constants.BaseLasersSimulation);

    return BaseLasersSimulation;
});
