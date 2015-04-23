define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var range = require('common/math/range');

    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a planet.
     */
    var PlanetView = BodyView.extend({

        textureBodyWidthRatio: 0.7,

        initialize: function(options) {
            this.massRange = range({ 
                min: this.model.get('minMass'), 
                max: this.model.get('maxMass') 
            });
            this.referenceMassPercent = this.massRange.percent(this.model.get('referenceMass'));

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
            var percent = this.massRange.percent(mass);
            if (Math.abs(percent - this.referenceMassPercent) > BodyView.GENERIC_BODY_THRESHOLD) {
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