Polymer({is:"iron-icon",properties:{icon:{type:String,observer:"_iconChanged"},theme:{type:String,observer:"_updateIcon"},src:{type:String,observer:"_srcChanged"}},_DEFAULT_ICONSET:"icons",_iconChanged:function(a){var b=(a||"").split(":");this._iconName=b.pop(),this._iconsetName=b.pop()||this._DEFAULT_ICONSET,this._updateIcon()},_srcChanged:function(a){this._updateIcon()},_usesIconset:function(){return this.icon||!this.src},_updateIcon:function(){this._usesIconset()?this._iconsetName&&(this._iconset=this.$.meta.byKey(this._iconsetName),this._iconset?this._iconset.applyIcon(this,this._iconName,this.theme):this._warn(this._logf("_updateIcon","could not find iconset `"+this._iconsetName+"`, did you import the iconset?"))):(this._img||(this._img=document.createElement("img"),this._img.style.width="100%",this._img.style.height="100%"),this._img.src=this.src,Polymer.dom(this.root).appendChild(this._img))}});