define(function (require) {

    'use strict';

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

    var Constants = require('constants');

    var Lens = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            indexOfRefraction: Constants.Lens.DEFAULT_INDEX_OF_REFRACTION,
            radiusOfCurvature: Constants.Lens.DEFAULT_RADIUS_OF_CURVATURE,
            focalLength: 0
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            this.on('change:indexOfRefraction change:radiusOfCurvature', this.updateFocalLength);

            this.updateFocalLength();
        },

        updateFocalLength: function() {
            this.set('focalLength', this.get('radiusOfCurvature') / (
                2 * (this.get('indexOfRefraction') - 1)
            ));
        }

    }, Constants.Lens);

    return Lens;
});
