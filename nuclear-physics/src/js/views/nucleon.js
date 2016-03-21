define(function(require) {

    'use strict';

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SubatomicParticleView     = require('views/subatomic-particle');

    var Nucleon = require('models/nucleon');

    /**
     * 
     */
    var NucleonView = SubatomicParticleView.extend({

        initialize: function(options) {
            SubatomicParticleView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:type', this.typeChanged);
        },

        createSprite: function() {
            if (this.model.get('type') === Nucleon.PROTON)
                return ParticleGraphicsGenerator.generateProton(this.mvt);
            else
                return ParticleGraphicsGenerator.generateNeutron(this.mvt);
        },

        typeChanged: function() {
            this.updateSprite();
        }

    });


    return NucleonView;
});