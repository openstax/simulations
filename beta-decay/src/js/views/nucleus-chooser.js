define(function(require) {

    'use strict';

    var NucleusType                     = require('models/nucleus-type');
    var Hydrogen3CompositeNucleus       = require('models/nucleus/hydrogen-3-composite');
    var Carbon14CompositeNucleus        = require('models/nucleus/carbon-14-composite');
    var LightAdjustableCompositeNucleus = require('models/nucleus/light-adjustable-composite');

    var NucleusChooser = require('views/nucleus-chooser');
    var NucleusView    = require('views/nucleus');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var BetaDecayNucleusChooserView = NucleusChooser.extend({

        initialize: function(options) {
            options = _.extend({
                scale: 18
            }, options);

            NucleusChooser.prototype.initialize.apply(this, [options]);
        },

        /**
         * Creates the views and labels that will be used to render the list
         */
        initItems: function() {
            var items = [];
            var symbolSize = 36;

            // Hydrogen-3 to Helium-3
            var hydrogen3 = Hydrogen3CompositeNucleus.create();
            var helium3   = Hydrogen3CompositeNucleus.create();
            helium3.decay(); // Decay from Hydrogen-3 into Helium-3

            items.push({
                nucleusType: NucleusType.HYDROGEN_3,
                isDefault: true,
                start: {
                    label: 'Hydrogen-3',
                    displayObject: new NucleusView({
                        model: hydrogen3,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                },
                end: {
                    label: 'Helium-3',
                    displayObject: new NucleusView({
                        model: helium3,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                }
            });

            // Carbon-14 to Nitrogen-14
            var carbon14   = Carbon14CompositeNucleus.create();
            var nitrogen14 = Carbon14CompositeNucleus.create();
            nitrogen14.decay(); // Decay from Carbon-14 into Nitrogen-14

            items.push({
                nucleusType: NucleusType.CARBON_14,
                start: {
                    label: 'Carbon-14',
                    displayObject: new NucleusView({
                        model: carbon14,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                },
                end: {
                    label: 'Nitrogen-14',
                    displayObject: new NucleusView({
                        model: nitrogen14,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                }
            });

            // Custom to custom decayed
            var custom  = LightAdjustableCompositeNucleus.create();
            var decayed = LightAdjustableCompositeNucleus.create();
            decayed.decay();

            items.push({
                nucleusType: NucleusType.LIGHT_CUSTOM,
                start: {
                    label: 'Custom',
                    displayObject: new NucleusView({
                        model: custom,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                },
                end: {
                    label: 'Custom<br>(Decayed)',
                    displayObject: new NucleusView({
                        model: decayed,
                        mvt: this.mvt,
                        symbolSize: symbolSize
                    }).displayObject
                }
            });

            this.items = items;
        }

    });

    return BetaDecayNucleusChooserView;
});
