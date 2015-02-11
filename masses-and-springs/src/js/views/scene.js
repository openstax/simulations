define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var Vector2   = require('common/math/vector2');
    // var Rectangle = require('common/math/rectangle');
    // var Colors    = require('common/colors/colors');


    var ModelViewTransform = require('common/math/model-view-transform');
    var PixiSceneView = require('common/pixi/view/scene');

    var SpringView = require('views/spring');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var MassesAndSpringsView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.zoomScale = 1;
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

            this.initLayers();
            this.initSprings(this.simulation, this.simulation.springs);
        },

        initLayers: function() {

            this.springLayer    =   new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.springLayer);
        },


        initSprings: function(simulation, springs){

            _.each(springs, function(spring, iter){
                var springView = new SpringView({
                    mvt: this.mvt,
                    model: spring,
                    width: this.width,
                    height: this.height
                });
                this.springLayer.addChild(springView.displayObject);
            }, this);

        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MassesAndSpringsView;
});
