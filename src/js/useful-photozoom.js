/*
	Source:
	van Creij, Maurice (2012). "useful.photozoom.js: Overlays a full screen preview of a thumbnail", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// public functions
	useful.Photozoom = function (objs, cfg) {
		// properties
		this.objs = objs;
		this.cfg = cfg;
		// methods
		this.start = function () {
			var a, b;
			// construct the spinner
			this.busy = new Busy();
			// apply the event handlers
			for (a = 0, b = this.objs.length; a < b; a += 1) {
				this.objs[a].addEventListener('click', this.onShow(this.objs[a]), true);
			}
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.onHide = function () {
			var context = this;
			return function () {
				// close the popup
				context.hide();
				// cancel the click
				return false;
			};
		};
		this.hide = function () {
			var context = this;
			// if there is a popup
			if (this.cfg.popup) {
				// unreveal the popup
				this.cfg.popup.className = this.cfg.popup.className.replace(/-active/gi, '-passive');
				// and after a while
				setTimeout(function () {
					// remove it
					document.body.removeChild(context.cfg.popup);
					// remove its reference
					context.cfg.popup = null;
				}, 500);
			}
		};
		this.onShow = function (obj) {
			var context = this;
			return function (event) {
				// cancel the click
				event.preventDefault();
				var url = obj.getAttribute('href') || obj.getAttribute('src'),
					desc = obj.getAttribute('title') || obj.getAttribute('alt'),
					image = (obj.nodeName === 'IMG') ? obj : obj.getElementsByTagName('img')[0],
					aspect = image.offsetHeight / image.offsetWidth;
				// open the popup
				context.show(url, desc, aspect);
			};
		};
		this.show = function (url, desc, aspect) {
			// if the popup doesn't exist
			if (!this.cfg.popup) {
				// show the busy indicator
				this.busy.show();
				// create a container for the popup
				this.cfg.popup = document.createElement('figure');
				this.cfg.popup.className = 'photozoom-popup photozoom-popup-passive';
				// add the popup to the document
				document.body.appendChild(this.cfg.popup);
				// add a close gadget
				this.addCloser();
				// if the description is not known
				desc = desc || '';
				// if the aspect is known
				if (aspect) {
					// add the image
					this.addImage(url, desc, aspect);
				// else if the size web-service is available
				} else if (this.cfg.size) {
					// retrieve the dimensions first
					var context = this;
					useful.request.send({
						url : this.cfg.size.replace(/{src}/g, url),
						post : null,
						onProgress : function () {},
						onFailure : function () {},
						onSuccess : function (reply) {
							var dimensions = JSON.parse(reply.responseText);
							context.addImage(url, desc, dimensions.y[0] / dimensions.x[0]);
						}
					});
				// else just make a wild guess
				} else {
					// add the image
					this.addImage(url, desc, 1);
				}
			}
		};
		this.addCloser = function () {
			var closer;
			// build a close gadget
			closer = document.createElement('a');
			closer.className = 'photozoom-closer';
			closer.innerHTML = 'x';
			closer.href = '#close';
			// add the close event handler
			closer.onclick = this.onHide(this);
			// add the close gadget to the image
			this.cfg.popup.appendChild(closer);
		};
		this.addImage = function (url, desc, aspect) {
			var caption, image, size, width = this.cfg.popup.offsetWidth, height = this.cfg.popup.offsetHeight;
			// add the caption
			caption = document.createElement('figcaption');
			caption.className = 'photozoom-caption';
			caption.innerHTML = desc;
			// add the zoomed image
			image = document.createElement('img');
			image.className = 'photozoom-image';
			image.setAttribute('alt', desc);
			image.onload = this.onReveal();
			// pick the dimensions based on the aspect ratio
			if (aspect > height / width) {
				image.setAttribute('width', '');
				image.setAttribute('height', '100%');
				size = 'height=' + height;
			} else {
				image.setAttribute('width', '100%');
				image.setAttribute('height', '');
				size = 'width=' + width;
			}
			// add the components to the popup
			this.cfg.popup.appendChild(image);
			this.cfg.popup.appendChild(caption);
			// load the image
			image.src = (this.cfg.slice) ? this.cfg.slice.replace('{src}', url).replace('{size}', size) : url;
		};
		this.onReveal = function () {
			var context = this;
			return function () {
				var image, popup = context.cfg.popup;
				// if there is a popup
				if (popup) {
					// find the image in the popup
					image = context.cfg.popup.getElementsByTagName('img')[0];
					// hide the busy indicator
					context.busy.hide();
					// centre the image
					image.style.marginTop = Math.round((popup.offsetHeight - image.offsetHeight) / 2) + 'px';
					// reveal it
					popup.className = popup.className.replace(/-passive/gi, '-active');
				}
			};
		};
		// go
		this.start();
	};

	// private functions
	var Busy = function () {
		this.start = function () {
			// construct the spinner
			this.spinner = document.createElement('div');
			this.spinner.className = 'photozoom-busy photozoom-busy-passive';
			document.body.appendChild(this.spinner);
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

}(window.useful = window.useful || {}));
