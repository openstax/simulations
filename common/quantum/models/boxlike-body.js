define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Body = require('./body');

    /**
     * A spherical body with mass and momentum
     */
    var BoxlikeBody = Body.extend({

        collidable: true,

        defaults: _.extend({}, Body.prototype.defaults, {
            mass: Number.POSITIVE_INFINITY,
            minimumWidth: 100,
            leftWallVx: 0
            corner1: undefined,
            corner2: undefined
        }),

        initialize: function(attributes, options) {
            Body.prototype.initialize.apply(this, [attributes, options]);

            this.set('corner1', new Vector2(this.get('corner1')));
            this.set('corner2', new Vector2(this.get('corner2')));
            this.corner1 = this.get('corner1');
            this.corner2 = this.get('corner2');
            this.center  = new Vector2();

            this.minX = Number.NEGATIVE_INFINITY;
            this.minY = Number.NEGATIVE_INFINITY;
            this.maxX = Number.POSITIVE_INFINITY;
            this.maxY = Number.POSITIVE_INFINITY;
            this.bounds = new Rectangle();

            this.prevPosition = new Vector2(this.get('position'));
            this.prevVelocity = new Vector2(this.get('velocity'));
        },

        getCM: function() {
            return this.center;
        },

        getMomentOfInertia: function() {
            return Number.MAX_VALUE;
        },

        setBounds: function(minX, minY, maxX, maxY) {
            this.setState(
                this.corner1.set(this.minX, this.minY), 
                this.corner2.set(this.maxX, this.maxY)
            );
        },

        getBounds: function() {
            this.bounds.set(this.minX, this.minY, this.getWidth(), this.getHeight());
            return this.bounds;
        },

        setState: function(corner1, corner2) {
            this.corner1.set(corner1);
            this.corner2.set(corner2);
            this.maxX = Math.max(corner1.x, corner2.x);
            this.maxY = Math.max(corner1.y, corner2.y);
            this.minX = Math.min(Math.min(corner1.x, corner2.x), this.maxX - this.get('minimumWidth'));
            this.minY = Math.min(corner1.y, corner2.y);
            this.center.set(
                (this.maxX + this.minX) / 2,
                (this.maxY + this.minY) / 2
            );
            this.setPosition(this.minX, this.minY);
        },

        getCorner1X: function() {
            return this.corner1.x;
        },

        getCorner1Y: function() {
            return this.corner1.y;
        },

        getCorner2X: function() {
            return this.corner2.x;
        },

        getCorner2Y: function() {
            return this.corner2.y;
        },

        getCenter: function() {
            return this.center;
        },

        getMinX: function() {
            return this.minX;
        },

        getMinY: function() {
            return this.minY;
        },

        getMaxX: function() {
            return this.maxX;
        },

        getMaxY: function() {
            return this.maxY;
        },

        getWidth: function() {
            return Math.abs(this.corner2.x - this.corner1.x);
        },

        getHeight: function() {
            return Math.abs(this.corner2.y - this.corner1.y);
        },

        getContactOffset: function(body) {
            return 0;
        },

        getLeftWallVx: function() {
            return this.get('leftWallVx');
        },

        /**
         * Overrides setPosition function to keep track of the previous position
         */
        setPosition: function(x, y, options) {
            this.prevPosition.set(this.get('acceleration'));

            Particle.prototype.setPosition.apply(this, arguments);
        },

        /**
         * Overrides setVelocity function to keep track of the previous velocity
         */
        setVelocity: function(x, y, options) {
            this.prevVelocity.set(this.get('acceleration'));

            Particle.prototype.setVelocity.apply(this, arguments);
        },

        getPreviousPosition: function() {
            return this.prevPosition;
        },

        getPreviousVelocity: function() {
            return this.prevVelocity;
        }

    });

    return BoxlikeBody;
});