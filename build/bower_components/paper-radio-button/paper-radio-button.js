Polymer({is:"paper-radio-button",behaviors:[Polymer.PaperInkyFocusBehavior],hostAttributes:{role:"radio","aria-checked":!1,tabindex:0},properties:{checked:{type:Boolean,value:!1,reflectToAttribute:!0,notify:!0,observer:"_checkedChanged"},toggles:{type:Boolean,value:!0,reflectToAttribute:!0}},attached:function(){var a=Polymer.dom(this).textContent.trim();""===a&&(this.$.radioLabel.hidden=!0),""===a||this.getAttribute("aria-label")||this.setAttribute("aria-label",a),this._isReady=!0},_buttonStateChanged:function(){this.disabled||this._isReady&&(this.checked=this.active)},_checkedChanged:function(){this.setAttribute("aria-checked",this.checked?"true":"false"),this.active=this.checked,this.fire("iron-change")}});