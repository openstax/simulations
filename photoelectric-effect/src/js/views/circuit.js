define(function(require) {

    'use strict';

    var $          = require('jquery');
    var PIXI       = require('pixi');
    var NoUiSlider = require('nouislider');
    require('wnumb');

    var PixiView = require('common/v3/pixi/view');
    
    var DischargeLampsConstants = require('discharge-lamps/constants');

    var BatteryView = require('views/battery');

    var Assets = require('assets');
    var Constants = require('constants');

    // CSS
    require('css!../../../bower_components/nouislider/distribute/nouislider.min.css');
    require('less!styles/circuit.less');

    var CircuitView = PixiView.extend({
        events: {},

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:circuitIsPositive', this.updateCircuitState);
        },

        initGraphics: function() {
            var wires = Assets.createSprite(Assets.Images.WIRES);
            // wires.x = 400;
            // wires.y = 258;
            wires.anchor.x = 0.5;
            wires.scale = new PIXI.Point(0.42, 0.42);
            this.wires = wires;
            this.displayObject.addChild(wires);

            this.wireWidth = wires.height * (42 / 548);

            var circuitEndL = Assets.createSprite(Assets.Images.PLATE);
            circuitEndL.x = -240;
            circuitEndL.y = -75;
            this.circuitEndL = circuitEndL;
            this.displayObject.addChild(this.circuitEndL);

            var circuitEnd = Assets.createSprite(Assets.Images.PLATE);
            circuitEnd.x = 220;
            circuitEnd.y = -75;
            this.circuitEnd = circuitEnd;
            this.displayObject.addChild(this.circuitEnd);

            var circuitBackgroundLoop = Assets.createSprite(Assets.Images.CIRCUIT_BACKGROUND_LOOP);
            circuitBackgroundLoop.x = -269;
            circuitBackgroundLoop.y = -85;
            this.circuitBackgroundLoop = circuitBackgroundLoop;
            this.displayObject.addChild(this.circuitBackgroundLoop);

            this.initBattery();

            this.updateMVT(this.mvt);
        },

        initBattery: function() {
            this.batteryView = new BatteryView({
                model: this.simulation.battery,
                mvt: this.mvt
            });

            this.batteryView.setPosition(0, this.wires.height - this.wireWidth / 2);

            this.displayObject.addChild(this.batteryView.displayObject);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.batteryView.updateMVT(mvt);
            console.log(mvt.modelToViewDeltaX(DischargeLampsConstants.CATHODE_LENGTH));

            this.displayObject.x = mvt.modelToViewX(400);
            this.displayObject.y = mvt.modelToViewY(250);
        },

        updateCircuitState: function(model, circuitIsPositive) {
            this.circuitA.visible = circuitIsPositive;
            this.circuitB.visible = !circuitIsPositive;
        }

    }, Constants.CircuitView);

    return CircuitView;
});
