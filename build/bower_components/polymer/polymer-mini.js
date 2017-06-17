Polymer.Base._addFeature({_prepTemplate:function(){if(this._template=this._template||Polymer.DomModule.import(this.is,"template"),!this._template){var a=document._currentScript||document.currentScript,b=a&&a.previousElementSibling;b&&"template"===b.localName&&(this._template=b)}this._template&&this._template.hasAttribute("is")&&this._warn(this._logf("_prepTemplate","top-level Polymer template must not be a type-extension, found",this._template,"Move inside simple <template>."))},_stampTemplate:function(){this._template&&(this.root=this.instanceTemplate(this._template))},instanceTemplate:function(a){var b=document.importNode(a._content||a.content,!0);return b}}),function(){var a=Polymer.Base.attachedCallback;Polymer.Base._addFeature({_hostStack:[],ready:function(){},_pushHost:function(a){this.dataHost=a=a||Polymer.Base._hostStack[Polymer.Base._hostStack.length-1],a&&a._clients&&a._clients.push(this),this._beginHost()},_beginHost:function(){Polymer.Base._hostStack.push(this),this._clients||(this._clients=[])},_popHost:function(){Polymer.Base._hostStack.pop()},_tryReady:function(){this._canReady()&&this._ready()},_canReady:function(){return!this.dataHost||this.dataHost._clientsReadied},_ready:function(){this._beforeClientsReady(),this._setupRoot(),this._readyClients(),this._afterClientsReady(),this._readySelf()},_readyClients:function(){this._beginDistribute();for(var a,b=this._clients,c=0,d=b.length;c<d&&(a=b[c]);c++)a._ready();this._finishDistribute(),this._clientsReadied=!0,this._clients=null},_readySelf:function(){this._doBehavior("ready"),this._readied=!0,this._attachedPending&&(this._attachedPending=!1,this.attachedCallback())},_beforeClientsReady:function(){},_afterClientsReady:function(){},_beforeAttached:function(){},attachedCallback:function(){this._readied?(this._beforeAttached(),a.call(this)):this._attachedPending=!0}})}(),Polymer.ArraySplice=function(){function a(a,b,c){return{index:a,removed:b,addedCount:c}}function b(){}var c=0,d=1,e=2,f=3;return b.prototype={calcEditDistances:function(a,b,c,d,e,f){for(var g=f-e+1,h=c-b+1,i=new Array(g),j=0;j<g;j++)i[j]=new Array(h),i[j][0]=j;for(var k=0;k<h;k++)i[0][k]=k;for(var j=1;j<g;j++)for(var k=1;k<h;k++)if(this.equals(a[b+k-1],d[e+j-1]))i[j][k]=i[j-1][k-1];else{var l=i[j-1][k]+1,m=i[j][k-1]+1;i[j][k]=l<m?l:m}return i},spliceOperationsFromEditDistances:function(a){for(var b=a.length-1,g=a[0].length-1,h=a[b][g],i=[];b>0||g>0;)if(0!=b)if(0!=g){var j,k=a[b-1][g-1],l=a[b-1][g],m=a[b][g-1];j=l<m?l<k?l:k:m<k?m:k,j==k?(k==h?i.push(c):(i.push(d),h=k),b--,g--):j==l?(i.push(f),b--,h=l):(i.push(e),g--,h=m)}else i.push(f),b--;else i.push(e),g--;return i.reverse(),i},calcSplices:function(b,g,h,i,j,k){var l=0,m=0,n=Math.min(h-g,k-j);if(0==g&&0==j&&(l=this.sharedPrefix(b,i,n)),h==b.length&&k==i.length&&(m=this.sharedSuffix(b,i,n-l)),g+=l,j+=l,h-=m,k-=m,h-g==0&&k-j==0)return[];if(g==h){for(var o=a(g,[],0);j<k;)o.removed.push(i[j++]);return[o]}if(j==k)return[a(g,[],h-g)];for(var p=this.spliceOperationsFromEditDistances(this.calcEditDistances(b,g,h,i,j,k)),o=void 0,q=[],r=g,s=j,t=0;t<p.length;t++)switch(p[t]){case c:o&&(q.push(o),o=void 0),r++,s++;break;case d:o||(o=a(r,[],0)),o.addedCount++,r++,o.removed.push(i[s]),s++;break;case e:o||(o=a(r,[],0)),o.addedCount++,r++;break;case f:o||(o=a(r,[],0)),o.removed.push(i[s]),s++}return o&&q.push(o),q},sharedPrefix:function(a,b,c){for(var d=0;d<c;d++)if(!this.equals(a[d],b[d]))return d;return c},sharedSuffix:function(a,b,c){for(var d=a.length,e=b.length,f=0;f<c&&this.equals(a[--d],b[--e]);)f++;return f},calculateSplices:function(a,b){return this.calcSplices(a,0,a.length,b,0,b.length)},equals:function(a,b){return a===b}},new b}(),Polymer.EventApi=function(){var a=Polymer.Settings,b=function(a){this.event=a};a.useShadow?b.prototype={get rootTarget(){return this.event.path[0]},get localTarget(){return this.event.target},get path(){return this.event.path}}:b.prototype={get rootTarget(){return this.event.target},get localTarget(){for(var a=this.event.currentTarget,b=a&&Polymer.dom(a).getOwnerRoot(),c=this.path,d=0;d<c.length;d++)if(Polymer.dom(c[d]).getOwnerRoot()===b)return c[d]},get path(){if(!this.event._path){for(var a=[],b=this.rootTarget;b;)a.push(b),b=Polymer.dom(b).parentNode||b.host;a.push(window),this.event._path=a}return this.event._path}};var c=function(a){return a.__eventApi||(a.__eventApi=new b(a)),a.__eventApi};return{factory:c}}(),Polymer.domInnerHTML=function(){function a(a){switch(a){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";case"\xa0":return"&nbsp;"}}function b(b){return b.replace(g,a)}function c(b){return b.replace(h,a)}function d(a){for(var b={},c=0;c<a.length;c++)b[a[c]]=!0;return b}function e(a,d,e){switch(a.nodeType){case Node.ELEMENT_NODE:for(var g,h=a.localName,k="<"+h,l=a.attributes,m=0;g=l[m];m++)k+=" "+g.name+'="'+b(g.value)+'"';return k+=">",i[h]?k:k+f(a,e)+"</"+h+">";case Node.TEXT_NODE:var n=a.data;return d&&j[d.localName]?n:c(n);case Node.COMMENT_NODE:return"<!--"+a.data+"-->";default:throw console.error(a),new Error("not implemented")}}function f(a,b){a instanceof HTMLTemplateElement&&(a=a.content);var c="",d=Polymer.dom(a).childNodes;d=b?a._composedChildren:d;for(var f,g=0,h=d.length;g<h&&(f=d[g]);g++)c+=e(f,a,b);return c}var g=/[&\u00A0"]/g,h=/[&\u00A0<>]/g,i=d(["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"]),j=d(["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"]);return{getInnerHTML:f}}(),Polymer.DomApi=function(){"use strict";function a(a){var b=a._lightChildren;return b?b:a.childNodes}function b(a){return a._composedChildren||(a._composedChildren=Array.prototype.slice.call(a.childNodes)),a._composedChildren}function c(a,c,e){var f=b(a),g=e?f.indexOf(e):-1;if(c.nodeType===Node.DOCUMENT_FRAGMENT_NODE){var h=b(c);h.forEach(function(b){d(b,a,f,g)})}else d(c,a,f,g)}function d(a,b,c,d){a._composedParent=b,d>=0?c.splice(d,0,a):c.push(a)}function e(a,c){if(c._composedParent=null,a){var d=b(a),e=d.indexOf(c);e>=0&&d.splice(e,1)}}function f(a){if(!a._lightChildren){for(var b,c=Array.prototype.slice.call(a.childNodes),d=0,e=c.length;d<e&&(b=c[d]);d++)b._lightParent=b._lightParent||a;a._lightChildren=c}}function g(a){return Boolean(a._insertionPoints.length)}var h=Polymer.Settings,i=Polymer.domInnerHTML.getInnerHTML,j=Element.prototype.insertBefore,k=Element.prototype.removeChild,l=Element.prototype.appendChild,m=[],n=function(a){this.node=a,this.patch&&this.patch()};if(n.prototype={flush:function(){for(var a,b=0;b<m.length;b++)a=m[b],a.flushDebouncer("_distribute");m=[]},_lazyDistribute:function(a){a.shadyRoot&&a.shadyRoot._distributionClean&&(a.shadyRoot._distributionClean=!1,a.debounce("_distribute",a._distributeContent),m.push(a))},appendChild:function(a){var b;if(this._removeNodeFromHost(a),this._nodeIsInLogicalTree(this.node)){var d=this._hostForNode(this.node);this._addLogicalInfo(a,this.node,d&&d.shadyRoot),this._addNodeToHost(a),d&&(b=this._maybeDistribute(a,this.node,d))}if(!b&&!this._tryRemoveUndistributedNode(a)){var e=this.node._isShadyRoot?this.node.host:this.node;l.call(e,a),c(e,a)}return a},insertBefore:function(a,b){if(!b)return this.appendChild(a);var d;if(this._removeNodeFromHost(a),this._nodeIsInLogicalTree(this.node)){f(this.node);var e=this.childNodes,g=e.indexOf(b);if(g<0)throw Error("The ref_node to be inserted before is not a child of this node");var h=this._hostForNode(this.node);this._addLogicalInfo(a,this.node,h&&h.shadyRoot,g),this._addNodeToHost(a),h&&(d=this._maybeDistribute(a,this.node,h))}if(!d&&!this._tryRemoveUndistributedNode(a)){b=b.localName===p?this._firstComposedNode(b):b;var i=this.node._isShadyRoot?this.node.host:this.node;j.call(i,a,b),c(i,a,b)}return a},removeChild:function(a){q(a).parentNode!==this.node&&console.warn("The node to be removed is not a child of this node",a);var b;if(this._nodeIsInLogicalTree(this.node)){var c=this._hostForNode(this.node);b=this._maybeDistribute(a,this.node,c),this._removeNodeFromHost(a)}if(!b){var d=this.node._isShadyRoot?this.node.host:this.node;d===a.parentNode&&(k.call(d,a),e(d,a))}return a},replaceChild:function(a,b){return this.insertBefore(a,b),this.removeChild(b),a},getOwnerRoot:function(){return this._ownerShadyRootForNode(this.node)},_ownerShadyRootForNode:function(a){if(a){if(void 0===a._ownerShadyRoot){var b;if(a._isShadyRoot)b=a;else{var c=Polymer.dom(a).parentNode;b=c?c._isShadyRoot?c:this._ownerShadyRootForNode(c):null}a._ownerShadyRoot=b}return a._ownerShadyRoot}},_maybeDistribute:function(a,b,c){var d=this._nodeNeedsDistribution(a),e=this._parentNeedsDistribution(b)||d;return d&&this._updateInsertionPoints(c),e&&this._lazyDistribute(c),e},_tryRemoveUndistributedNode:function(a){if(this.node.shadyRoot)return a.parentNode&&k.call(a.parentNode,a),!0},_updateInsertionPoints:function(a){a.shadyRoot._insertionPoints=q(a.shadyRoot).querySelectorAll(p)},_nodeIsInLogicalTree:function(a){return Boolean(a._lightParent||a._isShadyRoot||this._ownerShadyRootForNode(a)||a.shadyRoot)},_hostForNode:function(a){var b=a.shadyRoot||(a._isShadyRoot?a:this._ownerShadyRootForNode(a));return b&&b.host},_parentNeedsDistribution:function(a){return a&&a.shadyRoot&&g(a.shadyRoot)},_nodeNeedsDistribution:function(a){return a.localName===p||a.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&a.querySelector(p)},_removeNodeFromHost:function(a){if(a._lightParent){var b=this._ownerShadyRootForNode(a);b&&b.host._elementRemove(a),this._removeLogicalInfo(a,a._lightParent)}this._removeOwnerShadyRoot(a)},_addNodeToHost:function(a){var b=a.nodeType===Node.DOCUMENT_FRAGMENT_NODE?a.firstChild:a,c=this._ownerShadyRootForNode(b);c&&c.host._elementAdd(a)},_addLogicalInfo:function(a,b,c,d){f(b);var e=q(b).childNodes;if(d=void 0===d?e.length:d,a.nodeType===Node.DOCUMENT_FRAGMENT_NODE)for(var g,h=Array.prototype.slice.call(a.childNodes),i=0;i<h.length&&(g=h[i]);i++)e.splice(d++,0,g),g._lightParent=b;else e.splice(d,0,a),a._lightParent=b},_removeLogicalInfo:function(a,b){var c=q(b).childNodes,d=c.indexOf(a);if(d<0||b!==a._lightParent)throw Error("The node to be removed is not a child of this node");c.splice(d,1),a._lightParent=null},_removeOwnerShadyRoot:function(a){var b=void 0!==q(a).getOwnerRoot();if(b)for(var c,d=q(a).childNodes,e=0,f=d.length;e<f&&(c=d[e]);e++)this._removeOwnerShadyRoot(c);a._ownerShadyRoot=void 0},_firstComposedNode:function(a){for(var b,c,d=q(a).getDistributedNodes(),e=0,f=d.length;e<f&&(b=d[e]);e++)if(c=q(b).getDestinationInsertionPoints(),c[c.length-1]===a)return b},querySelector:function(a){return this.querySelectorAll(a)[0]},querySelectorAll:function(a){return this._query(function(b){return s.call(b,a)},this.node)},_query:function(a,b){b=b||this.node;var c=[];return this._queryElements(q(b).childNodes,a,c),c},_queryElements:function(a,b,c){for(var d,e=0,f=a.length;e<f&&(d=a[e]);e++)d.nodeType===Node.ELEMENT_NODE&&this._queryElement(d,b,c)},_queryElement:function(a,b,c){b(a)&&c.push(a),this._queryElements(q(a).childNodes,b,c)},getDestinationInsertionPoints:function(){return this.node._destinationInsertionPoints||[]},getDistributedNodes:function(){return this.node._distributedNodes||[]},queryDistributedElements:function(a){var b=this.childNodes,c=[];this._distributedFilter(a,b,c);for(var d,e=0,f=b.length;e<f&&(d=b[e]);e++)d.localName===p&&this._distributedFilter(a,q(d).getDistributedNodes(),c);return c},_distributedFilter:function(a,b,c){c=c||[];for(var d,e=0,f=b.length;e<f&&(d=b[e]);e++)d.nodeType===Node.ELEMENT_NODE&&d.localName!==p&&s.call(d,a)&&c.push(d);return c},_clear:function(){for(;this.childNodes.length;)this.removeChild(this.childNodes[0])},setAttribute:function(a,b){this.node.setAttribute(a,b),this._distributeParent()},removeAttribute:function(a){this.node.removeAttribute(a),this._distributeParent()},_distributeParent:function(){this._parentNeedsDistribution(this.parentNode)&&this._lazyDistribute(this.parentNode)}},Object.defineProperty(n.prototype,"classList",{get:function(){return this._classList||(this._classList=new n.ClassList(this)),this._classList},configurable:!0}),n.ClassList=function(a){this.domApi=a,this.node=a.node},n.ClassList.prototype={add:function(){this.node.classList.add.apply(this.node.classList,arguments),this.domApi._distributeParent()},remove:function(){this.node.classList.remove.apply(this.node.classList,arguments),this.domApi._distributeParent()},toggle:function(){this.node.classList.toggle.apply(this.node.classList,arguments),this.domApi._distributeParent()}},h.useShadow){n.prototype.querySelectorAll=function(a){return Array.prototype.slice.call(this.node.querySelectorAll(a))},n.prototype.getOwnerRoot=function(){for(var a=this.node;a;){if(a.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&a.host)return a;a=a.parentNode}},n.prototype.getDestinationInsertionPoints=function(){var a=this.node.getDestinationInsertionPoints();return a?Array.prototype.slice.call(a):[]},n.prototype.getDistributedNodes=function(){var a=this.node.getDistributedNodes();return a?Array.prototype.slice.call(a):[]},n.prototype._distributeParent=function(){},Object.defineProperties(n.prototype,{childNodes:{get:function(){return Array.prototype.slice.call(this.node.childNodes)},configurable:!0},children:{get:function(){return Array.prototype.slice.call(this.node.children)},configurable:!0},textContent:{get:function(){return this.node.textContent},set:function(a){return this.node.textContent=a},configurable:!0},innerHTML:{get:function(){return this.node.innerHTML},set:function(a){return this.node.innerHTML=a},configurable:!0}});var o=["parentNode","firstChild","lastChild","nextSibling","previousSibling","firstElementChild","lastElementChild","nextElementSibling","previousElementSibling"];o.forEach(function(a){Object.defineProperty(n.prototype,a,{get:function(){return this.node[a]},configurable:!0})})}else Object.defineProperties(n.prototype,{childNodes:{get:function(){var b=a(this.node);return Array.isArray(b)?b:Array.prototype.slice.call(b)},configurable:!0},children:{get:function(){return Array.prototype.filter.call(this.childNodes,function(a){return a.nodeType===Node.ELEMENT_NODE})},configurable:!0},parentNode:{get:function(){return this.node._lightParent||(this.node.__patched?this.node._composedParent:this.node.parentNode)},configurable:!0},firstChild:{get:function(){return this.childNodes[0]},configurable:!0},lastChild:{get:function(){var a=this.childNodes;return a[a.length-1]},configurable:!0},nextSibling:{get:function(){var a=this.parentNode&&q(this.parentNode).childNodes;if(a)return a[Array.prototype.indexOf.call(a,this.node)+1]},configurable:!0},previousSibling:{get:function(){var a=this.parentNode&&q(this.parentNode).childNodes;if(a)return a[Array.prototype.indexOf.call(a,this.node)-1]},configurable:!0},firstElementChild:{get:function(){return this.children[0]},configurable:!0},lastElementChild:{get:function(){var a=this.children;return a[a.length-1]},configurable:!0},nextElementSibling:{get:function(){var a=this.parentNode&&q(this.parentNode).children;if(a)return a[Array.prototype.indexOf.call(a,this.node)+1]},configurable:!0},previousElementSibling:{get:function(){var a=this.parentNode&&q(this.parentNode).children;if(a)return a[Array.prototype.indexOf.call(a,this.node)-1]},configurable:!0},textContent:{get:function(){return this.node.nodeType===Node.TEXT_NODE?this.node.textContent:Array.prototype.map.call(this.childNodes,function(a){return a.textContent}).join("")},set:function(a){this._clear(),a&&this.appendChild(document.createTextNode(a))},configurable:!0},innerHTML:{get:function(){return this.node.nodeType===Node.TEXT_NODE?null:i(this.node)},set:function(a){if(this.node.nodeType!==Node.TEXT_NODE){this._clear();var b=document.createElement("div");b.innerHTML=a;for(var c=b.firstChild;c;c=c.nextSibling)this.appendChild(c)}},configurable:!0}}),n.prototype._getComposedInnerHTML=function(){return i(this.node,!0)};var p="content",q=function(a,b){return a=a||document,a.__domApi||(a.__domApi=new n(a,b)),a.__domApi};Polymer.dom=function(a,b){return a instanceof Event?Polymer.EventApi.factory(a):q(a,b)},Polymer.dom.flush=n.prototype.flush;var r=Element.prototype,s=r.matches||r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector;return{getLightChildren:a,getComposedChildren:b,removeFromComposedParent:e,saveLightChildrenIfNeeded:f,matchesSelector:s,hasInsertionPoint:g,ctor:n,factory:q}}(),function(){function a(a,b){b._distributedNodes.push(a);var c=a._destinationInsertionPoints;c?c.push(b):a._destinationInsertionPoints=[b]}function b(a){for(var b=a._distributedNodes,c=0;c<b.length;c++){var d=b[c]._destinationInsertionPoints;d&&d.splice(d.indexOf(a)+1,d.length)}}function c(a,b){var c=a._lightParent;c&&c.shadyRoot&&o(c.shadyRoot)&&c.shadyRoot._distributionClean&&(c.shadyRoot._distributionClean=!1,b.shadyRoot._dirtyRoots.push(c))}function d(a,b){var c=b._destinationInsertionPoints;return c&&c[c.length-1]===a}function e(a){return"content"==a.localName}function f(a,b,c){var d=h(b);d!==a&&q(d,b),g(b),l(a),r.call(a,b,c||null),b._composedParent=a}function g(a){var b=h(a);b&&(l(b),a._composedParent=null,s.call(b,a))}function h(a){return a.__patched?a._composedParent:a.parentNode}function i(a){for(;a&&j(a);)a=a.domHost;return a}function j(a){for(var b,c=Polymer.dom(a).children,d=0;d<c.length;d++)if(b=c[d],"content"===b.localName)return a.domHost}function k(a){if(t&&a)for(var b=0;b<a.length;b++)CustomElements.upgrade(a[b])}Polymer.Base._addFeature({_prepShady:function(){this._useContent=this._useContent||Boolean(this._template),this._useContent&&(this._template._hasInsertionPoint=this._template.content.querySelector("content"))},_poolContent:function(){this._useContent&&l(this)},_setupRoot:function(){this._useContent&&(this._createLocalRoot(),this.dataHost||k(this._lightChildren))},_createLocalRoot:function(){this.shadyRoot=this.root,this.shadyRoot._distributionClean=!1,this.shadyRoot._isShadyRoot=!0,this.shadyRoot._dirtyRoots=[],this.shadyRoot._insertionPoints=this._template._hasInsertionPoint?this.shadyRoot.querySelectorAll("content"):[],l(this.shadyRoot),this.shadyRoot.host=this},get domHost(){var a=Polymer.dom(this).getOwnerRoot();return a&&a.host},distributeContent:function(){if(this.shadyRoot){var a=i(this);Polymer.dom(this)._lazyDistribute(a)}},_distributeContent:function(){this._useContent&&!this.shadyRoot._distributionClean&&(this._beginDistribute(),this._distributeDirtyRoots(),this._finishDistribute())},_beginDistribute:function(){this._useContent&&o(this.shadyRoot)&&(this._resetDistribution(),this._distributePool(this.shadyRoot,this._collectPool()))},_distributeDirtyRoots:function(){for(var a,b=this.shadyRoot._dirtyRoots,c=0,d=b.length;c<d&&(a=b[c]);c++)a._distributeContent();this.shadyRoot._dirtyRoots=[]},_finishDistribute:function(){if(this._useContent){if(o(this.shadyRoot))this._composeTree();else if(this.shadyRoot._hasDistributed){var a=this._composeNode(this);this._updateChildNodes(this,a)}else this.textContent="",this.appendChild(this.shadyRoot);this.shadyRoot._hasDistributed=!0,this.shadyRoot._distributionClean=!0}},elementMatches:function(a,b){return b=b||this,n.call(b,a)},_resetDistribution:function(){for(var a=m(this),c=0;c<a.length;c++){var d=a[c];d._destinationInsertionPoints&&(d._destinationInsertionPoints=void 0),e(d)&&b(d)}for(var f=this.shadyRoot,g=f._insertionPoints,h=0;h<g.length;h++)g[h]._distributedNodes=[]},_collectPool:function(){for(var a=[],b=m(this),c=0;c<b.length;c++){var d=b[c];e(d)?a.push.apply(a,d._distributedNodes):a.push(d)}return a},_distributePool:function(a,b){for(var d,e=a._insertionPoints,f=0,g=e.length;f<g&&(d=e[f]);f++)this._distributeInsertionPoint(d,b),c(d,this)},_distributeInsertionPoint:function(b,c){for(var d,e=!1,f=0,g=c.length;f<g;f++)d=c[f],d&&this._matchesContentSelect(d,b)&&(a(d,b),c[f]=void 0,e=!0);if(!e)for(var h=m(b),i=0;i<h.length;i++)a(h[i],b)},_composeTree:function(){this._updateChildNodes(this,this._composeNode(this));for(var a,b,c=this.shadyRoot._insertionPoints,d=0,e=c.length;d<e&&(a=c[d]);d++)b=a._lightParent||a.parentNode,b._useContent||b===this||b===this.shadyRoot||this._updateChildNodes(b,this._composeNode(b))},_composeNode:function(a){for(var b=[],c=m(a.shadyRoot||a),f=0;f<c.length;f++){var g=c[f];if(e(g))for(var h=g._distributedNodes,i=0;i<h.length;i++){var j=h[i];d(g,j)&&b.push(j)}else b.push(g)}return b},_updateChildNodes:function(a,b){for(var c,d=p(a),e=Polymer.ArraySplice.calculateSplices(b,d),h=0,i=0;h<e.length&&(c=e[h]);h++){for(var j,k=0;k<c.removed.length&&(j=c.removed[k]);k++)g(j),d.splice(c.index+i,1);i-=c.addedCount}for(var c,l,h=0;h<e.length&&(c=e[h]);h++){l=d[c.index];for(var j,k=c.index;k<c.index+c.addedCount;k++)j=b[k],f(a,j,l),d.splice(k,0,j)}},_matchesContentSelect:function(a,b){var c=b.getAttribute("select");if(!c)return!0;if(c=c.trim(),!c)return!0;if(!(a instanceof Element))return!1;var d=/^(:not\()?[*.#[a-zA-Z_|]/;return!!d.test(c)&&this.elementMatches(c,a)},_elementAdd:function(){},_elementRemove:function(){}});var l=Polymer.DomApi.saveLightChildrenIfNeeded,m=Polymer.DomApi.getLightChildren,n=Polymer.DomApi.matchesSelector,o=Polymer.DomApi.hasInsertionPoint,p=Polymer.DomApi.getComposedChildren,q=Polymer.DomApi.removeFromComposedParent,r=Element.prototype.insertBefore,s=Element.prototype.removeChild,t=window.CustomElements&&!CustomElements.useNative}(),Polymer.Settings.useShadow&&Polymer.Base._addFeature({_poolContent:function(){},_beginDistribute:function(){},distributeContent:function(){},_distributeContent:function(){},_finishDistribute:function(){},_createLocalRoot:function(){this.createShadowRoot(),this.shadowRoot.appendChild(this.root),this.root=this.shadowRoot}}),Polymer.DomModule=document.createElement("dom-module"),Polymer.Base._addFeature({_registerFeatures:function(){this._prepIs(),this._prepAttributes(),this._prepBehaviors(),this._prepExtends(),this._prepConstructor(),this._prepTemplate(),this._prepShady()},_prepBehavior:function(a){this._addHostAttributes(a.hostAttributes)},_initFeatures:function(){this._poolContent(),this._pushHost(),this._stampTemplate(),this._popHost(),this._marshalHostAttributes(),this._setupDebouncers(),this._marshalBehaviors(),this._tryReady()},_marshalBehavior:function(a){}});