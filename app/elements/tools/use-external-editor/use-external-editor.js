"use strict";
var EXTERNAL_EDITOR_APP_ID = 'hkjjmhkhhlmkflpihbikfpcojeofbjgn';
var UEE = (function () {
    function UEE() {
    }
    UEE.init = function () {
        window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
        window.doc.externalEditorDialogTrigger.classList.remove('disabled');
        window.doc.externalEditorDialogTrigger.disabled = false;
    };
    ;
    UEE.errorHandler = function (error) {
        if (error === void 0) { error = 'Something went wrong'; }
        var toast = window.doc.externalEditorErrorToast;
        toast.text = error;
        toast.show();
    };
    ;
    UEE.postMessage = function (msg) {
        try {
            this.appPort.postMessage(msg);
        }
        catch (e) {
        }
    };
    ;
    UEE.updateFromExternal = function (msg) {
        if (this.connection.id === msg.connectionId) {
            if (window.scriptEdit && window.scriptEdit.active) {
                window.scriptEdit.editor.setValue(msg.code);
            }
            else {
                window.stylesheetEdit.newSettings.value.stylesheet = msg.code;
                window.stylesheetEdit.editor.setValue(msg.code);
            }
        }
    };
    ;
    UEE.cancelOpenFiles = function () {
        window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
        window.doc.externalEditorDialogTrigger.classList.remove('disabled');
        window.doc.externalEditorDialogTrigger.disabled = false;
        try {
            this.appPort.postMessage({
                status: 'connected',
                action: 'disconnect'
            });
        }
        catch (e) {
        }
        if (window.scriptEdit && window.scriptEdit.active) {
            window.scriptEdit.reloadEditor();
        }
        else if (window.stylesheetEdit && window.stylesheetEdit.active) {
            window.stylesheetEdit.reloadEditor();
        }
    };
    ;
    UEE.createEditingOverlay = function () {
        window.doc.externalEditorDialogTrigger.style.color = 'rgb(175, 175, 175)';
        window.doc.externalEditorDialogTrigger.disabled = true;
        window.doc.externalEditorDialogTrigger.classList.add('disabled');
        this.EditingOverlay.generateOverlay();
        $((window.scriptEdit && window.scriptEdit.active ?
            window.scriptEdit.editor.display.wrapper : window.stylesheetEdit.editor.display.wrapper))
            .find('.CodeMirror-scroll')[0]
            .animate([
            {
                bottom: '-152px',
                right: '-350px'
            }, {
                bottom: 0,
                right: 0
            }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }).onfinish = function () {
            this.effect.target.style.bottom = '0';
            this.effect.target.style.right = '0';
        };
    };
    ;
    UEE.setupExternalEditing = function () {
        var _this = this;
        if (this.connection.connected) {
            var item_1 = this.editingCRMItem;
            var tempListener_1 = function (msg) {
                if (msg.status === 'connected' && (msg.action === 'setupScript' || msg.action === 'setupStylesheet') && msg.connectionId === _this.connection.id) {
                    if (msg.existed === false) {
                        item_1.file = {
                            id: msg.id,
                            path: msg.path
                        };
                    }
                    _this.connection.filePath = msg.path;
                    window.app.upload();
                    _this.connection.fileConnected = true;
                    (window.scriptEdit && window.scriptEdit.active ? window.scriptEdit.reloadEditor(true) : window.stylesheetEdit.reloadEditor(true));
                    _this.createEditingOverlay();
                    _this.appPort.onMessage.removeListener(tempListener_1);
                }
            };
            this.appPort.onMessage.addListener(tempListener_1);
            if (item_1.file) {
                this.appPort.postMessage({
                    status: 'connected',
                    action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
                    name: item_1.name,
                    code: (window.scriptEdit && window.scriptEdit.active ?
                        item_1.value.script : item_1.value.stylesheet),
                    id: item_1.file.id
                });
            }
            else {
                this.appPort.postMessage({
                    status: 'connected',
                    action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
                    name: item_1.name,
                    code: (window.scriptEdit && window.scriptEdit.active ?
                        item_1.value.script : item_1.value.stylesheet),
                });
            }
        }
        else {
            _this.errorHandler('Could not establish connection');
        }
    };
    ;
    UEE.setupMessageHandler = function () {
        var _this = this;
        chrome.runtime.onConnectExternal.addListener(function (port) {
            if (port.sender.id === 'obnfehdnkjmbijebdllfcnccllcfceli') {
                port.onMessage.addListener(function (msg) {
                    _this.messageHandler.apply(_this, [msg]);
                });
            }
        });
    };
    ;
    UEE.appMessageHandler = function (msg) {
        switch (msg.action) {
            case 'chooseFile':
                var _this_1 = this;
                var chooseFileDialog_1 = window.doc.externalEditorChooseFile;
                chooseFileDialog_1.init(msg.local, msg.external, function (result) {
                    if (result !== false) {
                        if (window.scriptEdit && window.scriptEdit.active) {
                            window.scriptEdit.editor.setValue(result);
                        }
                        else {
                            window.stylesheetEdit.newSettings.value.stylesheet = result;
                            window.stylesheetEdit.editor.setValue(result);
                        }
                        _this_1.appPort.postMessage({
                            status: 'connected',
                            action: 'chooseFile',
                            code: result
                        });
                    }
                    else {
                        chooseFileDialog_1.close();
                    }
                });
                chooseFileDialog_1.open();
                break;
            case 'updateFromApp':
                this.updateFromExternal(msg);
                break;
        }
    };
    ;
    UEE.messageHandler = function (msg) {
        switch (msg.status) {
            case 'connected':
                this.appMessageHandler(msg);
                break;
            case 'ping':
                this.appPort.postMessage({
                    status: 'ping',
                    message: 'received'
                });
                break;
        }
    };
    ;
    UEE.establishConnection = function (retry) {
        if (retry === void 0) { retry = false; }
        var _this = this;
        if (!this.appPort) {
            this.appPort = chrome.runtime.connect(EXTERNAL_EDITOR_APP_ID);
            this.connection.status = 'connecting';
            this.connection.stage = 0;
            this.connection.fileConnected = false;
            (function (resolve, reject) {
                function promiseListener(msg) {
                    if (msg.status === 'connecting' && msg.stage === 1 && msg.message === 'hey') {
                        _this.appPort.onMessage.removeListener(promiseListener);
                        resolve(msg);
                    }
                }
                if (retry) {
                    setTimeout(function () {
                        reject();
                    }, 5000);
                }
                _this.appPort.onMessage.addListener(promiseListener);
                _this.appPort.onMessage.addListener(function (msg) {
                    _this.messageHandler.apply(_this, [msg]);
                });
                _this.appPort.postMessage({
                    status: 'connecting',
                    message: 'hi',
                    stage: 0
                });
            }(function (msg) {
                _this.connection.stage = 2;
                _this.appPort.postMessage({
                    status: 'connecting',
                    message: 'hello',
                    stage: 2
                });
                _this.connection.connected = true;
                _this.connection.state = 'connected';
                _this.connection.id = msg.connectionId;
            }, function () {
                _this.errorHandler();
            }));
        }
    };
    ;
    UEE.cmLoaded = function () {
        var placeHolderRect = window.doc.chooseFileMergerPlaceholder.getBoundingClientRect();
        window.doc.chooseFileMergerPlaceholder.style.width = placeHolderRect.width + 'px';
        window.doc.chooseFileMergerPlaceholder.style.height = placeHolderRect.height + 'px';
        window.doc.chooseFileMergerPlaceholder.style.position = 'absolute';
        window.doc.chooseFileMergerPlaceholder.style.display = 'flex';
        this.playIfExists(this.editorFadeInAnimation) ||
            (this.editorFadeInAnimation = window.doc.chooseFileMergerPlaceholder.animate([
                {
                    opacity: 1
                }, {
                    opacity: 0
                }
            ], {
                duration: 350,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }));
        this.editorFadeInAnimation.onfinish = function () {
            window.doc.chooseFileMergerPlaceholder.style.display = 'none';
            window.doc.chooseFileMergerPlaceholder.style.position = 'initial';
            window.doc.chooseFileMergerPlaceholder.style.width = 'auto';
            window.doc.chooseFileMergerPlaceholder.style.height = 'auto';
            window.doc.chooseFilemergerContainer.style.opacity = '0';
            window.doc.chooseFilemergerContainer.style.display = 'block';
            window.doc.chooseFilemergerContainer.animate([
                {
                    opacity: 0
                }, {
                    opacity: 1
                }
            ], {
                duration: 350,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                window.doc.chooseFilemergerContainer.style.opacity = '1';
                window.externalEditor.editor.edit.refresh();
                window.externalEditor.editor.left.orig.refresh();
                window.externalEditor.editor.right.orig.refresh();
            };
        };
    };
    ;
    UEE.applyProps = function (source, target, props) {
        for (var i = 0; i < props.length; i++) {
            target[props[i]] = source[props[i]] + '';
        }
    };
    UEE.doCSSAnimation = function (element, _a, duration, callback) {
        var _this = this;
        var before = _a[0], after = _a[1];
        var animation = element.animate([before, after], {
            duration: duration,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        });
        animation.onfinish = function () {
            _this.applyProps(after, element.style, Object.getOwnPropertyNames(after));
            callback && callback();
        };
        return animation;
    };
    UEE.initEditor = function (_this, oldScript, newScript) {
        _this.editor = new window.CodeMirror.MergeView(window.doc.chooseFilemergerContainer, {
            lineNumbers: true,
            scrollbarStyle: 'simple',
            lineWrapping: true,
            mode: 'javascript',
            foldGutter: true,
            theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
            indentUnit: window.app.settings.editor.tabSize,
            indentWithTabs: window.app.settings.editor.useTabs,
            value: oldScript,
            origLeft: oldScript,
            origRight: newScript,
            connect: 'align',
            messageExternal: true
        });
    };
    UEE.playIfExists = function (animation) {
        if (animation) {
            animation.play();
            return true;
        }
        return false;
    };
    UEE.onDialogMainDivAnimationHideEnd = function (__this, dialogRect, dialogStyle, oldScript, newScript) {
        var _this = this;
        window.doc.chooseFileMainDialog.style.display = 'none';
        window.doc.chooseFileMainDialog.style.marginTop = '0';
        window.doc.chooseFileMainDialog.style.opacity = '1';
        this.playIfExists(__this.dialogExpansionAnimation) ||
            (__this.dialogExpansionAnimation = __this.doCSSAnimation(window.doc.externalEditorChooseFile, [{
                    width: dialogRect.width,
                    height: dialogRect.height,
                    marginTop: '24px',
                    marginLeft: '40px',
                    marginBottom: '24px',
                    marginRight: '40px',
                    top: (dialogStyle.top || '0px'),
                    left: (dialogStyle.left || '0px')
                }, {
                    width: '100vw',
                    height: '100vh',
                    marginTop: '0px',
                    marginLeft: '0px',
                    marginBottom: '0px',
                    marginRight: '0px',
                    top: '0px',
                    left: '0px'
                }], 400, function () {
                window.doc.chooseFileMerger.style.display = 'flex';
                _this.playIfExists(__this.dialogComparisonDivAnimationShow) ||
                    (__this.dialogComparisonDivAnimationShow = __this.doCSSAnimation(window.doc.chooseFileMerger, [{
                            marginTop: '70px',
                            opacity: 0
                        }, {
                            marginTop: '0px',
                            opacity: 1
                        }], 250, function () {
                        if (!__this.editor) {
                            setTimeout(function () {
                                __this.initEditor(__this, oldScript, newScript);
                            }, 150);
                        }
                    }));
            }));
    };
    UEE.showMergeDialog = function (_this, oldScript, newScript) {
        var dialogRect = window.doc.externalEditorChooseFile.getBoundingClientRect();
        var dialogStyle = window.doc.externalEditorChooseFile.style;
        _this.dialogStyleProperties = dialogRect;
        dialogStyle.maxWidth = '100vw';
        dialogStyle.width = dialogRect.width + 'px';
        dialogStyle.height = dialogRect.height + 'px';
        document.body.style.overflow = 'hidden';
        window.doc.chooseFileMainDialog.style.position = 'absolute';
        _this.playIfExists(_this.dialogMainDivAnimationHide) ||
            (_this.dialogMainDivAnimationHide = window.doc.chooseFileMainDialog.animate([
                {
                    marginTop: '20px',
                    opacity: 1
                }, {
                    marginTop: '100px',
                    opacity: 0
                }
            ], {
                duration: 240,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }));
        _this.dialogMainDivAnimationHide.onfinish = function () {
            _this.onDialogMainDivAnimationHideEnd(_this, dialogRect, dialogStyle, oldScript, newScript);
        };
    };
    ;
    UEE.findChildWithClass = function (div, classToFind) {
        for (var i = 0; i < div.children.length; i++) {
            if (div.children[i].classList.contains(classToFind)) {
                return div.children[i];
            }
        }
        return null;
    };
    ;
    UEE.findChildWithTag = function (div, tag) {
        for (var i = 0; i < div.children.length; i++) {
            if (div.children[i].tagName.toLowerCase() === tag) {
                return div.children[i];
            }
        }
        return null;
    };
    ;
    UEE.findReverseLineTranslation = function (_this, line, editor) {
        var i;
        var offset = 0;
        var lineDivs = editor.display.lineDiv.children;
        var lineWidget, seperator;
        var lineHeight = _this.findChildWithTag(lineDivs[0], 'pre').getBoundingClientRect().height;
        for (i = 0; i < lineDivs.length; i++) {
            if ((lineWidget = _this.findChildWithClass(lineDivs[i], 'CodeMirror-linewidget')) &&
                (seperator = _this.findChildWithClass(lineWidget, 'CodeMirror-merge-spacer'))) {
                offset += Math.round(parseInt(seperator.style.height.split('px')[0], 10) / lineHeight);
            }
            if (i + offset >= line) {
                return i;
            }
        }
        return i;
    };
    ;
    UEE.containEachother = function (line1, line2) {
        return !!(line1.indexOf(line2) > -1 ? true : line2.indexOf(line1));
    };
    ;
    UEE.generateIncrementFunction = function (errors) {
        var len = errors.length;
        return function (index) {
            if (++index === len) {
                index = 0;
            }
            return index;
        };
    };
    ;
    UEE.generateLineIndexTranslationArray = function (_this, editor) {
        var result = [];
        var offset = 0;
        var lineDivs = editor.display.lineDiv.children;
        var lineWidget, seperator;
        var lineHeight = _this.findChildWithTag(lineDivs[0], 'pre').getBoundingClientRect().height;
        for (var i = 0; i < lineDivs.length; i++) {
            if ((lineWidget = _this.findChildWithClass(lineDivs[i], 'CodeMirror-linewidget')) &&
                (seperator = _this.findChildWithClass(lineWidget, 'CodeMirror-merge-spacer'))) {
                offset += Math.round(parseInt(seperator.style.height.split('px')[0], 10) / lineHeight);
            }
            result[i] = i + offset;
        }
        return result;
    };
    ;
    UEE.generateNextErrorFinder = function (isLeftEditor, errors) {
        var i;
        var _this = this;
        var sideEditor = null;
        var mainEditor = null;
        var errorIndex = 0;
        var sideEditorLineTranslationArray;
        var incrementFunction = _this.generateIncrementFunction(errors);
        return function () {
            if (!sideEditor) {
                mainEditor = window.externalEditor.editor.edit;
                sideEditor = window.externalEditor.editor[(isLeftEditor ? 'left' : 'right')].orig;
                sideEditorLineTranslationArray = _this.generateLineIndexTranslationArray(_this, sideEditor);
            }
            var error = null;
            for (i = errorIndex, errorIndex = incrementFunction(errorIndex); i !== errorIndex; errorIndex = incrementFunction(errorIndex)) {
                var sideEditorLine = sideEditorLineTranslationArray[errors[errorIndex].from.line];
                var mainEditorLine = _this.findReverseLineTranslation(_this, sideEditorLine, mainEditor);
                if (_this.containEachother(mainEditor.getLine(mainEditorLine), sideEditor.getLine(errors[errorIndex].from.line))) {
                    error = errors[errorIndex];
                    break;
                }
            }
            errorIndex = incrementFunction(i);
            if (error) {
                $('.errorHighlight').each(function () {
                    this.classList.remove('errorHighlight');
                });
                mainEditor.markText(error.from, error.to, {
                    className: 'errorHighlight',
                    clearOnEnter: true,
                    inclusiveLeft: false,
                    inclusiveRight: false
                });
            }
            else {
                window.doc.noErrorsFound.show();
            }
        };
    };
    ;
    UEE.clearElementListeners = function (element) {
        var element = window.doc.updateMergeLeftNextError;
        element.listeners = element.listeners || [];
        for (var i = 0; i < element.listeners.length; i++) {
            element.removeEventListener('click', element.listeners[i]);
        }
        element.listeners = [];
    };
    UEE.markErrors = function (errors, editor) {
        for (var i = 0; i < errors.length; i++) {
            editor.orig.markText(errors[i].from, errors[i].to, {
                className: 'updateError',
                inclusiveLeft: false,
                inclusiveRight: false
            });
        }
    };
    UEE.resetStyles = function (target, source) {
        target.width = source.width + 'px';
        target.height = source.height + 'px';
        target.top = source.top + 'px';
        target.left = source.left + 'px';
    };
    UEE.initFileDialogText = function (isUpdate, chooseFileDialog) {
        window.doc.chooseFileCurrentTxt.innerText = (isUpdate ? 'Old' : 'CRM Editor');
        window.doc.chooseFileNewTxt.innerText = (isUpdate ? 'New' : 'File');
        window.doc.chooseFileTitleTxt.innerText = (isUpdate ? 'Change the script to how you want it' : 'Merge the file to how you want it');
        window.doc.chooseFileStopMerging.style.display = (isUpdate ? 'none' : 'block');
        chooseFileDialog.classList[(isUpdate ? 'add' : 'remove')]('updateMerge');
    };
    UEE.markerFn = function (_this, data) {
        var updateErrors = data.updateErrors, chooseFileDialog = data.chooseFileDialog;
        setTimeout(function () {
            _this.markErrors(updateErrors.oldScript, window.externalEditor.editor.left);
            _this.markErrors(updateErrors.oldScript, window.externalEditor.editor.right);
            chooseFileDialog.removeEventListener('iron-overlay-opened', function () {
                _this.markerFn(_this, data);
            });
        }, 2000);
    };
    UEE.handleUpdateErrors = function (_this, updateErrors, _a) {
        var leftErrorButton = _a[0], rightErrorButton = _a[1], chooseFileDialog = _a[2];
        window.doc.updateMergerCont.style.display = 'block';
        var errorsNumber = (updateErrors.parseError ? '1' : updateErrors.oldScript.length);
        window.doc.updateMergerTxt.innerText = 'A total of ' + errorsNumber + ' errors have occurred in updating this script.';
        if (!updateErrors.parseError) {
            leftErrorButton.style.display = rightErrorButton.style.display = window.doc.updateMergePlaceholderBr.style.display = 'block';
            var listenerLeft = _this.generateNextErrorFinder(true, updateErrors.oldScript);
            var listenerRight = _this.generateNextErrorFinder(false, updateErrors.newScript);
            leftErrorButton.addEventListener('click', listenerLeft);
            rightErrorButton.addEventListener('click', listenerRight);
            leftErrorButton.listeners.push(listenerLeft);
            rightErrorButton.listeners.push(listenerRight);
            chooseFileDialog.addEventListener('iron-overlay-opened', function () {
                _this.markerFn(_this, {
                    updateErrors: updateErrors,
                    chooseFileDialog: chooseFileDialog
                });
            });
        }
        else {
            leftErrorButton.style.display = rightErrorButton.style.display = window.doc.updateMergePlaceholderBr.style.display = 'none';
        }
    };
    UEE.chooseFileDialog = function (chooseFileDialog) {
        var _this = this;
        return function (local, file, callback, isUpdate, updateErrors) {
            _this.initFileDialogText(isUpdate, chooseFileDialog);
            var leftErrorButton = window.doc.updateMergeLeftNextError;
            var rightErrorButton = window.doc.updateMergeRightNextError;
            _this.clearElementListeners(leftErrorButton);
            _this.clearElementListeners(rightErrorButton);
            if (updateErrors) {
                _this.handleUpdateErrors(_this, updateErrors, [leftErrorButton, rightErrorButton, chooseFileDialog]);
            }
            else {
                window.doc.updateMergerCont.style.display = 'none';
            }
            chooseFileDialog.local = local;
            chooseFileDialog.file = file;
            chooseFileDialog.callback = callback;
            _this.editor = null;
            window.doc.chooseFilemergerContainer.innerHTML = '';
            document.body.style.overflow = 'auto';
            window.doc.chooseFileMainDialog.style.position = 'static';
            window.doc.chooseFileMainDialog.style.display = 'block';
            window.doc.chooseFileMerger.style.display = 'none';
            if (_this.dialogStyleProperties) {
                _this.resetStyles(chooseFileDialog.style, _this.dialogStyleProperties);
            }
        };
    };
    UEE.stopMerging = function (chooseFileDialog) {
        var _this = this;
        _this.playIfExists(_this.dialogComparisonDivAnimationHide) ||
            (_this.dialogComparisonDivAnimationHide = window.doc.chooseFileMerger.animate([
                {
                    marginTop: '0px',
                    opacity: 1
                }, {
                    marginTop: '70px',
                    opacity: 0
                }
            ], {
                duration: 250,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }));
        _this.dialogComparisonDivAnimationHide.onfinish = function () {
            window.doc.chooseFileMerger.style.display = 'none';
            _this.playIfExists(_this.dialogContractionAniation) ||
                (_this.dialogContractionAniation = _this.doCSSAnimation(chooseFileDialog, [{
                        width: '100vw',
                        height: '100vh',
                        top: 0,
                        left: 0,
                        margin: 0
                    }, {
                        width: _this.dialogStyleProperties.width + 'px',
                        height: _this.dialogStyleProperties.height + 'px',
                        top: _this.dialogStyleProperties.top + 'px',
                        left: _this.dialogStyleProperties.left + 'px',
                        margin: '40px 24px'
                    }], 250, function () {
                    document.body.style.overflow = 'auto';
                    window.doc.chooseFileMainDialog.style.position = 'static';
                    window.doc.chooseFileMainDialog.style.display = 'block';
                    _this.playIfExists(_this.dialogMainDivAnimationShow) || (_this.dialogMainDivAnimationShow = _this.doCSSAnimation(window.doc.chooseFileMainDialog, [{
                            marginTop: '100px',
                            opacity: 0
                        }, {
                            marginTop: '20px',
                            opacity: 1
                        }], 250));
                }));
        };
    };
    UEE.ready = function () {
        var _this = this;
        window.externalEditor = this;
        this.establishConnection();
        this.init();
        window.onfocus = function () {
            if (_this.connection.fileConnected) {
                _this.postMessage({
                    status: 'connected',
                    action: 'refreshFromApp'
                });
            }
        };
        var chooseFileDialog = window.doc.externalEditorChooseFile;
        chooseFileDialog.init = this.chooseFileDialog(chooseFileDialog);
        window.doc.externalEditorTryAgainButton.addEventListener('click', function () {
            _this.establishConnection(true);
            window.doc.externalEditorErrorToast.hide();
        });
        window.doc.chooseFileChooseFirst.addEventListener('click', function () {
            if (window.doc.chooseFileRadioGroup.selected === 'local') {
                chooseFileDialog.callback(chooseFileDialog.local);
            }
            else {
                chooseFileDialog.callback(chooseFileDialog.file);
            }
        });
        window.doc.chooseFileChooseMerge.addEventListener('click', function () {
            chooseFileDialog.callback(_this.editor.edit.getValue());
        });
        $('.closeChooseFileDialog').click(function () {
            chooseFileDialog.callback(false);
        });
        window.doc.chooseFileMerge.addEventListener('click', function () {
            _this.showMergeDialog(_this, chooseFileDialog.local, chooseFileDialog.file);
        });
        window.doc.chooseFileStopMerging.addEventListener('click', function () {
            _this.stopMerging(chooseFileDialog);
        });
    };
    return UEE;
}());
UEE.is = 'use-external-editor';
UEE.appPort = null;
UEE.connection = {
    status: 'no connection',
    connected: false
};
UEE.dialogMainDivAnimationShow = null;
UEE.dialogMainDivAnimationHide = null;
UEE.dialogComparisonDivAnimationShow = null;
UEE.dialogComparisonDivAnimationHide = null;
UEE.dialogExpansionAnimation = null;
UEE.dialogContractionAniation = null;
UEE.editor = null;
UEE.editorFadeInAnimation = null;
UEE.EditingOverlay = (function () {
    function EditingOverlay() {
    }
    EditingOverlay.createToolsCont = function () {
        var toolsCont = window.app.util.createElement('div', {
            id: 'externalEditingTools'
        });
        toolsCont.appendChild(window.app.util.createElement('div', {
            id: 'externalEditingToolsTitle'
        }, ['Using external editor']));
        return toolsCont;
    };
    EditingOverlay.createDisconnect = function () {
        var _this = this;
        var el = window.app.util.createElement('div', {
            id: 'externalEditingToolsDisconnect'
        }, [
            window.app.util.createElement('paper-material', {
                props: {
                    elevation: '1'
                }
            }, [
                window.app.util.createElement('paper-ripple', {}),
                window.app.util.createElement('svg', {
                    props: {
                        xmlns: 'http://www.w3.org/2000/svg',
                        height: '70',
                        width: '70',
                        viewBox: '0 0 24 24'
                    }
                }, [
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17' +
                                '.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                        }
                    }),
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M0 0h24v24H0z',
                            fill: 'none'
                        }
                    })
                ]),
                window.app.util.createElement('div', {
                    classes: ['externalEditingToolText']
                }, ['Stop'])
            ])
        ]);
        el.addEventListener('click', function () {
            _this.parent().cancelOpenFiles.apply(_this, []);
        });
        return el;
    };
    EditingOverlay.createShowLocation = function () {
        var _this = this;
        var el = window.app.util.createElement('div', {
            id: 'externalEditingToolsShowLocation'
        }, [
            window.app.util.createElement('paper-material', {
                props: {
                    elevation: '1'
                }
            }, [
                window.app.util.createElement('paper-ripple', {}),
                window.app.util.createElement('svg', {
                    props: {
                        height: '70',
                        viewBox: '0 0 24 24',
                        width: '70',
                        xmlns: 'http://www.w3.org/2000/svg'
                    }
                }, [
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M0 0h24v24H0z',
                            fill: 'none'
                        }
                    }),
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 ' +
                                '18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0' +
                                '-1.1-.9-2-2-2zm0 12H4V8h16v10z'
                        }
                    })
                ])
            ]),
            window.app.util.createElement('div', {
                classes: ['externalEditingToolText']
            }, ['Location'])
        ]);
        el.addEventListener('click', function () {
            var location = _this.parent().connection.filePath;
            location = location.replace(/\\/g, '/');
            window.doc.externalEditoOpenLocationInBrowser.setAttribute('href', 'file:///' + location);
            var externalEditorLocationToast = window.doc.externalEditorLocationToast;
            externalEditorLocationToast.text = 'File is located at: ' + location;
            externalEditorLocationToast.show();
        });
        return el;
    };
    EditingOverlay.createNewFile = function () {
        var _this = this;
        window.app.util.createElement('div', {
            id: 'externalEditingToolsCreateNewFile'
        }, [
            window.app.util.createElement('paper-material', {
                props: {
                    elevation: '1'
                }
            }, [
                window.app.util.createElement('paper-ripple', {}),
                window.app.util.createElement('svg', {
                    props: {
                        height: '70',
                        width: '70',
                        xmlns: 'http://www.w3.org/2000/svg',
                        viewBox: '0 0 24 24'
                    }
                }, [
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1' +
                                '.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6' +
                                '-6H6zm7 7V3.5L18.5 9H13z'
                        }
                    }),
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M0 0h24v24H0z',
                            fill: 'none'
                        }
                    })
                ])
            ]),
            window.app.util.createElement('div', {
                classes: ['externalEditingToolText']
            }, ['Move'])
        ]).addEventListener('click', function () {
            _this.parent().postMessage({
                status: 'connected',
                action: 'createNewFile',
                isCss: (!!window.scriptEdit),
                name: _this.parent().editingCRMItem.name
            });
        });
    };
    EditingOverlay.createUpdate = function () {
        var _this = this;
        var el = window.app.util.createElement('div', {
            id: 'externalEditingToolsUpdate'
        }, [
            window.app.util.createElement('paper-material', {
                props: {
                    elevation: '1'
                }
            }, [
                window.app.util.createElement('paper-ripple', {}),
                window.app.util.createElement('svg', {
                    props: {
                        height: '70',
                        width: '70',
                        xmlns: 'http://www.w3.org/2000/svg',
                        viewBox: '0 0 24 24'
                    }
                }, [
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58' +
                                '-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.0' +
                                '8c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6' +
                                ' 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
                        }
                    }),
                    window.app.util.createElement('path', {
                        props: {
                            d: 'M0 0h24v24H0z',
                            fill: 'none'
                        }
                    })
                ])
            ]),
            window.app.util.createElement('div', {
                classes: ['externalEditingToolText']
            }, ['Refresh'])
        ]);
        el.addEventListener('click', function () {
            _this.parent().postMessage({
                status: 'connected',
                action: 'refreshFromApp'
            });
        });
        return el;
    };
    EditingOverlay.createCont = function (toolsCont) {
        var cont = toolsCont.appendChild(window.app.util.createElement('div', {
            id: 'externalEditingToolsButtonsCont'
        }));
        cont.appendChild(this.createDisconnect());
        cont.appendChild(this.createShowLocation());
        this.createNewFile();
        cont.appendChild(this.createUpdate());
    };
    EditingOverlay.appendWrapper = function (toolsCont) {
        $((window.scriptEdit && window.scriptEdit.active ?
            window.scriptEdit.editor.display.wrapper :
            window.stylesheetEdit.editor.display.wrapper))
            .find('.CodeMirror-scroll')[0].appendChild(toolsCont);
    };
    EditingOverlay.generateOverlay = function () {
        var toolsCont = this.createToolsCont();
        this.createCont(toolsCont);
        this.appendWrapper(toolsCont);
    };
    EditingOverlay.parent = function () {
        return window.externalEditor;
    };
    return EditingOverlay;
}());
Polymer(UEE);
