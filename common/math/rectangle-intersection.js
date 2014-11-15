define(function (require) {

	'use strict';

	/**
	 * Returns a rectangle that is the intersection of this
	 *   rectangle (this) and another rectangle (that).
	 *
	 * Algorithm borrowed from java.awt.geom.Rectangle2D.intersect
	 */
	return function(that) {
		if (this._intersection === undefined)
			this._intersection = new Rectangle();

		var x1 = Math.max(this.left(),   that.left());
		var y1 = Math.max(this.bottom(), that.bottom());
		var x2 = Math.min(this.right(),  that.right());
		var y2 = Math.min(this.top(),    that.top());

		return this._intersection.set(x1, y1, x2 - x1, y2 - y1);
	};
});
