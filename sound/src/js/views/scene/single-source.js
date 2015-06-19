define(function(require) {

    'use strict';

    var SoundSceneView = require('views/scene');

    /**
     *
     */
    var SingleSourceSceneView = SoundSceneView.extend({

        initialize: function(options) {
            SoundSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            SoundSceneView.prototype.initGraphics.apply(this, arguments);

            this.initListenerView();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);


        },

    });

    return SingleSourceSceneView;
});
