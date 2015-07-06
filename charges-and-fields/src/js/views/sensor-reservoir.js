define(function(require) {

    'use strict';

    var _ = require('underscore');

    var Sensor = require('models/sensor');

    var ObjectReservoir = require('views/object-reservoir');
    var SensorView      = require('views/sensor');

    var Constants = require('constants');

    /**
     * The E-Field sensor reservoir
     */
    var SensorReservoir = ObjectReservoir.extend({

        numDecorationAttempts: 210,

        initialize: function(options) {
            options = _.extend({
                labelText: 'E-Field Sensors'
            }, options);

            ObjectReservoir.prototype.initialize.apply(this, [options]);
        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the scene as a
         *   dummy object.  Note the dummy object will not be added
         *   to the simulation until it gets turned into a real
         *   object after the user drops it.
         */
        createDummyObject: function() {
            var model = new Sensor();
            var view = new SensorView({
                simulation: this.simulation,
                model: model,
                mvt: this.mvt,
                interactive: false
            });
            return view;
        },

        /**
         * Creates the actual object based off of the position of the
         *   dummy object and adds it to the simulation/scene.
         */
        createAndAddObject: function(dummyObject) {
            var sensor = new Sensor({
                position: dummyObject.get('position')
            });
            this.simulation.addSensor(sensor);
        }

    });


    return SensorReservoir;
});