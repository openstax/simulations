define(function(require) {

    'use strict';
    
    var BasicPhotonView = require('views/photon-basic');
    /**
     * A view that represents a photon
     */
    var PhotonView = BasicPhotonView.extend({


        /**
         * Initializes the new PhotonView.
         */
        initialize: function(options) {
            BasicPhotonView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * This version doesn't need an update function because
         *   it listens to changes in the model.
         */
        update: function() {}

    });

    return PhotonView;
});