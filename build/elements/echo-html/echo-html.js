/*
 * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu 
 * This code may only be used under the MIT style license found in the LICENSE.txt file 
**/
"use strict";var echoHtmlProperties={html:{type:String,value:"",observer:"htmlChanged"},makelink:{type:Boolean,value:!1}},EH=function(){function a(){}return a.stampHtml=function(a){this.innerHTML=a},a.makeLinksFromHtml=function(a){return a=a&&a.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))/g,'<a target="_blank" href="$1" title="">$1</a>')},a.htmlChanged=function(){var a=this.html;this.makelink&&(a=this.makeLinksFromHtml(a)),this.stampHtml(a)},a.ready=function(){this.htmlChanged()},a}();EH.is="echo-html",EH.properties=echoHtmlProperties,Polymer(EH);