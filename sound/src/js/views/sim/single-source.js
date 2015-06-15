define(function (require) {

    'use strict';


    var SoundSimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var SingleSourceSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Source',
                name: 'single-source-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return SingleSourceSimView;
});
