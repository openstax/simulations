define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var BlockView = require('views/element/block');
    var Assets    = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents a brick model
     */
    var BrickView = BlockView.extend({

        createFrontFace: function(points) {
            return PIXI.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_FRONT));
        },

        createTopFace: function(points) {
            return PIXI.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_TOP));
        },

        createRightFace: function(points) {
            return PIXI.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_RIGHT));
        },

        getColor: function() {
            return BrickView.FILL_COLOR;
        }

    }, Constants.BrickView);

    return BrickView;
});