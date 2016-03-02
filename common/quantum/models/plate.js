define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Electrode      = require('./electrode');
    var ElectronSource = require('./electron-source');
    var ElectronSink   = require('./electron-sink');

    /**
     * A composite Electrode that comprises an ElectronSource and an ElectronSink
     */
    var Plate = Electrode.extend({

        defaults: _.extend({}, Electrode.prototype.defaults, {
            simulation: undefined,
            electromotiveForce: undefined
        }),

        /**
         * Initializes the Plate
         */
        initialize: function(attributes, options) {
            Electrode.prototype.initialize.apply(this, [attributes, options]);

            this.source = new ElectronSource({
                electromotiveForce: this.get('electromotiveForce'), 
                point1: this.get('point1'), 
                point2: this.get('point2'), 
                plate: this
            });
            
            this.sink = new ElectronSink({
                simulation: this.get('simulation'), 
                point1: this.get('point1'), 
                point2: this.get('point2')
            });

            this.get('simulation').addModel(this.source);
            this.get('simulation').addModel(this.sink);
        },

        setCurrent: function(current) {
            this.source.setCurrent(current);
        },

        getSource: function() {
            return this.source;
        },

        setEmittingLength: function(length) {
            this.source.setLength(length);
        },

        produceElectron: function() {
            return this.source.produceElectron();
        }

    });

    return Plate;
});