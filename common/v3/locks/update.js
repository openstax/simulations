define(function (require) {

    'use strict';

	/**
	 * Helper function for updating a view's inputs from a model's 
	 *   attributes without causing a loop of updates between the 
	 *   model and the view
	 */
	var updateLock = function(callback) {
	    if (this.inputtingProperty)
	        return;

	    this.updatingProperty = true;
	    callback.apply(this);
	    this.updatingProperty = false;
	};

	return updateLock;

});