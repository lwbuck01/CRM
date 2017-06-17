Polymer.PaperDialogBehaviorImpl={hostAttributes:{role:"dialog",tabindex:"-1"},properties:{modal:{observer:"_modalChanged",type:Boolean,value:!1},_lastFocusedElement:{type:Node},_boundOnFocus:{type:Function,value:function(){return this._onFocus.bind(this)}},_boundOnBackdropClick:{type:Function,value:function(){return this._onBackdropClick.bind(this)}}},listeners:{click:"_onDialogClick","iron-overlay-opened":"_onIronOverlayOpened","iron-overlay-closed":"_onIronOverlayClosed"},attached:function(){this._observer=this._observe(this),this._updateAriaLabelledBy()},detached:function(){this._observer&&this._observer.disconnect()},_observe:function(a){var b=new MutationObserver(function(){this._updateAriaLabelledBy()}.bind(this));return b.observe(a,{childList:!0,subtree:!0}),b},_modalChanged:function(){this.modal?this.setAttribute("aria-modal","true"):this.setAttribute("aria-modal","false"),this.modal&&(this.noCancelOnOutsideClick=!0,this.withBackdrop=!0)},_updateAriaLabelledBy:function(){var a=Polymer.dom(this).querySelector("h2");if(!a)return void this.removeAttribute("aria-labelledby");var b=a.getAttribute("id");if(!b||this.getAttribute("aria-labelledby")!==b){var c;b?c=b:(c="paper-dialog-header-"+(new Date).getUTCMilliseconds(),a.setAttribute("id",c)),this.setAttribute("aria-labelledby",c)}},_updateClosingReasonConfirmed:function(a){this.closingReason=this.closingReason||{},this.closingReason.confirmed=a},_onDialogClick:function(a){for(var b=a.target;b!==this;){if(b.hasAttribute("dialog-dismiss")){this._updateClosingReasonConfirmed(!1),this.close();break}if(b.hasAttribute("dialog-confirm")){this._updateClosingReasonConfirmed(!0),this.close();break}b=b.parentNode}},_onIronOverlayOpened:function(){this.modal&&(document.body.addEventListener("focus",this._boundOnFocus,!0),this.backdropElement.addEventListener("click",this._boundOnBackdropClick))},_onIronOverlayClosed:function(){document.body.removeEventListener("focus",this._boundOnFocus,!0),this.backdropElement.removeEventListener("click",this._boundOnBackdropClick)},_onFocus:function(a){if(this.modal){for(var b=a.target;b&&b!==this&&b!==document.body;)b=b.parentNode;b&&(b===document.body?this._lastFocusedElement?this._lastFocusedElement.focus():this._focusNode.focus():this._lastFocusedElement=a.target)}},_onBackdropClick:function(){this.modal&&(this._lastFocusedElement?this._lastFocusedElement.focus():this._focusNode.focus())}},Polymer.PaperDialogBehavior=[Polymer.IronOverlayBehavior,Polymer.PaperDialogBehaviorImpl];