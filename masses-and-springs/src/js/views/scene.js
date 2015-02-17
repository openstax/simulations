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
    var BodyView = require('views/body');

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
            this.initBodies(this.simulation, this.simulation.bodies);

            this.listenTo(this.simulation.bodies, 'change:hook', this.checkIntersect);
        },

        initLayers: function() {

            this.bodyLayer    =   new PIXI.DisplayObjectContainer();
            this.springLayer    =   new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.bodyLayer);
            this.stage.addChild(this.springLayer);
        },


        initSprings: function(simulation, springs){

            springs.each(function(spring, iter){
                var springView = new SpringView({
                    mvt: this.mvt,
                    model: spring
                });
                this.springLayer.addChild(springView.displayObject);
            }, this);

        },

        initBodies: function(simulation, bodies){

            bodies.each(function(body, iter){
                var bodyView = new BodyView({
                    mvt: this.mvt,
                    model: body
                });
                this.bodyLayer.addChild(bodyView.displayObject);
            }, this);
        },

        checkIntersect: function(body){

            this.simulation.systems.each(function(system){

                if(body.hook.intersects(system.spring.hitArea)){
                    system.addBody(body);
                }
            });

        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MassesAndSpringsView;
});
