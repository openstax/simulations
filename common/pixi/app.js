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
        	this.showLoading();
        	this.loadAssets();
        },

    	loadAssets: function() {
            this.assetsLoaded = false;
            var assetLoader = new PIXI.AssetLoader(this.assets);
            assetLoader.onComplete = _.bind(function(){
                this.assetsLoaded = true;
                this.render();
                this.postRender();
                this.hideLoading();
            }, this);
            assetLoader.load();
        },
    });

    return PixiAppView;
});