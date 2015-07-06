define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var WaveMediumView = require('views/wave-medium');
    var SpeakerView    = require('views/speaker');
    var ListenerView   = require('views/listener');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var SoundSceneView = PixiSceneView.extend({

        minSceneHeightInMeters: 12,

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initWaveMediumView();
            this.initSpeakerView();
        },

        initMVT: function() {
            var minimumHeight = this.minSceneHeightInMeters;
            var usableHeight = this.height;
            var scale = usableHeight / minimumHeight;
            
            this.viewOriginX = Math.round(this.width / 2 - (scale * (Constants.DEFAULT_LISTENER_X + 0.95)));
            this.viewOriginY = Math.round(usableHeight / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initWaveMediumView: function() {
            this.waveMediumView = new WaveMediumView({
                model: this.simulation.waveMedium,
                mvt: this.mvt
            });
            this.stage.addChild(this.waveMediumView.displayObject);

            this.waveMediumView.setPosition(this.mvt.modelToViewX(0), this.mvt.modelToViewY(0));
        },

        initSpeakerView: function() {
            this.speakerView = new SpeakerView({
                model: this.simulation,
                mvt: this.mvt
            });

            this.stage.addChild(this.speakerView.displayObject);
        },

        initListenerView: function() {
            this.listenerView = new ListenerView({
                model: this.simulation.personListener,
                mvt: this.mvt
            });

            this.stage.addChild(this.listenerView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.waveMediumView.update(time, deltaTime, paused);
            this.speakerView.update(time, deltaTime, paused);
        },

        showHelpLabels: function() {},

        hideHelpLabels: function() {}

    });

    return SoundSceneView;
});
