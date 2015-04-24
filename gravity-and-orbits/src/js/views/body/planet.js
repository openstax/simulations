define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a planet.
     */
    var PlanetView = BodyView.extend({

        textureBodyWidthRatio: 0.7,

        initialize: function(options) {
            this.lowMass  = this.model.get('referenceMass') * (1 - BodyView.GENERIC_BODY_THRESHOLD * 2);
            this.highMass = this.model.get('referenceMass') * (1 + BodyView.GENERIC_BODY_THRESHOLD);

            BodyView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BodyView.prototype.initGraphics.apply(this);

            this.genericPlanet = Assets.createSprite(Assets.Images.PLANET);
            this.genericPlanet.anchor.x = 0.5;
            this.genericPlanet.anchor.y = 0.5;
            this.genericPlanet.visible = false;
            this.bodyContainer.addChild(this.genericPlanet);
        },

        updateMass: function(body, mass) {
            if (mass > this.highMass || mass < this.lowMass) {
                this.genericPlanet.visible = true;
                this.body.visible = false;
            }
            else {
                this.genericPlanet.visible = false;
                this.body.visible = true;
            }
        }

    });

    return PlanetView;
});