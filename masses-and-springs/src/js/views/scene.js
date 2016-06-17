define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var AppView            = require('common/v3/app/app');

    var SpringView = require('views/spring');
    var BodyView   = require('views/body');

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
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);


            var scale;
            if (AppView.windowIsShort()) {
                scale = Constants.Scene.SHORT_SCREEN_PX_PER_METER;
                this.viewOriginX = 100;
                this.viewOriginY = 15;
            }
            else {
                scale = Constants.Scene.PX_PER_METER;
                this.viewOriginX = 0;
                this.viewOriginY = 0;
            }

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );

            this.initLayers();
            this.initSprings(this.simulation, this.simulation.springs);
            this.initBodies(this.simulation, this.simulation.bodies);

            this.listenTo(this.simulation.bodies, 'change:y', this.checkIntersect);
        },

        initLayers: function() {

            this.toolsLayer  = new PIXI.Container();
            this.bodyLayer   = new PIXI.Container();
            this.springLayer = new PIXI.Container();

            this.stage.addChild(this.toolsLayer);
            this.stage.addChild(this.bodyLayer);
            this.stage.addChild(this.springLayer);
        },


        initSprings: function(simulation, springs){

            this.springViews = [];

            springs.each(function(spring, iter){
                var springView = new SpringView({
                    model: spring,
                    mvt: this.mvt
                });
                this.springLayer.addChild(springView.displayObject);
                this.springViews.push(springView);
            }, this);

        },

        initBodies: function(simulation, bodies){

            this.bodyViews = [];

            bodies.each(function(body, iter){
                var bodyView = new BodyView({
                    model: body,
                    mvt: this.mvt
                });
                this.bodyLayer.addChild(bodyView.displayObject);
                this.bodyViews.push(bodyView);
            }, this);
        },

        initTools: function(tools){
            _.each(tools, function(tool){
                this.toolsLayer.addChild(tool.displayObject);
            }, this);
        },

        reset: function() {
            var i;

            // Clear body views
            for (i = this.bodyViews.length - 1; i >= 0; i--) {
                this.bodyViews[i].removeFrom(this.bodyViews[i].displayObject.parent);
                this.bodyViews.slice(i, 1);
            }

            // Clear spring views
            for (i = this.springViews.length - 1; i >= 0; i--) {
                this.springViews[i].removeFrom(this.springLayer);
                this.springViews.slice(i, 1);
            }

            // Add new ones
            this.initSprings(this.simulation, this.simulation.springs);
            this.initBodies(this.simulation, this.simulation.bodies);
        },

        checkIntersect: function(body){

            var systemsToCheck = this.simulation.systems.reject(function(system){
                return system.hasBody();
            });

            _.each(systemsToCheck, function(system){
                if(body.hook.intersects(system.spring.hitArea)){
                    system.addBody(body);
                }
            });
        },

        setVolume: function(setting){
            _(this.bodyViews).each(function(bodyView){
                bodyView.setVolume(setting);
            });

            _(this.springViews).each(function(springView){
                springView.setVolume(setting);
            });
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MassesAndSpringsView;
});
