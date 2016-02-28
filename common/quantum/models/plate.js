define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

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
                electromotiveForce: emf, 
                point1: p1, 
                point2: p2, 
                plate: this
            });
            
            this.sink = new ElectronSink({
                simulation: this.get('simulation'), 
                point1: p1, 
                point2: p2
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