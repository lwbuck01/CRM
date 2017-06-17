/*
 * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu 
 * This code may only be used under the MIT style license found in the LICENSE.txt file 
**/
"use strict";var menuEditProperties={item:{type:Object,value:{},notify:!0}},ME=function(){function a(){}return a.init=function(){this._init()},a.ready=function(){window.menuEdit=this},a}();ME.is="menu-edit",ME.behaviors=[Polymer.NodeEditBehavior],ME.properties=menuEditProperties,Polymer(ME);