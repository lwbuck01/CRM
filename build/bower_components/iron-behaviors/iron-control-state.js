Polymer.IronControlState={properties:{focused:{type:Boolean,value:!1,notify:!0,readOnly:!0,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,notify:!0,observer:"_disabledChanged",reflectToAttribute:!0},_oldTabIndex:{type:Number}},observers:["_changedControlState(focused, disabled)"],listeners:{focus:"_focusHandler",blur:"_blurHandler"},ready:function(){void 0===this.focused&&this._setFocused(!1)},_focusHandler:function(){this._setFocused(!0)},_blurHandler:function(){this._setFocused(!1)},_disabledChanged:function(a,b){this.setAttribute("aria-disabled",a?"true":"false"),this.style.pointerEvents=a?"none":"",a?(this._oldTabIndex=this.tabIndex,this.focused=!1,this.tabIndex=-1):void 0!==this._oldTabIndex&&(this.tabIndex=this._oldTabIndex)},_changedControlState:function(a,b){this._controlStateChanged&&this._controlStateChanged(a,b)}};