Polymer.IronSelectableBehavior={properties:{attrForSelected:{type:String,value:null},selected:{type:String,notify:!0},selectedItem:{type:Object,readOnly:!0,notify:!0},activateEvent:{type:String,value:"tap",observer:"_activateEventChanged"},selectable:String,selectedClass:{type:String,value:"iron-selected"},selectedAttribute:{type:String,value:null}},observers:["_updateSelected(attrForSelected, selected)"],excludedLocalNames:{template:1},created:function(){this._bindFilterItem=this._filterItem.bind(this),this._selection=new Polymer.IronSelection(this._applySelection.bind(this))},attached:function(){this._observer=this._observeItems(this),this._contentObserver=this._observeContent(this)},detached:function(){this._observer&&this._observer.disconnect(),this._contentObserver&&this._contentObserver.disconnect(),this._removeListener(this.activateEvent)},get items(){var a=Polymer.dom(this).queryDistributedElements(this.selectable||"*");return Array.prototype.filter.call(a,this._bindFilterItem)},indexOf:function(a){return this.items.indexOf(a)},select:function(a){this.selected=a},selectPrevious:function(){var a=this.items.length,b=(Number(this._valueToIndex(this.selected))-1+a)%a;this.selected=this._indexToValue(b)},selectNext:function(){var a=(Number(this._valueToIndex(this.selected))+1)%this.items.length;this.selected=this._indexToValue(a)},_addListener:function(a){this.listen(this,a,"_activateHandler")},_removeListener:function(a){},_activateEventChanged:function(a,b){this._removeListener(b),this._addListener(a)},_updateSelected:function(){this._selectSelected(this.selected)},_selectSelected:function(a){this._selection.select(this._valueToItem(this.selected))},_filterItem:function(a){return!this.excludedLocalNames[a.localName]},_valueToItem:function(a){return null==a?null:this.items[this._valueToIndex(a)]},_valueToIndex:function(a){if(!this.attrForSelected)return Number(a);for(var b,c=0;b=this.items[c];c++)if(this._valueForItem(b)==a)return c},_indexToValue:function(a){if(!this.attrForSelected)return a;var b=this.items[a];return b?this._valueForItem(b):void 0},_valueForItem:function(a){return a[this.attrForSelected]||a.getAttribute(this.attrForSelected)},_applySelection:function(a,b){this.selectedClass&&this.toggleClass(this.selectedClass,b,a),this.selectedAttribute&&this.toggleAttribute(this.selectedAttribute,b,a),this._selectionChange(),this.fire("iron-"+(b?"select":"deselect"),{item:a})},_selectionChange:function(){this._setSelectedItem(this._selection.get())},_observeContent:function(a){var b=a.querySelector("content");if(b&&b.parentElement===a)return this._observeItems(a.domHost)},_observeItems:function(a){var b=new MutationObserver(function(){null!=this.selected&&this._updateSelected()}.bind(this));return b.observe(a,{childList:!0,subtree:!0}),b},_activateHandler:function(a){if(a.type===this.activateEvent)for(var b=a.target,c=this.items;b&&b!=this;){var d=c.indexOf(b);if(d>=0){var e=this._indexToValue(d);return void this._itemActivate(e,b)}b=b.parentNode}},_itemActivate:function(a,b){this.fire("iron-activate",{selected:a,item:b},{cancelable:!0}).defaultPrevented||this.select(a)}};