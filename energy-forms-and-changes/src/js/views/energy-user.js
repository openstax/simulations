define(function(require) {

    'use strict';

    var EnergySystemsElementView = require('views/energy-systems-element');

    var EnergyUserView = EnergySystemsElementView.extend({

        showEnergyChunks: function() {
            EnergySystemsElementView.prototype.showEnergyChunks.apply(this);
            this.model.set('energyChunksVisible', true);
        },

        hideEnergyChunks: function() {
            EnergySystemsElementView.prototype.hideEnergyChunks.apply(this);
            this.model.set('energyChunksVisible', false);
        },

    });

    return EnergyUserView;
});