# useful.photozoom.js: Photo Zoom

Overlays a full screen preview of a thumbnail.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=useful-photozoom">demo</a>.

## How to use the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/photozoom.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/photozoom.min.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* and CSS3 animations in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

## How to start the script

```javascript
var photozoom = new useful.Photozoom( document.querySelectorAll('#photozoom a'), {
	'size' : './php/imagesize.php?src=../{src}',
	'slice' : './php/imageslice.php?src=../{src}&{size}',
});
photozoom.start();
```

**'size' : {string}** - Optional web-service for sizing images. An example is provided as *./php/imagesize.php*.

**'slice' : {string}** - Optional web-service for resizing images. An example is provided as *./php/imageslice.php*.

## How to control the script

### Open

```javascript
photozoom.open(url, desc, aspect);
```

Shows the popup using a specified url.

**'url' : {string}** - The url of the image to be displayed.

**'desc' : {string}** - An optional description to be used as a caption.

**'aspect' : {string}** - An optional aspect ratio of the image. If not provided the optional "imagesize.php" will be used instead. If neither is available a default value of 1 will be used.

### Close

```javascript
photozoom.close();
```

Hides the popup.

## Prerequisites

To concatenate and minify the script yourself, the following prerequisites are required:
+ https://github.com/WoollyMittens/useful-requests
+ https://github.com/WoollyMittens/useful-polyfills

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
