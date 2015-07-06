define(function(require) {

    'use strict';

    var HelpLabelView = require('common/help-label/index');

    var SoundSceneView = require('views/scene');
    var ListenerView   = require('views/listener');
    var BoxView        = require('views/box');

    /**
     *
     */
    var VariableAirPressureSceneView = SoundSceneView.extend({

        initialize: function(options) {
            SoundSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            SoundSceneView.prototype.initGraphics.apply(this, arguments);

            this.initListenerView();
            this.initBoxView();
        },

        initListenerView: function() {
            this.listenerView = new ListenerView({
                model: this.simulation.personListener,
                mvt: this.mvt,
                disableMovement: true
            });

            this.stage.addChild(this.listenerView.displayObject);
        },

        initBoxView: function() {
            this.boxView = new BoxView({
                model: this.simulation,
                mvt: this.mvt
            });

            this.boxView.displayObject.x = this.speakerView.displayObject.x;
            this.boxView.displayObject.y = this.speakerView.displayObject.y;

            // Add it under the speaker view so the speaker renders on top
            var speakerIndex = this.stage.getChildIndex(this.speakerView.displayObject);
            this.stage.addChildAt(this.boxView.displayObject, speakerIndex);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);

            this.boxView.update(time, deltaTime, paused);
        },

        removeAirFromBox: function() {
            this.boxView.removeAir();
        },

        addAirToBox: function() {
            this.boxView.addAir();
        },

        resetBox: function() {
            this.boxView.resetAir();
        }

    });

    return VariableAirPressureSceneView;
});
