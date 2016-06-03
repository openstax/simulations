define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView         = require('common/v3/pixi/view');
    var WavelengthColors = require('common/colors/wavelength');
    var Colors           = require('common/colors/colors');

    var LampView = require('views/lamp');

    var Assets = require('assets');

    /**
     * Create a different version of the LampView that doesn't control its own position
     */
    var ArrayLampView = LampView.extend({

        updatePosition: function(model, position) {
            // Let the LampArrayView handle positioning
        }

    });

    var LampArrayView = PixiView.extend({

        numLamps: 8,

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
        },

        initGraphics: function() {
            this.lampViews = [];

            for (var i = 0; i < this.numLamps; i++) {
                var lampView = new ArrayLampView({
                    model: this.model,
                    mvt: this.mvt,
                    modelWidth: 74
                });

                this.lampViews.push(lampView);
                this.displayObject.addChild(lampView.displayObject);
            }

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
            
            for (var i = 0; i < this.lampViews.length; i++)
                this.lampViews[i].updateMVT(mvt);

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            var width = this.lampViews[0].displayObject.width;

            for (var i = 0; i < this.lampViews.length; i++) {
                var displayObject = this.lampViews[i].displayObject;
                displayObject.x = viewPosition.x + (i - this.numLamps / 2 + 0.5) * width;
                displayObject.y = viewPosition.y;
            }
        },

    });
    
    return LampArrayView;
});
