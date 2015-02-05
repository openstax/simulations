define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var GridView           = require('common/pixi/view/grid');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var BodyView = require('views/body');

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
            this.zoomScale = 1.2;

            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'bodies-reset', this.initBodyViews);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.viewOriginX = Math.round(this.width  / 2);
            this.viewOriginY = Math.round(this.height / 2);
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.zoomScale
            );

            this.initGridView();
            this.initBodyLayer();
            this.initBodyViews(this.simulation, this.simulation.bodies);
        },

        initGridView: function() {
            this.gridView = new GridView({
                origin: new Vector2(this.width / 2, this.height / 2),
                bounds: new Rectangle(0, 0, this.width, this.height),
                gridSize: this.mvt.modelToViewDeltaX(100),
                lineColor: '#fff',
                lineAlpha: 0.1
            });
            this.stage.addChild(this.gridView.displayObject);
        },

        initBodyLayer: function() {
            this.bodyLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.bodyLayer);
        },

        initBodyViews: function(simulation, bodies) {
            this.bodyLayer.removeChildren();

            for (var i = 0; i < bodies.length; i++) {
                var bodyView = new BodyView({
                    model: bodies[i],
                    mvt: this.mvt,
                    color: Constants.BODY_COLORS[i]
                });
                this.bodyLayer.addChild(bodyView.displayObject);
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MSSSceneView;
});
