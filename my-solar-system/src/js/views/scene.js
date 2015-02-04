define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');
    var GridView      = require('common/pixi/view/grid');
    var Vector2       = require('common/math/vector2');
    var Rectangle     = require('common/math/rectangle');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var MSSSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.gridView = new GridView({
                origin: new Vector2(this.width / 2, this.height / 2),
                bounds: new Rectangle(0, 0, this.width, this.height),
                gridSize: 100,
                lineColor: '#fff',
                lineAlpha: 0.1
            });
            this.stage.addChild(this.gridView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MSSSceneView;
});
