define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LadybugView       = require('views/ladybug');
    var LadybugTraceView  = require('views/ladybug-trace');
    var RemoteControlView = require('views/remote-control');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var LadybugMotionSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initLadybugView();
            this.initLadybugTraceView();
            this.initRemoteControlView();
        },

        initMVT: function() {
            // Use whichever dimension is smaller
            var usableWidth = this.width - RemoteControlView.PANEL_WIDTH - RemoteControlView.RIGHT;
            var usableHeight = this.height - 62 - 8;
            var scale;
            if (usableWidth < usableHeight)
                scale = usableWidth / Constants.MIN_SCENE_DIAMETER;
            else
                scale = usableHeight / Constants.MIN_SCENE_DIAMETER;

            this.viewOriginX = Math.round(usableWidth / 2); // Center
            this.viewOriginY = Math.round(usableHeight / 2); // Center

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );

            this.simulation.setBounds(
                this.mvt.viewToModelX(0), 
                this.mvt.viewToModelY(0), 
                this.mvt.viewToModelX(usableWidth), 
                this.mvt.viewToModelY(usableHeight)
            );
        },

        initLadybugView: function() {
            this.ladybugView = new LadybugView({
                model: this.simulation.ladybug,
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.stage.addChild(this.ladybugView.displayObject);
            this.$ui.append(this.ladybugView.el);
        },

        initLadybugTraceView: function() {
            this.ladybugTraceView = new LadybugTraceView({
                model: this.simulation,
                mvt: this.mvt
            });
            this.stage.addChild(this.ladybugTraceView.displayObject);
        },

        initRemoteControlView: function() {
            this.remoteControlView = new RemoteControlView({
                model: this.simulation.ladybug,
                simulation: this.simulation
            });
            this.remoteControlView.displayObject.x = this.width  - RemoteControlView.RIGHT;
            this.remoteControlView.displayObject.y = this.height - RemoteControlView.BOTTOM;
            this.stage.addChild(this.remoteControlView.displayObject);
            this.$ui.append(this.remoteControlView.el);
            this.remoteControlView.$el.css({
                'top': (this.height - RemoteControlView.BOTTOM - RemoteControlView.PANEL_HEIGHT) + 'px'
            });
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return LadybugMotionSceneView;
});
