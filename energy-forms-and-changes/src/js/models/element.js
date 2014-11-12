define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	/**
	 * Basic building block model for all the elements in the intro tab scene
	 */
	var Element = Backbone.Model.extend({

		defaults: {
			supportingSurface: null
		},
		
		initialize: function(attributes, options) {

		},

		/**
		 * Get the top surface of this model element.  Only model elements that can
		 * support other elements on top of them have top surfaces.
		 *
		 * @return The top surface of this model element, null if this element can
		 *         not have other elements on top of it.
		 */
		getTopSurface: function() {
		    // Defaults to null, override as needed.
		    return null;
		},

		/**
		 * Get the bottom surface of this model element.  Only model elements that
		 * can rest on top of other model elements have bottom surfaces.
		 *
		 * @return The bottom surface of this model element, null if this element
		 *         never rests upon other model elements.
		 */
		getBottomSurface: function() {
		    // Defaults to null, override as needed.
		    return null;
		},

		/**
		 * Get the surface upon which this model element is resting, if there is
		 * one.
		 *
		 * @return Surface upon which this element is resting, null if there is
		 *         none.
		 */
		getSupportingSurface: function() {
		    return this.get('supportingSurface');
		},

		/*
		 * Set the surface upon which this model element is resting.
		 */
		setSupportingSurface: function(supportingSurface) {
		    this.set('supportingSurface', supportingSurface);
		},

		/**
		 * Get a value that indicates whether this element is stacked upon the
		 * given model element.
		 *
		 * @param element Model element to be checked.
		 * @return true if the given element is stacked anywhere on top of this
		 *         one, which includes cases where one or more elements are in between.
		 */
		isStackedUpon: function(element) {
		    return this.get('supportingSurface') && (
		    	this.get('supportingSurface').getOwner() === element || 
		    	this.get('supportingSurface').getOwner().isStackedUpon(element)
		    );
		},

		/**
		 * Reset the model element to its original state.  Subclasses must add
		 * reset functionality for any state that they add.
		 */
		reset: function() {
		    if (this.get('supportingSurface')) {
		        this.get('supportingSurface').removeAllObservers();
		        this.get('supportingSurface').clearSurface();
		        this.set('supportingSurface', null);
		    }
		}

	});

	return Body;
});
