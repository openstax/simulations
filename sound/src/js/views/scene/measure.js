define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RulerView = require('common/pixi/view/ruler');

    var SoundSceneView = require('views/scene');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var MeasureSceneView = SoundSceneView.extend({

        initialize: function(options) {
            SoundSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            SoundSceneView.prototype.initGraphics.apply(this, arguments);

            this.initRuler();
        },

        initRuler: function() {

        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);


        },

    });

    return MeasureSceneView;
});
