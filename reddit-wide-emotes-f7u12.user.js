// ==UserScript==
// @name         Reddit Wide Emotes - F7U12
// @namespace    http://www.reddit.com/r/fffffffuuuuuuuuuuuu/#reddit-wide-emotes
// @description  View rage-face emotes from r/fffffffuuuuuuuuuuuu anywhere on reddit!
// @version      1.0
// @author       Paul McMonagle <mcmonagle.paul@gmail.com> http://www.reddit.com/user/Veeediot/
// @include      http://reddit.com/*
// @include      http://*.reddit.com/*
// @match        http://reddit.com/*
// @match        http://*.reddit.com/*
// ==/UserScript==

/**
 * Implementation of Veeediot's reddit-wide-emotes.user.js
 * With influence from cheesemoo's http://dl.dropbox.com/u/948740/mylittleandysonic1.user.js
 * Which was adapted from ghostofme's http://userscripts.org/scripts/show/94898
 * Which was, in turn, adapted from maranas' https://github.com/maranas/Reddit-Rage-Faces
 */

var redditWide = redditWide || {
	emotes: {},
	utilities: {}
};

/** 
 * AJAX Implementation - sans jQuery
 */
redditWide.utilities.Ajax = function () {
	this.ajaxObject = null;
	if (window.XMLHttpRequest) {
		this.ajaxObject = new XMLHttpRequest();
	}
	if (window.ActiveXObject) {
		this.ajaxObject = new ActiveXObject("Microsoft.XMLHTTP");
	}
};

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
 * Common reddit-wide emotes class
 */
redditWide.emotes.Common = function (subreddits) {
	this.subreddits = subreddits;
};

redditWide.emotes.Common.prototype.init = function () {
	var i, scope, url, ajax;
	
	if(typeof this.subreddits !== "object") {
		return null;
	}
	
	for (i = 0; i < this.subreddits.length; i += 1) {
		scope = this;
		url = "/r/" + this.subreddits[i] + "/stylesheet.css";
		ajax = new redditWide.utilities.Ajax();
		ajax.getResponseAsText(url, this.handleCSS, scope, this.subreddits[i]);
	}
};

/** 
 * Provide CSS data and patterns to extractCSS.
 */
redditWide.emotes.Common.prototype.handleCSS = function (data) {
	this.extractCSS(data, /a\[href[\^|]?=['"]\/[^\}]+\}/g);
};

/** 
 * Extract snippets of CSS using provided Regular Expressions, and apply them.
 */
redditWide.emotes.Common.prototype.extractCSS = function (data, pattern) {
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

// Implementation of reddit-wide-emotes for F7U12
redditWide.emotes.instance = new redditWide.emotes.Common(["fffffffuuuuuuuuuuuu"]);
redditWide.emotes.instance.init();
