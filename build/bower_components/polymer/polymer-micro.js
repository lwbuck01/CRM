!function(){function a(){document.body.removeAttribute("unresolved")}window.WebComponents?addEventListener("WebComponentsReady",a):a()}(),Polymer={Settings:function(){var a=window.Polymer||{};location.search.slice(1).split("&").forEach(function(b){b=b.split("="),b[0]&&(a[b[0]]=b[1]||!0)});var b="shadow"===a.dom,c=Boolean(Element.prototype.createShadowRoot),d=c&&!window.ShadowDOMPolyfill,e=b&&c,f=Boolean("import"in document.createElement("link")),g=f,h=!window.CustomElements||window.CustomElements.useNative;return{wantShadow:b,hasShadow:c,nativeShadow:d,useShadow:e,useNativeShadow:e&&d,useNativeImports:g,useNativeCustomElements:h}}()},function(){var a=window.Polymer;window.Polymer=function(a){var c=b(a);a=c.prototype;var d={prototype:a};return a.extends&&(d.extends=a.extends),Polymer.telemetry._registrate(a),document.registerElement(a.is,d),c};var b=function(a){return a=Polymer.Base.chainObject(a,Polymer.Base),a.registerCallback(),a.constructor};if(window.Polymer=Polymer,a)for(var c in a)Polymer[c]=a[c];Polymer.Class=b}(),Polymer.telemetry={registrations:[],_regLog:function(a){console.log("["+a.is+"]: registered")},_registrate:function(a){this.registrations.push(a),Polymer.log&&this._regLog(a)},dumpRegistrations:function(){this.registrations.forEach(this._regLog)}},Object.defineProperty(window,"currentImport",{enumerable:!0,configurable:!0,get:function(){return(document._currentScript||document.currentScript).ownerDocument}}),Polymer.Base={_addFeature:function(a){this.extend(this,a)},registerCallback:function(){this._registerFeatures(),this._doBehavior("registered")},createdCallback:function(){Polymer.telemetry.instanceCount++,this.root=this,this._doBehavior("created"),this._initFeatures()},attachedCallback:function(){this.isAttached=!0,this._doBehavior("attached")},detachedCallback:function(){this.isAttached=!1,this._doBehavior("detached")},attributeChangedCallback:function(a){this._setAttributeToProperty(this,a),this._doBehavior("attributeChanged",arguments)},extend:function(a,b){return a&&b&&Object.getOwnPropertyNames(b).forEach(function(c){this.copyOwnProperty(c,b,a)},this),a||b},copyOwnProperty:function(a,b,c){var d=Object.getOwnPropertyDescriptor(b,a);d&&Object.defineProperty(c,a,d)},_log:console.log.apply.bind(console.log,console),_warn:console.warn.apply.bind(console.warn,console),_error:console.error.apply.bind(console.error,console),_logf:function(){return this._logPrefix.concat([this.is]).concat(Array.prototype.slice.call(arguments,0))}},Polymer.Base._logPrefix=function(){var a=window.chrome||/firefox/i.test(navigator.userAgent);return a?["%c[%s::%s]:","font-weight: bold; background-color:#EEEE00;"]:["[%s::%s]:"]}(),Polymer.Base.chainObject=function(a,b){return a&&b&&a!==b&&(Object.__proto__||(a=Polymer.Base.extend(Object.create(b),a)),a.__proto__=b),a},Polymer.Base=Polymer.Base.chainObject(Polymer.Base,HTMLElement.prototype),Polymer.telemetry.instanceCount=0,function(){function a(){if(d){var a=document._currentScript||document.currentScript;a&&CustomElements.upgradeAll(a.ownerDocument)}}var b={},c=function(){return document.createElement("dom-module")};c.prototype=Object.create(HTMLElement.prototype),c.prototype.constructor=c,c.prototype.createdCallback=function(){var a=this.id||this.getAttribute("name")||this.getAttribute("is");a&&(this.id=a,b[a]=this)},c.prototype.import=function(c,d){var e=b[c];return e||(a(),e=b[c]),e&&d&&(e=e.querySelector(d)),e};var d=window.CustomElements&&!CustomElements.useNative;if(d){var e=CustomElements.ready;CustomElements.ready=!0}document.registerElement("dom-module",c),d&&(CustomElements.ready=e)}(),Polymer.Base._addFeature({_prepIs:function(){if(!this.is){var a=(document._currentScript||document.currentScript).parentNode;if("dom-module"===a.localName){var b=a.id||a.getAttribute("name")||a.getAttribute("is");this.is=b}}}}),Polymer.Base._addFeature({behaviors:[],_prepBehaviors:function(){this.behaviors.length&&(this.behaviors=this._flattenBehaviorsList(this.behaviors)),this._prepAllBehaviors(this.behaviors)},_flattenBehaviorsList:function(a){var b=[];return a.forEach(function(a){a instanceof Array?b=b.concat(this._flattenBehaviorsList(a)):a?b.push(a):this._warn(this._logf("_flattenBehaviorsList","behavior is null, check for missing or 404 import"))},this),b},_prepAllBehaviors:function(a){for(var b=a.length-1;b>=0;b--)this._mixinBehavior(a[b]);for(var b=0,c=a.length;b<c;b++)this._prepBehavior(a[b]);this._prepBehavior(this)},_mixinBehavior:function(a){Object.getOwnPropertyNames(a).forEach(function(b){switch(b){case"hostAttributes":case"registered":case"properties":case"observers":case"listeners":case"created":case"attached":case"detached":case"attributeChanged":case"configure":case"ready":break;default:this.hasOwnProperty(b)||this.copyOwnProperty(b,a,this)}},this)},_doBehavior:function(a,b){this.behaviors.forEach(function(c){this._invokeBehavior(c,a,b)},this),this._invokeBehavior(this,a,b)},_invokeBehavior:function(a,b,c){var d=a[b];d&&d.apply(this,c||Polymer.nar)},_marshalBehaviors:function(){this.behaviors.forEach(function(a){this._marshalBehavior(a)},this),this._marshalBehavior(this)}}),Polymer.Base._addFeature({_prepExtends:function(){this.extends&&(this.__proto__=this._getExtendedPrototype(this.extends))},_getExtendedPrototype:function(a){return this._getExtendedNativePrototype(a)},_nativePrototypes:{},_getExtendedNativePrototype:function(a){var b=this._nativePrototypes[a];if(!b){var c=this.getNativePrototype(a);b=this.extend(Object.create(c),Polymer.Base),this._nativePrototypes[a]=b}return b},getNativePrototype:function(a){return Object.getPrototypeOf(document.createElement(a))}}),Polymer.Base._addFeature({_prepConstructor:function(){this._factoryArgs=this.extends?[this.extends,this.is]:[this.is];var a=function(){return this._factory(arguments)};this.hasOwnProperty("extends")&&(a.extends=this.extends),Object.defineProperty(this,"constructor",{value:a,writable:!0,configurable:!0}),a.prototype=this},_factory:function(a){var b=document.createElement.apply(document,this._factoryArgs);return this.factoryImpl&&this.factoryImpl.apply(b,a),b}}),Polymer.nob=Object.create(null),Polymer.Base._addFeature({properties:{},getPropertyInfo:function(a){var b=this._getPropertyInfo(a,this.properties);return b||this.behaviors.some(function(c){return b=this._getPropertyInfo(a,c.properties)},this),b||Polymer.nob},_getPropertyInfo:function(a,b){var c=b&&b[a];return"function"==typeof c&&(c=b[a]={type:c}),c&&(c.defined=!0),c}}),Polymer.CaseMap={_caseMap:{},dashToCamelCase:function(a){var b=Polymer.CaseMap._caseMap[a];return b?b:a.indexOf("-")<0?Polymer.CaseMap._caseMap[a]=a:Polymer.CaseMap._caseMap[a]=a.replace(/-([a-z])/g,function(a){return a[1].toUpperCase()})},camelToDashCase:function(a){var b=Polymer.CaseMap._caseMap[a];return b?b:Polymer.CaseMap._caseMap[a]=a.replace(/([a-z][A-Z])/g,function(a){return a[0]+"-"+a[1].toLowerCase()})}},Polymer.Base._addFeature({_prepAttributes:function(){this._aggregatedAttributes={}},_addHostAttributes:function(a){a&&this.mixin(this._aggregatedAttributes,a)},_marshalHostAttributes:function(){this._applyAttributes(this,this._aggregatedAttributes)},_applyAttributes:function(a,b){for(var c in b)this.hasAttribute(c)||"class"===c||this.serializeValueToAttribute(b[c],c,this)},_marshalAttributes:function(){this._takeAttributesToModel(this)},_takeAttributesToModel:function(a){for(var b=0,c=this.attributes.length;b<c;b++)this._setAttributeToProperty(a,this.attributes[b].name)},_setAttributeToProperty:function(a,b){if(!this._serializing){var c=Polymer.CaseMap.dashToCamelCase(b),d=this.getPropertyInfo(c);if(d.defined||this._propertyEffects&&this._propertyEffects[c]){var e=this.getAttribute(b);a[c]=this.deserialize(e,d.type)}}},_serializing:!1,reflectPropertyToAttribute:function(a){this._serializing=!0,this.serializeValueToAttribute(this[a],Polymer.CaseMap.camelToDashCase(a)),this._serializing=!1},serializeValueToAttribute:function(a,b,c){var d=this.serialize(a);(c||this)[void 0===d?"removeAttribute":"setAttribute"](b,d)},deserialize:function(a,b){switch(b){case Number:a=Number(a);break;case Boolean:a=null!==a;break;case Object:try{a=JSON.parse(a)}catch(a){}break;case Array:try{a=JSON.parse(a)}catch(b){a=null,console.warn("Polymer::Attributes: couldn`t decode Array as JSON")}break;case Date:a=new Date(a);break;case String:}return a},serialize:function(a){switch(typeof a){case"boolean":return a?"":void 0;case"object":if(a instanceof Date)return a;if(a)try{return JSON.stringify(a)}catch(a){return""}default:return null!=a?a:void 0}}}),Polymer.Base._addFeature({_setupDebouncers:function(){this._debouncers={}},debounce:function(a,b,c){this._debouncers[a]=Polymer.Debounce.call(this,this._debouncers[a],b,c)},isDebouncerActive:function(a){var b=this._debouncers[a];return b&&b.finish},flushDebouncer:function(a){var b=this._debouncers[a];b&&b.complete()},cancelDebouncer:function(a){var b=this._debouncers[a];b&&b.stop()}}),Polymer.version="1.0.2",Polymer.Base._addFeature({_registerFeatures:function(){this._prepIs(),this._prepAttributes(),this._prepBehaviors(),this._prepExtends(),this._prepConstructor()},_prepBehavior:function(a){this._addHostAttributes(a.hostAttributes)},_marshalBehavior:function(a){},_initFeatures:function(){this._marshalHostAttributes(),this._setupDebouncers(),this._marshalBehaviors()}});