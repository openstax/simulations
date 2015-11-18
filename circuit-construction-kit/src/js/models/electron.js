define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');

    /**
     * An electron which moves along a branch
     */
    var Electron = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            branch: undefined,
            distAlongWire: 0,
            radius: 0.1,
            deleted: false
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            this.on('change:distAlongWire', this.updatePosition);
            this.on('change:branch',        this.branchChanged);
        },

        setLocation: function(branch, x) {
            if (isNaN(x))
                throw 'x was NaN, for electron distance along branch.';
            else if (!branch.containsScalarLocation(x)) 
                throw 'No location in branch.';
            
            this.set('branch', branch);
            this.set('distAlongWire', x);
        },

        updatePosition: function() {
            var pt = this.get('branch').getPosition(this.get('distAlongWire'));

            if (isNaN(pt))
                throw 'Point was NaN, pt=' + pt + ', dist=' + this.get('distAlongWire') + ', wire length=' + this.get('branch').getLength();
            
            this.setPosition(pt);
        },

        branchChanged: function(model, branch) {
            if (this.previous('branch'))
                this.stopListening(this.previous('branch'));
            this.listenTo(branch, 'change', this.updatePosition);
            this.updatePosition();
        },

        isNaN: function(vector) {
            return isNaN(vector.x) || isNaN(vector.y);
        },

    });

    return Electron;
});