/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Multi = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.cfg = parent.cfg;
	this.obj = parent.cfg.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;
	// methods
	this.start = function () {
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.obj.addEventListener('gesturestart', this.onStartGesture());
			this.obj.addEventListener('gesturechange', this.onChangeGesture());
			this.obj.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.obj.addEventListener('msgesturestart', this.onStartGesture());
			this.obj.addEventListener('msgesturechange', this.onChangeGesture());
			this.obj.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.obj.addEventListener('touchstart', this.onStartFallback());
			this.obj.addEventListener('touchmove', this.onChangeFallback());
			this.obj.addEventListener('touchend', this.onEndFallback());
		}
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.cancelGesture = function (event) {
		if (this.cfg.cancelGesture) {
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
			this.cfg.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.cfg.twist({
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
	// fallback functionality
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
			this.cfg.pinch({
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
	// gesture events
	this.onStartGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.startGesture(event);
			context.changeGesture(event);
		};
	};
	this.onChangeGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.changeGesture(event);
		};
	};
	this.onEndGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// handle the event
			context.endGesture(event);
		};
	};
	// gesture events
	this.onStartFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//context.cancelGesture(event);
			// handle the event
			context.startFallback(event);
			context.changeFallback(event);
		};
	};
	this.onChangeFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.changeFallback(event);
		};
	};
	this.onEndFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// handle the event
			context.endGesture(event);
		};
	};
	// go
	this.start();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Multi;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Single = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.cfg = parent.cfg;
	this.obj = parent.cfg.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;
	// methods
	this.start = function () {
		// set the required events for mouse
		this.obj.addEventListener('mousedown', this.onStartTouch());
		this.obj.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		this.obj.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.obj.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for touch
		this.obj.addEventListener('touchstart', this.onStartTouch());
		this.obj.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.obj.addEventListener('mspointerdown', this.onStartTouch());
		this.obj.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.cancelTouch = function (event) {
		if (this.cfg.cancelTouch) {
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
			this.cfg.drag({
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
				this.cfg.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
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
	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.cfg.increment : scale = -this.cfg.increment;
		// report the zoom
		this.cfg.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};
	// touch events
	this.onStartTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// handle the event
			context.startTouch(event);
			context.changeTouch(event);
		};
	};
	this.onChangeTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// optionally cancel the default behaviour
			context.cancelTouch(event);
			// handle the event
			context.changeTouch(event);
		};
	};
	this.onEndTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// handle the event
			context.endTouch(event);
		};
	};
	// mouse wheel events
	this.onChangeWheel = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// optionally cancel the default behaviour
			context.cancelTouch(event);
			// handle the event
			context.changeWheel(event);
		};
	};
	// go
	this.start();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Single;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.init = function (cfg) {
	// properties
	"use strict";
	this.cfg = cfg;
	this.obj = cfg.element;
	this.paused = false;
	// methods
	this.start = function () {
		// check the configuration properties
		this.checkConfig(this.cfg);
		// add the single touch events
		this.single = new this.Single(this);
		// add the multi touch events
		this.multi = new this.Multi(this);
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.checkConfig = function (config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		config.swipeUp = config.swipeUp || function () {};
		config.swipeLeft = config.swipeLeft || function () {};
		config.swipeRight = config.swipeRight || function () {};
		config.swipeDown = config.swipeDown || function () {};
		config.drag = config.drag || function () {};
		config.pinch = config.pinch || function () {};
		config.twist = config.twist || function () {};
		config.doubleTap = config.doubleTap || function () {};
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
			while (element !== this.obj) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};
	// external API
	this.enableDefaultTouch = function () {
		this.cfg.cancelTouch = false;
	};
	this.disableDefaultTouch = function () {
		this.cfg.cancelTouch = true;
	};
	this.enableDefaultGesture = function () {
		this.cfg.cancelGesture = false;
	};
	this.disableDefaultGesture = function () {
		this.cfg.cancelGesture = true;
	};
	// go
	this.start();
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.polyfills = {

		// enabled the use of HTML5 elements in Internet Explorer
		html5 : function () {
			var a, b, elementsList;
			elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
			if (navigator.userAgent.match(/msie/gi)) {
				for (a = 0 , b = elementsList.length; a < b; a += 1) {
					document.createElement(elementsList[a]);
				}
			}
		},

		// allow array.indexOf in older browsers
		arrayIndexOf : function () {
			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0), j = this.length; i < j; i += 1) {
						if (this[i] === obj) { return i; }
					}
					return -1;
				};
			}
		},

		// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
		querySelectorAll : function () {
			if (!document.querySelectorAll) {
				document.querySelectorAll = function (a) {
					var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
					return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
				};
			}
		},

		// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
		addEventListener : function () {
			!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
				WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
					var target = this;
					registry.unshift([target, type, listener, function (event) {
						event.currentTarget = target;
						event.preventDefault = function () { event.returnValue = false; };
						event.stopPropagation = function () { event.cancelBubble = true; };
						event.target = event.srcElement || target;
						listener.call(target, event);
					}]);
					this.attachEvent("on" + type, registry[0][3]);
				};
				WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
					for (var index = 0, register; register = registry[index]; ++index) {
						if (register[0] == this && register[1] == type && register[2] == listener) {
							return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
						}
					}
				};
				WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
					return this.fireEvent("on" + eventObject.type, eventObject);
				};
			})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
		},

		// allow console.log
		consoleLog : function () {
			var overrideTest = new RegExp('console-log', 'i');
			if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
				window.console = {};
				window.console.log = function () {
					// if the reporting panel doesn't exist
					var a, b, messages = '', reportPanel = document.getElementById('reportPanel');
					if (!reportPanel) {
						// create the panel
						reportPanel = document.createElement('DIV');
						reportPanel.id = 'reportPanel';
						reportPanel.style.background = '#fff none';
						reportPanel.style.border = 'solid 1px #000';
						reportPanel.style.color = '#000';
						reportPanel.style.fontSize = '12px';
						reportPanel.style.padding = '10px';
						reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
						reportPanel.style.right = '10px';
						reportPanel.style.bottom = '10px';
						reportPanel.style.width = '180px';
						reportPanel.style.height = '320px';
						reportPanel.style.overflow = 'auto';
						reportPanel.style.zIndex = '100000';
						reportPanel.innerHTML = '&nbsp;';
						// store a copy of this node in the move buffer
						document.body.appendChild(reportPanel);
					}
					// truncate the queue
					var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
					// process the arguments
					for (a = 0, b = arguments.length; a < b; a += 1) {
						messages += arguments[a] + '<br/>';
					}
					// add a break after the message
					messages += '<hr/>';
					// output the queue to the panel
					reportPanel.innerHTML = messages + reportString;
				};
			}
		},

		// allows Object.create (https://gist.github.com/rxgx/1597825)
		objectCreate : function () {
			if (typeof Object.create !== "function") {
				Object.create = function (original) {
					function Clone() {}
					Clone.prototype = original;
					return new Clone();
				};
			}
		},

		// allows String.trim (https://gist.github.com/eliperelman/1035982)
		stringTrim : function () {
			if (!String.prototype.trim) {
				String.prototype.trim = function () { return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, ''); };
			}
			if (!String.prototype.ltrim) {
				String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
			}
			if (!String.prototype.rtrim) {
				String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
			}
			if (!String.prototype.fulltrim) {
				String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
			}
		},

		// allows localStorage support
		localStorage : function () {
			if (!window.localStorage) {
				if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)){
					window.localStorage = {
						getItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return null;
							}
							return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
						},
						key: function(nKeyId) {
							return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
						},
						setItem: function(sKey, sValue) {
							if (!sKey) {
								return;
							}
							document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
							this.length = document.cookie.match(/\=/g).length;
						},
						length: 0,
						removeItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return;
							}
							document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
							this.length--;
						},
						hasOwnProperty: function(sKey) {
							return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
						}
					};
					window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
				} else {
				    Object.defineProperty(window, "localStorage", new(function() {
				        var aKeys = [],
				            oStorage = {};
				        Object.defineProperty(oStorage, "getItem", {
				            value: function(sKey) {
				                return sKey ? this[sKey] : null;
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "key", {
				            value: function(nKeyId) {
				                return aKeys[nKeyId];
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "setItem", {
				            value: function(sKey, sValue) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "length", {
				            get: function() {
				                return aKeys.length;
				            },
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "removeItem", {
				            value: function(sKey) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        this.get = function() {
				            var iThisIndx;
				            for (var sKey in oStorage) {
				                iThisIndx = aKeys.indexOf(sKey);
				                if (iThisIndx === -1) {
				                    oStorage.setItem(sKey, oStorage[sKey]);
				                } else {
				                    aKeys.splice(iThisIndx, 1);
				                }
				                delete oStorage[sKey];
				            }
				            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
				                oStorage.removeItem(aKeys[0]);
				            }
				            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
				                aCouple = aCouples[nIdx].split(/\s*=\s*/);
				                if (aCouple.length > 1) {
				                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
				                    aKeys.push(iKey);
				                }
				            }
				            return oStorage;
				        };
				        this.configurable = false;
				        this.enumerable = true;
				    })());
				}
			}
		}

	};

	// startup
	useful.polyfills.html5();
	useful.polyfills.arrayIndexOf();
	useful.polyfills.querySelectorAll();
	useful.polyfills.addEventListener();
	useful.polyfills.consoleLog();
	useful.polyfills.objectCreate();
	useful.polyfills.stringTrim();
	useful.polyfills.localStorage();

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.polyfills;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.requests.js: A library of useful functions to ease working with AJAX and JSON.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.request = {

		// adds a random argument to the AJAX URL to bust the cache
		randomise : function (url) {
			return url.replace('?', '?time=' + new Date().getTime() + '&');
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
		exports = module.exports = useful.request;
	}

})();

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

useful.Photozoom.prototype.init = function (cfg) {

	// properties

	"use strict";

	this.cfg = cfg;

	this.objs = cfg.elements;

	// methods

	this.start = function () {

		var a, b;

		// apply the default values

		this.cfg.container = this.cfg.container || document.body;

		this.cfg.zoom = this.cfg.zoom || 1;

		this.cfg.sizer = this.cfg.sizer || null;

		this.cfg.slicer = this.cfg.slicer || '{src}';

		// construct the spinner

		this.busy = new this.Busy(this.cfg.container);

		// apply the event handlers

		for (a = 0, b = this.objs.length; a < b; a += 1) {

			this.objs[a].addEventListener('click', this.onShow(this.objs[a]));

		}

		// disable the start function so it can't be started twice

		this.init = function () {};

	};

	this.hide = function () {

		var _this = this;

		// if there is a popup

		if (this.popup) {

			// unreveal the popup

			this.popup.className = this.popup.className.replace(/-active/gi, '-passive');

			// and after a while

			setTimeout(function () {

				// remove it

				_this.cfg.container.removeChild(_this.popup);

				// remove its reference

				_this.popup = null;

				_this.image = null;

				_this.gestures = null;

			}, 500);

		}

	};

	this.show = function (url, desc, aspect) {

		// if the popup doesn't exist

		if (!this.popup) {

			// show the busy indicator

			this.busy.show();

			// create a container for the popup

			this.popup = document.createElement('figure');

			this.popup.className = (this.cfg.container === document.body) ?

				'photozoom-popup photozoom-popup-fixed photozoom-popup-passive':

				'photozoom-popup photozoom-popup-passive';

			// add a close gadget

			this.addCloser();

			// add the popup to the document

			this.cfg.container.appendChild(this.popup);

			// add the touch events

			this.translation = [0,0];

			this.scaling = [1,1];

			this.gestures = new useful.Gestures().init({

				'element' : this.popup,

				'drag' : this.onTransformed(),

				'pinch' : this.onTransformed(),

				'doubleTap' : this.onDoubleTapped()

			});

			// use a blank description if not given

			desc = desc || '';

			// figure out the aspect ratio of the image

			this.checkImage(url, desc, aspect);

		}

	};

	this.zoom = function (coords) {

		// apply the scaling

		if (coords.scale !== undefined) {

			this.scaling[0] = Math.min( Math.max( this.scaling[0] + coords.scale, 1 ), cfg.zoom );

			this.scaling[1] = Math.min( Math.max( this.scaling[1] + coords.scale, 1 ), cfg.zoom );

		}

		// apply the translation

		if (coords.horizontal !== undefined && coords.vertical !== undefined) {

			this.translation[0] = this.translation[0] + coords.horizontal / 2 / this.scaling[0];

			this.translation[1] = this.translation[1] + coords.vertical / 2 / this.scaling[1];

		}

		// limit the translation

		var overscanX = Math.max((this.image.offsetWidth * this.scaling[0] / this.popup.offsetWidth - 1) * 50 / this.scaling[0], 0),

			overscanY = Math.max((this.image.offsetHeight * this.scaling[1] / this.popup.offsetHeight - 1) * 50 / this.scaling[1], 0);

		this.translation[0] = Math.min( Math.max( this.translation[0] , -overscanX), overscanX );

		this.translation[1] = Math.min( Math.max( this.translation[1] , -overscanY), overscanY );

		// formulate the style rule

		var scaling = 'scale(' + this.scaling.join(',') + ')',

			translation = 'translate(' + this.translation.join('%,') + '%)';

		// apply the style rule

		this.image.style.transform = scaling + ' ' + translation;

		this.image.style.webkitTransform = scaling + ' ' + translation;

		this.image.style.msTransform = scaling + ' ' + translation;

	};

	this.addCloser = function () {

		var closer;

		// build a close gadget

		closer = document.createElement('a');

		closer.className = 'photozoom-closer';

		closer.innerHTML = 'x';

		closer.href = '#close';

		// add the close event handler

		closer.onclick = this.onHide();

		// add the close gadget to the image

		this.popup.appendChild(closer);

	};

	this.checkImage = function (url, desc, aspect) {

		// if the aspect is known

		if (aspect) {

			// add the image

			this.addImage(url, desc, aspect);

		// else if the size web-service is available

		} else if (this.cfg.sizer) {

			// retrieve the dimensions first

			var _this = this;

			useful.request.send({

				url : this.cfg.sizer.replace(/{src}/g, url),

				post : null,

				onProgress : function () {},

				onFailure : function () {},

				onSuccess : function (reply) {

					var dimensions = JSON.parse(reply.responseText);

					_this.addImage(url, desc, dimensions.y[0] / dimensions.x[0]);

				}

			});

		}

	};

	this.addImage = function (url, desc, aspect) {

		var caption, image, size,

			width = this.popup.offsetWidth,

			height = this.popup.offsetHeight;

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

			image.removeAttribute('width');

			image.setAttribute('height', '100%');

			size = 'height=' + (height * this.cfg.zoom);

		} else {

			image.setAttribute('width', '100%');

			image.removeAttribute('height');

			size = 'width=' + (width * this.cfg.zoom);

		}

		// add the components to the popup

		this.popup.appendChild(image);

		this.popup.appendChild(caption);

		this.image = image;

		// load the image

		image.src = (this.cfg.slicer) ? this.cfg.slicer.replace('{src}', url).replace('{size}', size) : url;

	};

	// events

	this.onHide = function () {

		var _this = this;

		return function (evt) {

			// cancel the click

			evt.preventDefault();

			// close the popup

			_this.hide();

		};

	};

	this.onShow = function (obj) {

		var _this = this;

		return function (event) {

			// cancel the click

			event.preventDefault();

			// try to scrape together the required properties

			var url = obj.getAttribute('href') || obj.getAttribute('src'),

				desc = obj.getAttribute('title') || obj.getAttribute('alt'),

				image = (obj.nodeName === 'IMG') ? obj : obj.getElementsByTagName('img')[0],

				aspect = image.offsetHeight / image.offsetWidth;

			// open the popup

			_this.show(url, desc, aspect);

		};

	};

	this.onReveal = function () {

		var _this = this;

		return function () {

			var image, popup = _this.popup;

			// if there is a popup

			if (popup) {

				// find the image in the popup

				image = _this.popup.getElementsByTagName('img')[0];

				// hide the busy indicator

				_this.busy.hide();

				// centre the image

				image.style.marginTop = Math.round((popup.offsetHeight - image.offsetHeight) / 2) + 'px';

				// reveal it

				popup.className = popup.className.replace(/-passive/gi, '-active');

			}

		};

	};

	this.onDoubleTapped = function () {

		var _this = this;

		return function () {

			_this.zoom({

				'scale' : (_this.scaling[0] === 1) ? _this.parent.cfg.zoom : -_this.parent.cfg.zoom,

			});

		};

	};

	this.onTransformed = function () {

		var _this = this;

		return function (coords) {

			_this.zoom(coords);

		};

	};

	// go

	this.start();

	return this;

};



// return as a require.js module

if (typeof module !== 'undefined') {

	exports = module.exports = useful.Photozoom;

}

