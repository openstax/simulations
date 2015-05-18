define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var range = require('common/math/range');

    var BaseGreenhouseSceneView = require('views/scene/base-greenhouse');
    var CloudView               = require('views/cloud');

    var Assets    = require('assets');
    var Constants = require('constants');

    /**
     * Scene view fro the Greenhouse Effect tab
     */
    var GreenhouseEffectSceneView = BaseGreenhouseSceneView.extend({

        initialize: function(options) {
            BaseGreenhouseSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.clouds, 'reset',          this.cloudsReset);
            this.listenTo(this.simulation.clouds, 'add',            this.cloudAdded);
            this.listenTo(this.simulation.clouds, 'remove destroy', this.cloudRemoved);

            this.listenTo(this.simulation.atmosphere, 'change:greenhouseGasConcentration', this.updatePollution);
        },
        
        initGraphics: function() {
            BaseGreenhouseSceneView.prototype.initGraphics.apply(this, arguments);

            this.initClouds();
            this.initPolution();
        },

        initBackground: function() {
            this.bgIceAge = this.createScene(Assets.Images.SCENE_ICE_AGE);
            this.bg1750   = this.createScene(Assets.Images.SCENE_1750);
            this.bgToday  = this.createScene(Assets.Images.SCENE_TODAY);

            if ($(window).height() <= 500) {
                this.bgToday.y += 20;
                this.bg1750.y += 20;
            }

            this.backgroundLayer.addChild(this.bgIceAge);
            this.backgroundLayer.addChild(this.bg1750);
            this.backgroundLayer.addChild(this.bgToday);

            this.bgToday.visible = true;
        },

        initClouds: function() {
            this.cloudViews = [];

            this.clouds = new PIXI.DisplayObjectContainer();
            this.backgroundLayer.addChild(this.clouds);

            this.cloudsReset(this.simulation.clouds);
        },

        initPolution: function() {
            if (this.pollution)
                this.foregroundLayer.removeChild(this.pollution);

            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, Constants.Atmosphere.POLLUTION_TOP_COLOR);
            gradient.addColorStop(1, Constants.Atmosphere.POLLUTION_BOTTOM_COLOR);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);

            this.pollution = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            this.foregroundLayer.addChild(this.pollution);

            this.pollutionRange = range({
                min: Constants.Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION,
                max: Constants.Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION
            });

            this.updatePollution(this.simulation.atmosphere, this.simulation.atmosphere.get('greenhouseGasConcentration'));
        },

        resize: function() {
            BaseGreenhouseSceneView.prototype.resize.apply(this, arguments);

            if (this.initialized) {
                this.setSceneScale(this.bgToday);
                this.setSceneScale(this.bg1750);
                this.setSceneScale(this.bgIceAge);
                this.initPolution();
            }
        },

        cloudsReset: function(clouds) {
            // Remove old cloud views
            for (var i = this.cloudViews.length - 1; i >= 0; i--) {
                this.cloudViews[i].removeFrom(this.clouds);
                this.cloudViews.splice(i, 1);
            }

            // Add new cloud views
            clouds.each(function(cloud) {
                this.createAndAddCloudView(cloud);
            }, this);
        },

        cloudAdded: function(cloud, clouds) {
            this.createAndAddCloudView(cloud);
        },

        cloudRemoved: function(cloud, clouds) {
            for (var i = this.cloudViews.length - 1; i >= 0; i--) {
                if (this.cloudViews[i].model === cloud) {
                    this.cloudViews[i].removeFrom(this.clouds);
                    this.cloudViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddCloudView: function(cloud) {
            var cloudView = new CloudView({ 
                model: cloud,
                mvt: this.mvt
            });
            this.clouds.addChild(cloudView.displayObject);
            this.cloudViews.push(cloudView);
        },

        updatePollution: function(atmosphere, concentration) {
            this.pollution.alpha = 0.2 * this.pollutionRange.percent(concentration);
        },

        showTodayScene: function() {
            this.bgIceAge.visible = false;
            this.bg1750.visible   = false;
            this.bgToday.visible  = true;
        },

        show1750Scene: function() {
            this.bgIceAge.visible = false;
            this.bg1750.visible   = true;
            this.bgToday.visible  = false;
        },

        showIceAgeScene: function() {
            this.bgIceAge.visible = true;
            this.bg1750.visible   = false;
            this.bgToday.visible  = false;
        }

    });

    return GreenhouseEffectSceneView;
});
