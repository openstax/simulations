define(function(require) {

    'use strict';

    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a moon.
     */
    var MoonView = BodyView.extend({

        textureBodyWidthRatio: 0.571,

        bodyLabelOffsetX: BodyView.prototype.bodyLabelOffsetX * -1,
        massLabelOffsetY: BodyView.prototype.massLabelOffsetY * -1,

        initialize: function(options) {
            this.lowMass  = this.model.get('referenceMass') * (1 - BodyView.GENERIC_BODY_THRESHOLD * 2);
            this.highMass = this.model.get('referenceMass') * (1 + BodyView.GENERIC_BODY_THRESHOLD);

            BodyView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BodyView.prototype.initGraphics.apply(this);

            this.genericMoon = Assets.createSprite(Assets.Images.MOON_GENERIC);
            this.genericMoon.anchor.x = 0.5;
            this.genericMoon.anchor.y = 0.5;
            this.genericMoon.visible = false;
            this.bodyContainer.addChild(this.genericMoon);
        },

        updateMass: function(body, mass) {
            BodyView.prototype.updateMass.apply(this, arguments);
            
            if (mass > this.highMass || mass < this.lowMass) {
                this.genericMoon.visible = true;
                this.body.visible = false;
            }
            else {
                this.genericMoon.visible = false;
                this.body.visible = true;
            }
        }

    });

    return MoonView;
});