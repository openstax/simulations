define(function(require) {

    'use strict';

    var HelpLabelView = require('common/help-label/index');

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
            this.initHelpLabels();
        },

        initHelpLabels: function() {
            this.helpLabels = [];

            var person = this.listenerView.person;
            this.helpLabels.push(new HelpLabelView({
                attachTo: this.listenerView,
                title: 'Listener can be moved\nright and left',
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

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);


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

    return SingleSourceSceneView;
});
