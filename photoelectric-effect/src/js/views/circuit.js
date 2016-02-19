define(function(require) {

    'use strict';

    var $ = require('jquery');
    var PIXI = require('pixi');
    var PixiView = require('common/v3/pixi/view');
    var NoUiSlider = require('nouislider');
    require('../../../node_modules/wnumb/wNumb');

    var Assets = require('assets');
    var Constants = require('constants');

    // CSS
    require('css!../../../bower_components/nouislider/distribute/nouislider.min.css');
    require('less!styles/circuit.less');

    var CircuitView = PixiView.extend({
        events: {},

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initCircuit();
            this.initGraphics();

            this.listenTo(this.model, 'change:circuitIsPositive', this.updateCircuitState);
        },

        initCircuit: function() {
            var slider = $('.voltageSlider')[0];
            var voltageLabel = $('.voltageSliderLabel')[0];
            var model = this.model;

            NoUiSlider.create(slider, {
                start: 0,
                step: .20,
                range: {
                    'min': -8,
                    'max': 8
                },
                pips: {
                    mode: 'positions',
                    values: [0, 50, 100],
                    density: 1
                },
                format: wNumb({
                    'decimals': 2,
                    'postfix': ' V'
                })
            });

            slider.noUiSlider.on('update', function(values, handle) {
                voltageLabel.innerHTML = values[handle];
                // the .replace is to undo the string formatting,'7.5 V' -> 7.5
                model.set('circuitIsPositive', (values[handle].replace(/(^\d+)(.+$)/i,'$1')>=0));
            });
        },

        initGraphics: function() {
            var circuitA = Assets.createSprite(Assets.Images.CIRCUIT_A);
            circuitA.x = 60;
            circuitA.y = 180;
            circuitA.scale = new PIXI.Point(.85, .85);
            this.circuitA = circuitA;
            this.displayObject.addChild(this.circuitA);

            var circuitB = Assets.createSprite(Assets.Images.CIRCUIT_B);
            circuitB.x = 60;
            circuitB.y = 180;
            circuitB.scale = new PIXI.Point(.85, .85);
            circuitB.visible = false;
            this.circuitB = circuitB;
            this.displayObject.addChild(this.circuitB);

            var circuitEndL = Assets.createSprite(Assets.Images.CIRCUIT_END_LEFT);
            circuitEndL.x = 160;
            circuitEndL.y = 175;
            this.circuitEndL = circuitEndL;
            this.displayObject.addChild(this.circuitEndL);

            var circuitEnd = Assets.createSprite(Assets.Images.CIRCUIT_END);
            circuitEnd.x = 620;
            circuitEnd.y = 175;
            this.circuitEnd = circuitEnd;
            this.displayObject.addChild(this.circuitEnd);

            var circuitBackgroundLoop = Assets.createSprite(Assets.Images.CIRCUIT_BACKGROUND_LOOP);
            circuitBackgroundLoop.x = 131;
            circuitBackgroundLoop.y = 165;
            this.circuitBackgroundLoop = circuitBackgroundLoop;
            this.displayObject.addChild(this.circuitBackgroundLoop);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        updateCircuitState: function(model, circuitIsPositive) {
            this.circuitA.visible = circuitIsPositive;
            this.circuitB.visible = !circuitIsPositive;
        }

    }, Constants.CircuitView);

    return CircuitView;
});
