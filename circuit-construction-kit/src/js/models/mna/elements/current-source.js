define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * CurrentSource model for the MNA circuit
     */
    var MNACurrentSource = function(originalComponent, node0, node1) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNACurrentSource.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNACurrentSource's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            MNAElement.prototype.init.apply(this, arguments);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNACurrentSource, MNAElement);


    return MNACurrentSource;
});