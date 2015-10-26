define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView   = require('common/v3/pixi/view');
    var SliderView = require('common/v3/pixi/view/slider');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var BatteryView = PixiView.extend({

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.battery = Assets.createSprite(Assets.Images.BATTERY);
            this.battery.anchor.x = 0.5;
            this.battery.anchor.y = 1;

            this.displayObject.addChild(this.battery);

            this.initControls();

            this.updateMVT(this.mvt);
        },

        initControls: function() {
            // Create the slider view
            this.sliderView = new SliderView({
                start: this.model.get('maxVoltage') * this.model.get('amplitude'),
                range: {
                    min: -this.model.get('maxVoltage'),
                    max:  this.model.get('maxVoltage')
                },
                orientation: 'horizontal',
                direction: 'rtl',

                width: 100,
                backgroundHeight: 4,
                backgroundColor: '#fff',
                backgroundAlpha: 1,
                backgroundLineColor: '#000',
                backgroundLineWidth: 1,
                backgroundLineAlpha: 0.3,

                handleSize: 10,
                handleColor: '#fff',
                handleAlpha: 1,
                handleLineColor: '#000',
                handleLineWidth: 1,
            });
            this.sliderView.displayObject.x = Math.floor(-this.sliderView.width / 2);
            this.displayObject.addChild(this.sliderView.displayObject);

            // Bind events
            this.listenTo(this.sliderView, 'slide', function(voltage, prev, event) {
                event.stopPropagation();
                this.model.set('amplitude', voltage / this.model.get('maxVoltage'));
            });
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(BatteryView.MODEL_WIDTH);
            var scale = targetWidth / this.battery.texture.width;
            this.battery.scale.x = scale;
            this.battery.scale.y = scale;

            this.sliderView.displayObject.y = -Math.floor(this.battery.height * 0.75);

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        /**
         * 
         */
        update: function() {
            
        }

    }, Constants.BatteryView);


    return BatteryView;
});