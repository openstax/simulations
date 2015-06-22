define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RulerView     = require('common/pixi/view/ruler');
    var HelpLabelView = require('common/help-label/index');

    var SoundSceneView    = require('views/scene');
    var ReferenceLineView = require('views/reference-line');

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
            this.initReferenceLines();
            this.initHelpLabels();
        },

        initRuler: function() {
            this.rulerView = new RulerView({
                orientation : 'horizontal',
                pxPerUnit: this.mvt.modelToViewDeltaX(1),
                rulerWidth: 1,
                rulerMeasureUnits : 10,
                units: 'meters',

                ticks : [{
                    size: 8,
                    at: 1,
                    color: '#5A3D01'
                },{
                    size: 4,
                    at: 0.1,
                    color: '#5A3D01'
                }],

                labels: [{
                    font: '16px Arial',
                    at: 1,
                    endAt: 8
                }]
            });

            this.stage.addChild(this.rulerView.displayObject);

            this.rulerView.setPosition(124, 60);
        },

        initReferenceLines: function() {
            this.referenceLine1 = new ReferenceLineView({
                position: {
                    x: 44,
                    y: 0
                },
                height: this.height
            });

            this.referenceLine2 = new ReferenceLineView({
                position: {
                    x: 84,
                    y: 0
                },
                height: this.height
            });

            this.stage.addChild(this.referenceLine1.displayObject);
            this.stage.addChild(this.referenceLine2.displayObject);
        },

        initHelpLabels: function() {
            this.helpLabels = [];

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.rulerView,
                title: 'Use meter stick to measure waves',
                color: '#222',
                font: '12pt Helvetica Neue',
                position: {
                    x: 0,
                    y: 64
                }
            }));

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.stage,
                title: 'Dotted lines can be moved left and right to\nhelp mark measurement points on waves',
                color: '#222',
                font: '12pt Helvetica Neue',
                position : {
                    x: 100,
                    y: this.height - 120
                },
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

    return MeasureSceneView;
});
