define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');

    var ExternalFieldControlView = require('views/external-field-control');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var EFDSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initExternalFieldControlView();
        },

        initExternalFieldControlView: function() {
            this.externalFieldControlView = new ExternalFieldControlView({
                model: this.simulation.fieldLaw,
                simulation: this.simulation
            });

            this.externalFieldControlView.displayObject.x = this.width  - ExternalFieldControlView.RIGHT;
            this.externalFieldControlView.displayObject.y = this.height - ExternalFieldControlView.BOTTOM;

            this.stage.addChild(this.externalFieldControlView.displayObject);
            this.$ui.append(this.externalFieldControlView.el);

            this.externalFieldControlView.$el.css({
                'top': (this.height - ExternalFieldControlView.BOTTOM - ExternalFieldControlView.PANEL_HEIGHT) + 'px'
            });
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return EFDSceneView;
});
