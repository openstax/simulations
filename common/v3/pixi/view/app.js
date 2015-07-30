define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView = require('../../app/app');

    /**
     * This is a version of the AppView that has asset preloading
     *   capabilities.  When extending this view, one must pass
     *   in an array from assets (from Assets.getAssetList() for
     *   example).  Calling the AppView.load function will then
     *   start the assets downloading and won't call AppView's
     *   postLoad function until the sim views AND the assets
     *   have been loaded.
     */
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

            var onComplete = _.bind(function(){
                this.assetsLoaded = true;
                this.trigger('assets-loaded');
            }, this);

            if (this.assets.length > 0) {
                var assetLoader = PIXI.loader;
                assetLoader.add(this.assets);
                assetLoader.once('complete', onComplete);
                assetLoader.load();
            }
            else {
                onComplete();
            }
        },
    });

    return PixiAppView;
});