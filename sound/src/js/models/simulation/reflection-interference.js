define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var SoundSimulation = require('models/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var ReflectionInterferenceSimulation = SoundSimulation.extend({

        defaults: _.extend({}, SoundSimulation.prototype.defaults, {
            amplitude: Constants.MAX_AMPLITUDE
        })

    });

    return ReflectionInterferenceSimulation;
});
