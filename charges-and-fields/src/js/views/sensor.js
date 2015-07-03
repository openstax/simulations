define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ArrowView = require('common/pixi/view/arrow');

    var ReservoirObjectView = require('views/reservoir-object');

    var Constants = require('constants');
    var RAD_TO_DEG = 180 / Math.PI;

    /**
     * 
     */
    var SensorView = ReservoirObjectView.extend({

        initialize: function(options) {
            options = _.extend({
                radius: 9
            }, options);

            this.simulation = options.simulation;

            ReservoirObjectView.prototype.initialize.apply(this, [options]);

            if (this.interactive) {
                this.listenTo(this.simulation.charges, 'change add remove reset',  this.chargesChanged);
                this.listenTo(this.model, 'change:position', this.updateInfo);

                this.updateInfo();
            }
        },

        initGraphics: function() {
            if (this.interactive) {
                // Add arrow
                this.arrowViewModel = new ArrowView.ArrowViewModel();
                this.arrowView = new ArrowView({
                    model: this.arrowViewModel,
                    tailWidth:  6,
                    headWidth:  18,
                    headLength: 18
                });
                this.displayObject.addChild(this.arrowView.displayObject);    

                // Add text
                var textSettings = {
                    font: '12px Helvetica Neue',
                    fill: '#000',
                    align: 'center'
                };
                this.text = new PIXI.Text('', textSettings);
                this.text.anchor.x = 0.5;
                this.text.anchor.y = -0.4;
                this.displayObject.addChild(this.text);
            }

            ReservoirObjectView.prototype.initGraphics.apply(this, arguments);
        },

        updateInfo: function() {
            var efield = this.simulation.getE(
                this.mvt.viewToModelX(this.displayObject.x),
                this.mvt.viewToModelY(this.displayObject.y) 
            );

            // Update arrow
            this.arrowViewModel.set('targetX', this.mvt.modelToViewDeltaX(efield.x * SensorView.E_VECTOR_SCALE_FACTOR) * 0.01);
            this.arrowViewModel.set('targetY', this.mvt.modelToViewDeltaX(efield.y * SensorView.E_VECTOR_SCALE_FACTOR) * 0.01);

            // Update text
            var magnitude = efield.length() * Constants.EFAC * 0.01;
            var angle = (Math.atan2(-efield.y, efield.x) * RAD_TO_DEG);
            this.text.setText(
                magnitude.toFixed(1) + ' V/m' + '\n' + 
                angle.toFixed(1) + ' deg'
            );
        },

        chargesChanged: function() {
            this.updateInfo();
        }

    }, Constants.SensorView);

    return SensorView;
});