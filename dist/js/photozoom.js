/*
	Source:
	van Creij, Maurice (2018). "gestures.js: A library of useful functions to ease working with touch and gestures.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// extend the constructor
var Gestures = function (config) {

	// PROPERTIES

	// METHODS

	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this);
	};

	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context);
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = Gestures;
}

// extend the class
Gestures.prototype.Main = function (config, context) {

	// PROPERTIES

	this.config = config;
	this.context = context;
	this.element = config.element;
	this.paused = false;

	// METHODS

	this.init = function () {
		// check the configuration properties
		this.config = this.checkConfig(config);
		// add the single touch events
		if (config.allowSingle) { this.single = new this.context.Single(this); }
		// add the multi touch events
		if (config.allowMulti) { this.multi = new this.context.Multi(this); }
	};

	this.checkConfig = function (config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		if (config.swipeUp || config.swipeLeft || config.swipeRight || config.swipeDown || config.drag || config.doubleTap) {
			config.allowSingle = true;
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.doubleTap = config.doubleTap || function () {};
		}
		// if there's pinch there's also twist
		if (config.pinch || config.twist) {
			config.allowMulti = true;
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
		}
		// return the fixed config
		return config;
	};

	this.readEvent = function (event) {
		var coords = {}, offsets;
		// try all likely methods of storing coordinates in an event
		if (event.touches && event.touches[0]) {
			coords.x = event.touches[0].pageX;
			coords.y = event.touches[0].pageY;
		} else if (event.pageX !== undefined) {
			coords.x = event.pageX;
			coords.y = event.pageY;
		} else {
			coords.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			coords.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		return coords;
	};

	this.correctOffset = function (element) {
		var offsetX = 0, offsetY = 0;
		// if there is an offset
		if (element.offsetParent) {
			// follow the offsets back to the right parent element
			while (element !== this.element) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};

	// EXTERNAL

	this.enableDefaultTouch = function () {
		this.config.cancelTouch = false;
	};

	this.disableDefaultTouch = function () {
		this.config.cancelTouch = true;
	};

	this.enableDefaultGesture = function () {
		this.config.cancelGesture = false;
	};

	this.disableDefaultGesture = function () {
		this.config.cancelGesture = true;
	};

	// EVENTS

	this.init();

};

// extend the class
Gestures.prototype.Multi = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.element.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.element.addEventListener('gesturestart', this.onStartGesture());
			this.element.addEventListener('gesturechange', this.onChangeGesture());
			this.element.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.element.addEventListener('msgesturestart', this.onStartGesture());
			this.element.addEventListener('msgesturechange', this.onChangeGesture());
			this.element.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.element.addEventListener('touchstart', this.onStartFallback());
			this.element.addEventListener('touchmove', this.onChangeFallback());
			this.element.addEventListener('touchend', this.onEndFallback());
		}
	};

	this.cancelGesture = function (event) {
		if (this.config.cancelGesture) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startGesture = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// note the start position
			this.gestureOrigin = {
				'scale' : event.scale,
				'rotation' : event.rotation,
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'scale' : this.gestureOrigin.scale,
				'rotation' : this.gestureOrigin.rotation
			};
		}
	};

	this.changeGesture = function (event) {
		// if there is an origin
		if (this.gestureOrigin) {
			// get the distances from the event
			var scale = event.scale,
				rotation = event.rotation;
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.config.twist({
				'x' : coords.x,
				'y' : coords.y,
				'rotation' : rotation - this.gestureProgression.rotation,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'scale' : event.scale,
				'rotation' : event.rotation
			};
		}
	};

	this.endGesture = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	// FALLBACK

	this.startFallback = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused && event.touches.length === 2) {
			// note the start position
			this.gestureOrigin = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				],
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'touches' : this.gestureOrigin.touches
			};
		}
	};

	this.changeFallback = function (event) {
		// if there is an origin
		if (this.gestureOrigin && event.touches.length === 2) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// calculate the scale factor
			var scale = 0, progression = this.gestureProgression;
			scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
			scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
			scale = scale - 2;
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				]
			};
		}
	};

	this.endFallback = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.config.increment : scale = -this.config.increment;
		// report the zoom
		this.config.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};

	// GESTURE EVENTS

	this.onStartGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.startGesture(event);
			_this.changeGesture(event);
		};
	};

	this.onChangeGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeGesture(event);
		};
	};

	this.onEndGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// FALLBACK EVENTS

	this.onStartFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//_this.cancelGesture(event);
			// handle the event
			_this.startFallback(event);
			_this.changeFallback(event);
		};
	};

	this.onChangeFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeFallback(event);
		};
	};

	this.onEndFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// MOUSE EVENTS

	this.onChangeWheel = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeWheel(event);
		};
	};

	// EVENTS

	this.init();

};

// extend the class
Gestures.prototype.Single = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousedown', this.onStartTouch());
		this.element.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		// set the required events for touch
		this.element.addEventListener('touchstart', this.onStartTouch());
		this.element.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.element.addEventListener('mspointerdown', this.onStartTouch());
		this.element.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
	};

	this.cancelTouch = function (event) {
		if (this.config.cancelTouch) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startTouch = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// note the start position
			this.touchOrigin = {
				'x' : coords.x,
				'y' : coords.y,
				'target' : event.target || event.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		}
	};

	this.changeTouch = function (event) {
		// if there is an origin
		if (this.touchOrigin) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.drag({
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'horizontal' : coords.x - this.touchProgression.x,
				'vertical' : coords.y - this.touchProgression.y,
				'event' : event,
				'source' : this.touchOrigin.target
			});
			// update the current position
			this.touchProgression = {
				'x' : coords.x,
				'y' : coords.y
			};
		}
	};

	this.endTouch = function (event) {
		// if the numbers are valid
		if (this.touchOrigin && this.touchProgression) {
			// calculate the motion
			var distance = {
				'x' : this.touchProgression.x - this.touchOrigin.x,
				'y' : this.touchProgression.y - this.touchOrigin.y
			};
			// if there was very little movement, but this is the second touch in quick successionif (
			if (
				this.lastTouch &&
				Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 &&
				Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 &&
				new Date().getTime() - this.lastTouch.time < 500 &&
				new Date().getTime() - this.lastTouch.time > 100
			) {
				// treat this as a double tap
				this.config.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.config.threshold) {
					// report the associated swipe
					this.config.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.config.threshold) {
					// report the associated swipe
					this.config.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				}
			}
			// store the history of this touch
			this.lastTouch = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'time' : new Date().getTime()
			};
		}
		// clear the input
		this.touchProgression = null;
		this.touchOrigin = null;
	};

	// TOUCH EVENTS

	this.onStartTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.startTouch(event);
			_this.changeTouch(event);
		};
	};

	this.onChangeTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelTouch(event);
			// handle the event
			_this.changeTouch(event);
		};
	};

	this.onEndTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.endTouch(event);
		};
	};

	// EVENTS

	this.init();

};

/*
	Source:
	van Creij, Maurice (2018). "requests.js: A library of useful functions to ease working with AJAX and JSON.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/


// establish the class
var requests = {

	// adds a random argument to the AJAX URL to bust the cache
	randomise : function (url) {
		return url.replace('?', '?time=' + new Date().getTime() + '&');
	},

	// perform all requests in a single application
	all : function (queue, results) {
		// set up storage for the results
		var _this = this, _url = queue.urls[queue.urls.length - 1], _results = results || [];
		// perform the first request in the queue
		this.send({
			url : _url,
			post : queue.post || null,
			contentType : queue.contentType || 'text/xml',
			timeout : queue.timeout || 4000,
			onTimeout : queue.onTimeout || function (reply) { return reply; },
			onProgress : function (reply) {
				// report the fractional progress of the whole queue
				queue.onProgress({});
			},
			onFailure : queue.onFailure || function (reply) { return reply; },
			onSuccess : function (reply) {
				// store the results
				_results.push({
					'url' : _url,
					'response' : reply.response,
					'responseText' : reply.responseText,
					'responseXML' : reply.responseXML,
					'status' : reply.status,
				});
				// pop one request off the queue
				queue.urls.length = queue.urls.length - 1;
				// if there are more items in the queue
				if (queue.urls.length > 0) {
					// perform the next request
					_this.all(queue, _results);
				// else
				} else {
					// trigger the success handler
					queue.onSuccess(_results);
				}
			}
		});
	},

	// create a request that is compatible with the browser
	create : function (properties) {
		var serverRequest,
			_this = this;
		// create a microsoft only xdomain request
		if (window.XDomainRequest && properties.xdomain) {
			// create the request object
			serverRequest = new XDomainRequest();
			// add the event handler(s)
			serverRequest.onload = function () { properties.onSuccess(serverRequest, properties); };
			serverRequest.onerror = function () { properties.onFailure(serverRequest, properties); };
			serverRequest.ontimeout = function () { properties.onTimeout(serverRequest, properties); };
			serverRequest.onprogress = function () { properties.onProgress(serverRequest, properties); };
		}
		// or create a standard HTTP request
		else if (window.XMLHttpRequest) {
			// create the request object
			serverRequest = new XMLHttpRequest();
			// set the optional timeout if available
			if (serverRequest.timeout) { serverRequest.timeout = properties.timeout || 0; }
			// add the event handler(s)
			serverRequest.ontimeout = function () { properties.onTimeout(serverRequest, properties); };
			serverRequest.onreadystatechange = function () { _this.update(serverRequest, properties); };
		}
		// or use the fall back
		else {
			// create the request object
			serverRequest = new ActiveXObject("Microsoft.XMLHTTP");
			// add the event handler(s)
			serverRequest.onreadystatechange = function () { _this.update(serverRequest, properties); };
		}
		// return the request object
		return serverRequest;
	},

	// perform and handle an AJAX request
	send : function (properties) {
		// add any event handlers that weren't provided
		properties.onSuccess = properties.onSuccess || function () {};
		properties.onFailure = properties.onFailure || function () {};
		properties.onTimeout = properties.onTimeout || function () {};
		properties.onProgress = properties.onProgress || function () {};
		// create the request object
		var serverRequest = this.create(properties);
		// if the request is a POST
		if (properties.post) {
			try {
				// open the request
				serverRequest.open('POST', properties.url, true);
				// set its header
				serverRequest.setRequestHeader("Content-type", properties.contentType || "application/x-www-form-urlencoded");
				// send the request, or fail gracefully
				serverRequest.send(properties.post);
			}
			catch (errorMessage) { properties.onFailure({ readyState : -1, status : -1, statusText : errorMessage }); }
		// else treat it as a GET
		} else {
			try {
				// open the request
				serverRequest.open('GET', this.randomise(properties.url), true);
				// send the request
				serverRequest.send();
			}
			catch (errorMessage) { properties.onFailure({ readyState : -1, status : -1, statusText : errorMessage }); }
		}
	},

	// regularly updates the status of the request
	update : function (serverRequest, properties) {
		// react to the status of the request
		if (serverRequest.readyState === 4) {
			switch (serverRequest.status) {
				case 200 :
					properties.onSuccess(serverRequest, properties);
					break;
				case 304 :
					properties.onSuccess(serverRequest, properties);
					break;
				default :
					properties.onFailure(serverRequest, properties);
			}
		} else {
			properties.onProgress(serverRequest, properties);
		}
	},

	// turns a string back into a DOM object
	deserialize : function (text) {
		var parser, xmlDoc;
		// if the DOMParser exists
		if (window.DOMParser) {
			// parse the text as an XML DOM
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(text, "text/xml");
		// else assume this is Microsoft doing things differently again
		} else {
			// parse the text as an XML DOM
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(text);
		}
		// return the XML DOM object
		return xmlDoc;
	},

	// turns a json string into a JavaScript object
	decode : function (text) {
		var object;
		object = {};
		// if JSON.parse is available
		if (typeof JSON !== 'undefined' && typeof JSON.parse !== 'undefined') {
			// use it
			object = JSON.parse(text);
		// if jQuery is available
		} else if (typeof jQuery !== 'undefined') {
			// use it
			object = jQuery.parseJSON(text);
		}
		// return the object
		return object;
	}

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = requests;
}

/*
	Source:
	van Creij, Maurice (2018). "photozoom.js: Overlays a full screen preview of a thumbnail", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Photozoom = function (config) {

		this.only = function (config) {
			// start an instance of the script
			return new this.Main(config, this).init();
		};

		this.each = function (config) {
			var _config, _context = this, instances = [];
			// for all element
			for (var a = 0, b = config.elements.length; a < b; a += 1) {
				// clone the configuration
				_config = Object.create(config);
				// insert the current element
				_config.element = config.elements[a];
				// start a new instance of the object
				instances[a] = new this.Main(_config, _context);
			}
			// return the instances
			return instances;
		};

		return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photozoom;
}

// extend the constructor
Photozoom.prototype.Busy = function (container) {

	// PROPERTIES

	this.container = container;

	// METHODS

	this.init = function () {
		// not needed yet
	};

	this.show = function () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = (this.container === document.body) ?
			'photozoom-busy photozoom-busy-fixed photozoom-busy-active':
			'photozoom-busy photozoom-busy-active';
		this.container.appendChild(this.spinner);
	};

	this.hide = function () {
		// deconstruct the spinner
		if (this.spinner) {
			this.container.removeChild(this.spinner);
			this.spinner = null;
		}
	};

};

// extend the class
Photozoom.prototype.Main = function(config, context) {

  // PROPERTIES

  this.context = context;
  this.element = config.element;
  this.config = {
    'container': document.body,
    'zoom': 1,
    'sizer': null,
    'slicer': '{src}'
  };

  for (key in config) {
    this.config[key] = config[key];
  }

  // METHODS

  this.hide = function() {
    // if there is a popup
    if (this.popup) {
      // unreveal the popup
      this.popup.className = this.popup.className.replace(/-active/gi, '-passive');
      // and after a while
      var _this = this;
      setTimeout(function() {
        // remove it
        if (_this.popup) { _this.config.container.removeChild(_this.popup); }
        // remove all references
        _this.popup = null;
        _this.image = null;
        _this.gestures = null;
      }, 500);
    }
  };

  this.show = function() {
    // if the popup doesn't exist
    if (!this.popup) {
      // show the busy indicator
      this.busy = new this.context.Busy(this.config.container);
      this.busy.show();
      // create a container for the popup
      this.popup = document.createElement('figure');
      this.popup.className = (this.config.container === document.body) ?
        'photozoom-popup photozoom-popup-fixed photozoom-popup-passive' :
        'photozoom-popup photozoom-popup-passive';
      // add a close gadget
      this.addCloser();
      // add a locator gadget
      this.addLocator();
      // add the popup to the document
      this.config.container.appendChild(this.popup);
      // add the touch events
      this.translation = [0, 0];
      this.scaling = [1, 1];
      this.gestures = new Gestures({
        'element': this.popup,
        'drag': this.onTransformed.bind(this),
        'pinch': this.onTransformed.bind(this),
        'doubleTap': this.onDoubleTapped.bind(this),
        'swipeLeft': this.onSwiped.bind(this, 'left'),
        'swipeRight': this.onSwiped.bind(this, 'right')
      });
      // figure out the aspect ratio of the image
      this.checkImage(this.element, '0%');
    }
  };

  this.zoom = function(coords) {
    // apply the scaling
    if (coords.scale !== undefined) {
      this.scaling[0] = Math.min(Math.max(this.scaling[0] + coords.scale, 1), config.zoom);
      this.scaling[1] = Math.min(Math.max(this.scaling[1] + coords.scale, 1), config.zoom);
    }
    // apply the translation
    if (coords.horizontal !== undefined && coords.vertical !== undefined) {
      this.translation[0] = this.translation[0] + coords.horizontal / 2 / this.scaling[0];
      this.translation[1] = this.translation[1] + coords.vertical / 2 / this.scaling[1];
    }
    // limit the translation
    var overscanX = Math.max((this.image.offsetWidth * this.scaling[0] / this.popup.offsetWidth - 1) * 50 / this.scaling[0], 0),
      overscanY = Math.max((this.image.offsetHeight * this.scaling[1] / this.popup.offsetHeight - 1) * 50 / this.scaling[1], 0);
    this.translation[0] = Math.min(Math.max(this.translation[0], -overscanX), overscanX);
    this.translation[1] = Math.min(Math.max(this.translation[1], -overscanY), overscanY);
    // formulate the style rule
    var scaling = 'scale(' + this.scaling.join(',') + ')',
      translation = 'translate(' + this.translation.join('%,') + '%)';
    // apply the style rule
    this.image.style.transform = scaling + ' ' + translation;
    this.image.style.webkitTransform = scaling + ' ' + translation;
    this.image.style.msTransform = scaling + ' ' + translation;
  };

  this.addCloser = function() {
    // build a close gadget
    var closer = document.createElement('a');
    closer.className = 'photozoom-closer';
    closer.innerHTML = 'x';
    closer.href = '#close';
    // add the close event handler
    closer.addEventListener('click', this.onHide.bind(this));
    closer.addEventListener('touchstart', this.onHide.bind(this));
    // add the close gadget to the image
    this.popup.appendChild(closer);
  };

  this.addLocator = function(url) {
    // only add if a handler was specified
    if (this.config.located) {
      var parent = this.parent,
        config = this.config,
        locator;
      // build the geo marker icon
      locator = document.createElement('a');
      locator.className = 'photozoom-locator';
      locator.innerHTML = 'Show on a map';
      locator.href = '#map';
      // add the event handler
      locator.addEventListener('click', this.onLocate.bind(this));
      locator.addEventListener('touchstart', this.onLocate.bind(this));
      // add the location marker to the image
      this.popup.appendChild(locator);
    }
  };

  this.checkImage = function(element, offset) {
    // try to scrape together the required properties
    var url = element.getAttribute('href') || element.getAttribute('src'),
      desc = element.getAttribute('title') || element.getAttribute('alt') || element.getAttribute('data-desc') || '',
      image = (element.nodeName === 'IMG') ? element : element.getElementsByTagName('img')[0],
      aspect = image.offsetHeight / image.offsetWidth;
    // if the aspect is known
    if (aspect) {
      // add the image
      this.addImage(url, desc, aspect, offset);
      // else if the size web-service is available
    } else if (this.config.sizer) {
      // retrieve the dimensions first
      var _this = this;
      requests.send({
        url: this.config.sizer.replace(/{src}/g, url),
        post: null,
        onProgress: function() {},
        onFailure: function() {},
        onSuccess: function(reply) {
          var dimensions = JSON.parse(reply.responseText);
          _this.addImage(url, desc, dimensions.y[0] / dimensions.x[0], offset);
        }
      });
    }
  };

  this.addImage = function(url, desc, aspect, offset) {
    var caption, image, size,
      width = this.popup.offsetWidth,
      height = this.popup.offsetHeight;
    // add the caption
    caption = document.createElement('figcaption');
    caption.className = (desc !== '') ? 'photozoom-caption' : 'photozoom-caption photozoom-caption-hidden';
    caption.innerHTML = desc;
    // add the zoomed image
    image = document.createElement('img');
    image.className = 'photozoom-image';
    image.style.visibility = 'hidden';
    image.style.left = offset || '0%';
    image.setAttribute('alt', desc);
    image.onload = this.onReveal.bind(this);
    image.onerror = this.onFail.bind(this);
    // pick the dimensions based on the aspect ratio
    if (aspect > height / width) {
      image.removeAttribute('width');
      image.setAttribute('height', '100%');
      size = 'height=' + (height * this.config.zoom);
    } else {
      image.setAttribute('width', '100%');
      image.removeAttribute('height');
      size = 'width=' + (width * this.config.zoom);
    }
    // add the image to the popup
    this.popup.appendChild(image);
    this.image = image;
    // add the caption to the popup
    this.popup.appendChild(caption);
    this.caption = caption;
    // load the image
    image.src = (this.config.slicer) ? this.config.slicer.replace('{src}', url).replace('{size}', size) : url;
  };

  this.changeImage = function(direction) {
    // if there is more than one photo
    if (this.config.elements.length > 1) {
      // have the old element it slide off screen in the direction of the swipe
      this.image.style.left = (direction === 'left') ? '-100%' : '100%';
      // replace the image for the next one
      var _this = this;
      setTimeout(function() {
        // remove the old image
        _this.popup.removeChild(_this.image);
        _this.popup.removeChild(_this.caption);
        // show the spinner
        _this.busy.show();
        // update the element with the next one from this.elements
        _this.element = _this.findImage(_this.element, _this.config.elements, (direction === 'left') ? 1 : -1);
        // have the new element slide on screen from the direction of the swipe
        _this.checkImage(_this.element, (direction === 'left') ? '100%' : '-100%');
        // trigger the opener event
        if (_this.config.opened) {
          _this.config.opened(_this.element);
        }
      }, 500);
    }
  };

  this.findImage = function(element, elements, offset) {
    var a, b, index = 0;
    // find the current element
    for (a = 0, b = elements.length; a < b; a += 1) {
      if (element === elements[a]) {
        if (a + offset < 0) {
          return elements[elements.length - 1];
        } else if (a + offset >= elements.length) {
          return elements[0];
        } else {
          return elements[a + offset];
        }
      }
    }
    // fall back
    return element;
  };

  this.onLocate = function() {
    var config = this.config;
    // trigger the located event if available
    if (config.located) {
      config.located(this.element);
    }
  };

  this.onHide = function(evt) {
    var config = this.config;
    // cancel the click
    evt.preventDefault();
    // hide the spinner
    this.busy.hide();
    // close the popup
    this.hide();
    // trigger the closed event if available
    if (config.closed) {
      config.closed(this.element);
    }
  };

  this.onShow = function(evt) {
    var config = this.config;
    // cancel the click
    event.preventDefault();
    // trigger the opened event if available
    var allowed = (config.opened) ? config.opened(this.element) : function() {
      return true;
    };
    // show the popup if allowed by the open event
    if (allowed) {
      this.show(this.element);
    }
  };

  this.onFail = function() {
    var config = this.config;
    // give up on the popup
    if (this.popup) {
      // remove the popup
      config.container.removeChild(this.popup);
      // remove its reference
      this.popup = null;
      this.image = null;
      this.gestures = null;
    }
    // trigger the located handler directly
    if (config.located) {
      config.located(this.element);
    }
    // hide the busy indicator
    this.busy.hide();
  };

  this.onReveal = function() {
    var image, popup = this.popup;
    // if there is a popup
    if (popup) {
      // find the image in the popup
      image = this.popup.getElementsByTagName('img')[0];
      // hide the busy indicator
      this.busy.hide();
      // centre the image
      image.style.marginTop = Math.round((popup.offsetHeight - image.offsetHeight) / 2) + 'px';
      // reveal it
      image.style.visibility = 'visible';
      image.style.left = '0%';
      // show the popup
      popup.className = popup.className.replace(/-passive/gi, '-active');
    }
  };

  this.onDoubleTapped = function() {
    this.zoom({
      'scale': (this.scaling[0] === 1) ? this.config.zoom : -this.config.zoom,
    });
  };

  this.onTransformed = function(coords) {
    this.zoom(coords);
  };

  this.onSwiped = function(direction) {
    // if we're at zoom level 1
    if (this.scaling[0] === 1) {
      // pick the direction
      this.changeImage(direction);
    }
  };

  // EVENTS

  this.element.addEventListener('click', this.onShow.bind(this));

};
