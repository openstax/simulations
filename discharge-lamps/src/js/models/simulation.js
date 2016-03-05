define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var LasersSimulation = require('lasers/models/simulation');

    var Vector2                     = require('common/math/vector2');
    var Tube                        = require('common/quantum/models/tube');
    var Electron                    = require('common/quantum/models/electron');
    var ElectronSink                = require('common/quantum/models/electron-sink');
    var ElectronSource              = require('common/quantum/models/electron-source');
    var ElectronAtomCollisionExpert = require('common/quantum/models/electron-atom-collision-expert');
    var Plate                       = require('common/quantum/models/plate');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    var Spectrometer   = require('./spectrometer');
    var Battery        = require('./battery');
    var HeatingElement = require('./heating-element');

    /**
     * Constants
     */
    var Constants = require('../constants');

    
    /**
     * Wraps the update function in 
     */
    var DischargeLampsSimulation = LasersSimulation.extend({

        defaults: _.extend(LasersSimulation.prototype.defaults, {
            elementProperties: undefined,
            current: 0,
            maxCurrent: 0
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond: Constants.FPS,
                deltaTimePerFrame: Constants.DT
            }, options);
            
            LasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:elementProperties', this.elementPropertiesChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            LasersSimulation.prototype.initComponents.apply(this, arguments);

            this.electrons = new Backbone.Collection();
            this.electronSources = new Backbone.Collection();
            this.electronSinks = new Backbone.Collection();
            this.electronAcceleration = new Vector2();

            this.listenTo(this.electrons, 'remove', this.modelRemoved);

            this.listenTo(this.electronSources, 'electron-produced', this.electronProducedFromSource);

            this.spectrometer = new Spectrometer();
            this.spectrometer.listenTo(this.photons, 'add', this.spectrometer.photonEmitted);

            // Make the battery
            this.battery = new Battery({
                maxVoltage: -DischargeLampsSimulation.MAX_VOLTAGE, 
                minVoltage:  DischargeLampsSimulation.MAX_VOLTAGE
            });
            this.listenTo(this.battery, 'change:voltage', this.batteryVoltageChanged);

            // Make the plates
            this.setLeftHandPlate(new Plate({
                simulation: this,
                electromotiveForce: this,
                point1: Constants.CATHODE_START,
                point2: Constants.CATHODE_END
            }));

            this.setRightHandPlate(new Plate({
                simulation: this,
                electromotiveForce: this,
                point1: Constants.ANODE_START,
                point2: Constants.ANODE_END
            }));

            // Make the heating elements
            this.leftHandHeatingElement = new HeatingElement({
                position: Constants.CATHODE_LOCATION
            });

            this.rightHandHeatingElement = new HeatingElement({
                position: Constants.ANODE_LOCATION
            });

            // Make the discharge tube
            var x = Constants.CATHODE_LOCATION.x - Constants.ELECTRODE_LEFT;
            var y = Constants.CATHODE_LOCATION.y - Constants.CATHODE_LENGTH / 2 - Constants.ELECTRODE_TOP;
            var length = Constants.ANODE_LOCATION.x - Constants.CATHODE_LOCATION.x + Constants.ELECTRODE_LEFT + Constants.ELECTRODE_RIGHT;
            var height = Constants.CATHODE_LENGTH + Constants.ELECTRODE_TOP + Constants.ELECTRODE_BOTTOM;
            this.tube = new Tube({
                origin: new Vector2(x, y), 
                width: length, 
                height: height
            });
            this.addModel(this.tube);
        },

        updateModels: function(time, deltaTime) {
            LasersSimulation.prototype.updateModels.apply(this, arguments);

            for (var i = 0; i < this.electrons.length; i++)
                this.electrons.at(i).update(time, deltaTime);
        },

        checkCollisions: function(deltaTime) {
            LasersSimulation.prototype.checkCollisions.apply(this, arguments);

            this.checkElectronAtomCollisions();
        },

        checkElectronAtomCollisions: function() {
            // Check for collisions between electrons and atoms
            for (var i = 0; i < this.atoms.length; i++) {
                var atom = this.atoms.at(i);
                for (var j = 0; j < this.electrons.length; j++) {
                    var electron = this.electrons.at(j);
                    ElectronAtomCollisionExpert.detectAndDoCollision(atom, electron);
                }
            }
        },

        addModel: function(model) {
            LasersSimulation.prototype.addModel.apply(this, arguments);

            if (model instanceof ElectronSink)
                this.electronSinks.add(model);

            if (model instanceof ElectronSource)
                this.electronSources.add(model);
        },

        removeModel: function(model) {
            LasersSimulation.prototype.removeModel.apply(this, arguments);

            if (model instanceof Electron)
                this.electrons.remove(model);
        },

        addElectron: function(electron) {
            electron.setAcceleration(this.getElectronAcceleration());
            this.electrons.add(electron);
            this.bodies.add(electron);
        },

        setVoltage: function(voltage) {
            // Set the potential of the plates
            if (voltage > 0) {
                this.leftHandPlate.set('potential', voltage);
                this.rightHandPlate.set('potential', 0);
            }
            else {
                this.leftHandPlate.set('potential', 0);
                this.rightHandPlate.set('potential', -voltage);
            }
            
            this.trigger('voltage-changed', this, voltage);
        },

        getVoltage: function() {
            return this.leftHandPlate.getPotential() - this.rightHandPlate.getPotential();
        },

        getTube: function() {
            return this.tube;
        },

        getSpectrometer: function() {
            return this.spectrometer;
        },

        getBattery: function() {
            return this.battery;
        },

        setLeftHandPlate: function(plate) {
            if (this.leftHandPlate)
                this.stopListening(this.leftHandPlate);
            this.leftHandPlate = plate;
            this.listenTo(this.leftHandPlate, 'change', this.potentialChanged);
            this.listenTo(this.leftHandPlate, 'electron-produced', this.electronProduced);
        },

        getLeftHandPlate: function() {
            return this.leftHandPlate;
        },

        setRightHandPlate: function(plate) {
            if (this.rightHandPlate)
                this.stopListening(this.rightHandPlate);
            this.rightHandPlate = plate;
            this.listenTo(this.rightHandPlate, 'change', this.potentialChanged);
            this.listenTo(this.rightHandPlate, 'electron-produced', this.electronProduced);
        },

        getRightHandPlate: function() {
            return this.rightHandPlate;
        },

        getLeftHandHeatingElement: function() {
            return this.leftHandHeatingElement;
        },

        getRightHandHeatingElement: function() {
            return this.rightHandHeatingElement;
        },

        setHeatingElementsEnabled: function(heatingElementsEnabled) {
            this.leftHandHeatingElement.set('enabled', heatingElementsEnabled);
            this.rightHandHeatingElement.set('enabled', heatingElementsEnabled);
        },

        /**
         * Sets the electron production mode to continuous or single-shot. Also enables/disables
         * the heating elements.
         */
        setElectronProductionMode: function(electronProductionMode ) {
            for (var i = 0; i < this.electronSources.length; i++)
                this.electronSources.at(i).set('electronProductionMode', electronProductionMode);
            
            this.setHeatingElementsEnabled(electronProductionMode === ElectronSource.CONTINUOUS_MODE);
        },

        setElectronAcceleration: function(potentialDiff, plateSeparation) {
            this.electronAcceleration.set(potentialDiff / plateSeparation, 0);
        },

        setElementProperties: function(elementProperties) {
            this.set('elementProperties', elementProperties);
        },

        getElementProperties: function() {
            return this.get('elementProperties');
        },

        getAtomicStates: function() {
            return this.getElementProperties().getStates();
        },

        setMaxCurrent: function(maxCurrent) {
            this.set('maxCurrent', maxCurrent);
        },

        setCurrent: function(value, factor) {
            if (factor !== undefined)
                this.set('current', value * factor);
            else
                this.set('current', value);
        },

        getCurrent: function() {
            return this.get('current');
        },

        elementPropertiesChanged: function(simulation, elementProperties) {
            for (var i = 0; i < this.atoms.length; i++)
                this.atoms.at(i).setElementProperties(elementProperties);
            
            this.trigger('energy-levels-changed', this);
        },

        batteryVoltageChanged: function(battery, voltage) {
            this.setVoltage(voltage);
        },

        potentialChanged: function() {
            var potentialDiff = this.leftHandPlate.getPotential() - this.rightHandPlate.getPotential();

            // Determine the acceleration that electrons will experience
            this.setElectronAcceleration(
                potentialDiff * Constants.ELECTRON_ACCELERATION_CALIBRATION_FACTOR, 
                this.leftHandPlate.getPosition().distance(this.rightHandPlate.getPosition())
            );

            for (var i = 0; i < this.electrons.length; i++)
                this.electrons.at(i).setAcceleration(this.electronAcceleration);

            // Calling setCurrent() ensures that the current flows in the correct direction
            this.setCurrent(this.get('current'));
        },

        currentChanged: function(simulation, current) {
            // Compute the temperature of the heating element. The max temperature, corresponding to
            //   the maxCurrent, is 255. This is because it's used in a filter for the graphic image.
            this.leftHandHeatingElement.setTemperature(0);
            this.rightHandHeatingElement.setTemperature(0);
            var temperature = 255 * current * 1000 / this.get('maxCurrent'); 
            // Original PhET Note: The 1000 here works, but I haven't dug into
            //   exactly why it's needed.

            // Set the current of the appropriate plate and the temperature of the appropriate heating element
            if (this.leftHandPlate.getPotential() > this.rightHandPlate.getPotential()) {
                this.leftHandPlate.setCurrent(current);
                this.rightHandPlate.setCurrent(0);
                this.leftHandHeatingElement.set('temperature', temperature);
            }
            else {
                this.rightHandPlate.setCurrent(current);
                this.leftHandPlate.setCurrent(0);
                this.rightHandHeatingElement.set('temperature', temperature);
            }
        },

        electronProduced: function(source, electron) {
            this.addElectron(electron);
        },

        electronProducedFromSource: function(source, electron) {
            for (var i = 0; i < this.electronSinks.length; i++)
                this.electronSinks.at(i).addElectron(electron);
        },

    }, Constants.DischargeLampsSimulation);

    return DischargeLampsSimulation;
});
