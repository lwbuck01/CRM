Polymer.PaperButtonBehaviorImpl={properties:{_elevation:{type:Number}},observers:["_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)"],hostAttributes:{role:"button",tabindex:"0"},_calculateElevation:function(){var a=1;this.disabled?a=0:this.active||this.pressed?a=4:this.receivedFocusFromKeyboard&&(a=3),this._elevation=a}},Polymer.PaperButtonBehavior=[Polymer.IronButtonState,Polymer.IronControlState,Polymer.PaperButtonBehaviorImpl];