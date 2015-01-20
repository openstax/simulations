define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');
    var Pool    = require('object-pool');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var Constants = require('constants');

    /**
     * This is needed by classes in both tabs.  It just provides some
     *   helper functions for changing a position vector in a way that
     *   leverages Backbone's event system.
     */
    var CarouselAnimator = Backbone.Model.extend({

        defaults: {
            elements: [],
            elementSpacing: Constants.EnergySystemsSimulation.OFFSET_BETWEEN_ELEMENTS,
            activeIndex: 0,
            activeElement: null,
            activeElementPosition: null,
            transitionDuration: Constants.EnergySystemsSimulation.TRANSITION_DURATION
        },
        
        initialize: function(attributes, options) {
            this.initElementPositions();

            // Set the initial active index
            this.activeElementChanged(this, this.get('activeElement'));

            this.on('change:activeIndex',   this.startAnimation);
            this.on('change:activeElement', this.activeElementChanged);
        },

        initElementPositions: function() {
            // Position the elements
            _.each(this.get('elements'), function(element, index) {
                // We can just scale by the difference in index to get the correct offset
                var offset = this.get('elementSpacing').clone().scale(index - this.get('activeIndex'));
                var position = this.get('activeElementPosition').clone().add(offset);
                element.setPosition(position);
                //console.log(position.toString());
            }, this);
        },

        reset: function() {
            this.animating = false;
            this.set('activeIndex', 0, { silent: true });
            this.initElementPositions();
            this.updateElementOpacities();
        },

        activeElementChanged: function(animator, activeElement) {
            var index = _.indexOf(this.get('elements'), activeElement);
            if (index >= 0)
                this.set('activeIndex', index);
            else
                this.set('activeIndex', 0);
        },

        startAnimation: function(animator, activeIndex) {
            this.elapsedTransitionTime = 0;
            this.easedPercent = 0;
            if (this.targetPositionTranslation)
                vectorPool.remove(this.targetPositionTranslation);
            this.targetPositionTranslation = this.translationToTargetPosition();
            this.animating = true;
            //console.log(this.targetPositionTranslation.toString());
        },

        stopAnimation: function() {
            this.animating = false;
            this.trigger('destination-reached', this.activeElement(), this.previousElement());
        },

        update: function(time, deltaTime) {
            if (!this.animating)
                return;

            this.elapsedTransitionTime += deltaTime;

            var percentElapsed = this.calculateElapsedTimePercent(this.elapsedTransitionTime);
            var easedPercent = this.calculateEasedPercent(percentElapsed);
            var deltaPercent = easedPercent - this.easedPercent;
            this.easedPercent = easedPercent;
            var translation = vectorPool.create()
                .set(this.targetPositionTranslation)
                .scale(deltaPercent);
            //console.log(translation.toString());

            this.translateAllElements(translation);
            this.updateElementOpacities();

            if (this.elapsedTransitionTime >= this.get('transitionDuration'))
                this.stopAnimation();

            vectorPool.remove(translation);
        },

        calculateElapsedTimePercent: function(elapsedTime) {
            return Math.min(1, elapsedTime / this.get('transitionDuration'));
        },

        /**
         * From PhET's Carousel.computeSlowInSlowOut
         */
        calculateEasedPercent: function(percent) {
            if (percent < 0.5)
                return 2 * percent * percent;
            else {
                var complement = 1 - percent;
                return 1 - 2 * complement * complement;
            }
        },

        translationToTargetPosition: function() {
            return vectorPool.create()
                .set(this.get('activeElementPosition'))
                .sub(this.activeElement().get('position'));
        },

        translateAllElements: function(translation) {
            var elements = this.get('elements');
            for (var i = 0; i < elements.length; i++)
                elements[i].translate(translation);
        },

        updateElementOpacities: function() {
            var spacingDistance = this.get('elementSpacing').length();
            var elements = this.get('elements');
            for (var i = 0; i < elements.length; i++) {
                var distanceFromActivePosition = elements[i].get('position').distance(this.get('activeElementPosition'));
                var opacity = 1 - (distanceFromActivePosition / spacingDistance);
                if (opacity > 1)
                    opacity = 1;
                if (opacity < 0)
                    opacity = 0;
                elements[i].set('opacity', opacity);
            }
        },

        activeElement: function() {
            return this.get('elements')[this.get('activeIndex')];
        },

        previousElement: function() {
            return this.get('elements')[this.previous('activeIndex')];
        },

    });

    return CarouselAnimator;
});
