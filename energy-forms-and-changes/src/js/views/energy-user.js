define(function(require) {

    'use strict';

    var EnergySystemsElementView = require('views/energy-systems-element');

    var EnergyUserView = EnergySystemsElementView.extend({

        initialize: function(options) {
            EnergySystemsElementView.prototype.initialize.apply(this, [options]);
        }

    });

    return EnergyUserView;
});