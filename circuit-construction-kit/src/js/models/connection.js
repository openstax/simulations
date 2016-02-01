define(function (require) {

    'use strict';

    var PooledObject = require('common/pooled-object/pooled-object');


    var JunctionConnection = PooledObject.extend({

        init: function(junction) {
            this.junction = junction;
        },

        getJunction: function() {
            return this.junction;
        },

        getVoltageAddon: function() {
            return 0;
        },

        equals: function(obj) {
            if (obj instanceof JunctionConnection && obj.junction === this.junction)
                return true;
            return false;
        }

    });


    var BranchConnection = PooledObject.extend({

        init: function(branch, dist) {
            this.branch = branch;
            this.dist = dist;
        },

        getJunction: function() {
            return this.branch.get('startJunction');
        },

        getBranch: function() {
            return this.branch;
        },

        getVoltageAddon: function() {
            var resistance = this.branch.get('resistance');
            var length = this.branch.getLength();
            var resistivity = resistance / length; // Infer a resistivity.
            var incrementalResistance = this.dist * resistivity;
            var current = this.branch.get('current');
            var voltage = current * incrementalResistance; // The sign is probably right
            return voltage;
        },

        equals: function(obj) {
            return false;
        }

    });


    var Connection = {
        JunctionConnection: JunctionConnection,
        BranchConnection: BranchConnection
    };


    return Connection;
});