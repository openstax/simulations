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

            this._type = this.model.get('type');
        },

        update: function(time, deltaTime) {
           SubatomicParticleView.prototype.update.apply(this, arguments);

            if (this._type !== this.model.get('type')) {
                this._type = this.model.get('type');
                this.typeChanged();
            }
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