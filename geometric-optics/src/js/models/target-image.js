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

        defaults: _.extend({}, SourceObject.prototype.defaults, {
            scale: 0,
            strength: 1 // 1 is the strongest image and 0 is the weakest (invisible)
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
            this.listenTo(this.sourceObject, 'change:type',        this.updateType);

            this.listenTo(this.lens, 'change:focalLength', this.update);
            this.listenTo(this.lens, 'change:diameter',    this.updateStrength);

            // Set up initial point values
            this.update();

        },

        update: function() {
            this.updatePosition(this.sourceObject, this.sourceObject.get('position'));
            this.updateSecondPoint(this.sourceObject, this.sourceObject.get('secondPoint'));
            this.updateScale();
            this.updateStrength(this.lens, this.lens.get('diameter'));
        },

        updatePosition: function(sourceObject, position) {
            this.setPosition(this.getTargetPoint(position));
        },

        updateSecondPoint: function(sourceObject, secondPoint) {
            this.setSecondPoint(this.getTargetPoint(secondPoint));
        },

        updateType: function(sourceObject, type) {
            this.set('type', type);
        },

        updateScale: function() {
            var focalLength = this.getFocalLength();
            var scale = focalLength / (this.getObjectLensDistance() - focalLength);
            // if (scale === Infinity) Not sure if infinity is going to throw errors yet
            //     scale = 1000;
            this.set('scale', scale);
        },

        updateStrength: function(lens, diameter) {
            this.set('strength', 0.2 + (diameter / 1.3));
        },

        getTargetPoint: function(sourcePoint) {
            return this._point.set(
                this.lens.get('position').x - sourcePoint.x,
                this.lens.get('position').y - sourcePoint.y
            );
        },

        getObjectLensDistance: function() {
            return this.lens.get('position').x - this.sourceObject.get('position').x;
        },

        getFocalLength: function() {
            return this.lens.get('focalLength');
        },

        isVirtualImage: function() {
            return this.getObjectLensDistance() < this.getFocalLength();
        }

    });

    return TargetImage;
});
