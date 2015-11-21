define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');

    /**
     * CurrentSource model for the MNA circuit
     */
    var MNACurrentSource = MNAElement.extend({

    	/**
    	 * Initializes the MNACompanionBattery's properties with provided initial values
    	 */
    	init: function(node0, node1, current) {
    	    MNAElement.prototype.init.apply(this, [null, node0, node1]);

    	    this.current = current;
    	}

    });


    return MNACurrentSource;
});