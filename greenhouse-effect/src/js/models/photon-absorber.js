define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * 
     */
    var PhotonAbsorber = Backbone.Model.extend({

        update: function(deltaTime) {},

        absorbPhoton: function(photon) {
            this.trigger('photon-absorbed', photon);
        }

    });

    return PhotonAbsorber;
});
