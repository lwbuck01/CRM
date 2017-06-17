"use strict";
var scriptEditProperties = {
    item: {
        type: Object,
        value: {},
        notify: true
    }
};
var SCE = (function () {
    function SCE() {
    }
    SCE.openDocs = function () {
        window.open(chrome.runtime.getURL('/html/crmAPIDocs.html'), '_blank');
    };
    SCE.clearTriggerAndNotifyMetaTags = function (e) {
        if (this.querySelectorAll('.executionTrigger').length === 1) {
            window.doc.messageToast.text = 'You need to have at least one trigger';
            window.doc.messageToast.show();
            return;
        }
        this.clearTrigger(e);
    };
    ;
    SCE.triggerCheckboxChange = function (element) {
        var oldValue = !element.checked;
        var inputValue = $(element).parent().children('.triggerInput')[0].value;
        var line = this.editor.removeMetaTags(this.editor, oldValue ? 'exclude' : 'match', inputValue);
        this.editor.addMetaTags(this.editor, oldValue ? 'match' : 'exclude', inputValue, line);
    };
    ;
    SCE.addTriggerAndAddListeners = function () {
        this.addTrigger();
    };
    ;
    SCE.contentCheckboxChanged = function (e) {
        var element = window.app.util.findElementWithTagname(e.path, 'paper-checkbox');
        var elements = $('script-edit .showOnContentItemCheckbox');
        var elementType = element.classList[1].split('Type')[0];
        var state = !element.checked;
        var states = [];
        var oldStates = [];
        var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
        for (var i = 0; i < elements.length; i++) {
            var checkbox = elements[i];
            if (types[i] === elementType) {
                states[i] = state;
                oldStates[i] = !state;
            }
            else {
                states[i] = checkbox.checked;
                oldStates[i] = checkbox.checked;
            }
        }
    };
    ;
    SCE.addDialogToMetaTagUpdateListeners = function () {
        var _this = this;
        var __this = this;
        $(this.$.nameInput).on('keydown', function () {
            var el = _this.$.nameInput;
            var oldVal = el.value || '';
            Array.isArray(oldVal) && (oldVal = oldVal[0]);
        });
        $('.executionTriggerNot').on('change', function () {
            __this.triggerCheckboxChange.apply(__this, [this]);
        });
    };
    ;
    SCE.disableButtons = function () {
        this.$.dropdownMenu.disable();
    };
    ;
    SCE.enableButtons = function () {
        this.$.dropdownMenu.enable();
    };
    ;
    SCE.changeTab = function (mode) {
        if (mode !== this.editorMode) {
            if (mode === 'main') {
                if (this.editorMode === 'background') {
                    this.newSettings.value.backgroundScript = this.editor.getValue();
                }
                this.editorMode = 'main';
                this.enableButtons();
                this.editor.setValue(this.newSettings.value.script);
            }
            else if (mode === 'background') {
                if (this.editorMode === 'main') {
                    this.newSettings.value.script = this.editor.getValue();
                }
                this.editorMode = 'background';
                this.disableButtons();
                this.editor.setValue(this.newSettings.value.backgroundScript || '');
            }
            var element = document.querySelector(mode === 'main' ? '.mainEditorTab' : '.backgroundEditorTab');
            Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(function (tab) {
                tab.classList.remove('active');
            });
            element.classList.add('active');
        }
    };
    ;
    SCE.switchBetweenScripts = function (element) {
        element.classList.remove('optionsEditorTab');
        if (this.editorMode === 'options') {
            try {
                this.newSettings.value.options = JSON.parse(this.editor.getValue());
            }
            catch (e) {
                this.newSettings.value.options = this.editor.getValue();
            }
        }
        this.hideCodeOptions();
        this.initTernKeyBindings();
    };
    SCE.changeTabEvent = function (e) {
        var element = window.app.util.findElementWithClassName(e.path, 'editorTab');
        var isMain = element.classList.contains('mainEditorTab');
        var isBackground = element.classList.contains('backgroundEditorTab');
        if (isMain && this.editorMode !== 'main') {
            this.switchBetweenScripts(element);
            this.changeTab('main');
        }
        else if (!isMain && isBackground && this.editorMode !== 'background') {
            this.switchBetweenScripts(element);
            this.changeTab('background');
        }
        else if (!isBackground && this.editorMode !== 'options') {
            element.classList.add('optionsEditorTab');
            if (this.editorMode === 'main') {
                this.newSettings.value.script = this.editor.getValue();
            }
            else if (this.editorMode === 'background') {
                this.newSettings.value.backgroundScript = this.editor.getValue();
            }
            this.showCodeOptions();
            this.editorMode = 'options';
        }
        Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(function (tab) {
            tab.classList.remove('active');
        });
        element.classList.add('active');
    };
    ;
    SCE.getExportData = function () {
        $('script-edit #exportMenu paper-menu')[0].selected = 0;
        var settings = {};
        this.save(null, settings);
        return settings;
    };
    ;
    SCE.exportScriptAsCRM = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
    };
    ;
    SCE.exportScriptAsUserscript = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
    };
    ;
    SCE.cancelChanges = function () {
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
    SCE.getMetaTagValues = function () {
        return this.editor.metaTags.metaTags;
    };
    ;
    SCE.saveChanges = function (resultStorage) {
        resultStorage.value.metaTags = this.getMetaTagValues();
        this.finishEditing();
        window.externalEditor.cancelOpenFiles();
        this.changeTab('main');
        this.active = false;
    };
    ;
    SCE.onPermissionsDialogOpen = function (extensionWideEnabledPermissions, settingsStorage) {
        var el, svg;
        $('.requestPermissionsShowBot').off('click').on('click', function () {
            el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
            svg = $(this).find('.requestPermissionsSvg')[0];
            svg.style.transform = (svg.style.transform === 'rotate(90deg)' || svg.style.transform === '' ? 'rotate(270deg)' : 'rotate(90deg)');
            if (el.animation) {
                el.animation.reverse();
            }
            else {
                el.animation = el.animate([
                    {
                        height: 0
                    }, {
                        height: el.scrollHeight + 'px'
                    }
                ], {
                    duration: 250,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                    fill: 'both'
                });
            }
        });
        var permission;
        $('.requestPermissionButton').off('click').on('click', function () {
            permission = this.previousElementSibling.previousElementSibling.textContent;
            var slider = this;
            var oldPermissions;
            if (this.checked) {
                if (Array.prototype.slice.apply(extensionWideEnabledPermissions).indexOf(permission) === -1) {
                    chrome.permissions.request({
                        permissions: [permission]
                    }, function (accepted) {
                        if (!accepted) {
                            slider.checked = false;
                        }
                        else {
                            chrome.storage.local.get(function (e) {
                                var permissionsToRequest = e.requestPermissions;
                                permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                chrome.storage.local.set({
                                    requestPermissions: permissionsToRequest
                                });
                            });
                            settingsStorage.permissions = settingsStorage.permissions || [];
                            oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                            settingsStorage.permissions.push(permission);
                        }
                    });
                }
                else {
                    settingsStorage.permissions = settingsStorage.permissions || [];
                    oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                    settingsStorage.permissions.push(permission);
                }
            }
            else {
                oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
            }
        });
    };
    SCE.openPermissionsDialog = function (item, callback) {
        var _this = this;
        var nodeItem;
        var settingsStorage;
        if (!item || item.type === 'tap') {
            nodeItem = this.item;
            settingsStorage = this.newSettings;
        }
        else {
            nodeItem = item;
            settingsStorage = item;
        }
        chrome.permissions.getAll(function (extensionWideEnabledPermissions) {
            if (!nodeItem.permissions) {
                nodeItem.permissions = [];
            }
            var scriptPermissions = nodeItem.permissions;
            var permissions = window.app.templates.getScriptPermissions();
            extensionWideEnabledPermissions = extensionWideEnabledPermissions.permissions;
            var askedPermissions = (nodeItem.nodeInfo &&
                nodeItem.nodeInfo.permissions) || [];
            var requiredActive = [];
            var requiredInactive = [];
            var nonRequiredActive = [];
            var nonRequiredNonActive = [];
            var isAsked;
            var isActive;
            var permissionObj;
            permissions.forEach(function (permission) {
                isAsked = askedPermissions.indexOf(permission) > -1;
                isActive = scriptPermissions.indexOf(permission) > -1;
                permissionObj = {
                    name: permission,
                    toggled: isActive,
                    required: isAsked,
                    description: window.app.templates.getPermissionDescription(permission)
                };
                if (isAsked && isActive) {
                    requiredActive.push(permissionObj);
                }
                else if (isAsked && !isActive) {
                    requiredInactive.push(permissionObj);
                }
                else if (!isAsked && isActive) {
                    nonRequiredActive.push(permissionObj);
                }
                else {
                    nonRequiredNonActive.push(permissionObj);
                }
            });
            var permissionList = nonRequiredActive;
            permissionList.push.apply(permissionList, requiredActive);
            permissionList.push.apply(permissionList, requiredInactive);
            permissionList.push.apply(permissionList, nonRequiredNonActive);
            $('#scriptPermissionsTemplate')[0].items = permissionList;
            $('.requestPermissionsScriptName')[0].innerHTML = 'Managing permisions for script "' + nodeItem.name;
            var scriptPermissionDialog = $('#scriptPermissionDialog')[0];
            scriptPermissionDialog.addEventListener('iron-overlay-opened', function () {
                _this.onPermissionsDialogOpen(extensionWideEnabledPermissions, settingsStorage);
            });
            scriptPermissionDialog.addEventListener('iron-overlay-closed', callback);
            scriptPermissionDialog.open();
        });
    };
    ;
    SCE.initToolsRibbon = function () {
        var _this = this;
        window.app.$.paperLibrariesSelector.init();
        window.app.$.paperGetPageProperties.init(function (snippet) {
            _this.insertSnippet(_this, snippet);
        });
    };
    ;
    SCE.popInRibbons = function () {
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
        this.initToolsRibbon();
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
    SCE.popOutRibbons = function () {
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
    SCE.enterFullScreen = function () {
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
        window.paperLibrariesSelector.updateLibraries((this.editorMode === 'main' ?
            this.newSettings.value.libraries : this.newSettings.value.backgroundLibraries || [])), this.editorMode;
        this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
        var $editorWrapper = $(this.editor.display.wrapper);
        var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
        buttonShadow.style.position = 'absolute';
        buttonShadow.style.right = '-1px';
        this.editor.display.wrapper.classList.add('fullscreen');
        this.editor.display.wrapper.classList.remove('small');
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
                _this.popInRibbons();
            }
        });
    };
    ;
    SCE.exitFullScreen = function () {
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
            _this.editor.display.wrapper.classList.add('small');
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
    SCE.showOptions = function () {
        var _this = this;
        this.optionsShown = true;
        this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
        var editorWidth = $('.script-edit-codeMirror').width();
        var editorHeight = $('.script-edit-codeMirror').height();
        var circleRadius;
        if (this.fullscreen) {
            circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
        }
        else {
            circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
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
                    var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
                    settingsCont.style.overflow = 'scroll';
                    settingsCont.style.overflowX = 'hidden';
                    settingsCont.style.height = 'calc(100vh - 66px)';
                    var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'fixed';
                    bubbleCont.style.zIndex = '50';
                }
            }
        });
    };
    ;
    SCE.hideOptions = function () {
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
                    var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
                    settingsCont.style.height = '345px';
                    settingsCont.style.overflowX = 'hidden';
                    var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'absolute';
                    bubbleCont.style.zIndex = 'auto';
                }
            }
        });
    };
    ;
    SCE.reloadEditor = function (disable) {
        if (disable === void 0) { disable = false; }
        if (this.editor) {
            $(this.editor.display.wrapper).remove();
            this.$.editorPlaceholder.style.display = 'flex';
            this.$.editorPlaceholder.style.opacity = '1';
            this.$.editorPlaceholder.style.position = 'absolute';
            if (this.editorMode === 'main') {
                this.newSettings.value.script = this.editor.doc.getValue();
            }
            else if (this.editorMode === 'background') {
                this.newSettings.value.backgroundScript = this.editor.doc.getValue();
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
        var value;
        if (this.editorMode === 'main') {
            value = this.newSettings.value.script;
        }
        else if (this.editorMode === 'background') {
            value = this.newSettings.value.backgroundScript;
        }
        else {
            if (typeof this.newSettings.value.options === 'string') {
                value = this.newSettings.value.options;
            }
            else {
                value = JSON.stringify(this.newSettings.value.options);
            }
        }
        if (this.fullscreen) {
            this.loadEditor(window.doc.fullscreenEditorHorizontal, value, disable);
        }
        else {
            this.loadEditor(this.$.editorCont, value, disable);
        }
    };
    ;
    SCE.createKeyBindingListener = function (element, binding) {
        var _this = this;
        return function (event) {
            event.preventDefault();
            if (event.keyCode < 16 || event.keyCode > 18) {
                if (event.altKey || event.shiftKey || event.ctrlKey) {
                    var values = [];
                    if (event.ctrlKey) {
                        values.push('Ctrl');
                    }
                    if (event.altKey) {
                        values.push('Alt');
                    }
                    if (event.shiftKey) {
                        values.push('Shift');
                    }
                    values.push(String.fromCharCode(event.keyCode));
                    var value = element.value = values.join('-');
                    element.lastValue = value;
                    window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
                        autocomplete: _this.keyBindings[0].defaultKey,
                        showType: _this.keyBindings[0].defaultKey,
                        showDocs: _this.keyBindings[1].defaultKey,
                        goToDef: _this.keyBindings[2].defaultKey,
                        jumpBack: _this.keyBindings[3].defaultKey,
                        rename: _this.keyBindings[4].defaultKey,
                        selectName: _this.keyBindings[5].defaultKey,
                    };
                    var prevValue = window.app.settings.editor.keyBindings[binding.storageKey];
                    if (prevValue) {
                        var prevKeyMap = {};
                        prevKeyMap[prevValue] = binding.fn;
                        window.scriptEdit.editor.removeKeyMap(prevKeyMap);
                    }
                    var keyMap = {};
                    keyMap[value] = binding.fn;
                    window.scriptEdit.editor.addKeyMap(keyMap);
                    window.app.settings.editor.keyBindings[binding.storageKey] = value;
                }
            }
            element.value = element.lastValue || '';
            return;
        };
    };
    ;
    SCE.fillEditorOptions = function (container) {
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
        importedElement.querySelector('#editorJSLintGlobalsInput')
            .addEventListener('keypress', function () {
            var _this = this;
            setTimeout(function () {
                var val = _this.value;
                var globals = val.split(',');
                chrome.storage.local.set({
                    jsLintGlobals: globals
                });
                window.app.jsLintGlobals = globals;
            }, 0);
        });
        window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
            autocomplete: this.keyBindings[0].defaultKey,
            showType: this.keyBindings[0].defaultKey,
            showDocs: this.keyBindings[1].defaultKey,
            goToDef: this.keyBindings[2].defaultKey,
            jumpBack: this.keyBindings[3].defaultKey,
            rename: this.keyBindings[4].defaultKey,
            selectName: this.keyBindings[5].defaultKey,
        };
        var settingsContainer = importedElement.querySelector('#settingsContainer');
        for (var i = 0; i < this.keyBindings.length; i++) {
            var keyBindingClone = document.querySelector('#keyBindingTemplate').content;
            var input = keyBindingClone.querySelector('paper-input');
            var value = window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey] ||
                this.keyBindings[i].defaultKey;
            input.setAttribute('label', this.keyBindings[i].name);
            input.setAttribute('value', value);
            var keyBindingCloneTemplate = document.importNode(keyBindingClone, true);
            settingsContainer.insertBefore(keyBindingCloneTemplate, settingsContainer.querySelector('#afterEditorSettingsSpacing'));
            settingsContainer.querySelector('paper-input')
                .addEventListener('keydown', this.createKeyBindingListener(input, this.keyBindings[i]));
        }
    };
    ;
    SCE.initTernKeyBindings = function () {
        var keySettings = {};
        for (var i = 0; i < this.keyBindings.length; i++) {
            keySettings[window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey]] = this.keyBindings[i].fn;
        }
        this.editor.setOption('extraKeys', keySettings);
        this.editor.on('cursorActivity', function (cm) {
            window.app.ternServer.updateArgHints(cm);
        });
    };
    ;
    SCE._posToIndex = function (pos, lines) {
        var chars = 0;
        for (var i = 0; i < lines.length; i++) {
            if (i < pos.line) {
                chars += lines[i].length;
            }
            else {
                chars += pos.ch;
                return chars;
            }
            chars++;
        }
        return chars;
    };
    SCE._indexToPos = function (index, lines) {
        var chars = 0;
        for (var i = 0; i < lines.length; i++) {
            chars += lines[i].length;
            if (chars >= index) {
                return {
                    line: i,
                    ch: index - (chars - lines[i].length)
                };
            }
            chars++;
        }
        return {
            line: 0,
            ch: index
        };
    };
    SCE._posInRange = function (val, lower, upper) {
        var lowerIndex = this._posToIndex(lower, val.lines);
        var upperIndex = this._posToIndex(upper, val.lines);
        return (val.end >= lowerIndex && val.end <= upperIndex) ||
            (val.start >= lowerIndex && val.start <= upperIndex) ||
            (val.start <= lowerIndex && val.end >= upperIndex);
    };
    SCE.findChromeBaseExpression = function (from, to) {
        var _this = this;
        var code = this.editor.getValue();
        var file = {
            name: '[doc]',
            text: code,
            type: 'full'
        };
        var lines = code.split('\n');
        var lastLine = lines.pop();
        window.app.ternServer.server.request({
            query: {
                docs: true,
                end: window.CodeMirror.Pos(lines.length - 1, lastLine.length - 1),
                file: '[doc]',
                lineCharPositions: true,
                type: 'type',
                types: true,
                urls: true
            },
            files: [file]
        }, function (e) {
            _this.markers.forEach(function (marker) { return marker.clear(); });
            var passedStart = false;
            var file = window.app.ternServer.server.files[0];
            var persistentData = {
                lineSeperators: window.app.legacyScriptReplace.localStorageReplace.getLineSeperators(lines),
                script: file.text,
                lines: lines
            };
            for (var i = 0; i < file.ast.body.length; i++) {
                var inRange = _this._posInRange({
                    lines: lines,
                    start: file.ast.body[i].start,
                    end: file.ast.body[i].end
                }, from, to);
                if (!passedStart && inRange) {
                    passedStart = true;
                }
                else if (passedStart && !inRange) {
                    return;
                }
                if (inRange) {
                    window.app.legacyScriptReplace.localStorageReplace.findExpression(file.ast.body[i], persistentData, 'chrome', function (data, expression) {
                        if (data.isObj || data.siblingExpr.type === 'Identifier' &&
                            data.siblingExpr.name === 'window') {
                            _this.markers.push(_this.editor.doc.markText(_this._indexToPos(expression.start, lines), _this._indexToPos(expression.end, lines), {
                                className: 'chromeCallsDeprecated',
                                inclusiveLeft: false,
                                inclusiveRight: false,
                                atomic: false,
                                clearOnEnter: false,
                                clearWhenEmpty: true,
                                readOnly: false,
                                title: 'Direct chrome calls are deprecated, please use the CRM API for chrome calls (documentation can be' +
                                    ' found at the "docs" button)'
                            }));
                        }
                    });
                }
            }
        });
    };
    SCE.cmLoaded = function (editor) {
        var _this = this;
        this.editor = editor;
        editor.refresh();
        editor.on('metaTagChanged', function (changes, metaTags) {
            if (_this.editorMode === 'main') {
                _this.newSettings.value.metaTags = JSON.parse(JSON.stringify(metaTags));
            }
        });
        this.$.mainEditorTab.classList.add('active');
        this.$.backgroundEditorTab.classList.remove('active');
        editor.on('metaDisplayStatusChanged', function (info) {
            _this.newSettings.value.metaTagsHidden = (info.status === 'hidden');
        });
        editor.performLint();
        var newChanges = [];
        editor.on('changes', function (cm, changes) {
            newChanges = newChanges.concat(changes.map(function (change) {
                return {
                    from: change.from,
                    to: change.to,
                    removed: change.removed,
                    text: change.text,
                    origin: change.origin,
                    time: Date.now()
                };
            }));
        });
        var interval = window.setInterval(function () {
            if (!_this.active) {
                window.clearInterval(interval);
            }
            else {
                if (newChanges.length > 0 && Date.now() - newChanges.slice(-1)[0].time > 1000) {
                    editor.performLint();
                    newChanges.forEach(function (change) {
                        _this.findChromeBaseExpression(change.from, change.to);
                    });
                    newChanges = [];
                }
            }
        }, 1000);
        if (this.newSettings.value.metaTagsHidden) {
            editor.doc.markText({
                line: editor.metaTags.metaStart.line,
                ch: editor.metaTags.metaStart.ch - 2
            }, {
                line: editor.metaTags.metaStart.line,
                ch: editor.metaTags.metaStart.ch + 27
            }, {
                className: 'metaTagHiddenText',
                inclusiveLeft: false,
                inclusiveRight: false,
                atomic: true,
                readOnly: true,
                addToHistory: true
            });
            editor.metaTags.metaTags = this.newSettings.value.metaTags;
        }
        editor.display.wrapper.classList.remove('stylesheet-edit-codeMirror');
        editor.display.wrapper.classList.add('script-edit-codeMirror');
        editor.display.wrapper.classList.add('small');
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
        this.initTernKeyBindings();
    };
    ;
    SCE.loadEditor = function (container, content, disable) {
        if (content === void 0) { content = this.item.value.script; }
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
                autocomplete: this.keyBindings[0].defaultKey,
                showType: this.keyBindings[0].defaultKey,
                showDocs: this.keyBindings[1].defaultKey,
                goToDef: this.keyBindings[2].defaultKey,
                jumpBack: this.keyBindings[3].defaultKey,
                rename: this.keyBindings[4].defaultKey,
                selectName: this.keyBindings[5].defaultKey,
            }
        });
        this.editor = window.CodeMirror(container, {
            lineNumbers: true,
            value: content,
            scrollbarStyle: 'simple',
            lineWrapping: true,
            mode: 'javascript',
            foldGutter: true,
            readOnly: (disable ? 'nocursor' : false),
            theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
            indentUnit: window.app.settings.editor.tabSize,
            indentWithTabs: window.app.settings.editor.useTabs,
            messageScriptEdit: true,
            gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
            lint: window.CodeMirror.lint.optionsJSON,
            undoDepth: 500
        });
    };
    ;
    SCE.init = function () {
        var _this = this;
        this._init();
        this.$.dropdownMenu.init();
        this.$.exportMenu.init();
        this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
        this.initDropdown();
        this.selectorStateChange(0, this.newSettings.value.launchMode);
        this.addDialogToMetaTagUpdateListeners();
        window.app.ternServer = window.app.ternServer || new window.CodeMirror.TernServer({
            defs: [window.ecma5, window.ecma6, window.browserDefs, window.crmAPIDefs]
        });
        document.body.classList.remove('editingStylesheet');
        document.body.classList.add('editingScript');
        window.scriptEdit = this;
        this.$.editorPlaceholder.style.display = 'flex';
        this.$.editorPlaceholder.style.opacity = '1';
        window.externalEditor.init();
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: {
                    val: this.item.value.script,
                    id: this.item.id,
                    mode: _this.editorMode,
                    crmType: window.app.crmType
                }
            });
            this.savingInterval = window.setInterval(function () {
                if (_this.active && _this.editor) {
                    var val = _this.editor.getValue();
                    chrome.storage.local.set({
                        editing: {
                            val: val,
                            id: _this.item.id,
                            mode: _this.editorMode,
                            crmType: window.app.crmType
                        }
                    }, function () { chrome.runtime.lastError; });
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
    return SCE;
}());
SCE.is = 'script-edit';
SCE.behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];
SCE.properties = scriptEditProperties;
SCE.markers = [];
SCE.keyBindings = [
    {
        name: 'AutoComplete',
        defaultKey: 'Ctrl-Space',
        storageKey: 'autocomplete',
        fn: function (cm) {
            window.app.ternServer.complete(cm);
        }
    }, {
        name: 'Show Type',
        defaultKey: 'Ctrl-I',
        storageKey: 'showType',
        fn: function (cm) {
            window.app.ternServer.showType(cm);
        }
    }, {
        name: 'Show Docs',
        defaultKey: 'Ctrl-O',
        storageKey: 'showDocs',
        fn: function (cm) {
            window.app.ternServer.showDocs(cm);
        }
    }, {
        name: 'Go To Definition',
        defaultKey: 'Alt-.',
        storageKey: 'goToDef',
        fn: function (cm) {
            window.app.ternServer.jumpToDef(cm);
        }
    }, {
        name: 'Jump Back',
        defaultKey: 'Alt-,',
        storageKey: 'jumpBack',
        fn: function (cm) {
            window.app.ternServer.jumpBack(cm);
        }
    }, {
        name: 'Rename',
        defaultKey: 'Ctrl-Q',
        storageKey: 'rename',
        fn: function (cm) {
            window.app.ternServer.rename(cm);
        }
    }, {
        name: 'Select Name',
        defaultKey: 'Ctrl-.',
        storageKey: 'selectName',
        fn: function (cm) {
            window.app.ternServer.selectName(cm);
        }
    }
];
Polymer(SCE);
