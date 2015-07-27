define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var CapacitorLabSceneView = require('views/scene');
    var DielectricSceneView   = require('views/scene/dielectric');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var IntroSceneView = DielectricSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            DielectricSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            DielectricSceneView.prototype.initGraphics.apply(this, arguments);

        },

        initEFieldDetector: function() {
            // We don't want the dielectric version of the e-field reader
            CapacitorLabSceneView.prototype.initEFieldDetector.apply(this, arguments);
        },

    });

    return IntroSceneView;
});
