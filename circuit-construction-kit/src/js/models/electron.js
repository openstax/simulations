define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');

    // var silent = {silent: true };

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

            this._attrs = {};

            this.on('change:distAlongWire', this.updatePosition);
            // this.on('change:branch',        this.branchChanged);

            this.updatePosition();
        },

        setLocation: function(branch, x) {
            if (isNaN(x))
                throw 'x was NaN, for electron distance along branch.';
            else if (!branch.containsScalarLocation(x)) 
                throw 'No location in branch.';
            
            this._attrs.branch = branch;
            this._attrs.distAlongWire = x;
            this.set(this._attrs);
            // this.set('branch', branch);
            // this.set('distAlongWire', x);
        },

        updatePosition: function() {
            // console.log('before/start: ', this.get('branch').getStartPoint())
            // console.log('before/end: '  , this.get('branch').getEndPoint())
            var pt = this.get('branch').getPosition(this.get('distAlongWire'));

            if (this.isNaN(pt))
                throw 'Point was NaN, pt=' + pt + ', dist=' + this.get('distAlongWire') + ', wire length=' + this.get('branch').getLength();
            
            this.setPosition(pt);
            // console.log('after/start: ' , this.get('branch').getStartPoint())
            // console.log('after/end: '   , this.get('branch').getEndPoint())
        },

        branchChanged: function(model, branch) {
            if (this.previous('branch'))
                this.stopListening(this.previous('branch'));
            // this.listenTo(branch, 'start-junction-changed end-junction-changed', this.updatePosition);
            this.updatePosition();
        },

        isNaN: function(vector) {
            return isNaN(vector.x) || isNaN(vector.y);
        }

    });

    return Electron;
});