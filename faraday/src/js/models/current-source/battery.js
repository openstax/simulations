define(function (require) {

    'use strict';

    var AbstractCurrentSource = require('models/current-source');

    /**
     * Battery is the model of a DC battery.
     */
    var Battery = AbstractCurrentSource.extend();

    return Battery;
});
