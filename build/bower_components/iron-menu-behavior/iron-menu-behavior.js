Polymer.IronMenuBehaviorImpl={properties:{focusedItem:{observer:"_focusedItemChanged",readOnly:!0,type:Object},attrForItemTitle:{type:String}},hostAttributes:{role:"menu",tabindex:"0"},observers:["_updateMultiselectable(multi)"],listeners:{focus:"_onFocus",keydown:"_onKeydown"},keyBindings:{up:"_onUpKey",down:"_onDownKey",esc:"_onEscKey",enter:"_onEnterKey","shift+tab:keydown":"_onShiftTabDown"},_updateMultiselectable:function(a){a?this.setAttribute("aria-multiselectable","true"):this.removeAttribute("aria-multiselectable")},_onShiftTabDown:function(){var a;Polymer.IronMenuBehaviorImpl._shiftTabPressed=!0,a=this.getAttribute("tabindex"),this.setAttribute("tabindex","-1"),this.async(function(){this.setAttribute("tabindex",a),Polymer.IronMenuBehaviorImpl._shiftTabPressed=!1},1)},_applySelection:function(a,b){b?a.setAttribute("aria-selected","true"):a.removeAttribute("aria-selected"),Polymer.IronSelectableBehavior._applySelection.apply(this,arguments)},_focusedItemChanged:function(a,b){b&&b.setAttribute("tabindex","-1"),a&&(a.setAttribute("tabindex","0"),a.focus())},select:function(a){this._defaultFocusAsync&&(this.cancelAsync(this._defaultFocusAsync),this._defaultFocusAsync=null);var b=this._valueToItem(a);this._setFocusedItem(b),Polymer.IronMultiSelectableBehaviorImpl.select.apply(this,arguments)},_onFocus:function(a){Polymer.IronMenuBehaviorImpl._shiftTabPressed||(this.blur(),this._setFocusedItem(null),this._defaultFocusAsync=this.async(function(){var a=this.multi?this.selectedItems&&this.selectedItems[0]:this.selectedItem;a?this._setFocusedItem(a):this._setFocusedItem(this.items[0])},100))},_onUpKey:function(){this._focusPrevious()},_onDownKey:function(){this._focusNext()},_onEscKey:function(){this.focusedItem.blur()},_onEnterKey:function(a){this._activateFocused(a.detail.keyboardEvent)},_onKeydown:function(a){this.keyboardEventMatchesKeys(a,"up down esc enter")||this._focusWithKeyboardEvent(a)},_focusWithKeyboardEvent:function(a){for(var b,c=0;b=this.items[c];c++){var d=this.attrForItemTitle||"textContent",e=b[d]||b.getAttribute(d);if(e&&e.trim().charAt(0).toLowerCase()===String.fromCharCode(a.keyCode).toLowerCase()){this._setFocusedItem(b);break}}},_activateFocused:function(a){this.focusedItem.hasAttribute("disabled")||this._activateHandler(a)},_focusPrevious:function(){var a=this.items.length,b=(Number(this.indexOf(this.focusedItem))-1+a)%a;this._setFocusedItem(this.items[b])},_focusNext:function(){var a=(Number(this.indexOf(this.focusedItem))+1)%this.items.length;this._setFocusedItem(this.items[a])}},Polymer.IronMenuBehaviorImpl._shiftTabPressed=!1,Polymer.IronMenuBehavior=[Polymer.IronMultiSelectableBehavior,Polymer.IronA11yKeysBehavior,Polymer.IronMenuBehaviorImpl];