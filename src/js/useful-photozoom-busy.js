/*
	Source:
	van Creij, Maurice (2014). "useful.photozoom.js: Overlays a full screen preview of a thumbnail", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photozoom = useful.Photozoom || function () {};

// extend the constructor
useful.Photozoom.prototype.Busy = function (container) {
	// properties
	"use strict";
	this.container = container;
	// methods
	this.start = function () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = (this.container === document.body) ?
			'photozoom-busy photozoom-busy-fixed photozoom-busy-passive':
			'photozoom-busy photozoom-busy-passive';
		this.container.appendChild(this.spinner);
		// disable the start function so it can't be started twice
		this.start = function () {};
	};
	this.show = function () {
		// show the spinner
		this.spinner.className = this.spinner.className.replace(/-passive/gi, '-active');
	};
	this.hide = function () {
		// hide the spinner
		this.spinner.className = this.spinner.className.replace(/-active/gi, '-passive');
	};
	// go
	this.start();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photozoom.Busy;
}