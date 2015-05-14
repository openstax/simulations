define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var BaseGreenhouseSceneView = require('views/scene/base-greenhouse');
    var GlassPaneView           = require('views/glass-pane');

    var Assets    = require('assets');
    var Constants = require('constants');

    /**
     * Scene view fro the Greenhouse Effect tab
     */
    var GlassLayersSceneView = BaseGreenhouseSceneView.extend({

        initialize: function(options) {
            BaseGreenhouseSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.glassPanes, 'reset',          this.glassPanesReset);
            this.listenTo(this.simulation.glassPanes, 'add',            this.glassPaneAdded);
            this.listenTo(this.simulation.glassPanes, 'remove destroy', this.glassPaneRemoved);
        },
        
        initGraphics: function() {
            BaseGreenhouseSceneView.prototype.initGraphics.apply(this, arguments);

            this.initGlassPanes();
        },

        initGlassPanes: function() {
            this.glassPaneViews = [];

            this.glassPanes = new PIXI.DisplayObjectContainer();
            this.backgroundLayer.addChild(this.glassPanes);

            this.glassPanesReset(this.simulation.glassPanes);
        },

        glassPanesReset: function(glassPanes) {
            // Remove old photon views
            for (var i = this.glassPaneViews.length - 1; i >= 0; i--) {
                this.glassPaneViews[i].removeFrom(this.glassPanes);
                this.glassPaneViews.splice(i, 1);
            }

            // Add new photon views
            glassPanes.each(function(glassPane) {
                this.createAndAddGlassPaneView(glassPane);
            }, this);
        },

        glassPaneAdded: function(glassPane, glassPanes) {
            this.createAndAddGlassPaneView(glassPane);
        },

        glassPaneRemoved: function(glassPane, glassPanes) {
            for (var i = this.glassPaneViews.length - 1; i >= 0; i--) {
                if (this.glassPaneViews[i].model === glassPane) {
                    this.glassPaneViews[i].removeFrom(this.glassPanes);
                    this.glassPaneViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddGlassPaneView: function(glassPane) {
            var glassPaneView = new GlassPaneView({ 
                model: glassPane,
                mvt: this.mvt
            });
            this.glassPanes.addChild(glassPaneView.displayObject);
            this.glassPaneViews.push(glassPaneView);
        }

    });

    return GlassLayersSceneView;
});
