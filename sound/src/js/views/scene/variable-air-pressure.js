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
            this.stage.addChild(this.boxView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);

            // TODO: update box view
        }

    });

    return VariableAirPressureSceneView;
});
