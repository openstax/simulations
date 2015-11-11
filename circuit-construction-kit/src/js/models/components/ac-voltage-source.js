define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Battery = require('models/components/battery');

    var Constants = require('constants');
    
    /**
     * An alternating-current voltage source
     */
    var ACVoltageSource = Battery.extend({

        defaults: _.extend({}, Battery.prototype.defaults, {
            time: 0,
            amplitude: 10,
            frequency: 0.5 //Hz
        }),

        initialize: function(attributes, options) {
            Battery.prototype.initialize.apply(this, [attributes, options]);
        },

        getVoltageDrop: function() {
            var scale = Math.sin(this.get('time') * this.get('frequency') * Math.PI * 2);
            return this.get('amplitude') * scale;
        },

        update: function(time, deltaTime) {
            this.set('time', this.get('time') + deltaTime);
        },

        resetDynamics: function() {
            this.set('time', 0);
        }

    });

    return ACVoltageSource;
});