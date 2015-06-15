define(function (require) {

    'use strict';


    var SoundSimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var ReflectionInterferenceSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Interference by Reflection',
                name: 'reflection-interference-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return ReflectionInterferenceSimView;
});
