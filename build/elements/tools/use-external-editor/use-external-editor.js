/*
 * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu 
 * This code may only be used under the MIT style license found in the LICENSE.txt file 
**/
"use strict";var EXTERNAL_EDITOR_APP_ID="hkjjmhkhhlmkflpihbikfpcojeofbjgn",UEE=function(){function a(){}return a.init=function(){window.doc.externalEditorDialogTrigger.style.color="rgb(38, 153, 244)",window.doc.externalEditorDialogTrigger.classList.remove("disabled"),window.doc.externalEditorDialogTrigger.disabled=!1},a.errorHandler=function(a){void 0===a&&(a="Something went wrong");var b=window.doc.externalEditorErrorToast;b.text=a,b.show()},a.postMessage=function(a){try{this.appPort.postMessage(a)}catch(a){}},a.updateFromExternal=function(a){this.connection.id===a.connectionId&&(window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.editor.setValue(a.code):(window.stylesheetEdit.newSettings.value.stylesheet=a.code,window.stylesheetEdit.editor.setValue(a.code)))},a.cancelOpenFiles=function(){window.doc.externalEditorDialogTrigger.style.color="rgb(38, 153, 244)",window.doc.externalEditorDialogTrigger.classList.remove("disabled"),window.doc.externalEditorDialogTrigger.disabled=!1;try{this.appPort.postMessage({status:"connected",action:"disconnect"})}catch(a){}window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.reloadEditor():window.stylesheetEdit&&window.stylesheetEdit.active&&window.stylesheetEdit.reloadEditor()},a.createEditingOverlay=function(){window.doc.externalEditorDialogTrigger.style.color="rgb(175, 175, 175)",window.doc.externalEditorDialogTrigger.disabled=!0,window.doc.externalEditorDialogTrigger.classList.add("disabled"),this.EditingOverlay.generateOverlay(),$(window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.editor.display.wrapper:window.stylesheetEdit.editor.display.wrapper).find(".CodeMirror-scroll")[0].animate([{bottom:"-152px",right:"-350px"},{bottom:0,right:0}],{duration:300,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"}).onfinish=function(){this.effect.target.style.bottom="0",this.effect.target.style.right="0"}},a.setupExternalEditing=function(){var a=this;if(this.connection.connected){var b=this.editingCRMItem,c=function(d){"connected"!==d.status||"setupScript"!==d.action&&"setupStylesheet"!==d.action||d.connectionId!==a.connection.id||(d.existed===!1&&(b.file={id:d.id,path:d.path}),a.connection.filePath=d.path,window.app.upload(),a.connection.fileConnected=!0,window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.reloadEditor(!0):window.stylesheetEdit.reloadEditor(!0),a.createEditingOverlay(),a.appPort.onMessage.removeListener(c))};this.appPort.onMessage.addListener(c),b.file?this.appPort.postMessage({status:"connected",action:window.scriptEdit&&window.scriptEdit.active?"setupScript":"setupStylesheet",name:b.name,code:window.scriptEdit&&window.scriptEdit.active?b.value.script:b.value.stylesheet,id:b.file.id}):this.appPort.postMessage({status:"connected",action:window.scriptEdit&&window.scriptEdit.active?"setupScript":"setupStylesheet",name:b.name,code:window.scriptEdit&&window.scriptEdit.active?b.value.script:b.value.stylesheet})}else a.errorHandler("Could not establish connection")},a.setupMessageHandler=function(){var a=this;chrome.runtime.onConnectExternal.addListener(function(b){"obnfehdnkjmbijebdllfcnccllcfceli"===b.sender.id&&b.onMessage.addListener(function(b){a.messageHandler.apply(a,[b])})})},a.appMessageHandler=function(a){switch(a.action){case"chooseFile":var b=this,c=window.doc.externalEditorChooseFile;c.init(a.local,a.external,function(a){a!==!1?(window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.editor.setValue(a):(window.stylesheetEdit.newSettings.value.stylesheet=a,window.stylesheetEdit.editor.setValue(a)),b.appPort.postMessage({status:"connected",action:"chooseFile",code:a})):c.close()}),c.open();break;case"updateFromApp":this.updateFromExternal(a)}},a.messageHandler=function(a){switch(a.status){case"connected":this.appMessageHandler(a);break;case"ping":this.appPort.postMessage({status:"ping",message:"received"})}},a.establishConnection=function(a){void 0===a&&(a=!1);var b=this;this.appPort||(this.appPort=chrome.runtime.connect(EXTERNAL_EDITOR_APP_ID),this.connection.status="connecting",this.connection.stage=0,this.connection.fileConnected=!1,function(c,d){function e(a){"connecting"===a.status&&1===a.stage&&"hey"===a.message&&(b.appPort.onMessage.removeListener(e),c(a))}a&&setTimeout(function(){d()},5e3),b.appPort.onMessage.addListener(e),b.appPort.onMessage.addListener(function(a){b.messageHandler.apply(b,[a])}),b.appPort.postMessage({status:"connecting",message:"hi",stage:0})}(function(a){b.connection.stage=2,b.appPort.postMessage({status:"connecting",message:"hello",stage:2}),b.connection.connected=!0,b.connection.state="connected",b.connection.id=a.connectionId},function(){b.errorHandler()}))},a.cmLoaded=function(){var a=window.doc.chooseFileMergerPlaceholder.getBoundingClientRect();window.doc.chooseFileMergerPlaceholder.style.width=a.width+"px",window.doc.chooseFileMergerPlaceholder.style.height=a.height+"px",window.doc.chooseFileMergerPlaceholder.style.position="absolute",window.doc.chooseFileMergerPlaceholder.style.display="flex",this.playIfExists(this.editorFadeInAnimation)||(this.editorFadeInAnimation=window.doc.chooseFileMergerPlaceholder.animate([{opacity:1},{opacity:0}],{duration:350,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"})),this.editorFadeInAnimation.onfinish=function(){window.doc.chooseFileMergerPlaceholder.style.display="none",window.doc.chooseFileMergerPlaceholder.style.position="initial",window.doc.chooseFileMergerPlaceholder.style.width="auto",window.doc.chooseFileMergerPlaceholder.style.height="auto",window.doc.chooseFilemergerContainer.style.opacity="0",window.doc.chooseFilemergerContainer.style.display="block",window.doc.chooseFilemergerContainer.animate([{opacity:0},{opacity:1}],{duration:350,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"}).onfinish=function(){window.doc.chooseFilemergerContainer.style.opacity="1",window.externalEditor.editor.edit.refresh(),window.externalEditor.editor.left.orig.refresh(),window.externalEditor.editor.right.orig.refresh()}}},a.applyProps=function(a,b,c){for(var d=0;d<c.length;d++)b[c[d]]=a[c[d]]+""},a.doCSSAnimation=function(a,b,c,d){var e=this,f=b[0],g=b[1],h=a.animate([f,g],{duration:c,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"});return h.onfinish=function(){e.applyProps(g,a.style,Object.getOwnPropertyNames(g)),d&&d()},h},a.initEditor=function(a,b,c){a.editor=new window.CodeMirror.MergeView(window.doc.chooseFilemergerContainer,{lineNumbers:!0,scrollbarStyle:"simple",lineWrapping:!0,mode:"javascript",foldGutter:!0,theme:"dark"===window.app.settings.editor.theme?"dark":"default",indentUnit:window.app.settings.editor.tabSize,indentWithTabs:window.app.settings.editor.useTabs,value:b,origLeft:b,origRight:c,connect:"align",messageExternal:!0})},a.playIfExists=function(a){return!!a&&(a.play(),!0)},a.onDialogMainDivAnimationHideEnd=function(a,b,c,d,e){var f=this;window.doc.chooseFileMainDialog.style.display="none",window.doc.chooseFileMainDialog.style.marginTop="0",window.doc.chooseFileMainDialog.style.opacity="1",this.playIfExists(a.dialogExpansionAnimation)||(a.dialogExpansionAnimation=a.doCSSAnimation(window.doc.externalEditorChooseFile,[{width:b.width,height:b.height,marginTop:"24px",marginLeft:"40px",marginBottom:"24px",marginRight:"40px",top:c.top||"0px",left:c.left||"0px"},{width:"100vw",height:"100vh",marginTop:"0px",marginLeft:"0px",marginBottom:"0px",marginRight:"0px",top:"0px",left:"0px"}],400,function(){window.doc.chooseFileMerger.style.display="flex",f.playIfExists(a.dialogComparisonDivAnimationShow)||(a.dialogComparisonDivAnimationShow=a.doCSSAnimation(window.doc.chooseFileMerger,[{marginTop:"70px",opacity:0},{marginTop:"0px",opacity:1}],250,function(){a.editor||setTimeout(function(){a.initEditor(a,d,e)},150)}))}))},a.showMergeDialog=function(a,b,c){var d=window.doc.externalEditorChooseFile.getBoundingClientRect(),e=window.doc.externalEditorChooseFile.style;a.dialogStyleProperties=d,e.maxWidth="100vw",e.width=d.width+"px",e.height=d.height+"px",document.body.style.overflow="hidden",window.doc.chooseFileMainDialog.style.position="absolute",a.playIfExists(a.dialogMainDivAnimationHide)||(a.dialogMainDivAnimationHide=window.doc.chooseFileMainDialog.animate([{marginTop:"20px",opacity:1},{marginTop:"100px",opacity:0}],{duration:240,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"})),a.dialogMainDivAnimationHide.onfinish=function(){a.onDialogMainDivAnimationHideEnd(a,d,e,b,c)}},a.findChildWithClass=function(a,b){for(var c=0;c<a.children.length;c++)if(a.children[c].classList.contains(b))return a.children[c];return null},a.findChildWithTag=function(a,b){for(var c=0;c<a.children.length;c++)if(a.children[c].tagName.toLowerCase()===b)return a.children[c];return null},a.findReverseLineTranslation=function(a,b,c){var d,e,f,g=0,h=c.display.lineDiv.children,i=a.findChildWithTag(h[0],"pre").getBoundingClientRect().height;for(d=0;d<h.length;d++)if((e=a.findChildWithClass(h[d],"CodeMirror-linewidget"))&&(f=a.findChildWithClass(e,"CodeMirror-merge-spacer"))&&(g+=Math.round(parseInt(f.style.height.split("px")[0],10)/i)),d+g>=b)return d;return d},a.containEachother=function(a,b){return!!(a.indexOf(b)>-1||b.indexOf(a))},a.generateIncrementFunction=function(a){var b=a.length;return function(a){return++a===b&&(a=0),a}},a.generateLineIndexTranslationArray=function(a,b){for(var c,d,e=[],f=0,g=b.display.lineDiv.children,h=a.findChildWithTag(g[0],"pre").getBoundingClientRect().height,i=0;i<g.length;i++)(c=a.findChildWithClass(g[i],"CodeMirror-linewidget"))&&(d=a.findChildWithClass(c,"CodeMirror-merge-spacer"))&&(f+=Math.round(parseInt(d.style.height.split("px")[0],10)/h)),e[i]=i+f;return e},a.generateNextErrorFinder=function(a,b){var c,d,e=this,f=null,g=null,h=0,i=e.generateIncrementFunction(b);return function(){f||(g=window.externalEditor.editor.edit,f=window.externalEditor.editor[a?"left":"right"].orig,d=e.generateLineIndexTranslationArray(e,f));var j=null;for(c=h,h=i(h);c!==h;h=i(h)){var k=d[b[h].from.line],l=e.findReverseLineTranslation(e,k,g);if(e.containEachother(g.getLine(l),f.getLine(b[h].from.line))){j=b[h];break}}h=i(c),j?($(".errorHighlight").each(function(){this.classList.remove("errorHighlight")}),g.markText(j.from,j.to,{className:"errorHighlight",clearOnEnter:!0,inclusiveLeft:!1,inclusiveRight:!1})):window.doc.noErrorsFound.show()}},a.clearElementListeners=function(a){var a=window.doc.updateMergeLeftNextError;a.listeners=a.listeners||[];for(var b=0;b<a.listeners.length;b++)a.removeEventListener("click",a.listeners[b]);a.listeners=[]},a.markErrors=function(a,b){for(var c=0;c<a.length;c++)b.orig.markText(a[c].from,a[c].to,{className:"updateError",inclusiveLeft:!1,inclusiveRight:!1})},a.resetStyles=function(a,b){a.width=b.width+"px",a.height=b.height+"px",a.top=b.top+"px",a.left=b.left+"px"},a.initFileDialogText=function(a,b){window.doc.chooseFileCurrentTxt.innerText=a?"Old":"CRM Editor",window.doc.chooseFileNewTxt.innerText=a?"New":"File",window.doc.chooseFileTitleTxt.innerText=a?"Change the script to how you want it":"Merge the file to how you want it",window.doc.chooseFileStopMerging.style.display=a?"none":"block",b.classList[a?"add":"remove"]("updateMerge")},a.markerFn=function(a,b){var c=b.updateErrors,d=b.chooseFileDialog;setTimeout(function(){a.markErrors(c.oldScript,window.externalEditor.editor.left),a.markErrors(c.oldScript,window.externalEditor.editor.right),d.removeEventListener("iron-overlay-opened",function(){a.markerFn(a,b)})},2e3)},a.handleUpdateErrors=function(a,b,c){var d=c[0],e=c[1],f=c[2];window.doc.updateMergerCont.style.display="block";var g=b.parseError?"1":b.oldScript.length;if(window.doc.updateMergerTxt.innerText="A total of "+g+" errors have occurred in updating this script.",b.parseError)d.style.display=e.style.display=window.doc.updateMergePlaceholderBr.style.display="none";else{d.style.display=e.style.display=window.doc.updateMergePlaceholderBr.style.display="block";var h=a.generateNextErrorFinder(!0,b.oldScript),i=a.generateNextErrorFinder(!1,b.newScript);d.addEventListener("click",h),e.addEventListener("click",i),d.listeners.push(h),e.listeners.push(i),f.addEventListener("iron-overlay-opened",function(){a.markerFn(a,{updateErrors:b,chooseFileDialog:f})})}},a.chooseFileDialog=function(a){var b=this;return function(c,d,e,f,g){b.initFileDialogText(f,a);var h=window.doc.updateMergeLeftNextError,i=window.doc.updateMergeRightNextError;b.clearElementListeners(h),b.clearElementListeners(i),g?b.handleUpdateErrors(b,g,[h,i,a]):window.doc.updateMergerCont.style.display="none",a.local=c,a.file=d,a.callback=e,b.editor=null,window.doc.chooseFilemergerContainer.innerHTML="",document.body.style.overflow="auto",window.doc.chooseFileMainDialog.style.position="static",window.doc.chooseFileMainDialog.style.display="block",window.doc.chooseFileMerger.style.display="none",b.dialogStyleProperties&&b.resetStyles(a.style,b.dialogStyleProperties)}},a.stopMerging=function(a){var b=this;b.playIfExists(b.dialogComparisonDivAnimationHide)||(b.dialogComparisonDivAnimationHide=window.doc.chooseFileMerger.animate([{marginTop:"0px",opacity:1},{marginTop:"70px",opacity:0}],{duration:250,easing:"cubic-bezier(0.215, 0.610, 0.355, 1.000)"})),b.dialogComparisonDivAnimationHide.onfinish=function(){window.doc.chooseFileMerger.style.display="none",b.playIfExists(b.dialogContractionAniation)||(b.dialogContractionAniation=b.doCSSAnimation(a,[{width:"100vw",height:"100vh",top:0,left:0,margin:0},{width:b.dialogStyleProperties.width+"px",height:b.dialogStyleProperties.height+"px",top:b.dialogStyleProperties.top+"px",left:b.dialogStyleProperties.left+"px",margin:"40px 24px"}],250,function(){document.body.style.overflow="auto",window.doc.chooseFileMainDialog.style.position="static",window.doc.chooseFileMainDialog.style.display="block",b.playIfExists(b.dialogMainDivAnimationShow)||(b.dialogMainDivAnimationShow=b.doCSSAnimation(window.doc.chooseFileMainDialog,[{marginTop:"100px",opacity:0},{marginTop:"20px",opacity:1}],250))}))}},a.ready=function(){var a=this;window.externalEditor=this,this.establishConnection(),this.init(),window.onfocus=function(){a.connection.fileConnected&&a.postMessage({status:"connected",action:"refreshFromApp"})};var b=window.doc.externalEditorChooseFile;b.init=this.chooseFileDialog(b),window.doc.externalEditorTryAgainButton.addEventListener("click",function(){a.establishConnection(!0),window.doc.externalEditorErrorToast.hide()}),window.doc.chooseFileChooseFirst.addEventListener("click",function(){"local"===window.doc.chooseFileRadioGroup.selected?b.callback(b.local):b.callback(b.file)}),window.doc.chooseFileChooseMerge.addEventListener("click",function(){b.callback(a.editor.edit.getValue())}),$(".closeChooseFileDialog").click(function(){b.callback(!1)}),window.doc.chooseFileMerge.addEventListener("click",function(){a.showMergeDialog(a,b.local,b.file)}),window.doc.chooseFileStopMerging.addEventListener("click",function(){a.stopMerging(b)})},a}();UEE.is="use-external-editor",UEE.appPort=null,UEE.connection={status:"no connection",connected:!1},UEE.dialogMainDivAnimationShow=null,UEE.dialogMainDivAnimationHide=null,UEE.dialogComparisonDivAnimationShow=null,UEE.dialogComparisonDivAnimationHide=null,UEE.dialogExpansionAnimation=null,UEE.dialogContractionAniation=null,UEE.editor=null,UEE.editorFadeInAnimation=null,UEE.EditingOverlay=function(){function a(){}return a.createToolsCont=function(){var a=window.app.util.createElement("div",{id:"externalEditingTools"});return a.appendChild(window.app.util.createElement("div",{id:"externalEditingToolsTitle"},["Using external editor"])),a},a.createDisconnect=function(){var a=this,b=window.app.util.createElement("div",{id:"externalEditingToolsDisconnect"},[window.app.util.createElement("paper-material",{props:{elevation:"1"}},[window.app.util.createElement("paper-ripple",{}),window.app.util.createElement("svg",{props:{xmlns:"http://www.w3.org/2000/svg",height:"70",width:"70",viewBox:"0 0 24 24"}},[window.app.util.createElement("path",{props:{d:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"}}),window.app.util.createElement("path",{props:{d:"M0 0h24v24H0z",fill:"none"}})]),window.app.util.createElement("div",{classes:["externalEditingToolText"]},["Stop"])])]);return b.addEventListener("click",function(){a.parent().cancelOpenFiles.apply(a,[])}),b},a.createShowLocation=function(){var a=this,b=window.app.util.createElement("div",{id:"externalEditingToolsShowLocation"},[window.app.util.createElement("paper-material",{props:{elevation:"1"}},[window.app.util.createElement("paper-ripple",{}),window.app.util.createElement("svg",{props:{height:"70",viewBox:"0 0 24 24",width:"70",xmlns:"http://www.w3.org/2000/svg"}},[window.app.util.createElement("path",{props:{d:"M0 0h24v24H0z",fill:"none"}}),window.app.util.createElement("path",{props:{d:"M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"}})])]),window.app.util.createElement("div",{classes:["externalEditingToolText"]},["Location"])]);return b.addEventListener("click",function(){var b=a.parent().connection.filePath;b=b.replace(/\\/g,"/"),window.doc.externalEditoOpenLocationInBrowser.setAttribute("href","file:///"+b);var c=window.doc.externalEditorLocationToast;c.text="File is located at: "+b,c.show()}),b},a.createNewFile=function(){var a=this;window.app.util.createElement("div",{id:"externalEditingToolsCreateNewFile"},[window.app.util.createElement("paper-material",{props:{elevation:"1"}},[window.app.util.createElement("paper-ripple",{}),window.app.util.createElement("svg",{props:{height:"70",width:"70",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"}},[window.app.util.createElement("path",{props:{d:"M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"}}),window.app.util.createElement("path",{props:{d:"M0 0h24v24H0z",fill:"none"}})])]),window.app.util.createElement("div",{classes:["externalEditingToolText"]},["Move"])]).addEventListener("click",function(){a.parent().postMessage({status:"connected",action:"createNewFile",isCss:!!window.scriptEdit,name:a.parent().editingCRMItem.name})})},a.createUpdate=function(){var a=this,b=window.app.util.createElement("div",{id:"externalEditingToolsUpdate"},[window.app.util.createElement("paper-material",{props:{elevation:"1"}},[window.app.util.createElement("paper-ripple",{}),window.app.util.createElement("svg",{props:{height:"70",width:"70",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"}},[window.app.util.createElement("path",{props:{d:"M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"}}),window.app.util.createElement("path",{props:{d:"M0 0h24v24H0z",fill:"none"}})])]),window.app.util.createElement("div",{classes:["externalEditingToolText"]},["Refresh"])]);return b.addEventListener("click",function(){a.parent().postMessage({status:"connected",action:"refreshFromApp"})}),b},a.createCont=function(a){var b=a.appendChild(window.app.util.createElement("div",{id:"externalEditingToolsButtonsCont"}));b.appendChild(this.createDisconnect()),b.appendChild(this.createShowLocation()),this.createNewFile(),b.appendChild(this.createUpdate())},a.appendWrapper=function(a){$(window.scriptEdit&&window.scriptEdit.active?window.scriptEdit.editor.display.wrapper:window.stylesheetEdit.editor.display.wrapper).find(".CodeMirror-scroll")[0].appendChild(a)},a.generateOverlay=function(){var a=this.createToolsCont();this.createCont(a),this.appendWrapper(a)},a.parent=function(){return window.externalEditor},a}(),Polymer(UEE);