define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');

    var BodyView = require('views/body');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var GOSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initBodies();
        },

        initBodies: function() {
            this.sun = new BodyView({

            });
            this.stage.addChild(this.sun.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (!paused) {
                // Update particles to match new lattice
                this.updateBodies(time, deltaTime);
            }
        },

        updateBodies: function(time, deltaTime) {
            this.sun.update(time, deltaTime);
        }

    });

    return GOSceneView;
});
