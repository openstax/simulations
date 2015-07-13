define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var CapacitorLabSceneView = require('views/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var DielectricSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);


        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return DielectricSceneView;
});
