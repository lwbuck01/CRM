/*
 * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu 
 * This code may only be used under the MIT style license found in the LICENSE.txt file 
**/
!function(window){function CrmAPIInit(node,id,tabData,clickData,secretKey,nodeStorage,contextData,greasemonkeyData,isBackground,options,enableBackwardsCompatibility,tabIndex,extensionId){function CallbackStorage(){var a=this;this._items={},this._index=0,this.add=function(b){return a._items[++a._index]=b,a._index},this.remove=function(b){if("number"==typeof b||"string"==typeof b)delete a._items[~~b];else for(var c in a._items)a._items.hasOwnProperty(c)&&a._items[c]===b&&delete a._items[c]},this.get=function(b){return a._items[b]},this.forEach=function(b){for(var c in a._items)a._items.hasOwnProperty(c)&&b(a._items[c],c)},Object.defineProperty(this,"length",{get:function(){var b=0;return a.forEach(function(){b++}),b}})}function getStackTrace(a){return a.stack.split("\n")}function createDeleterFunction(a){return function(){callInfo.remove(a)}}function createCallback(a,b,c){c=c||{};var d=c.persistent,e=c.maxCalls||1;b=b||new Error;var f=callInfo.add({callback:a,stackTrace:_this.stackTraces&&getStackTrace(b),persistent:d,maxCalls:e});return d||setTimeout(createDeleterFunction(f),36e5),f}function createCallbackFunction(a,b,c){function d(b,c,d){if("error"===b){if(_this.onError&&_this.onError(c),_this.stackTraces&&setTimeout(function(){console.log("stack trace: "),d.forEach(function(a){console.log(a)})},5),_this.errors)throw new Error("CrmAPIError: "+c.error);console.warn("CrmAPIError: "+c.error)}else a.apply(_this,c)}return createCallback(d,b,c)}function handshakeFunction(){sendMessage=function(a){a.onFinish&&(a.onFinish=createCallback(a.onFinish.fn,new Error,{maxCalls:a.onFinish.maxCalls,persistent:a.onFinish.persistent})),port.postMessage(a)},queue.forEach(function(a){sendMessage(a)}),queue=null}function callbackHandler(a){var b=callInfo.get(a.callbackId);b&&(b.callback(a.type,a.data,b.stackTrace),b.persistent||(b.maxCalls--,0===b.maxCalls&&callInfo.remove(a.callbackId)))}function executeCode(a){var b=(new Date).toLocaleString(),c=(new Error).stack.split("\n")[1];c.indexOf("eval")>-1&&(c=(new Error).stack.split("\n")[2]);var d;try{var e=isBackground?self:window;d={type:"success",result:JSON.stringify(specialJSON.toJSON(eval.apply(e,[a.code])))}}catch(a){d={type:"error",result:{stack:a.stack,name:a.name,message:a.message}}}sendMessage({id:id,type:"logCrmAPIValue",tabId:_this.tabId,tabIndex:tabIndex,data:{type:"evalResult",value:d,id:id,tabIndex:tabIndex,callbackIndex:a.logCallbackIndex,lineNumber:"<eval>:0",timestamp:b,tabId:_this.tabId}})}function getObjectProperties(a){var b=Object.getOwnPropertyNames(Object.getPrototypeOf(a)),c=[];for(var d in a)c.push(d);return b.concat(c)}function getCodeSections(a){var b=a.exec(leadingWordRegex)[1];a=a.slice(b.length);for(var c,d=[];c=sectionRegex.exec(a);){var e=c[4]||c[5];d.push(e),a=a.slice(e.length)}var f=endRegex.exec(a);return f&&(f={type:f[3]?"brackets":"dotnotation",currentWord:f[2]||f[6]}),{lead:b,words:d,end:f}}function getSuggestions(a){var b=getCodeSections(a.code);if(!b.end)return null;if(!(b.lead in window))return null;var c=window[b.lead];if(c){var d;for(d=0;d<b.words.length;d++){if(!(b.words[d]in c))return null;c=c[b.words[d]]}var e={full:[],partial:[]},f=getObjectProperties(c);for(d=0;d<f.length;d++)f[d]===b.end.currentWord?e.full.push(f[d]):0===f[d].indexOf(b.end.currentWord)&&e.partial.push(f[d]);return e.full.sort().concat(e.partial.sort())}return null}function getHints(a){var b=getSuggestions(a);b=b||[],sendMessage({id:id,type:"displayHints",tabId:_this.tabId,tabIndex:tabIndex,data:{hints:b,id:id,tabIndex:tabIndex,callbackIndex:a.logCallbackIndex,tabId:_this.tabId}})}function saveLogValues(a){var b=specialJSON.toJSON(a);return sentLogs.push(b),{data:b,logId:sentLogs.length-1}}function createVariable(a,b){var c,d=isBackground?self:window;for(c=1;"temp"+c in d;c++);return d["temp"+c]=a.originalValues[b],"temp"+c}function createLocalVariable(a){var b=sentLogs[a.code.logId],c=("["+a.code.index+"]"+a.code.path.replace(/\.(\w+)/g,function(a,b){return'["'+b+'"]'})).split("][");c[0]=c[0].slice(1),c[c.length-1]=c[c.length-1].slice(0,c[c.length-1].length-1),c=JSON.stringify(c.map(function(a){return JSON.parse(a)}));for(var d=0;d<b.paths.length;d++)if(c===JSON.stringify(b.paths[d])){var e=createVariable(b,d);return void this.log("Created local variable "+e)}this.log("Could not create local variable")}function messageHandler(a){if(queue){for(var b=a.instances,c=0;c<b.length;c++)instances.add({id:b[c].id,tabIndex:b[c].tabIndex,sendMessage:generateSendInstanceMessageFunction(b[c].id,b[c].tabIndex)});var d=[];instances.forEach(function(a){d.push(a)}),instancesReady=!0,instancesReadyListeners.forEach(function(a){a(d)}),handshakeFunction()}else switch(a.messageType){case"callback":callbackHandler(a);break;case"executeCRMCode":executeCode(a);break;case"getCRMMHints":getHints(a);break;case"storageUpdate":remoteStorageChange(a.changes);break;case"instancesUpdate":instancesChange(a.change);break;case"instanceMessage":instanceMessageHandler(a);break;case"localStorageProxy":localStorageProxyHandler(a);break;case"backgroundMessage":backgroundPageMessageHandler(a);break;case"createLocalLogVariable":createLocalVariable(a);break;case"dummy":}}function mergeArrays(a,b){for(var c=0;c<b.length;c++)a[c]&&"object"==typeof b[c]&&void 0!==a[c]&&null!==a[c]?Array.isArray(b[c])?a[c]=mergeArrays(a[c],b[c]):a[c]=mergeObjects(a[c],b[c]):a[c]=b[c];return a}function mergeObjects(a,b){for(var c in b)b.hasOwnProperty(c)&&("object"==typeof b[c]&&void 0!==a[c]&&null!==a[c]?Array.isArray(b[c])?a[c]=mergeArrays(a[c],b[c]):a[c]=mergeObjects(a[c],b[c]):a[c]=b[c]);return a}function findElementsOnPage(){if("undefined"==typeof window.document||!contextData)return void(contextData={target:null,toElement:null,srcElement:null});var a="crm_element_identifier_"+contextData.target;contextData.target=window.document.querySelector("."+a),contextData.target&&contextData.target.classList.remove(a);var b="crm_element_identifier_"+contextData.toElement;contextData.toElement=window.document.querySelector("."+b),contextData.toElement&&contextData.toElement.classList.remove(b);var c="crm_element_identifier_"+contextData.srcElement;contextData.srcElement=window.document.querySelector("."+c),contextData.srcElement&&contextData.srcElement.classList.remove(c)}function checkType(a,b,c){var d;if(d=Array.isArray(b)?b:[b],"boolean"==typeof c&&c)return void 0!==a&&null!==a&&(d.indexOf(typeof a)>-1&&!a.splice||d.indexOf("array")>-1&&"object"==typeof a&&a.splice);if(void 0===a||null===a)throw new Error("Value "+(c?"of "+c:"")+" is undefined or null");if(!(d.indexOf(typeof a)>-1&&!a.splice||d.indexOf("array")>-1&&"object"==typeof a&&a.splice))throw new Error("Value "+(c?"of "+c:"")+" is not of type"+(d.length>1?"s "+d.join(", "):" "+d));return!0}function lookup(a,b,c){checkType(a,"array","path"),checkType(b,"object","data");var d=a.length;c&&d--;for(var e=b,f=0;f<d;f++)e[a[f]]||f+1===d||(e[a[f]]={}),e=e[a[f]];return e}function isFn(a){return a&&"function"==typeof a}function instancesChange(a){switch(a.type){case"removed":instances.forEach(function(b,c){b.id===a.value&&instances.remove(c)});break;case"added":instances.add({id:a.value,tabIndex:a.tabIndex,sendMessage:generateSendInstanceMessageFunction(a.value,a.tabIndex)})}}function localStorageProxyHandler(a){var b=a.message.indexIds;for(var c in a.message)if("indexIds"!==c)try{localStorageProxy.defineProperty(localStorageProxy,c,{get:function(){return localStorageProxy[c]},set:function(a,b){localStorageProxyData.onSet(a,b)}})}catch(a){}localStorageProxyData.onSet=function(c,d){function e(){if(i[2]!==j[2])switch(j[1]){case"Link":var a=j[2].split(",").map(function(a){return{url:a,newTab:!0}});_this.crm.link.setLinks(b[f],a);break;case"Script":var c=j[2].split("%124");_this.crm.script.setScript(b[f],c[1],function(){_this.crm.setLaunchMode(b[f],c[0])})}}if(isNaN(parseInt(c,10)))localStorageProxy[c]=d,sendMessage({id:id,tabIndex:tabIndex,type:"applyLocalStorage",data:{tabIndex:tabIndex,key:c,value:d},tabId:_this.tabId});else{var f=parseInt(c,10),g=localStorageProxy[c],h=d;localStorageProxy[c]=d;var i=g.split("%123"),j=h.split("%123");if(f>=a.message.numberofrows){var k={name:j[0],type:j[1]};switch(j[1]){case"Link":k.linkData=j[2].split(",").map(function(a){return{url:a,newTab:!0}});break;case"Script":var l=j[2].split("%124");k.scriptData={launchMode:l[0],script:l[1]}}_this.crm.createNode(k)}else{var m={};i[0]!==j[0]&&(m.name=j[0]),i[1]!==j[1]&&(m.type=j[1]),m.name||m.type?_this.crm.editNode(b[f],m,e):e()}}}}function instanceMessageHandler(a){commListeners.forEach(function(b){b&&"function"==typeof b&&b(a.message)})}function generateBackgroundResponse(a){return function(b){sendMessage({id:id,tabIndex:tabIndex,type:"respondToBackgroundMessage",data:{message:b,id:a.id,tabIndex:tabIndex,tabId:a.tabId,response:a.respond},tabId:_this.tabId})}}function backgroundPageMessageHandler(a){backgroundPageListeners.forEach(function(b){b&&"function"==typeof b&&b(a.message,generateBackgroundResponse(a))})}function generateSendInstanceMessageFunction(a,b){return function(c,d){sendInstanceMessage(a,b,c,d)}}function sendInstanceMessage(a,b,c,d){function e(a,b){d&&"function"==typeof d&&d("error"===a?{error:!0,success:!1,message:b}:{error:!1,success:!0})}sendMessage({id:id,type:"sendInstanceMessage",data:{toInstanceId:a,toTabIndex:b,tabIndex:b,message:c,id:id,tabId:_this.tabId},tabId:_this.tabId,tabIndex:b,onFinish:{maxCalls:1,fn:e}})}function updateCommHandlerStatus(a){sendMessage({id:id,type:"changeInstanceHandlerStatus",tabIndex:tabIndex,data:{tabIndex:tabIndex,hasHandler:a},tabId:_this.tabId})}function notifyChanges(a,b,c,d){Array.isArray(a)&&(a=a.join(".")),storageListeners.forEach(function(e){e.key.indexOf(a)>-1&&isFn(e.callback)&&e.callback(e.key,b,c,d||!1)}),storagePrevious=nodeStorage}function remoteStorageChange(a){for(var b=0;b<a.length;b++){notifyChanges(a[b].keyPath,a[b].oldValue,a[b].newValue,!0),Array.isArray(a[b].keyPath)||(a[b].keyPath=[a[b].keyPath]);var c=lookup(a[b].keyPath,nodeStorage,!0);c=c||{},c[a[b].keyPath[a[b].keyPath.length-1]]=a[b].newValue,storagePrevious=nodeStorage}}function localStorageChange(a,b,c){sendMessage({id:id,type:"updateStorage",data:{type:"nodeStorage",nodeStorageChanges:[{keyPath:a,oldValue:b,newValue:c}],id:id,tabIndex:tabIndex,tabId:_this.tabId},tabIndex:tabIndex,tabId:_this.tabId}),notifyChanges(a,b,c,!1)}function sendOptionalCallbackCrmMessage(a,b,c){function d(a,c,d){if(b)if("error"===a){if(_this.onError&&_this.onError(c),_this.stackTraces&&setTimeout(function(){console.log("stack trace: "),d.forEach(function(a){console.log(a)})},5),_this.errors)throw new Error("CrmAPIError: "+c.error);console.warn("CrmAPIError: "+c.error)}else b.apply(_this,c)}var e={type:"crm",id:id,tabIndex:tabIndex,action:a,crmPath:node.path,data:c,onFinish:{maxCalls:1,fn:d},tabId:_this.tabId};sendMessage(e)}function sendCrmMessage(a,b,c){if(!b)throw new Error("CrmAPIError: No callback was supplied");sendOptionalCallbackCrmMessage(a,b,c)}function genChromeRequest(a,b){var c={api:a,chromeAPIArguments:[],_sent:!1};_this.warnOnChromeFunctionNotSent&&window.setTimeout(function(){c._sent||console.warn("Looks like you didn't send your chrome function, set crmAPI.warnOnChromeFunctionNotSent to false to disable this message")},5e3),Object.defineProperty(c,"type",{get:function(){return b}});var d;return d=function(){var a=function(){for(var a=0;a<arguments.length;a++){var b=arguments[a];"function"==typeof b?c.chromeAPIArguments.push({type:"fn",isPersistent:!1,val:createCallback(b,new Error,{maxCalls:1})}):c.chromeAPIArguments.push({type:"arg",val:jsonFn.stringify(b)})}return d};return a.args=a.a=a,a.return=a.r=chromeReturnFunction,a.persistent=a.p=persistentCallbackFunction,a.send=a.s=chromeSendFunction,a.request=c,a}()}function chromeReturnFunction(a){return this.request.chromeAPIArguments.push({type:"return",val:createCallback(a,new Error,{maxCalls:1})}),this}function persistentCallbackFunction(){for(var a=Array.prototype.slice.apply(arguments),b=0;b<a.length;b++)this.request.chromeAPIArguments.push({type:"fn",isPersistent:!0,val:createCallback(a[b],new Error,{persistent:!0})});return this}function chromeSendFunction(){function a(a,b){a.stackTrace&&(console.warn("Remote stack trace:"),a.stackTrace.forEach(function(a){console.warn(a)})),console.warn((a.stackTrace?"Local s":"S")+"tack trace:"),b.forEach(function(a){console.warn(a)})}function b(b,d,e){if("error"===b||"chromeError"===b){if(c.request.onError?c.request.onError(d):_this.onError&&_this.onError(d),_this.stackTraces&&window.setTimeout(function(){a(d,e)},5),_this.errors)throw new Error("CrmAPIError: "+d.error);_this.onError||console.warn("CrmAPIError: "+d.error)}else callInfo.get(d.callbackId).callback.apply(window,d.params),callInfo.get(d.callbackId).persistent||callInfo.remove(d.callbackId)}var c=this;this.request._sent=!0;var d=0,e=!1;this.request.chromeAPIArguments.forEach(function(a){"fn"!==a.type&&"return"!==a.type||(d++,a.isPersistent&&(e=!0))});var f={maxCalls:d,persistent:e,fn:b},g={type:"chrome",id:id,tabIndex:tabIndex,api:c.request.api,args:c.request.chromeAPIArguments,tabId:tabData.id,requestType:c.request.type,onFinish:f};sendMessage(g)}function chromeSpecialRequest(a,b){return genChromeRequest(a,b)}function setupRequestEvent(a,b,c){"use strict";a["on"+c]&&b.addEventListener(c,function(d){var e={responseText:b.responseText,responseXML:b.responseXML,readyState:b.readyState,responseHeaders:null,status:null,statusText:null,finalUrl:null};switch(c){case"progress":e.lengthComputable=d.lengthComputable,e.loaded=d.loaded,e.total=d.total;break;case"error":break;default:if(4!==b.readyState)break;e.responseHeaders=b.getAllResponseHeaders(),e.status=b.status,e.statusText=b.statusText}a["on"+c](e)})}function instantCb(a){a()}function addNotificationListener(a,b,c){sendMessage({id:id,type:"addNotificationListener",data:{notificationId:a,onClick:b,tabIndex:tabIndex,onDone:c,id:id,tabId:_this.tabId},tabIndex:tabIndex,tabId:_this.tabId})}var _this=this;enableBackwardsCompatibility||(localStorageProxy="undefined"==typeof localStorage?{}:localStorage),this.stackTraces=!0,this.errors=!0,this.debugOnerror=!1,this.onError=null,this.warnOnChromeFunctionNotSent=!0,this.options=function(a){return mergeObjects(a||{},options)};var jsonFn={stringify:function(a){return JSON.stringify(a,function(a,b){return b instanceof Function||"function"==typeof b?b.toString():b instanceof RegExp?"_PxEgEr_"+b:b})},parse:function(str,date2Obj){var iso8061=!!date2Obj&&/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d *)?)Z$/;return JSON.parse(str,function(key,value){if("string"!=typeof value)return value;if(value.length<8)return value;var prefix=value.substring(0,8);return iso8061&&value.match(iso8061)?new Date(value):"function"===prefix?eval("("+value+")"):"_PxEgEr_"===prefix?eval(value.slice(8)):value})}},specialJSON={_regexFlagNames:["global","multiline","sticky","unicode","ignoreCase"],_getRegexFlags:function(a){var b=[];return this._regexFlagNames.forEach(function(c){a[c]&&("sticky"===c?b.push("y"):b.push(c[0]))}),b},_stringifyNonObject:function(a){if("function"==typeof a){var b=a.toString(),c=this._fnRegex.exec(b);a="__fn$("+c[2]+"){"+c[10]+"}$fn__"}else a instanceof RegExp?a="__regexp$"+JSON.stringify({regexp:a.source,flags:this._getRegexFlags(a)})+"$regexp__":a instanceof Date?a="__date$"+(a+"")+"$date__":"string"==typeof a&&(a=a.replace(/\$/g,"\\$"));return JSON.stringify(a)},_fnRegex:/^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,_specialStringRegex:/^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,_fnCommRegex:/^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,_parseNonObject:function(a){var b=JSON.parse(a);if("string"==typeof b){var c=void 0;if(!(c=this._specialStringRegex.exec(b)))return b.replace(/\\\$/g,"$");var d=c[2];switch(c[1]){case"fn":var e=this._fnCommRegex.exec(d);return""!==e[1].trim()?new Function(e[1].split(","),e[6]):new Function(e[6]);case"regexp":var f=JSON.parse(d);return new RegExp(f.regexp,f.flags.join(""));case"date":return new Date}}return b},_iterate:function(a,b,c){return Array.isArray(b)?(a=a||[],b.forEach(function(b,d,e){a[d]=c(b,d,e)})):(a=a||{},Object.getOwnPropertyNames(b).forEach(function(d){a[d]=c(b[d],d,b)})),a},_isObject:function(a){return!(a instanceof Date||a instanceof RegExp||a instanceof Function)&&("object"==typeof a&&!Array.isArray(a))},_toJSON:function(a,b,c,d){var e=this;if(this._isObject(b)||Array.isArray(b)){if(d.originalValues.indexOf(b)===-1){var f=d.refs.length;d.refs[f]=a,d.paths[f]=c,d.originalValues[f]=b}return a=this._iterate(a,b,function(b,f){if(e._isObject(b)||Array.isArray(b)){var g=void 0;if((g=d.originalValues.indexOf(b))===-1){g=d.refs.length,a=Array.isArray(b)?[]:{},d.refs.push(null),d.paths[g]=c;var h=e._toJSON(a[f],b,c.concat(f),d);d.refs[g]=h.data,d.originalValues[g]=b}return"__$"+g+"$__"}return e._stringifyNonObject(b)}),{refs:d.refs,data:a,rootType:Array.isArray(b)?"array":"object"}}return{refs:[],data:this._stringifyNonObject(b),rootType:"normal"}},toJSON:function(a,b){var c=this;void 0===b&&(b=[]);var d=[[]],e=[a];if(this._isObject(a)||Array.isArray(a)){var f=Array.isArray(a)?[]:{};return b.push(f),f=this._iterate(f,a,function(a,g){if(c._isObject(a)||Array.isArray(a)){var h=void 0;if((h=e.indexOf(a))===-1){h=b.length,b.push(null);var i=c._toJSON(f[g],a,[g],{refs:b,paths:d,originalValues:e}).data;e[h]=a,d[h]=[g],b[h]=i}return"__$"+h+"$__"}return c._stringifyNonObject(a)}),{refs:b,data:f,originalValues:e,rootType:Array.isArray(a)?"array":"object",paths:d}}return{refs:[],data:this._stringifyNonObject(a),rootType:"normal",originalValues:e,paths:[]}},_refRegex:/^__\$(\d+)\$__$/,_replaceRefs:function(a,b){var c=this;return this._iterate(a,a,function(a){var d;if(d=c._refRegex.exec(a)){var e=d[1],f=b[~~e];return f.parsed?f.ref:(f.parsed=!0,c._replaceRefs(f.ref,b))}return c._parseNonObject(a)}),a},fromJSON:function(a){var b=JSON.parse(a);b.refs=b.refs.map(function(a){return{ref:a,parsed:!1}});var c=b.refs;return"normal"===b.rootType?JSON.parse(b.data):(c[0].parsed=!0,this._replaceRefs(c[0].ref,c))}};Object.defineProperty(this,"tabId",{get:function(){return tabData.id}}),Object.defineProperty(this,"currentTabIndex",{get:function(){return tabIndex}}),Object.defineProperty(this,"permissions",{get:function(){return JSON.parse(JSON.stringify(node.permissions))}}),Object.defineProperty(this,"id",{get:function(){return id}}),Object.defineProperty(this,"contextData",{get:function(){return contextData}});var callInfo=new CallbackStorage,queue=[],sendMessage=function(a){queue.push(a)},port;isBackground||(port=_chrome.chrome.runtime.connect(extensionId,{name:JSON.stringify(secretKey)}));var instancesReady=!1,instancesReadyListeners=[],instances=new CallbackStorage,leadingWordRegex=/^(\w+)/,sectionRegex=/^((\[(['"`])(\w+)\3\])|(\.(\w+)))/,endRegex=/^(\.(\w+)?|\[((['"`])((\w+)(\11)?)?)?)?/,sentLogs=["filler"];isBackground?port=self.handshake(id,secretKey,messageHandler):(port.onMessage.addListener(messageHandler),port.postMessage({id:id,key:secretKey,tabId:_this.tabId}));var emptyFn=function(){for(var a=[],b=0;b<arguments.length;b++)a[b-0]=arguments[b]};findElementsOnPage(),this.comm={};var commListeners=new CallbackStorage,backgroundPageListeners=new CallbackStorage;this.comm.getInstances=function(a){if(instancesReady){var b=[];instances.forEach(function(a){b.push(a)}),a(b)}else instancesReadyListeners.push(a)},this.comm.sendMessage=function(a,b,c,d){var e;e="number"==typeof a?instances.get(a):a,isFn(e.sendMessage)&&e.sendMessage(c,d)},this.comm.addListener=function(a){var b=commListeners.length,c=commListeners.add(a);return 0===b&&updateCommHandlerStatus(!0),c},this.comm.removeListener=function(a){commListeners.remove(a),0===commListeners.length&&updateCommHandlerStatus(!1)},this.comm.messageBackgroundPage=function(a,b){isBackground?self.log("The function messageBackgroundPage is not available in background pages"):sendMessage({id:id,type:"sendBackgroundpageMessage",data:{message:a,id:id,tabId:_this.tabId,tabIndex:tabIndex,response:createCallbackFunction(b,new Error,{maxCalls:1})},tabIndex:tabIndex,tabId:_this.tabId})},this.comm.listenAsBackgroundPage=function(a){isBackground?backgroundPageListeners.add(a):self.log("The function listenAsBackgroundPage is not available in non-background script")};var storage=nodeStorage;this.storage={};var storageListeners=new CallbackStorage,storagePrevious={};storage=storage||{},this.storage.get=function(a){if(!a)return storage;if(checkType(a,"string",!0)){var b=a;if("string"==typeof b){if(b.indexOf(".")===-1)return storage[b];a=b.split(".")}}return checkType(a,"array","keyPath"),Array.isArray(a)?lookup(a,storage):void 0},this.storage.set=function(a,b){if(checkType(a,"string",!0)){var c=a;if("string"==typeof c){if(c.indexOf(".")===-1)return localStorageChange(a,nodeStorage[c],b),nodeStorage[c]=b,void(storagePrevious=nodeStorage);a=c.split(".")}}if(checkType(a,"array",!0)){var d=a;if(Array.isArray(d)){for(var e=nodeStorage,f=d.length-1,g=0;g<f;g++)void 0===e[d[g]]&&(e[d[g]]={}),e=e[d[g]];return localStorageChange(d,e[d[d.length-1]],b),e[d[d.length-1]]=b,void(storagePrevious=nodeStorage)}}checkType(a,["object"],"keyPath");var h=a;if("object"==typeof h)for(var i in h)h.hasOwnProperty(i)&&(localStorageChange(i,nodeStorage[i],h[i]),nodeStorage[i]=h[i]);storagePrevious=nodeStorage},this.storage.remove=function(a){if(checkType(a,"string",!0)){var b=a;if("string"==typeof b){if(b.indexOf(".")===-1)return notifyChanges(b,nodeStorage[b],void 0),delete nodeStorage[b],void(storagePrevious=nodeStorage);a=b.split(".")}}if(checkType(a,"array",!0)){var c=a;if(Array.isArray(c)){var d=lookup(c,nodeStorage,!0);return notifyChanges(c.join("."),d[c[c.length-1]],void 0),delete d[c[c.length-1]],void(storagePrevious=nodeStorage)}}storagePrevious=nodeStorage},this.storage.onChange={},this.storage.onChange.addListener=function(a,b){return storageListeners.add({callback:a,key:b})},this.storage.onChange.removeListener=function(a,b){var c;"number"==typeof a?storageListeners.remove(a):(c=[],storageListeners.forEach(function(c,d){c.callback===a&&(void 0!==b?c.key===b&&storageListeners.remove(d):storageListeners.remove(d))}))},this.general=this,this.getSelection=function(){return clickData.selectionText||window.getSelection()&&window.getSelection().toString()||""},this.getClickInfo=function(){return clickData},this.getTabInfo=function(){return tabData},this.getNode=function(){return node},this.crm={},this.crm.getTree=function(a){sendCrmMessage("getTree",a)},this.crm.getSubTree=function(a,b){sendCrmMessage("getSubTree",b,{nodeId:a})},this.crm.getNode=function(a,b){sendCrmMessage("getNode",b,{nodeId:a})},this.crm.getNodeIdFromPath=function(a,b){sendCrmMessage("getNodeIdFromPath",b,{path:a})},this.crm.queryCrm=function(a,b){sendCrmMessage("queryCrm",b,{query:a})},this.crm.getParentNode=function(a,b){sendCrmMessage("getParentNode",b,{nodeId:a})},this.crm.getNodeType=function(a,b){sendCrmMessage("getNodeType",b,{nodeId:a})},this.crm.getNodeValue=function(a,b){sendCrmMessage("getNodeValue",b,{nodeId:a})},this.crm.createNode=function(a,b){sendOptionalCallbackCrmMessage("createNode",b,{options:a})},this.crm.copyNode=function(a,b,c){b=b||{};var d=JSON.parse(JSON.stringify(b));sendOptionalCallbackCrmMessage("copyNode",c,{nodeId:a,options:d})},this.crm.moveNode=function(a,b,c){var d;d=b?JSON.parse(JSON.stringify(b)):{},sendOptionalCallbackCrmMessage("moveNode",c,{nodeId:a,position:d})},this.crm.deleteNode=function(a,b){sendOptionalCallbackCrmMessage("deleteNode",b,{nodeId:a})},this.crm.editNode=function(a,b,c){b=b||{};var d=JSON.parse(JSON.stringify(b));sendOptionalCallbackCrmMessage("editNode",c,{options:d,nodeId:a})},this.crm.getTriggers=function(a,b){sendCrmMessage("getTriggers",b,{nodeId:a})},this.crm.setTriggers=function(a,b,c){sendOptionalCallbackCrmMessage("setTriggers",c,{nodeId:a,triggers:b})},this.crm.getTriggerUsage=function(a,b){sendCrmMessage("getTriggerUsage",b,{nodeId:a})},this.crm.setTriggerUsage=function(a,b,c){sendOptionalCallbackCrmMessage("setTriggerUsage",c,{nodeId:a,useTriggers:b})},this.crm.getContentTypes=function(a,b){sendCrmMessage("getContentTypes",b,{nodeId:a})},this.crm.setContentType=function(a,b,c,d){sendOptionalCallbackCrmMessage("setContentType",d,{index:b,value:c,nodeId:a})},this.crm.setContentTypes=function(a,b,c){sendOptionalCallbackCrmMessage("setContentTypes",c,{contentTypes:b,nodeId:a})},this.crm.setLaunchMode=function(a,b,c){sendOptionalCallbackCrmMessage("setLaunchMode",c,{nodeId:a,launchMode:b})},this.crm.getLaunchMode=function(a,b){sendCrmMessage("getLaunchMode",b,{nodeId:a})},this.crm.stylesheet={},this.crm.stylesheet.setStylesheet=function(a,b,c){sendOptionalCallbackCrmMessage("setStylesheetValue",c,{nodeId:a,stylesheet:b})},this.crm.stylesheet.getStylesheet=function(a,b){sendCrmMessage("getStylesheetValue",b,{nodeId:a})},this.crm.link={},this.crm.link.getLinks=function(a,b){sendCrmMessage("linkGetLinks",b,{nodeId:a})},this.crm.link.setLinks=function(a,b,c){sendOptionalCallbackCrmMessage("linkSetLinks",c,{nodeId:a,items:b})},this.crm.link.push=function(a,b,c){sendOptionalCallbackCrmMessage("linkPush",c,{items:b,nodeId:a})},this.crm.link.splice=function(a,b,c,d){sendOptionalCallbackCrmMessage("linkSplice",d,{nodeId:a,start:b,amount:c})},this.crm.script={},this.crm.script.setScript=function(a,b,c){sendOptionalCallbackCrmMessage("setScriptValue",c,{nodeId:a,script:b})},this.crm.script.getScript=function(a,b){sendCrmMessage("getScriptValue",b,{nodeId:a})},this.crm.script.setBackgroundScript=function(a,b,c){sendOptionalCallbackCrmMessage("setBackgroundScriptValue",c,{nodeId:a,script:b})},this.crm.script.getBackgroundScript=function(a,b){sendCrmMessage("getBackgroundScriptValue",b,{nodeId:a})},this.crm.script.libraries={},this.crm.script.libraries.push=function(a,b,c){sendOptionalCallbackCrmMessage("scriptLibraryPush",c,{nodeId:a,libraries:b})},this.crm.script.libraries.splice=function(a,b,c,d){sendOptionalCallbackCrmMessage("scriptLibrarySplice",d,{nodeId:a,start:b,amount:c})},this.crm.script.backgroundLibraries={},this.crm.script.backgroundLibraries.push=function(a,b,c){sendOptionalCallbackCrmMessage("scriptBackgroundLibraryPush",c,{nodeId:a,libraries:b})},this.crm.script.backgroundLibraries.splice=function(a,b,c,d){sendOptionalCallbackCrmMessage("scriptBackgroundLibrarySplice",d,{nodeId:a,start:b,amount:c})},this.crm.menu={},this.crm.menu.getChildren=function(a,b){sendCrmMessage("getMenuChildren",b,{nodeId:a})},this.crm.menu.setChildren=function(a,b,c){sendOptionalCallbackCrmMessage("setMenuChildren",c,{nodeId:a,childrenIds:b})},this.crm.menu.push=function(a,b,c){sendOptionalCallbackCrmMessage("pushMenuChildren",c,{nodeId:a,childrenIds:b})},this.crm.menu.splice=function(a,b,c,d){sendOptionalCallbackCrmMessage("spliceMenuChildren",d,{nodeId:a,start:b,amount:c})},this.libraries={},this.libraries.register=function(a,b,c){sendOptionalCallbackCrmMessage("registerLibrary",c,{name:a,url:b.url,code:b.code})},this.chrome=function(a){return genChromeRequest(a)},this.GM={},this.GM.GM_info=function(){return greasemonkeyData.info},this.GM.GM_getValue=function(a,b){var c=_this.storage.get(a);return void 0!==c?c:b},this.GM.GM_setValue=function(a,b){_this.storage.set(a,b)},this.GM.GM_deleteValue=function(a){_this.storage.remove(a)},this.GM.GM_listValues=function(){var a=[];for(var b in _this.storage)_this.storage.hasOwnProperty(b)&&a.push(b);return a},this.GM.GM_getResourceURL=function(a){return greasemonkeyData.resources[a].crmUrl},this.GM.GM_getResourceString=function(a){return greasemonkeyData.resources[a].dataString},this.GM.GM_addStyle=function(a){var b=document.createElement("style");b.appendChild(document.createTextNode(a)),document.head.appendChild(b)},this.GM.GM_log=console.log.bind(console),this.GM.GM_openInTab=function(a){window.open(a,"_blank")},this.GM.GM_registerMenuCommand=emptyFn,this.GM.GM_unregisterMenuCommand=emptyFn,this.GM.GM_setClipboard=emptyFn,this.GM.GM_xmlhttpRequest=function(a){var b=new XMLHttpRequest;if(setupRequestEvent(a,b,"abort"),setupRequestEvent(a,b,"error"),setupRequestEvent(a,b,"load"),setupRequestEvent(a,b,"progress"),setupRequestEvent(a,b,"readystatechange"),b.open(a.method,a.url,!0,a.username||"",a.password||""),a.overrideMimeType&&b.overrideMimeType(a.overrideMimeType),a.headers)for(var c in a.headers)Object.prototype.hasOwnProperty.call(a.headers,c)&&b.setRequestHeader(c,a.headers[c]);var d=a.data?a.data:null;return b.send(d)},this.GM.GM_addValueChangeListener=function(a,b){return storageListeners.add({key:a,callback:b})},this.GM.GM_removeValueChangeListener=function(a){storageListeners.remove(a)},this.GM.GM_download=function(a,b){var c={},d=a;"string"==typeof d?(c.url=d,c.name=b):c=a;var e={url:c.url,fileName:c.name,saveAs:b,headers:c.headers},f=chromeSpecialRequest("downloads.download","GM_download").args(e).args(function(a){var b=a.APIArgs[0];void 0===b?isFn(c.onerror)&&c.onerror({error:"not_succeeded",details:"request didn't complete"}):isFn(c.onload)&&c.onload()});f.onError=function(a){isFn(c.onerror)&&c.onerror({error:"not_permitted",details:a.error})},f.send()},this.GM.GM_getTab=instantCb,this.GM.GM_getTabs=instantCb,this.GM.GM_saveTab=emptyFn,this.GM.unsafeWindow="undefined"==typeof window?self:window,this.GM.GM_notification=function(a,b,c,d){var e;"object"==typeof a&&a?(e={message:a.text,title:a.title,iconUrl:a.imageUrl,isClickable:!!a.onclick,onclick:a.onclick},e.ondone=b||a.ondone):e={message:a,title:b,iconUrl:c,isClickable:!!d,onclick:d},e.type="basic",e.iconUrl=e.iconUrl||_chrome.chrome.runtime.getURL("icon-large.png"),d=e.onclick&&createCallbackFunction(e.onclick,new Error,{maxCalls:1});var f=e.ondone&&createCallbackFunction(e.ondone,new Error,{maxCalls:1});delete e.onclick,delete e.ondone;var g=chromeSpecialRequest("notifications.create","GM_notification").args(e).args(function(a){addNotificationListener(a,d,f)});g.onError=function(a){console.warn(a)},g.send()},this.GM.GM_installScript=emptyFn;var greaseMonkeyAPIs=this.GM;for(var gmKey in greaseMonkeyAPIs)greaseMonkeyAPIs.hasOwnProperty(gmKey)&&(window[gmKey]=greaseMonkeyAPIs[gmKey]);return this.getSelection=function(){return clickData.selectionText||window.getSelection().toString()},this.$crmAPI=this.$=function(a,b){return b=b||document,Array.prototype.slice.apply(b.querySelectorAll(a))},window.$=window.$||this.$crmAPI,this.log=function(){var a=(new Error).stack.split("\n")[2];a.indexOf("eval")>-1&&(a=(new Error).stack.split("\n")[3]);var b=a.split("at"),c=b.slice(1,b.length).join("at").replace(/anonymous/,"script"),d=Array.prototype.slice.apply(arguments),e=saveLogValues(d);sendMessage({id:id,type:"logCrmAPIValue",tabId:_this.tabId,tabIndex:tabIndex,data:{type:"log",data:JSON.stringify(e.data),id:id,logId:e.logId,tabIndex:tabIndex,lineNumber:c,tabId:_this.tabId}})},window.log=window.log||this.log,this}var _chrome={chrome:"undefined"==typeof chrome?void 0:chrome},localStorageProxy={};try{Object.defineProperty(window,"localStorageProxy",{get:function(){return localStorageProxy}})}catch(a){}Object.defineProperty(localStorageProxy,"getItem",{get:function(){return function(a){return localStorage[a]}}});var localStorageProxyData={onSet:function(a,b){}};Object.defineProperty(localStorageProxy,"setItem",{get:function(a,b){return localStorageProxyData.onSet}}),Object.defineProperty(localStorageProxy,"clear",{get:function(){return function(){}}}),window.CrmAPIInit=CrmAPIInit}("undefined"==typeof window?self:window);