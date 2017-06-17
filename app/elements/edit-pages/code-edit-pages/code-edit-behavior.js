"use strict";
var CEB = (function () {
    function CEB() {
    }
    CEB.finishEditing = function () {
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: null
            });
        }
        window.useOptionsCompletions = false;
        this.hideCodeOptions();
        Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(function (tab) {
            tab.classList.remove('active');
        });
        document.querySelector('.mainEditorTab').classList.add('active');
    };
    ;
    CEB.insertSnippet = function (_this, snippet, noReplace) {
        if (noReplace === void 0) { noReplace = false; }
        this.editor.doc.replaceSelection(noReplace ?
            snippet :
            snippet.replace('%s', this.editor.doc
                .getSelection()));
    };
    ;
    CEB.popOutToolsRibbon = function () {
        window.doc.editorToolsRibbonContainer.animate([
            {
                marginLeft: 0
            }, {
                marginLeft: '-200px'
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }).onfinish = function () {
            this.effect.target.style.marginLeft = '-200px';
            this.effect.target.classList.remove('visible');
        };
    };
    ;
    CEB.toggleFullScreen = function () {
        (this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
    };
    ;
    CEB.toggleOptions = function () {
        (this.optionsShown ? this.hideOptions() : this.showOptions());
    };
    ;
    CEB.scrollbarsUpdate = function (vertical) {
        if (vertical !== this.verticalVisible) {
            if (vertical) {
                this.buttonsContainer.style.right = '29px';
            }
            else {
                this.buttonsContainer.style.right = '11px';
            }
            this.verticalVisible = !this.verticalVisible;
        }
    };
    ;
    CEB.getCmInstance = function () {
        if (this.item.type === 'script') {
            return window.scriptEdit.editor;
        }
        return window.stylesheetEdit.editor;
    };
    CEB.showCodeOptions = function () {
        window.useOptionsCompletions = true;
        if (!this.otherDoc) {
            var doc = new window.CodeMirror.Doc(typeof this.item.value.options === 'string' ?
                this.item.value.options : JSON.stringify(this.item.value.options, null, '\t'), {
                name: 'javascript',
                json: true
            });
            this.otherDoc = this.getCmInstance().swapDoc(doc);
        }
        else {
            this.otherDoc = this.getCmInstance().swapDoc(this.otherDoc);
        }
        this.getCmInstance().performLint();
    };
    CEB.hideCodeOptions = function () {
        if (!window.useOptionsCompletions) {
            return;
        }
        window.useOptionsCompletions = false;
        this.otherDoc = this.getCmInstance().swapDoc(this.otherDoc);
        this.getCmInstance().performLint();
    };
    return CEB;
}());
CEB.savingInterval = 0;
CEB.active = false;
CEB.editor = null;
CEB.verticalVisible = false;
CEB.horizontalVisible = false;
CEB.settingsEl = null;
CEB.fullscreenEl = null;
CEB.buttonsContainer = null;
CEB.editorHeight = 0;
CEB.editorWidth = 0;
CEB.showTriggers = false;
CEB.showContentTypeChooser = false;
CEB.optionsShown = false;
CEB.fullscreen = false;
CEB.editorOptions = null;
CEB.settingsShadow = null;
CEB.preFullscreenEditorDimensions = {};
CEB.editorMode = 'main';
CEB.otherDoc = null;
Polymer.CodeEditBehavior = CEB;
