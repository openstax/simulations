define(function (require) {

    'use strict';


    var SoundSimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var TwoSourceInterferenceSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Two Source Interference',
                name: 'two-source-interference-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return TwoSourceInterferenceSimView;
});
