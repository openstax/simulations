define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

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
        },
        
        initGraphics: function() {
            BaseGreenhouseSceneView.prototype.initGraphics.apply(this, arguments);

            this.initClouds();
        },

        initClouds: function() {
            this.cloudViews = [];

            this.clouds = new PIXI.DisplayObjectContainer();
            this.backgroundLayer.addChild(this.clouds);

            this.cloudsReset(this.simulation.clouds);
        },

        cloudsReset: function(clouds) {
            // Remove old photon views
            for (var i = this.cloudViews.length - 1; i >= 0; i--) {
                this.cloudViews[i].removeFrom(this.clouds);
                this.cloudViews.splice(i, 1);
            }

            // Add new photon views
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
        }

    });

    return GreenhouseEffectSceneView;
});
