!function(){var a={},b={};Polymer.IronMeta=Polymer({is:"iron-meta",properties:{type:{type:String,value:"default",observer:"_typeChanged"},key:{type:String,observer:"_keyChanged"},value:{type:Object,notify:!0,observer:"_valueChanged"},self:{type:Boolean,observer:"_selfChanged"},list:{type:Array,notify:!0}},factoryImpl:function(a){if(a)for(var b in a)switch(b){case"type":case"key":case"value":this[b]=a[b]}},created:function(){this._metaDatas=a,this._metaArrays=b},_keyChanged:function(a,b){this._resetRegistration(b)},_valueChanged:function(a){this._resetRegistration(this.key)},_selfChanged:function(a){a&&(this.value=this)},_typeChanged:function(c){this._unregisterKey(this.key),a[c]||(a[c]={}),this._metaData=a[c],b[c]||(b[c]=[]),this.list=b[c],this._registerKeyValue(this.key,this.value)},byKey:function(a){return this._metaData&&this._metaData[a]},_resetRegistration:function(a){this._unregisterKey(a),this._registerKeyValue(this.key,this.value)},_unregisterKey:function(a){this._unregister(a,this._metaData,this.list)},_registerKeyValue:function(a,b){this._register(a,b,this._metaData,this.list)},_register:function(a,b,c,d){a&&c&&void 0!==b&&(c[a]=b,d.push(b))},_unregister:function(a,b,c){if(a&&b&&a in b){var d=b[a];delete b[a],this.arrayDelete(c,d)}}}),Polymer.IronMetaQuery=Polymer({is:"iron-meta-query",properties:{type:{type:String,value:"default",observer:"_typeChanged"},key:{type:String,observer:"_keyChanged"},value:{type:Object,notify:!0,readOnly:!0},list:{type:Array,notify:!0}},constructor:function(a){if(a)for(var b in a)switch(b){case"type":case"key":this[b]=a[b]}},created:function(){this._metaDatas=a,this._metaArrays=b},_keyChanged:function(a){this._setValue(this._metaData&&this._metaData[a])},_typeChanged:function(c){this._metaData=a[c],this.list=b[c],this.key&&this._keyChanged(this.key)},byKey:function(a){return this._metaData&&this._metaData[a]}})}();