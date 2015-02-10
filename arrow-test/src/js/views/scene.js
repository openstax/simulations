define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');
    var DraggableArrowView = require('common/pixi/view/arrow-draggable');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var TemplateSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            this.arrowViewModel = new DraggableArrowView.ArrowViewModel({
                originX: 300,
                originY: 300,
                targetX: 380,
                targetY: 220
            });

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.arrowView = new DraggableArrowView({ 
                model: this.arrowViewModel
            });

            this.stage.addChild(this.arrowView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return TemplateSceneView;
});
