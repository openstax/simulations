define(function(require) {
    
    'use strict';

    var FaradayAppView = require('views/app');
    
    var GeneratorBarMagnetSimView     = require('./sim/bar-magnet');
    var GeneratorPickupCoilSimView    = require('./sim/pickup-coil');
    var GeneratorElectromagnetSimView = require('./sim/electromagnet');
    var GeneratorTransformerSimView   = require('./sim/transformer');
    var GeneratorGeneratorSimView     = require('./sim/generator');

    var Assets = require('assets');

    var GeneratorAppView = FaradayAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            GeneratorBarMagnetSimView,
            GeneratorPickupCoilSimView,
            GeneratorElectromagnetSimView,
            GeneratorTransformerSimView,
            GeneratorGeneratorSimView
        ],

        /**
         * Overrides the default postRender function so we select the "Generator"
         *   tab to start instead of the first tab.
         */
        postRender: function() {
            FaradayAppView.prototype.postRender.apply(this, arguments);

            this.$('.sim-tab').last().click();
        }

    });

    return GeneratorAppView;
});
