define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView = require('../app/app');

    var PixiAppView = AppView.extend({

    	assets: [],
        
        initialize: function(options) {
            AppView.prototype.initialize.apply(this, [options]);
        },

        load: function() {
        	this.$el.empty();
        	this.showLoading();
        	
        	this.on('sim-views-initialized assets-loaded', function() {
        		if (this.simViewsInitialized && this.assetsLoaded)
        			this.postLoad();
        	});

        	this.loadAssets();
        	this.initSimViews();
        },

    	loadAssets: function() {
            this.assetsLoaded = false;
            var assetLoader = new PIXI.AssetLoader(this.assets);
            assetLoader.onComplete = _.bind(function(){
                this.assetsLoaded = true;
                this.trigger('assets-loaded');
            }, this);
            assetLoader.load();
        },
    });

    return PixiAppView;
});