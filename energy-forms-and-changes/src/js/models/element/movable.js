define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var Pool    = require('object-pool');

    var Element = require('models/element');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * 
     */
    var MovableElement = Element.extend({

        defaults: {
            // Physical properties
            position: null,
            verticalVelocity: 0,
            
            // State properties
            userControlled: false,
        },
        
        initialize: function(attributes, options) {
            // Create vectors
            this.set('position', vectorPool.create().set(this.get('position')));

            this.on('change:userControlled', function(model, userControlled) {
                if (userControlled && this.getSupportingSurface()) {
                    this.stopListening(this.getSupportingSurface());
                    this.getSupportingSurface().clearSurface();
                    this.setSupportingSurface(null);
                }
            });
        },

        reset: function() {
            this.set('userControlled', true);
            this.setPosition(0, 0);
            this.set('verticalVelocity', 0);

            Element.prototype.reset.apply(this);
        },

        setX: function(x) {
            this.setPosition(x, this.get('position').y);
        },

        setY: function(y) {
            this.setPosition(this.get('position').x, y);
        },

        translate: function(x, y) {
            var oldPosition = this.get('position');
            var newPosition = vectorPool.create().set(this.get('position'));

            if (x instanceof Vector2)
                this.set('position', newPosition.add(x));
            else
                this.set('position', newPosition.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        },

        setPosition: function(x, y) {
            var oldPosition = this.get('position');
            
            if (x instanceof Vector2)
                this.set('position', vectorPool.create().set(x));
            else
                this.set('position', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        },

        setSupportingSurface: function(supportingSurface) {
            this.set('supportingSurface', supportingSurface);
            if (supportingSurface) {
                this.listenTo(supportingSurface, 'change', function() {
                    this.setPosition(supportingSurface.getCenterX(), supportingSurface.yPos);
                });    
            }
        }

    });

    return MovableElement;
});
