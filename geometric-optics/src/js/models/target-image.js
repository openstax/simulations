define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var SourceObject = require('models/source-object');

    var Constants = require('constants');

    /**
     * This class represents an image of the original object seen or
     *   projected through the lens.  It listens for changes in the
     *   original object and uses the properties of the lens and
     *   relative positions of the points in the source object and
     *   the lens.  Note that it extends the SourceObject because 
     *   the target image is supposed to be an image representation
     *   of the source object and will therefore have shared traits.
     */
    var TargetImage = SourceObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            scale: 0,
            upright: false // Whether or not the object is right-side-up
        }),

        initialize: function(attributes, options) {
            SourceObject.prototype.initialize.apply(this, arguments);

            if (options && options.sourceObject)
                this.sourceObject = options.sourceObject;
            else
                throw 'sourceObject is a required option for TargetImage.';

            if (options && options.lens)
                this.lens = options.lens;
            else
                throw 'lens is a required option for TargetImage.';

            // Cached objects
            this._point = new Vector2();

            // Listen for changes in the sourceObject
            this.listenTo(this.sourceObject, 'change:position',    this.update);
            this.listenTo(this.sourceObject, 'change:secondPoint', this.updateSecondPoint);
            this.listenTo(this.lens, 'change:focalLength', this.update);

            // Set up initial point values
            this.update();
        },

        update: function() {
            this.updatePosition(this.sourceObject, this.sourceObject.get('position'));
            this.updateSecondPoint(this.sourceObject, this.sourceObject.get('secondPoint'));
            this.updateScale();
            this.updateOrientation();
        },

        updatePosition: function(sourceObject, position) {
            this.set('position', this.getTargetPoint(position));
        },

        updateSecondPoint: function(sourceObject, secondPoint) {
            this.set('secondPoint', this.getTargetPoint(secondPoint));
        },

        updateScale: function() {
            var focalLength = this.getFocalLength();
            this.set('scale', 100 * focalLength / (this.getObjectLensDistance() - focalLength));
        },

        updateOrientation: function() {
            if (this.isVirtualImage())
                this.set('upright', true);
            else
                this.set('upright', false);
        },

        getTargetPoint: function(sourcePoint) {
            return this._point.set(
                this.lens.get('position').x - sourcePoint.x,
                this.lens.get('position').y - sourcePoint.y
            );
        },

        getObjectLensDistance: function() {
            return this.lens.get('position').x - sourcePoint.x;
        },

        getFocalLength: function() {
            return this.lens.get('focalLength');
        },

        isVirtualImage: function() {
            return this.getObjectLensDistance() < this.focalLength();
        }

    });

    return TargetImage;
});
