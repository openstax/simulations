define(function (require) {

    'use strict';

    var CCKSimView = require('views/sim');

    /**
     * "DCOnly" version of the original
     */
    var DCOnlySimView = CCKSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'circuit-construction-kit-dc'
            }, options);

            CCKSimView.prototype.initialize.apply(this, [options]);
        }

    });

    return DCOnlySimView;
});
