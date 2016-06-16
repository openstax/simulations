define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var AppView            = require('common/v3/app/app');
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
            this.initLadybugTraceView();
            this.initLadybugView();
            this.initRemoteControlView();
        },

        initMVT: function() {
            // Use whichever dimension is smaller
            var usableWidth = this.width - RemoteControlView.PANEL_WIDTH - RemoteControlView.RIGHT;
            var usableHeight = this.height - 62 - 8;

            if (AppView.windowIsShort())
                usableWidth -= RemoteControlView.PANEL_WIDTH + RemoteControlView.RIGHT;

            var scale;
            if (usableWidth < usableHeight)
                scale = usableWidth / Constants.MIN_SCENE_DIAMETER;
            else
                scale = usableHeight / Constants.MIN_SCENE_DIAMETER;

            if (AppView.windowIsShort()) {
                // Center between the two columns
                this.viewOriginX = Math.round(this.width / 2);
                this.viewOriginY = Math.round(usableHeight / 2);
            }
            else {
                // Center in the usable area on the left
                this.viewOriginX = Math.round(usableWidth / 2);
                this.viewOriginY = Math.round(usableHeight / 2);
            }

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );

            this.simulation.setBounds(
                this.mvt.viewToModelX(this.viewOriginX - usableWidth  / 2), 
                this.mvt.viewToModelY(this.viewOriginY - usableHeight / 2), 
                this.mvt.viewToModelX(this.viewOriginX + usableWidth  / 2), 
                this.mvt.viewToModelY(this.viewOriginY + usableHeight / 2)
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

        reset: function() {
            this.ladybugTraceView.clearTraces();
            this.ladybugView.reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return LadybugMotionSceneView;
});
