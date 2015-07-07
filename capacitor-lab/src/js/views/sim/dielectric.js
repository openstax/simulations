define(function (require) {

    'use strict';

    var CapacitorLabSimView = require('views/sim');

    var Constants = require('constants');

    var dielectricHtml = require('text!templates/dielectric.html');

    /**
     * 
     */
    var DielectricSimView = CapacitorLabSimView.extend({

        /**
         * Templates
         */
        dielectricTemplate: _.template(dielectricHtml),

        /**
         * Dom event listeners
         */
        events: _.extend({}, CapacitorLabSimView.prototype.events, {

        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Dielectric',
                name: 'dielectric',
            }, options);

            CapacitorLabSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Renders page content
         */
        renderScaffolding: function() {
            CapacitorLabSimView.prototype.renderScaffolding.apply(this, arguments);

            var tempMaterialsList = [{
                label: 'Custom',
                config: {}
            }, {
                label: 'Teflon (2.1)',
                config: {}
            }, {
                label: 'Paper (3.5)',
                config: {}
            }, {
                label: 'Glass (4.7)',
                config: {}
            }];

            var data = {
                Constants: Constants,
                unique: this.cid,
                materials: tempMaterialsList
            };

            this.$('.sim-controls-group-2').append(this.dielectricTemplate(data));

            // Turn basic select into a nice one
            this.$('select').selectpicker();
        }

    });

    return DielectricSimView;
});
