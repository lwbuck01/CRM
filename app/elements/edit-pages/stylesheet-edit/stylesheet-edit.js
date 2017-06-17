"use strict";
var stylesheetEditProperties = {
    item: {
        type: Object,
        value: {},
        notify: true
    }
};
var STE = (function () {
    function STE() {
    }
    STE.getExportData = function () {
        $('stylesheet-edit #exportMenu paper-menu')[0].selected = 0;
        var settings = {};
        this.save(null, settings);
        return settings;
    };
    ;
    STE.exportStylesheetAsCRM = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
    };
    ;
    STE.exportStylesheetAsUserscript = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
    };
    ;
    STE.exportStylesheetAsUserstyle = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'Userstyle');
    };
    ;
    STE.cancelChanges = function () {
        var _this = this;
        if (this.fullscreen) {
            this.exitFullScreen();
        }
        window.setTimeout(function () {
            _this.finishEditing();
            window.externalEditor.cancelOpenFiles();
            _this.active = false;
        }, this.fullscreen ? 500 : 0);
    };
    ;
    STE.saveChanges = function () {
        this.finishEditing();
        window.externalEditor.cancelOpenFiles();
        this.active = false;
    };
    ;
    STE.popInRibbons = function () {
        var scriptTitle = window.app.$.editorCurrentScriptTitle;
        var titleRibbonSize;
        if (window.app.storageLocal.shrinkTitleRibbon) {
            window.doc.editorTitleRibbon.style.fontSize = '40%';
            scriptTitle.style.padding = '0';
            titleRibbonSize = '-18px';
        }
        else {
            titleRibbonSize = '-51px';
        }
        scriptTitle.style.display = 'flex';
        scriptTitle.style.marginTop = titleRibbonSize;
        var scriptTitleAnimation = [
            {
                marginTop: titleRibbonSize
            }, {
                marginTop: 0
            }
        ];
        var margin = (window.app.storageLocal.hideToolsRibbon ? '-200px' : '0');
        scriptTitle.style.marginLeft = '-200px';
        scriptTitleAnimation[0]['marginLeft'] = '-200px';
        scriptTitleAnimation[1]['marginLeft'] = 0;
        setTimeout(function () {
            window.doc.editorToolsRibbonContainer.style.display = 'flex';
            window.doc.editorToolsRibbonContainer.animate([
                {
                    marginLeft: '-200px'
                }, {
                    marginLeft: margin
                }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                window.doc.editorToolsRibbonContainer.style.marginLeft = margin;
                window.doc.editorToolsRibbonContainer.classList.add('visible');
            };
        }, 200);
        setTimeout(function () {
            window.doc.dummy.style.height = '0';
            $(window.doc.dummy).animate({
                height: '50px'
            }, {
                duration: 500,
                easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                step: function (now) {
                    window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
                }
            });
            scriptTitle.animate(scriptTitleAnimation, {
                duration: 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.marginTop = '0';
                if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
                    scriptTitle.style.marginLeft = '0';
                }
            };
        }, 200);
    };
    ;
    STE.popOutRibbons = function () {
        var scriptTitle = window.app.$.editorCurrentScriptTitle;
        var toolsRibbon = window.app.$.editorToolsRibbonContainer;
        var toolsVisible = !window.app.storageLocal.hideToolsRibbon &&
            toolsRibbon &&
            toolsRibbon.classList.contains('visible');
        var titleExpanded = scriptTitle.getBoundingClientRect().height > 20;
        var titleAnimation = [{
                marginTop: 0,
                marginLeft: 0
            }, {
                marginTop: titleExpanded ? '-51px' : '-18px',
                marginLeft: (toolsVisible ? '-200px' : 0)
            }];
        if (toolsVisible) {
            scriptTitle.animate(titleAnimation, {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.marginTop = titleAnimation[1].marginTop + '';
                scriptTitle.style.marginLeft = titleAnimation[1].marginLeft + '';
            };
            toolsRibbon.animate([
                {
                    marginLeft: 0
                }, {
                    marginLeft: '-200px'
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.display = 'none';
                toolsRibbon.style.display = 'none';
                toolsRibbon.style.marginLeft = '-200px';
            };
        }
        else {
            window.doc.dummy.style.height = (titleExpanded ? '50px' : '18px');
            $(window.doc.dummy).animate({
                height: 0
            }, {
                duration: 800,
                easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                step: function (now) {
                    window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
                }
            });
            scriptTitle.animate([
                {
                    marginTop: 0
                }, {
                    marginTop: titleExpanded ? '-51px' : '-18px'
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.display = 'none';
                toolsRibbon.style.display = 'none';
                scriptTitle.style.marginTop = (titleExpanded ? '-51px' : '-18px');
            };
        }
    };
    ;
    STE.enterFullScreen = function () {
        var _this = this;
        if (this.fullscreen) {
            return;
        }
        this.fullscreen = true;
        var rect = this.editor.display.wrapper.getBoundingClientRect();
        var editorCont = window.doc.fullscreenEditor;
        var editorContStyle = editorCont.style;
        editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
        editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
        editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
        editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
        this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
        var $editorWrapper = $(this.editor.display.wrapper);
        var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
        buttonShadow.style.position = 'absolute';
        buttonShadow.style.right = '-1px';
        this.editor.display.wrapper.classList.add('fullscreen');
        $editorWrapper.appendTo(window.doc.fullscreenEditorHorizontal);
        var $horizontalCenterer = $('#horizontalCenterer');
        var viewportWidth = $horizontalCenterer.width() + 20;
        var viewPortHeight = $horizontalCenterer.height();
        if (window.app.storageLocal.hideToolsRibbon !== undefined) {
            if (window.app.storageLocal.hideToolsRibbon) {
                window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
            }
            else {
                window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
            }
        }
        else {
            chrome.storage.local.set({
                hideToolsRibbon: false
            });
            window.app.storageLocal.hideToolsRibbon = false;
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
        }
        if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
            if (window.app.storageLocal.shrinkTitleRibbon) {
                window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
            }
            else {
                window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
            }
        }
        else {
            chrome.storage.local.set({
                shrinkTitleRibbon: false
            });
            window.app.storageLocal.shrinkTitleRibbon = false;
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
        }
        $editorWrapper[0].style.height = 'auto';
        document.documentElement.style.overflow = 'hidden';
        editorCont.style.display = 'flex';
        $(editorCont).animate({
            width: viewportWidth,
            height: viewPortHeight,
            marginTop: 0,
            marginLeft: 0
        }, {
            duration: 500,
            easing: 'easeOutCubic',
            complete: function () {
                _this.editor.refresh();
                _this.style.width = '100vw';
                _this.style.height = '100vh';
                buttonShadow.style.position = 'fixed';
                window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
                window.colorFunction.func({
                    from: {
                        line: 0
                    },
                    to: {
                        line: window.colorFunction.cm.lineCount()
                    }
                }, window.colorFunction.cm);
                _this.popInRibbons();
            }
        });
    };
    ;
    STE.exitFullScreen = function () {
        if (!this.fullscreen) {
            return;
        }
        this.fullscreen = false;
        var _this = this;
        this.popOutRibbons();
        var $wrapper = $(_this.editor.display.wrapper);
        var $buttonShadow = $wrapper.find('#buttonShadow');
        $buttonShadow[0].style.position = 'absolute';
        setTimeout(function () {
            _this.editor.display.wrapper.classList.remove('fullscreen');
            var editorCont = window.doc.fullscreenEditor;
            _this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
            $(editorCont).animate({
                width: _this.preFullscreenEditorDimensions.width,
                height: _this.preFullscreenEditorDimensions.height,
                marginTop: _this.preFullscreenEditorDimensions.marginTop,
                marginLeft: _this.preFullscreenEditorDimensions.marginLeft
            }, {
                duration: 500,
                easing: 'easeOutCubic',
                complete: function () {
                    editorCont.style.marginLeft = '0';
                    editorCont.style.marginTop = '0';
                    editorCont.style.width = '0';
                    editorCont.style.height = '0';
                    $(_this.editor.display.wrapper).appendTo(_this.$.editorCont).css({
                        height: _this.preFullscreenEditorDimensions.height,
                        marginTop: 0,
                        marginLeft: 0
                    });
                }
            });
        }, 800);
    };
    ;
    STE.showOptions = function () {
        var _this = this;
        this.optionsShown = true;
        this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
        var editorWidth = $('.stylesheet-edit-codeMirror').width();
        var editorHeight = $('.stylesheet-edit-codeMirror').height();
        var circleRadius;
        if (this.fullscreen) {
            circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
        }
        else {
            circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 100;
        }
        var negHalfRadius = -circleRadius;
        circleRadius = circleRadius * 2;
        this.settingsShadow.parentElement.style.width = editorWidth + '';
        this.settingsShadow.parentElement.style.height = editorHeight + '';
        this.fullscreenEl.style.display = 'none';
        var settingsInitialMarginLeft = -500;
        $('#editorThemeFontSizeInput')[0].value = window.app.settings.editor.zoom;
        $(this.settingsShadow).css({
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            marginTop: '-25px',
            marginRight: '-25px'
        }).animate({
            width: circleRadius,
            height: circleRadius,
            marginTop: negHalfRadius,
            marginRight: negHalfRadius
        }, {
            duration: 500,
            easing: 'linear',
            progress: function (animation) {
                _this.editorOptions.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                _this.editorOptions.style.marginTop = -animation.tweens[2].now + 'px';
            },
            complete: function () {
                if (_this.fullscreen) {
                    var settingsCont = $('.stylesheet-edit-codeMirror #settingsContainer')[0];
                    settingsCont.style.overflow = 'scroll';
                    settingsCont.style.overflowX = 'hidden';
                    settingsCont.style.height = 'calc(100vh - 66px)';
                    var bubbleCont = $('.stylesheet-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'fixed';
                    bubbleCont.style.zIndex = '50';
                }
            }
        });
    };
    ;
    STE.hideOptions = function () {
        var _this = this;
        this.optionsShown = false;
        var settingsInitialMarginLeft = -500;
        this.fullscreenEl.style.display = 'block';
        $(this.settingsShadow).animate({
            width: 0,
            height: 0,
            marginTop: 0,
            marginRight: 0
        }, {
            duration: 500,
            easing: 'linear',
            progress: function (animation) {
                _this.editorOptions.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                _this.editorOptions.style.marginTop = -animation.tweens[2].now + 'px';
            },
            complete: function () {
                var zoom = window.app.settings.editor.zoom;
                var prevZoom = _this.unchangedEditorSettings.zoom;
                _this.unchangedEditorSettings.zoom = zoom;
                if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
                    _this.reloadEditor();
                }
                if (zoom !== prevZoom) {
                    window.app.updateEditorZoom();
                }
                if (_this.fullscreen) {
                    var settingsCont = $('.stylesheet-edit-codeMirror #settingsContainer')[0];
                    settingsCont.style.height = '376px';
                    settingsCont.style.overflowX = 'hidden';
                    var bubbleCont = $('.stylesheet-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'absolute';
                    bubbleCont.style.zIndex = 'auto';
                }
            }
        });
    };
    ;
    STE.reloadEditor = function (disable) {
        if (disable === void 0) { disable = false; }
        if (this.editor) {
            $(this.editor.display.wrapper).remove();
            this.$.editorPlaceholder.style.display = 'flex';
            this.$.editorPlaceholder.style.opacity = '1';
            this.$.editorPlaceholder.style.position = 'absolute';
            var stylesheetLines = [];
            var lines = this.editor.doc.lineCount();
            for (var i = 0; i < lines; i++) {
                stylesheetLines.push(this.editor.doc.getLine(i));
            }
            if (this.editorMode === 'main') {
                this.newSettings.value.stylesheet = stylesheetLines.join('\n');
            }
            else {
                try {
                    this.newSettings.value.options = JSON.parse(this.editor.doc.getValue());
                }
                catch (e) {
                    this.newSettings.value.options = this.editor.doc.getValue();
                }
            }
        }
        this.editor = null;
        var value = this.editorMode === 'main' ?
            this.newSettings.value.stylesheet : JSON.stringify(this.newSettings.value.options);
        if (this.fullscreen) {
            this.loadEditor(window.doc.fullscreenEditorHorizontal, value, disable);
        }
        else {
            this.loadEditor(this.$.editorCont, value, disable);
        }
    };
    ;
    STE.fillEditorOptions = function (container) {
        var clone = document.querySelector('#editorOptionsTemplate').content;
        if (window.app.settings.editor.theme === 'white') {
            clone.querySelector('#editorThemeSettingWhite').classList.add('currentTheme');
        }
        else {
            clone.querySelector('#editorThemeSettingWhite').classList.remove('currentTheme');
        }
        if (window.app.settings.editor.theme === 'dark') {
            clone.querySelector('#editorThemeSettingDark').classList.add('currentTheme');
        }
        else {
            clone.querySelector('#editorThemeSettingDark').classList.remove('currentTheme');
        }
        clone.querySelector('#editorTabSizeInput paper-input-container input')
            .setAttribute('value', window.app.settings.editor.tabSize + '');
        var cloneCheckbox = clone.querySelector('#editorTabsOrSpacesCheckbox');
        if (window.app.settings.editor.useTabs) {
            cloneCheckbox.setAttribute('checked', 'checked');
        }
        else {
            cloneCheckbox.removeAttribute('checked');
        }
        var cloneTemplate = document.importNode(clone, true);
        container.appendChild(cloneTemplate);
        var importedElement = container;
        importedElement.querySelector('#editorThemeSettingWhite').addEventListener('click', function () {
            var themes = importedElement.querySelectorAll('.editorThemeSetting');
            themes[0].classList.add('currentTheme');
            themes[1].classList.remove('currentTheme');
            window.app.settings.editor.theme = 'white';
            window.app.upload();
        });
        importedElement.querySelector('#editorThemeSettingDark').addEventListener('click', function () {
            var themes = importedElement.querySelectorAll('.editorThemeSetting');
            themes[0].classList.remove('currentTheme');
            themes[1].classList.add('currentTheme');
            window.app.settings.editor.theme = 'dark';
            window.app.upload();
        });
        var zoomEl = importedElement.querySelector('#editorThemeFontSizeInput');
        function updateZoomEl() {
            setTimeout(function () {
                window.app.settings.editor.zoom = zoomEl.querySelector('input').value;
                window.app.upload();
            }, 0);
        }
        ;
        zoomEl.addEventListener('change', function () {
            updateZoomEl();
        });
        this._updateZoomEl = updateZoomEl;
        importedElement.querySelector('#editorTabsOrSpacesCheckbox').addEventListener('click', function () {
            window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
            window.app.upload();
        });
        function updateTabSizeEl() {
            setTimeout(function () {
                window.app.settings.editor.tabSize =
                    ~~importedElement.querySelector('#editorTabSizeInput paper-input-container input')
                        .value;
                window.app.upload();
            }, 0);
        }
        importedElement.querySelector('#editorTabSizeInput paper-input-container input')
            .addEventListener('change', function () {
            updateTabSizeEl();
        });
        this._updateTabSizeEl = updateTabSizeEl;
        importedElement.querySelector('#editorJSLintGlobals').remove();
        importedElement.querySelector('#keyBindingsText').remove();
    };
    ;
    STE.cmLoaded = function (editor) {
        var _this = this;
        this.editor = editor;
        editor.refresh();
        editor.display.wrapper.classList.remove('script-edit-codeMirror');
        editor.display.wrapper.classList.add('stylesheet-edit-codeMirror');
        editor.performLint();
        var lastChange = null;
        editor.on('changes', function (cm, changes) {
            lastChange = Date.now();
        });
        var interval = window.setInterval(function () {
            if (!_this.active) {
                window.clearInterval(interval);
            }
            else {
                if (lastChange && Date.now() - lastChange > 1000) {
                    editor.performLint();
                    lastChange = null;
                }
            }
        }, 2000);
        var keys = {};
        keys[window.app.settings.editor.keyBindings.autocomplete] = function (cm) {
            window.app.ternServer.complete(cm);
        };
        this.editor.setOption('extraKeys', keys);
        var cloneTemplate = document.importNode(document.querySelector('#scriptEditorTemplate').content, true);
        editor.display.sizer.insertBefore(cloneTemplate, editor.display.sizer.children[0]);
        var clone = editor.display.sizer;
        this.settingsShadow = clone.querySelector('#settingsShadow');
        this.editorOptions = clone.querySelector('#editorOptions');
        this.fillEditorOptions(this.editorOptions);
        this.fullscreenEl = clone.querySelector('#editorFullScreen');
        this.fullscreenEl.addEventListener('click', function () {
            _this.toggleFullScreen.apply(_this);
        });
        this.settingsEl = clone.querySelector('#editorSettings');
        this.settingsEl.addEventListener('click', function () {
            _this.toggleOptions.apply(_this);
        });
        if (editor.getOption('readOnly') === 'nocursor') {
            editor.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
        }
        var buttonShadow = editor.display.sizer.querySelector('#buttonShadow');
        if (this.fullscreen) {
            editor.display.wrapper.style.height = 'auto';
            this.$.editorPlaceholder.style.display = 'none';
            buttonShadow.style.right = '-1px';
            buttonShadow.style.position = 'absolute';
            this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
        }
        else {
            this.$.editorPlaceholder.style.height = this.editorHeight + 'px';
            this.$.editorPlaceholder.style.width = this.editorWidth + 'px';
            this.$.editorPlaceholder.style.position = 'absolute';
            if (this.editorPlaceHolderAnimation) {
                this.editorPlaceHolderAnimation.play();
            }
            else {
                this.editorPlaceHolderAnimation = this.$.editorPlaceholder.animate([
                    {
                        opacity: 1
                    }, {
                        opacity: 0
                    }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                });
                this.editorPlaceHolderAnimation.onfinish = function () {
                    this.effect.target.style.display = 'none';
                };
            }
        }
    };
    ;
    STE.loadEditor = function (container, content, disable) {
        if (content === void 0) { content = this.item.value.stylesheet; }
        if (disable === void 0) { disable = false; }
        var placeHolder = $(this.$.editorPlaceholder);
        this.editorHeight = placeHolder.height();
        this.editorWidth = placeHolder.width();
        !window.app.settings.editor && (window.app.settings.editor = {
            useTabs: true,
            theme: 'dark',
            zoom: '100',
            tabSize: 4,
            keyBindings: {
                autocomplete: window.scriptEdit.keyBindings[0].defaultKey,
                showType: window.scriptEdit.keyBindings[0].defaultKey,
                showDocs: window.scriptEdit.keyBindings[1].defaultKey,
                goToDef: window.scriptEdit.keyBindings[2].defaultKey,
                jumpBack: window.scriptEdit.keyBindings[3].defaultKey,
                rename: window.scriptEdit.keyBindings[4].defaultKey,
                selectName: window.scriptEdit.keyBindings[5].defaultKey,
            }
        });
        this.editor = window.CodeMirror(container, {
            lineNumbers: true,
            mode: 'css',
            value: content || this.item.value.stylesheet,
            scrollbarStyle: 'simple',
            lineWrapping: true,
            foldGutter: true,
            readOnly: (disable ? 'nocursor' : false),
            theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
            indentUnit: window.app.settings.editor.tabSize,
            indentWithTabs: window.app.settings.editor.useTabs,
            messageStylesheetEdit: true,
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
            lint: window.CodeMirror.lint.optionsJSON
        });
    };
    ;
    STE.init = function () {
        var _this = this;
        this._init();
        this.$.dropdownMenu.init();
        this.$.exportMenu.init();
        this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
        this.initDropdown();
        document.body.classList.remove('editingScript');
        document.body.classList.add('editingStylesheet');
        window.stylesheetEdit = this;
        this.$.editorPlaceholder.style.display = 'flex';
        this.$.editorPlaceholder.style.opacity = '1';
        if (this.editor) {
            this.editor.display.wrapper.remove();
            this.editor = null;
        }
        window.app.ternServer = window.app.ternServer || new window.CodeMirror.TernServer({
            defs: [window.ecma5, window.ecma6, window.browserDefs, window.crmAPIDefs]
        });
        window.externalEditor.init();
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: {
                    val: this.item.value.stylesheet,
                    id: this.item.id,
                    crmType: window.app.crmType
                }
            });
            this.savingInterval = window.setInterval(function () {
                if (_this.active && _this.editor) {
                    var val = void 0;
                    try {
                        val = _this.editor.getValue();
                        chrome.storage.local.set({
                            editing: {
                                val: val,
                                id: _this.item.id,
                                crmType: window.app.crmType
                            }
                        });
                    }
                    catch (e) { }
                }
                else {
                    chrome.storage.local.set({
                        editing: false
                    });
                    window.clearInterval(_this.savingInterval);
                }
            }, 5000);
        }
        this.active = true;
        setTimeout(function () {
            _this.loadEditor(_this.$.editorCont);
        }, 750);
    };
    STE.changeTabEvent = function (e) {
        var element = window.app.util.findElementWithClassName(e.path, 'editorTab');
        var isMain = element.classList.contains('mainEditorTab');
        if (isMain && this.editorMode !== 'main') {
            element.classList.remove('optionsEditorTab');
            try {
                this.newSettings.value.options = JSON.parse(this.editor.getValue());
            }
            catch (e) {
                this.newSettings.value.options = this.editor.getValue();
            }
            this.hideCodeOptions();
            this.editorMode = 'main';
        }
        else if (!isMain && this.editorMode === 'main') {
            element.classList.add('optionsEditorTab');
            this.newSettings.value.stylesheet = this.editor.getValue();
            this.showCodeOptions();
            this.editorMode = 'options';
        }
        Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(function (tab) {
            tab.classList.remove('active');
        });
        element.classList.add('active');
    };
    return STE;
}());
STE.is = 'stylesheet-edit';
STE.behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];
STE.properties = stylesheetEditProperties;
;
Polymer(STE);
