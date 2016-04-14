define(function(require) {

    'use strict';

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var NucleusType                    = require('models/nucleus-type');
    var Uranium238Nucleus              = require('models/nucleus/uranium-238');
    var Carbon14Nucleus                = require('models/nucleus/carbon-14');
    var HeavyAdjustableHalfLifeNucleus = require('models/nucleus/heavy-adjustable-half-life');

    var NucleusChooser = require('views/nucleus-chooser');
    var NucleusView    = require('views/nucleus');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var HalfLifeNucleusChooserView = NucleusChooser.extend({

        initialize: function(options) {
            options = _.extend({
                scale: AppView.windowIsShort() ? 16 : 18,
                spacingOffset: AppView.windowIsShort() ? -13 : 0
            }, options);

            NucleusChooser.prototype.initialize.apply(this, [options]);
        },

        /**
         * Creates the views and labels that will be used to render the list
         */
        initItems: function() {
            var items = [];
            var symbolSize = 30;

            // Carbon-14 to Nitrogen-14
            var carbon14   = Carbon14Nucleus.create();
            var nitrogen14 = Carbon14Nucleus.create();
            nitrogen14.decay(); // Decay from Carbon-14 into Nitrogen-14

            items.push({
                isDefault: true,
                nucleusType: NucleusType.CARBON_14,
                start: {
                    label: 'Carbon-14',
                    displayObject: new NucleusView({
                        model: carbon14,
                        mvt: this.mvt,
                        symbolSize: symbolSize,
                        hideNucleons: true
                    }).displayObject
                },
                end: {
                    label: 'Nitrogen-14',
                    displayObject: new NucleusView({
                        model: nitrogen14,
                        mvt: this.mvt,
                        symbolSize: symbolSize,
                        hideNucleons: true
                    }).displayObject
                }
            });

            var largeAtomMVT = new ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0), 
                new Vector2(0, 0), 
                this.scale * 0.4
            );
            var largeAtomSymbolSize = 26;

            // Uranium-238 to Lead-206
            var uranium238 = Uranium238Nucleus.create();
            var lead206    = Uranium238Nucleus.create();
            lead206.decay(); // Uranium-238 to Lead-206

            items.push({
                nucleusType: NucleusType.URANIUM_238,
                start: {
                    label: 'Uranium-238',
                    displayObject: new NucleusView({
                        model: uranium238,
                        mvt: largeAtomMVT,
                        symbolSize: largeAtomSymbolSize,
                        hideNucleons: true
                    }).displayObject
                },
                end: {
                    label: 'Lead-206',
                    displayObject: new NucleusView({
                        model: lead206,
                        mvt: largeAtomMVT,
                        symbolSize: largeAtomSymbolSize,
                        hideNucleons: true
                    }).displayObject
                }
            });

            // Custom to custom decayed
            var custom  = HeavyAdjustableHalfLifeNucleus.create();
            var decayed = HeavyAdjustableHalfLifeNucleus.create();
            decayed.decay();

            items.push({
                nucleusType: NucleusType.HEAVY_CUSTOM,
                start: {
                    label: 'Custom',
                    displayObject: new NucleusView({
                        model: custom,
                        mvt: largeAtomMVT,
                        symbolSize: largeAtomSymbolSize,
                        hideNucleons: true
                    }).displayObject
                },
                end: {
                    label: 'Custom<br>(Decayed)',
                    displayObject: new NucleusView({
                        model: decayed,
                        mvt: largeAtomMVT,
                        symbolSize: largeAtomSymbolSize,
                        hideNucleons: true
                    }).displayObject
                }
            });

            this.items = items;
        }

    });

    return HalfLifeNucleusChooserView;
});
