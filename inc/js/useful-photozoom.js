/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var polyfills = polyfills || {};

	// enabled the use of HTML5 elements in Internet Explorer
	polyfills.html5 = function () {
		var a, b, elementsList;
		elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
		if (navigator.userAgent.match(/msie/gi)) {
			for (a = 0 , b = elementsList.length; a < b; a += 1) {
				document.createElement(elementsList[a]);
			}
		}
	};

	// allow array.indexOf in older browsers
	polyfills.arrayIndexOf = function () {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
	};

	// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
	polyfills.querySelectorAll = function () {
		if (!document.querySelectorAll) {
			document.querySelectorAll = function (a) {
				var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
				return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
			};
		}
	};

	// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
	polyfills.addEventListener = function () {
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
	};

	// allow console.log
	polyfills.consoleLog = function () {
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
	};

	// allows Object.create (https://gist.github.com/rxgx/1597825)
	polyfills.objectCreate = function () {
		if (typeof Object.create !== "function") {
			Object.create = function (original) {
				function Clone() {}
				Clone.prototype = original;
				return new Clone();
			};
		}
	};

	// allows String.trim (https://gist.github.com/eliperelman/1035982)
	polyfills.stringTrim = function () {
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
	};

	// for immediate use
	polyfills.html5();
	polyfills.arrayIndexOf();
	polyfills.querySelectorAll();
	polyfills.addEventListener();
	polyfills.consoleLog();
	polyfills.objectCreate();
	polyfills.stringTrim();

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.requests.js: A library of useful functions to ease working with AJAX and JSON.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Fallbacks:
	<!--[if IE]>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var request = request || {};

	// adds a random argument to the AJAX URL to bust the cache
	request.randomise = function (url) {
		return url.replace('?', '?time=' + new Date().getTime() + '&');
	};

	// perform and handle an AJAX request
	request.send = function (properties) {
		var serverRequest;
		// create an HTTP request
		serverRequest = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		// add the onchange handler
		serverRequest.onreadystatechange = function () {
			request.update(serverRequest, properties);
		};
		// if the request is a POST
		if (properties.post) {
			// open the request
			serverRequest.open('POST', properties.url, true);
			// set its header
			serverRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			serverRequest.setRequestHeader("Content-length", properties.post.length);
			serverRequest.setRequestHeader("Connection", "close");
			// send the request, or fail gracefully
			try { serverRequest.send(properties.post); }
			catch (errorMessage) { properties.onFailure({readyState : -1, status : -1, statusText : errorMessage}); }
		// else treat it as a GET
		} else {
			// open the request
			serverRequest.open('GET', request.randomise(properties.url), true);
			// send the request
			try { serverRequest.send(); }
			catch (errorMessage) { properties.onFailure({readyState : -1, status : -1, statusText : errorMessage}); }
		}
	};

	// regularly updates the status of the request
	request.update = function (serverRequest, properties) {
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
	};

	// turns a string back into a DOM object
	request.deserialize = function (text) {
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
	};

	// turns a json string into a JavaScript object
	request.decode = function (text) {
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
/*
		else {
			// do something desperate
			eval('object = ' + text);
		}
*/
		// return the object
		return object;
	};

	// public functions
	useful.request = useful.request || {};
	useful.request.send = request.send;
	useful.request.decode = request.decode;

}(window.useful = window.useful || {}));

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
