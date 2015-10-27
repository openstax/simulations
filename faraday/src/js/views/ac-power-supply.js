define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView   = require('common/v3/pixi/view');
    var SliderView = require('common/v3/pixi/view/slider');
    var Colors     = require('common/colors/colors');

    var SineWaveView = require('views/sine-wave');

    var Assets = require('assets');

    var Constants = require('constants');
    var WAVE_VIEWPORT_SIZE = Constants.ACPowerSupplyView.WAVE_VIEWPORT_SIZE;
    var WAVE_ORIGIN        = Constants.ACPowerSupplyView.WAVE_ORIGIN;
    var AXES_COLOR         = Colors.parseHex(Constants.ACPowerSupplyView.AXES_COLOR);
    var AXES_ALPHA         = Constants.ACPowerSupplyView.AXES_ALPHA;
    var AXES_STROKE_WIDTH  = Constants.ACPowerSupplyView.AXES_STROKE_WIDTH;
    var TICK_COLOR         = Colors.parseHex(Constants.ACPowerSupplyView.TICK_COLOR);
    var TICK_ALPHA         = Constants.ACPowerSupplyView.TICK_ALPHA;
    var TICK_SPACING       = Constants.ACPowerSupplyView.TICK_SPACING;
    var TICK_LENGTH        = Constants.ACPowerSupplyView.TICK_LENGTH;
    var TICK_STROKE_WIDTH  = Constants.ACPowerSupplyView.TICK_STROKE_WIDTH;

    /**
     * 
     */
    var ACPowerSupplyView = PixiView.extend({

        /**
         * Initializes the new ACPowerSupplyView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position',     this.updatePosition);
            this.listenTo(this.model, 'change:enabled',      this.enabledChanged);
            this.listenTo(this.model, 'change:maxAmplitude', this.maxAmplitudeChanged);
            this.listenTo(this.model, 'change:frequency',    this.frequencyChanged);
            this.enabledChanged(this.model, this.model.get('enabled'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.body = Assets.createSprite(Assets.Images.AC_POWER_SUPPLY);
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 1;

            this.displayObject.addChild(this.body);

            this.initSliders();
            this.initValues();
            this.initTitle();
            this.initGraph();

            this.updateMVT(this.mvt);
        },

        initSliders: function() {
            var sliderSettings = {
                width: 96,
                backgroundHeight: 2,
                backgroundColor: '#000',
                backgroundAlpha: 0.4,

                handleColor: '#21366B'
            };

            // Amplitude slider
            this.amplitudeSlider = new SliderView(_.extend({
                start: this.model.get('maxAmplitude'),
                range: {
                    min: Constants.AC_MAXAMPLITUDE_MIN,
                    max: Constants.AC_MAXAMPLITUDE_MAX
                },
                orientation: 'vertical',
                direction: 'rtl'
            }, sliderSettings));

            this.amplitudeSlider.displayObject.x = -87;
            this.amplitudeSlider.displayObject.y = -137;

            // Frequency slider
            this.frequencySlider = new SliderView(_.extend({
                start: this.model.get('frequency'),
                range: {
                    min: Constants.AC_FREQUENCY_MIN,
                    max: Constants.AC_FREQUENCY_MAX
                },
                width: 100
            }, sliderSettings));

            this.frequencySlider.displayObject.x = -62;
            this.frequencySlider.displayObject.y = -24;

            // Bind events
            this.listenTo(this.amplitudeSlider, 'slide', function(amplitude, prev, event) {
                event.stopPropagation();
                this.model.set('maxAmplitude', amplitude);
            });

            this.listenTo(this.frequencySlider, 'slide', function(frequency, prev, event) {
                event.stopPropagation();
                this.model.set('frequency', frequency);
            });

            this.displayObject.addChild(this.amplitudeSlider.displayObject);
            this.displayObject.addChild(this.frequencySlider.displayObject);
        },

        initValues: function() {
            var textSettings = {
                font: '13px Helvetica Neue',
                fill: '#0f0',
                align: 'right'
            };

            this.amplitudeText = new PIXI.Text('50%', textSettings);
            this.frequencyText = new PIXI.Text('50%', textSettings);

            this.amplitudeText.anchor.x = 1;
            this.amplitudeText.x = -68;
            this.amplitudeText.y = -169;

            this.frequencyText.anchor.x = 1;
            this.frequencyText.x = 95;
            this.frequencyText.y = -33;

            this.displayObject.addChild(this.amplitudeText);
            this.displayObject.addChild(this.frequencyText);
        },

        initTitle: function() {
            var title = new PIXI.Text('AC Current Supply', {
                font: '15px Helvetica Neue',
                fill: '#fff',
                align: 'center'
            });

            title.x = -Math.round(title.width / 2);
            title.y = -202;

            this.displayObject.addChild(title);
        },

        initGraph: function() {
            var graphics = new PIXI.Graphics();
            this.graph = graphics;
            this.graph.x = WAVE_ORIGIN.x;
            this.graph.y = WAVE_ORIGIN.y;

            // Axes
            var xLength = WAVE_VIEWPORT_SIZE.width;
            var yLength = WAVE_VIEWPORT_SIZE.height;
            var x;
            var y;

            // Axes
            graphics.lineStyle(AXES_STROKE_WIDTH, AXES_COLOR, AXES_ALPHA);

            // X axis
            graphics.moveTo(-xLength / 2, 0);
            graphics.lineTo( xLength / 2, 0);

            // Y axis
            graphics.moveTo(0, -yLength / 2);
            graphics.lineTo(0,  yLength / 2);

            // Tick marks
            graphics.lineStyle(TICK_STROKE_WIDTH, TICK_COLOR, TICK_ALPHA);

            // X-axis tick marks -- start at the origin and move out in both directions.
            x = TICK_SPACING;
            y = TICK_LENGTH / 2;
            while (x < xLength / 2) {
                graphics.moveTo(x, -y);
                graphics.lineTo(x,  y);

                graphics.moveTo(-x, -y);
                graphics.lineTo(-x,  y);

                x += TICK_SPACING;
            }

            // Y-axis tick marks -- start at the origin and move out in both directions.
            x = TICK_LENGTH / 2;
            y = TICK_SPACING;
            while ( y < yLength / 2 ) {
                graphics.moveTo(-x, y);
                graphics.lineTo( x, y);

                graphics.moveTo(-x, -y);
                graphics.lineTo( x, -y);

                y += TICK_SPACING;
            }

            this.sineWaveView = new SineWaveView({
                viewportWidth:  WAVE_VIEWPORT_SIZE.width,
                viewportHeight: WAVE_VIEWPORT_SIZE.height,
                // Configure cycles so that minimum frequency shows 1 cycle.
                maxCycles: Constants.AC_FREQUENCY_MAX / Constants.AC_FREQUENCY_MIN
            });
            this.sineWaveView.displayObject.x = WAVE_ORIGIN.x;
            this.sineWaveView.displayObject.y = WAVE_ORIGIN.y;

            this.displayObject.addChild(graphics);
            this.displayObject.addChild(this.sineWaveView.displayObject);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(ACPowerSupplyView.MODEL_WIDTH);
            var scale = targetWidth / this.body.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateCursor: function() {

        },

        /**
         * 
         */
        update: function() {
            if (this.model.get('enabled')) {
                var amplitude    = this.model.get('amplitude');
                var maxAmplitude = this.model.get('maxAmplitude');
                var frequency    = this.model.get('frequency');

                if (maxAmplitude === this.previousMaxAmplitude && frequency === this.previousFrequency) {
                    // Just update the moving cursor.
                    this.updateCursor();
                }
                else {
                    // maxAmplitude and/or frequency was changed.

                    // Reset the cursor.
                    // _cursorAngle = 0.0;
                    // _cursorGraphic.setVisible( false );

                    // Update the sine wave.
                    this.sineWaveView.setAmplitude(maxAmplitude);
                    this.sineWaveView.setFrequency(frequency);
                    this.sineWaveView.update();

                    // Save the new values.
                    this.previousMaxAmplitude = maxAmplitude;
                    this.previousFrequency = frequency;
                }
            }
        },

        enabledChanged: function(battery, enabled) {
            this.displayObject.visible = enabled;
        },

        maxAmplitudeChanged: function(battery, maxAmplitude) {
            this.amplitudeText.text = Math.round(maxAmplitude * 100) + '%';
        },

        frequencyChanged: function(battery, frequency) {
            this.frequencyText.text = Math.round(frequency * 100) + '%';
        }

    }, Constants.ACPowerSupplyView);


    return ACPowerSupplyView;
});