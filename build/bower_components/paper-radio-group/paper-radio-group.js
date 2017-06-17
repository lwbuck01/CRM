Polymer({is:"paper-radio-group",behaviors:[Polymer.IronA11yKeysBehavior,Polymer.IronSelectableBehavior],hostAttributes:{role:"radiogroup",tabindex:0},properties:{attrForSelected:{type:String,value:"name"},selectedAttribute:{type:String,value:"checked"},selectable:{type:String,value:"paper-radio-button"}},keyBindings:{"left up":"selectPrevious","right down":"selectNext"},select:function(a){if(this.selected){var b=this._valueToItem(this.selected);if(this.selected==a)return void(b.checked=!0);b&&(b.checked=!1)}Polymer.IronSelectableBehavior.select.apply(this,[a]),this.fire("paper-radio-group-changed")},selectPrevious:function(){var a=this.items.length,b=Number(this._valueToIndex(this.selected));do b=(b-1+a)%a;while(this.items[b].disabled);this.select(this._indexToValue(b))},selectNext:function(){var a=this.items.length,b=Number(this._valueToIndex(this.selected));do b=(b+1+a)%a;while(this.items[b].disabled);this.select(this._indexToValue(b))}});