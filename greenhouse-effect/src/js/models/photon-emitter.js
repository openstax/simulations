define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * 
     */
    var AbstractPhotonEmitter = Backbone.Model.extend({

        defaults: {
            productionRate: 0
        },

        initialize: function(attributes, options) {
            this.timeSincePhotonsProduced = 0;

            this.on('change:productionRate', function() {
                this.timeSincePhotonsProduced = 0;
            });
        },

        update: function(deltaTime) {
            this.timeSincePhotonsProduced += deltaTime;
            var numPhotons = Math.floor(this.get('productionRate') * this.timeSincePhotonsProduced);
            for (var i = 0; i < numPhotons; i++) {
                this.emitPhoton();
                this.timeSincePhotonsProduced = 0;
            }
        },

        emitPhoton: function() {}

    });

    return AbstractPhotonEmitter;
});
