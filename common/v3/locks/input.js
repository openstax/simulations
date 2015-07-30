define(function (require) {

    'use strict';

	/**
	 * Helper function for setting properties on a view object without 
	 *   causing a loop of updates between the model and the view
	 */
    var inputLock = function(callback) {
	    if (this.updatingProperty)
	        return;

	    this.inputtingProperty = true;
	    callback.apply(this);
	    this.inputtingProperty = false;
	};

	return inputLock;

});