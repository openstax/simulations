define(function(require) {

    'use strict';

    var HelpLabelView = require('common/v3/help-label/index');

    var SoundSceneView = require('views/scene');
    var WaveMediumView = require('views/wave-medium');
    var SpeakerView    = require('views/speaker');
    var ListenerView   = require('views/listener');

    /**
     *
     */
    var TwoSourceInterferenceSceneView = SoundSceneView.extend({

        minSceneHeightInMeters: 16,

        initialize: function(options) {
            SoundSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.personListener, 'change:origin',  this.speaker1Moved);
            this.listenTo(this.simulation.personListener, 'change:origin2', this.speaker2Moved);
        },

        initGraphics: function() {
            SoundSceneView.prototype.initGraphics.apply(this, arguments);

            this.initSecondWaveMediumView();
            this.initSecondSpeakerView();
            this.initListenerView();
            this.initHelpLabels();

            this.speaker1Moved(this.simulation.personListener, this.simulation.personListener.get('origin'));
            this.speaker2Moved(this.simulation.personListener, this.simulation.personListener.get('origin2'));
        },

        initHelpLabels: function() {
            this.helpLabels = [];

            var person = this.listenerView.person;
            this.helpLabels.push(new HelpLabelView({
                attachTo: this.listenerView,
                title: 'Listener can be moved\nin all directions',
                style: {
                    font: '12pt Helvetica Neue',
                    fill: '#222',
                    align: 'center'
                },
                anchor: {
                    x: 0.5,
                    y: 0
                },
                position: {
                    x: ((1 - person.anchor.x) * person.width) / 2,
                    y: ((1 - person.anchor.y) * person.height) + 12
                }
            }));

            _.each(this.helpLabels, function(helpLabel){
                helpLabel.render();
            }, this);
        },

        initSecondWaveMediumView: function() {
            this.waveMedium2View = new WaveMediumView({
                model: this.simulation.waveMedium,
                mvt: this.mvt,
                width: this.width,
                height: this.height
            });
            this.$ui.append(this.waveMediumView.el);
        },

        initSecondSpeakerView: function() {
            this.speaker2View = new SpeakerView({
                model: this.simulation,
                mvt: this.mvt,
                bindToSecondOrigin: true
            });

            this.stage.addChild(this.speaker2View.displayObject);
        },

        initListenerView: function() {
            this.listenerView = new ListenerView({
                model: this.simulation.personListener,
                mvt: this.mvt,
                disableYMovement: false
            });

            this.stage.addChild(this.listenerView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);

            this.waveMedium2View.update(time, deltaTime, paused);
            this.speaker2View.update(time, deltaTime, paused);
        },

        speaker1Moved: function(personListener, origin) {
            var viewPosition = this.mvt.modelToView(origin);
            this.waveMediumView.setPosition(viewPosition.x, viewPosition.y);
        },

        speaker2Moved: function(personListener, origin2) {
            var viewPosition = this.mvt.modelToView(origin2);
            this.waveMedium2View.setPosition(viewPosition.x, viewPosition.y);
        },

        showHelpLabels: function() {
            for (var i = 0; i < this.helpLabels.length; i++)
                this.helpLabels[i].show();
        },

        hideHelpLabels: function() {
            for (var i = 0; i < this.helpLabels.length; i++)
                this.helpLabels[i].hide();
        }

    });

    return TwoSourceInterferenceSceneView;
});
