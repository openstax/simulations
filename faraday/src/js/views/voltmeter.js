define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var VoltmeterView = PixiView.extend({

        /**
         * Initializes the new VoltmeterView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:enabled',  this.updateVisibility);
            this.updateVisibility(this.model, this.model.get('enabled'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.background = new PIXI.Container();

            this.body = Assets.createSprite(Assets.Images.VOLTMETER);
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 1;
            this.background.addChild(this.body);
            this.background.y = -40;

            this.ticks  = new PIXI.Graphics();
            this.needle = new PIXI.Graphics();

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.ticks);
            this.displayObject.addChild(this.needle);

            this.initLabel();
            this.initResistor();
            this.initProbes();

            this.updateMVT(this.mvt);
        },

        initLabel: function() {

        },

        initResistor: function() {
            this.resistor = Assets.createSprite(Assets.Images.VOLTMETER_RESISTOR);
            this.resistor.anchor.x = 0.5;
            this.resistor.anchor.y = 0.5;
            this.resistor.y = 40;

            this.background.addChild(this.resistor);
        },

        initProbes: function() {
            var leftProbe  = Assets.createSprite(Assets.Images.VOLTMETER_PROBE_WHITE);
            var rightProbe = Assets.createSprite(Assets.Images.VOLTMETER_PROBE_BLACK);
            leftProbe.anchor.x = rightProbe.anchor.x = 0.5;
            leftProbe.anchor.y = rightProbe.anchor.y = 1;
            leftProbe.y = rightProbe.y = this.resistor.y;
            leftProbe.x = -Math.floor(this.resistor.width / 2);
            rightProbe.x = Math.floor(this.resistor.width / 2);

            this.background.addChildAt(leftProbe, 0);
            this.background.addChildAt(rightProbe, 0);
        },

        drawTicks: function() {

        },

        drawNeedle: function() {

        },



        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var scale = this.mvt.modelToViewDeltaX(1);
            this.background.scale.x = scale;
            this.background.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateVisibility: function(model, enabled) {
            this.displayObject.visible = enabled;
        }

    });


    return VoltmeterView;
});