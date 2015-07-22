define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var DielectricSceneView = require('views/scene/dielectric');

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

        }

    });

    return IntroSceneView;
});
