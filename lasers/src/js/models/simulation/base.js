define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var VanillaCollection = require('common/collections/vanilla');
    var Tube              = require('common/quantum/models/tube');
    var Photon            = require('common/quantum/models/photon');
    var QuantumConfig     = require('common/quantum/config');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    var LasersSimulation = require('../simulation');
    var BandPass         = require('./band-pass');

    /**
     * Constants
     */
    var Constants = require('../../constants');

    /**
     * 
     */
    var BaseLasersSimulation = LasersSimulation.extend({

        origin: Constants.ORIGIN,
        boxHeight: 120,
        boxWidth: 300,
        laserOffsetX: 50,

        defaults: _.extend(LasersSimulation.prototype.defaults, {
            lasingPhotonViewMode:  Constants.PHOTON_DISCRETE,
            pumpingPhotonViewMode: Constants.PHOTON_CURTAIN
        }),
        
        initialize: function(attributes, options) {
            LasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            LasersSimulation.prototype.initComponents.apply(this, arguments);

            this.laserOrigin = new Vector2(this.origin.x + this.laserOffsetX, this.origin.y);

            this.initTube();
            this.initBeams();
            this.initMirrors();
        },

        initTube: function() {
            this.addModel(new Tube({
                position: this.laserOrigin,
                width: this.boxWidth,
                height: this.boxHeight
            }));
        },

        initBeams: function() {
            var seedBeam = new Beam({
                wavelength:          Photon.RED,
                position:            this.origin,
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
                position:            new Vector2(this.origin.x + this.laserOffsetX, this.origin.y - this.laserOffsetX,
                length:              1000,
                beamWidth:           this.tube.get('width'),           
                maxPhotonsPerSecond: Constants.MAXIMUM_SEED_PHOTON_RATE,
                fanout:              Constants.PUMPING_BEAM_FANOUT, 
                speed:               this.get('photonSpeedScale'),
                enabled:             true
            }, {
                direction: new Vector2(0, 1)
            });

            this.setStimulatingBeam(seedBeam);
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
            var bandPass = new BandPass(QuantumConfig.MIN_WAVELENGTH, QuantumConfig.MAX_WAVELENGTH);
            rightMirror = new PartialMirror( p1, p2 );
            rightMirror.addReflectionStrategy( bandPass );
            rightMirror.addReflectionStrategy( new LeftReflecting() );
            rightMirrorGraphic = new MirrorGraphic( getApparatusPanel(), rightMirror, MirrorGraphic.LEFT_FACING );

            // The left mirror is 100% reflecting
            var p3 = new Vector2(
                this.tube.getX(),
                this.tube.getY()
            );
            var p4 = new Vector2(
                this.tube.getX(),
                this.tube.getY() + this.tube.get('height')
            );
            leftMirror = new PartialMirror( p3, p4 );
            leftMirror.addReflectionStrategy( bandPass );
            leftMirror.addReflectionStrategy( new RightReflecting() );
            leftMirror.setReflectivity( 1.0 );
            leftMirrorGraphic = new MirrorGraphic( getApparatusPanel(), leftMirror, MirrorGraphic.RIGHT_FACING );

            // Put a reflectivity control on the panel
            JPanel reflectivityControl = new RightMirrorReflectivityControlPanel( rightMirror );
            reflectivityControlPanel = new JPanel();
            Dimension dim = reflectivityControl.getPreferredSize();
            reflectivityControlPanel.setBounds( (int) rightMirror.getPosition().getX() + 10,
                                                (int) ( rightMirror.getPosition().getY() + rightMirror.getBounds().getHeight() ),
                                                (int) dim.getWidth() + 10, (int) dim.getHeight() + 10 );
            reflectivityControlPanel.add( reflectivityControl );
            reflectivityControl.setBorder( new BevelBorder( BevelBorder.RAISED ) );
            reflectivityControlPanel.setOpaque( false );
            reflectivityControlPanel.setVisible( false );
            getApparatusPanel().add( reflectivityControlPanel );
        },

        resetComponents: function() {
            LasersSimulation.prototype.resetComponents.apply(this, arguments);

        },

        _update: function(time, deltaTime) {
            LasersSimulation.prototype._update.apply(this, arguments);

            
        },

        photonEmitted: function(source, photon) {
            this.addModelElement(photon);
            var photonVisible = true;

            // Was the photon emitted by an atom?
            if (source instanceof Atom) {
                // Don't show certain photons
                if (source.getStates().length > 2 && 
                    source.getCurrState() == source.getStates()[2] && 
                    !displayHighLevelEmissions
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
        }

    }, Constants.BaseLasersSimulation);

    return BaseLasersSimulation;
});
