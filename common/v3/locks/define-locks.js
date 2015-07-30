define(function (require) {

    'use strict';

    var inputLock = require('./input');
	var updateLock = require('./update');

    /**
     * Function that adds the two functions to a constructor's prototype.
     */
    var defineInputUpdateLocks = function(constructor) {
		constructor.prototype.inputLock = inputLock;
		constructor.prototype.updateLock = updateLock;
    };

	return defineInputUpdateLocks;

});