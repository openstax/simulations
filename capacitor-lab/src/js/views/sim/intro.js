define(function (require) {

    'use strict';

    var CapacitorLabSimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var IntroSimView = CapacitorLabSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Introduction',
                name: 'intro',
            }, options);

            CapacitorLabSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return IntroSimView;
});
