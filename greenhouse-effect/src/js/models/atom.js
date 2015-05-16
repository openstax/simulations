define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');
    var Rectangle          = require('common/math/rectangle');

    /**
     * Class that represents an atom in the model.  This is used
     *   in the microscopic view of photon abosorption.  This is
     *   an abstract class, and it is expected that it be
     *   extended by specific atoms.
     */
    var Atom = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            radius: 0,
            mass:   0,
            color: ''
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);
            
            this._bounds = new Rectangle();
        },

        getBoundingRect: function() {
            return this._bounds.set(
                this.get('position').x - this.get('radius'),
                this.get('position').y - this.get('radius'),
                this.get('radius') * 2,
                this.get('radius') * 2
            );
        }

    });

    return Atom;
});
