// ==UserScript==
// @name         Reddit-Wide Emotes
// @namespace    https://github.com/pmcmonagle/Reddit-Wide-Emotes
// @description  Base class for implementing subreddit-specific emotes that can be used on all parts of reddit. Note: this does nothing on its own - see usage examples.
// @version      1.1.0
// @author       Paul McMonagle <mcmonagle.paul@gmail.com> https://github.com/pmcmonagle
// @include      http://reddit.com/*
// @include      http://*.reddit.com/*
// @match        http://reddit.com/*
// @match        http://*.reddit.com/*
// ==/UserScript==
 
/** 
 * This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

// Contact me on Reddit: http://www.reddit.com/message/compose/?to=Veeediot
// Special thanks to cheesemoo and his pony emotes script: http://dl.dropbox.com/u/948740/mylittleandysonic1.user.js

var redditWide = redditWide || {
	emotes: {},
	utilities: {}
};

/** 
 * AJAX utility class.
 * 
 * @constructor
 * @this {redditWide.utilities.Ajax}
 */
redditWide.utilities.Ajax = function () {
	this.ajaxObject = null;
	if (window.XMLHttpRequest) {
		this.ajaxObject = new XMLHttpRequest();
	}
	// Probably redundant since IE doesn't support user scripts.
	if (window.ActiveXObject) {
		this.ajaxObject = new ActiveXObject("Microsoft.XMLHTTP");
	}
};

/** 
 * Applies the response text of an AJAX request to a supplied callback function.
 * 
 * @this {redditWide.utilities.Ajax}
 * @param {String} url The URL to retreive data from. Must be same origin, eg. http://www.reddit.com/*.
 * @param {Function} callback A callback function that expects ajax.responseText as its first argument.
 * @param {Object|null} [scope] The callback function will be applied to the scope of this object if provided. (Optional)
 * @param {*} [args] All additional arguments will be applied to the callback function. (Optional)
 */
redditWide.utilities.Ajax.prototype.getResponseAsText = function (url, callback, scope) {
	var ajax = this.ajaxObject,
		args = Array.prototype.slice.call(arguments);
	
	args = args.length > 2 ? args.slice(2) : [];
	scope = scope || null;
	
	while (args[0] === scope) {
		args.shift();
	}
	
	if (ajax === null || typeof url !== "string" || typeof callback !== "function") {
		return null;
	}
	
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4) {
			args.unshift(ajax.responseText);
			callback.apply(scope, args);
		}
	};
	
	ajax.open("GET", url, true);
	ajax.send(null);
};

/** 
 * Reddit-Wide Emotes class.
 * 
 * @constructor
 * @this {redditWide.emotes.Common}
 * @param {Array} subreddits An array of subreddit strings to pull emotes from; eg. ['javascript'] for /r/javascript
 */
redditWide.emotes.Common = function (subreddits) {
	this.subreddits = subreddits;
};

/** 
 * Reddit-Wide Emotes class.
 * 
 * @constructor
 * @this {redditWide.emotes.Common}
 * @param {Array} subreddits An array of subreddit strings to pull emotes from; eg. ['javascript'] for /r/javascript
 */
redditWide.emotes.Common.prototype.requestStyles = function () {
	var i, scope, url, ajax;
	
	if(typeof this.subreddits !== "object") {
		return null;
	}
	
	for (i = 0; i < this.subreddits.length; i += 1) {
		scope = this;
		url = "/r/" + this.subreddits[i] + "/stylesheet.css";
		ajax = new redditWide.utilities.Ajax();
		ajax.getResponseAsText(url, this.responseHandler, scope, this.subreddits[i]);
	}
};

/** 
 * Callback function for AJAX requests to various subreddit stylesheets.
 * 
 * @private
 * @param {String} data Ajax responseText from a subreddit stylesheet.
 * @param {String} [subreddit] Name of the subreddit where the data originated from. (optional)
 */
redditWide.emotes.Common.prototype.responseHandler = function (data, subreddit) {
	this.applyStyles(data, /a\[href[\^|]?=['"]\/[^\}]+\}/g);
	switch(subreddit) {
		default:
			break;
	}
};

/** 
 * Tests a stylesheet from an AJAX response against a regular expression.
 * Positive matches are added to the page as a <style> tag within the head of the document.
 * 
 * @private
 * @param {String} data Ajax responseText from a subreddit stylesheet.
 * @param {RegExp} pattern Regular expression to test the data against before adding it to the page. (optional)
 */
redditWide.emotes.Common.prototype.applyStyles = function (data, pattern) {
	var styles = data.match(pattern),
		styleElement,
		styleText;
	
	if (styles) {
		styleElement = document.createElement("style");
		styleElement.type = "text/css";
		styleElement.title = "applied_subreddit_stylesheet";
		styleText = document.createTextNode(styles.join("\n"));
		styleElement.appendChild(styleText);
		document.head.appendChild(styleElement);
	}
};

/* Examples of Usage */
 
/*
// Easy Mode - pulls only the a[href= stuff.
redditWide.emotes.instance = new redditWide.emotes.Common(["fffffffuuuuuuuuuuuu"]);
redditWide.emotes.instance.requestStyles();
*/

/*
// Hero Mode - extend the Common class for fun and profit!
redditWide.emotes.Mylittlepony = function () {};
redditWide.emotes.Mylittlepony.prototype = new redditWide.emotes.Common(["mylittlepony", "mylittleonions"]);
redditWide.emotes.Mylittlepony.prototype.responseHandler = function (data, subreddit) {
	this.applyStyles(data, /a\[href[\^|]?=['"]\/[^\}]+\}/g);
	if (subreddit === "mylittlepony") {
		// Note: this doesn't actually exist in the r/mylittlepony stylesheet, but I've seen similar things in other subreddits.
		this.applyStyles(data, /\/\/===IMAGINARY CSS TOKEN===[\s\S]*\/\/===END IMAGINARY CSS TOKEN===/g);
	}
};

redditWide.emotes.instance = new redditWide.emotes.Mylittlepony();
redditWide.emotes.instance.requestStyles();
*/
