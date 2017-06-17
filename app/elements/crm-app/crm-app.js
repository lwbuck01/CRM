"use strict";
window.runOrAddAsCallback = function (toRun, thisElement, params) {
    if (window.app.settings) {
        toRun.apply(thisElement, params);
    }
    else {
        window.app.addSettingsReadyCallback(toRun, thisElement, params);
    }
};
if (!document.createElement('div').animate) {
    HTMLElement.prototype.animate = function (properties, options) {
        if (!properties[1]) {
            return {
                play: function () { },
                reverse: function () { },
                effect: {
                    target: this
                }
            };
        }
        var element = this;
        var direction = 'forwards';
        var returnVal = {
            play: function () {
                $(element).animate(properties[~~(direction === 'forwards')], (options && options.duration) || 500, function () {
                    if (returnVal.onfinish) {
                        returnVal.onfinish.apply({
                            effect: {
                                target: element
                            }
                        });
                    }
                });
            },
            reverse: function () {
                direction = 'backwards';
                this.play();
            },
            effect: {
                target: this
            }
        };
        $(this).animate(properties[1], options.duration, function () {
            if (returnVal.onfinish) {
                returnVal.onfinish.apply({
                    effect: {
                        target: element
                    }
                });
            }
        });
        return returnVal;
    };
    HTMLElement.prototype.animate.isJqueryFill = true;
}
var properties = {
    settings: {
        type: Object,
        notify: true
    },
    onSettingsReadyCallbacks: {
        type: Array,
        value: []
    },
    crmType: Number,
    settingsJsonLength: {
        type: Number,
        notify: true,
        value: 0
    },
    globalExcludes: {
        type: Array,
        notify: true,
        value: []
    },
    versionUpdateTab: {
        type: Number,
        notify: true,
        value: 0,
        observer: 'versionUpdateChanged'
    }
};
var CA = (function () {
    function CA() {
    }
    CA.domListener = function (event) {
        var propKey = "data-on-" + event.type;
        var listeners = this.listeners;
        var fnName;
        var pathIndex = 0;
        var currentElement = event.path[pathIndex];
        while (!(fnName = currentElement.getAttribute(propKey)) && pathIndex < event.path.length) {
            pathIndex++;
            currentElement = event.path[pathIndex];
        }
        if (fnName) {
            if (fnName !== 'prototype' && fnName !== 'parent' && listeners[fnName]) {
                var listener_1 = this.listeners[fnName];
                listener_1.bind(listeners)(event, event.detail);
            }
            else {
                this._warn(this._logf("_createEventHandler", "listener method " + fnName + " not defined"));
            }
        }
        else {
            this._warn(this._logf("_createEventHandler", "property " + propKey + " not defined"));
        }
    };
    CA._getPageTitle = function () {
        return location.href.indexOf('demo') > -1 ?
            'Demo, actual right-click menu does NOT work in demo' :
            'Custom Right-Click Menu';
    };
    CA._getString = function (str) {
        return str || '';
    };
    CA._isOfType = function (option, type) {
        return option.type === type;
    };
    CA._generateCodeOptionsArray = function (settings) {
        if (typeof settings === 'string') {
            return [];
        }
        return Object.getOwnPropertyNames(settings).map(function (key) {
            return {
                key: key,
                value: JSON.parse(JSON.stringify(settings[key]))
            };
        });
    };
    CA._isOnlyGlobalExclude = function () {
        return this.globalExcludes.length === 1;
    };
    ;
    CA._isVersionUpdateTabX = function (currentTab, desiredTab) {
        return currentTab === desiredTab;
    };
    ;
    CA._getUpdatedScriptString = function (updatedScript) {
        if (!updatedScript) {
            return 'Please ignore';
        }
        return [
            'Node ',
            updatedScript.name,
            ' was updated from version ',
            updatedScript.oldVersion,
            ' to version ',
            updatedScript.newVersion
        ].join('');
    };
    ;
    CA._getPermissionDescription = function () {
        return this.templates.getPermissionDescription;
    };
    ;
    CA._getNodeName = function (nodeId) {
        return window.app.nodesById[nodeId].name;
    };
    ;
    CA._getNodeVersion = function (nodeId) {
        return (window.app.nodesById[nodeId].nodeInfo && window.app.nodesById[nodeId].nodeInfo.version) ||
            '1.0';
    };
    ;
    CA._placeCommas = function (number) {
        var split = this.reverseString(number.toString()).match(/[0-9]{1,3}/g);
        return this.reverseString(split.join(','));
    };
    ;
    CA._getSettingsJsonLengthColor = function () {
        var red;
        var green;
        if (this.settingsJsonLength <= 51200) {
            green = 255;
            red = (this.settingsJsonLength / 51200) * 255;
        }
        else {
            red = 255;
            green = 255 - (((this.settingsJsonLength - 51200) / 51200) * 255);
        }
        red = Math.floor(red * 0.7);
        green = Math.floor(green * 0.7);
        return 'color: rgb(' + red + ', ' + green + ', 0);';
    };
    ;
    CA.findScriptsInSubtree = function (toFind, container) {
        if (toFind.type === 'script') {
            container.push(toFind);
        }
        else if (toFind.children) {
            for (var i = 0; i < toFind.children.length; i++) {
                this.findScriptsInSubtree(toFind.children[i], container);
            }
        }
    };
    ;
    CA.runDialogsForImportedScripts = function (nodesToAdd, dialogs) {
        var _this = this;
        if (dialogs[0]) {
            var script = dialogs.splice(0, 1)[0];
            window.scriptEdit.openPermissionsDialog(script, function () {
                _this.runDialogsForImportedScripts(nodesToAdd, dialogs);
            });
        }
        else {
            this.addImportedNodes(nodesToAdd);
        }
    };
    ;
    CA.addImportedNodes = function (nodesToAdd) {
        var _this = this;
        if (!nodesToAdd[0]) {
            return false;
        }
        var toAdd = nodesToAdd.splice(0, 1)[0];
        this.util.treeForEach(toAdd, function (node) {
            node.id = _this.generateItemId();
            node.nodeInfo.source = 'import';
        });
        this.crm.add(toAdd);
        var scripts = [];
        this.findScriptsInSubtree(toAdd, scripts);
        this.runDialogsForImportedScripts(nodesToAdd, scripts);
        return true;
    };
    ;
    CA.reverseString = function (string) {
        return string.split('').reverse().join('');
    };
    ;
    CA.requestPermissions = function (toRequest, force) {
        if (force === void 0) { force = false; }
        var i;
        var index;
        var _this = this;
        var allPermissions = this.templates.getPermissions();
        for (i = 0; i < toRequest.length; i++) {
            index = allPermissions.indexOf(toRequest[i]);
            if (index === -1) {
                toRequest.splice(index, 1);
                i--;
            }
            else {
                allPermissions.splice(index, 1);
            }
        }
        chrome.storage.local.set({
            requestPermissions: toRequest
        });
        if (toRequest.length > 0 || force) {
            chrome.permissions.getAll(function (allowed) {
                var requested = [];
                for (i = 0; i < toRequest.length; i++) {
                    requested.push({
                        name: toRequest[i],
                        description: _this.templates.getPermissionDescription(toRequest[i]),
                        toggled: false
                    });
                }
                var other = [];
                for (i = 0; i < allPermissions.length; i++) {
                    other.push({
                        name: allPermissions[i],
                        description: _this.templates.getPermissionDescription(allPermissions[i]),
                        toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
                    });
                }
                var requestPermissionsOther = $('#requestPermissionsOther')[0];
                var overlay;
                function handler() {
                    var el, svg;
                    overlay.style.maxHeight = 'initial!important';
                    overlay.style.top = 'initial!important';
                    overlay.removeEventListener('iron-overlay-opened', handler);
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
                    $('#requestPermissionsShowOther').off('click').on('click', function () {
                        var showHideSvg = this;
                        var otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
                        if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
                            $(otherPermissions).animate({
                                height: otherPermissions.scrollHeight + 'px'
                            }, 350, function () {
                                showHideSvg.children[0].style.display = 'none';
                                showHideSvg.children[1].style.display = 'block';
                            });
                        }
                        else {
                            $(otherPermissions).animate({
                                height: 0
                            }, 350, function () {
                                showHideSvg.children[0].style.display = 'block';
                                showHideSvg.children[1].style.display = 'none';
                            });
                        }
                    });
                    var permission;
                    $('.requestPermissionButton').off('click').on('click', function () {
                        permission = this.previousElementSibling.previousElementSibling.textContent;
                        var slider = this;
                        if (this.checked) {
                            try {
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
                                    }
                                });
                            }
                            catch (e) {
                                chrome.storage.local.get(function (e) {
                                    var permissionsToRequest = e.requestPermissions;
                                    permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                    chrome.storage.local.set({
                                        requestPermissions: permissionsToRequest
                                    });
                                });
                            }
                        }
                        else {
                            chrome.permissions.remove({
                                permissions: [permission]
                            }, function (removed) {
                                if (!removed) {
                                    slider.checked = true;
                                }
                            });
                        }
                    });
                    $('#requestPermissionsAcceptAll').off('click').on('click', function () {
                        chrome.permissions.request({
                            permissions: toRequest
                        }, function (accepted) {
                            if (accepted) {
                                chrome.storage.local.set({
                                    requestPermissions: []
                                });
                                $('.requestPermissionButton.required').each(function () {
                                    this.checked = true;
                                });
                            }
                        });
                    });
                }
                var interval = window.setInterval(function () {
                    try {
                        var centerer = window.doc.requestPermissionsCenterer;
                        overlay = centerer.$.content.children[0];
                        if (overlay.open) {
                            window.clearInterval(interval);
                            $('#requestedPermissionsTemplate')[0].items = requested;
                            $('#requestedPermissionsOtherTemplate')[0].items = other;
                            overlay.addEventListener('iron-overlay-opened', handler);
                            setTimeout(function () {
                                var requestedPermissionsCont = $('#requestedPermissionsCont')[0];
                                var requestedPermissionsAcceptAll = $('#requestPermissionsAcceptAll')[0];
                                var requestedPermissionsType = $('.requestPermissionsType')[0];
                                if (requested.length === 0) {
                                    requestedPermissionsCont.style.display = 'none';
                                    requestPermissionsOther.style.height = (31 * other.length) + 'px';
                                    requestedPermissionsAcceptAll.style.display = 'none';
                                    requestedPermissionsType.style.display = 'none';
                                }
                                else {
                                    requestedPermissionsCont.style.display = 'block';
                                    requestPermissionsOther.style.height = '0';
                                    requestedPermissionsAcceptAll.style.display = 'block';
                                    requestedPermissionsType.style.display = 'block';
                                }
                                overlay.open();
                            }, 0);
                        }
                    }
                    catch (e) {
                    }
                }, 100);
            });
        }
    };
    ;
    CA.transferCRMFromOld = function (openInNewTab, storageSource, method) {
        if (storageSource === void 0) { storageSource = localStorage; }
        if (method === void 0) { method = 2; }
        return this.transferFromOld.transferCRMFromOld(openInNewTab, storageSource, method);
    };
    ;
    CA.initCodeOptions = function (node) {
        var _this = this;
        this.$.codeSettingsDialog.item = node;
        this.$.codeSettingsTitle.innerText = "Changing the options for " + node.name;
        this.$.codeSettingsRepeat.items = this._generateCodeOptionsArray(node.value.options);
        this.$.codeSettingsNoItems.if = this.$.codeSettingsRepeat.items.length === 0;
        this.async(function () {
            _this.$.codeSettingsDialog.fit();
            Array.prototype.slice.apply(_this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
                .forEach(function (el) {
                el.init();
            });
            _this.$.codeSettingsDialog.open();
        }, 100);
    };
    CA.tryEditorLoaded = function (cm) {
        cm.display.wrapper.classList.add('try-editor-codemirror');
        cm.refresh();
    };
    ;
    CA.versionUpdateChanged = function () {
        if (this._isVersionUpdateTabX(this.versionUpdateTab, 1)) {
            var versionUpdateDialog = this.$.versionUpdateDialog;
            if (!versionUpdateDialog.editor) {
                versionUpdateDialog.editor = window.CodeMirror(this.$.tryOutEditor, {
                    lineNumbers: true,
                    value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    mode: 'javascript',
                    readOnly: false,
                    foldGutter: true,
                    theme: 'dark',
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs,
                    gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
                    lint: window.CodeMirror.lint.javascript,
                    messageTryEditor: true,
                    undoDepth: 500
                });
            }
        }
    };
    ;
    CA.generateItemId = function () {
        this.latestId = this.latestId || 0;
        this.latestId++;
        if (this.settings) {
            this.settings.latestId = this.latestId;
            window.app.upload();
        }
        return this.latestId;
    };
    ;
    CA.toggleShrinkTitleRibbon = function () {
        var viewportHeight = window.innerHeight;
        var $settingsCont = $('#settingsContainer');
        if (window.app.storageLocal.shrinkTitleRibbon) {
            $(window.doc.editorTitleRibbon).animate({
                fontSize: '100%'
            }, 250);
            $(window.doc.editorCurrentScriptTitle).animate({
                paddingTop: '4px',
                paddingBottom: '4px'
            }, 250);
            $settingsCont.animate({
                height: viewportHeight - 50
            }, 250, function () {
                $settingsCont[0].style.height = 'calc(100vh - 66px)';
            });
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
        }
        else {
            $(window.doc.editorTitleRibbon).animate({
                fontSize: '40%'
            }, 250);
            $(window.doc.editorCurrentScriptTitle).animate({
                paddingTop: 0,
                paddingBottom: 0
            }, 250);
            $settingsCont.animate({
                height: viewportHeight - 18
            }, 250, function () {
                $settingsCont[0].style.height = 'calc(100vh - 29px)';
            });
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
        }
        window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
        chrome.storage.local.set({
            shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
        });
    };
    ;
    CA.addSettingsReadyCallback = function (callback, thisElement, params) {
        this.onSettingsReadyCallbacks.push({
            callback: callback,
            thisElement: thisElement,
            params: params
        });
    };
    ;
    CA.upload = function (force) {
        if (force === void 0) { force = false; }
        this.uploading.upload(force);
    };
    CA.updateEditorZoom = function () {
        var prevStyle = document.getElementById('editorZoomStyle');
        prevStyle && prevStyle.remove();
        var styleEl = document.createElement('style');
        styleEl.id = 'editorZoomStyle';
        styleEl.innerText = ".CodeMirror, .CodeMirror-focused {\n\t\t\tfont-size: " + 1.25 * ~~window.app.settings.editor.zoom + "%!important;\n\t\t}";
        document.head.appendChild(styleEl);
        $('.CodeMirror').each(function () {
            this.CodeMirror.refresh();
        });
        var editor = ((window.scriptEdit && window.scriptEdit.active) ?
            window.scriptEdit.editor :
            ((window.stylesheetEdit && window.stylesheetEdit.active) ?
                window.stylesheetEdit.editor :
                null));
        if (!editor) {
            return;
        }
        window.colorFunction && window.colorFunction.func({
            from: {
                line: 0
            },
            to: {
                line: editor.lineCount()
            }
        }, editor);
    };
    ;
    CA.setLocal = function (key, value) {
        var obj = (_a = {},
            _a[key] = value,
            _a);
        var _this = this;
        chrome.storage.local.set(obj);
        chrome.storage.local.get(function (storageLocal) {
            _this.storageLocal = storageLocal;
            if (key === 'CRMOnPage') {
                window.doc.editCRMInRM.setCheckboxDisabledValue &&
                    window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal.CRMOnPage);
            }
            _this.upload();
        });
        var _a;
    };
    ;
    CA.refreshPage = function () {
        var _this = this;
        function onDone(fn) {
            fn();
            this.setup.initCheckboxes.apply(this, [window.app.storageLocal]);
            Array.prototype.slice.apply(document.querySelectorAll('default-link')).forEach(function (link) {
                link.reset();
            });
            window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
            window.doc.URISchemeFilePath.querySelector('input').value = 'C:\\files\\my_file.exe';
            window.doc.URISchemeSchemeName.value = 'myscheme';
            window.doc.URISchemeSchemeName.querySelector('input').value = 'myscheme';
            Array.prototype.slice.apply(document.querySelectorAll('paper-dialog')).forEach(function (dialog) {
                dialog.opened && dialog.close();
            });
            this.upload(true);
        }
        if (window.app.item) {
            var dialog = window[window.app.item.type + 'Edit'];
            dialog && dialog.cancel();
        }
        window.app.item = null;
        window.app.settings = window.app.storageLocal = null;
        window.Storages.loadStorages(function () {
            _this.setup.setupStorages(onDone.bind(_this));
        });
    };
    ;
    CA.ready = function () {
        var _this = this;
        window.app = this;
        window.doc = window.app.$;
        chrome.runtime.onInstalled.addListener(function (details) {
            if (details.reason === 'update') {
                _this.$.messageToast.text = "Extension has been updated to version " + chrome.runtime.getManifest().version;
                _this.$.messageToast.show();
            }
        });
        if (typeof localStorage === 'undefined') {
            chrome.runtime.onMessage.addListener(function (message) {
                if (message.type === 'idUpdate') {
                    _this.latestId = message.latestId;
                }
            });
        }
        var controlPresses = 0;
        document.body.addEventListener('keydown', function (event) {
            if (event.key === 'Control') {
                controlPresses++;
                window.setTimeout(function () {
                    if (controlPresses >= 3) {
                        _this.listeners._toggleBugReportingTool();
                        controlPresses = 0;
                    }
                    else {
                        if (controlPresses > 0) {
                            controlPresses--;
                        }
                    }
                }, 800);
            }
        });
        this.setup.setupLoadingBar(function (resolve) {
            _this.setup.setupStorages.apply(_this.setup, [resolve]);
        });
        this.show = false;
    };
    ;
    return CA;
}());
CA.is = 'crm-app';
CA._log = [];
CA.show = false;
CA.item = null;
CA.latestId = -1;
CA.nodesById = {};
CA.jsLintGlobals = [];
CA.properties = properties;
CA.transferFromOld = (function () {
    function CRMAppTransferFromOld() {
    }
    CRMAppTransferFromOld.backupLocalStorage = function () {
        if (typeof localStorage === 'undefined' ||
            (typeof window.indexedDB === 'undefined' && typeof window.webkitIndexedDB === 'undefined')) {
            return;
        }
        var data = JSON.stringify(localStorage);
        var idb = window.indexedDB || window.webkitIndexedDB;
        var req = idb.open('localStorageBackup', 1);
        req.onerror = function () { console.log('Error backing up localStorage data'); };
        req.onupgradeneeded = function (event) {
            var db = event.target.result;
            var objectStore = db.createObjectStore('data', {
                keyPath: 'id'
            });
            objectStore.add({
                id: 0,
                data: data
            });
        };
    };
    CRMAppTransferFromOld.parseOldCRMNode = function (string, openInNewTab, method) {
        var node = {};
        var oldNodeSplit = string.split('%123');
        var name = oldNodeSplit[0];
        var type = oldNodeSplit[1].toLowerCase();
        var nodeData = oldNodeSplit[2];
        switch (type) {
            case 'link':
                var split = void 0;
                if (nodeData.indexOf(', ') > -1) {
                    split = nodeData.split(', ');
                }
                else {
                    split = nodeData.split(',');
                }
                node = this.parent().templates.getDefaultLinkNode({
                    name: name,
                    id: this.parent().generateItemId(),
                    value: split.map(function (url) {
                        return {
                            newTab: openInNewTab,
                            url: url
                        };
                    })
                });
                break;
            case 'divider':
                node = this.parent().templates.getDefaultDividerNode({
                    name: name,
                    id: this.parent().generateItemId()
                });
                break;
            case 'menu':
                node = this.parent().templates.getDefaultMenuNode({
                    name: name,
                    id: this.parent().generateItemId(),
                    children: nodeData
                });
                break;
            case 'script':
                var scriptSplit = nodeData.split('%124');
                var scriptLaunchMode = scriptSplit[0];
                var scriptData = scriptSplit[1];
                var triggers = void 0;
                var launchModeString = scriptLaunchMode + '';
                if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
                    triggers = launchModeString.split('1,')[1].split(',');
                    triggers = triggers.map(function (item) {
                        return {
                            not: false,
                            url: item.trim()
                        };
                    }).filter(function (item) {
                        return item.url !== '';
                    });
                    scriptLaunchMode = '2';
                }
                var id = this.parent().generateItemId();
                node = this.parent().templates.getDefaultScriptNode({
                    name: name,
                    id: id,
                    triggers: triggers || [],
                    value: {
                        launchMode: parseInt(scriptLaunchMode, 10),
                        updateNotice: true,
                        oldScript: scriptData,
                        script: this.parent().legacyScriptReplace.convertScriptFromLegacy(scriptData, id, method)
                    }
                });
                break;
        }
        return node;
    };
    ;
    CRMAppTransferFromOld.assignParents = function (parent, nodes, index, amount) {
        for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
            var currentNode = nodes[index.index];
            if (currentNode.type === 'menu') {
                var childrenAmount = ~~currentNode.children;
                currentNode.children = [];
                index.index++;
                this.assignParents(currentNode.children, nodes, index, childrenAmount);
                index.index--;
            }
            parent.push(currentNode);
        }
    };
    ;
    CRMAppTransferFromOld.transferCRMFromOld = function (openInNewTab, storageSource, method) {
        this.backupLocalStorage();
        var i;
        var amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;
        var nodes = [];
        for (i = 1; i < amount; i++) {
            nodes.push(this.parseOldCRMNode(storageSource.getItem(i), openInNewTab, method));
        }
        var crm = [];
        this.assignParents(crm, nodes, {
            index: 0
        }, nodes.length);
        return crm;
    };
    ;
    CRMAppTransferFromOld.parent = function () {
        return window.app;
    };
    return CRMAppTransferFromOld;
}());
CA.setup = (function () {
    function CRMAppSetup() {
    }
    CRMAppSetup.restoreUnsavedInstances = function (editingObj, errs) {
        if (errs === void 0) { errs = 0; }
        var _this = this;
        errs = errs + 1 || 0;
        if (errs < 5) {
            if (!window.CodeMirror) {
                setTimeout(function () {
                    _this.restoreUnsavedInstances(editingObj, errs);
                }, 500);
            }
            else {
                var crmItem_1 = _this.parent().nodesById[editingObj.id];
                var code = (crmItem_1.type === 'script' ? (editingObj.mode === 'main' ?
                    crmItem_1.value.script : crmItem_1.value.backgroundScript) :
                    (crmItem_1.value.stylesheet));
                _this.parent().listeners.iconSwitch(null, editingObj.crmType);
                $('.keepChangesButton').on('click', function () {
                    if (crmItem_1.type === 'script') {
                        crmItem_1.value[(editingObj.mode === 'main' ?
                            'script' :
                            'backgroundScript')] = editingObj.val;
                    }
                    else {
                        crmItem_1.value.stylesheet = editingObj.val;
                    }
                    window.app.upload();
                    chrome.storage.local.set({
                        editing: null
                    });
                    window.setTimeout(function () {
                        window.doc.restoreChangesOldCodeCont.innerHTML = '';
                        window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                    }, 500);
                });
                $('.restoreChangesBack').on('click', function () {
                    window.doc.restoreChangesOldCode.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'none';
                    window.doc.restoreChangesMain.style.display = 'block';
                    window.doc.restoreChangesDialog.fit();
                });
                $('.discardButton').on('click', function () {
                    chrome.storage.local.set({
                        editing: null
                    });
                    window.setTimeout(function () {
                        window.doc.restoreChangesOldCodeCont.innerHTML = '';
                        window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                    }, 500);
                });
                window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                window.doc.restoreChangesOldCodeCont.innerHTML = '';
                var oldEditor_1 = window.CodeMirror(window.doc.restoreChangesOldCodeCont, {
                    lineNumbers: true,
                    value: code,
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    readOnly: 'nocursor',
                    theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs
                });
                var unsavedEditor_1 = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
                    lineNumbers: true,
                    value: editingObj.val,
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    readOnly: 'nocursor',
                    theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs
                });
                window.doc.restoreChangesShowOld.addEventListener('click', function () {
                    window.doc.restoreChangesMain.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'none';
                    window.doc.restoreChangesOldCode.style.display = 'flex';
                    window.doc.restoreChangesDialog.fit();
                    oldEditor_1.refresh();
                });
                window.doc.restoreChangesShowUnsaved.addEventListener('click', function () {
                    window.doc.restoreChangesMain.style.display = 'none';
                    window.doc.restoreChangesOldCode.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'flex';
                    window.doc.restoreChangesDialog.fit();
                    unsavedEditor_1.refresh();
                });
                var stopHighlighting_1 = function (element) {
                    $(element).find('.item')[0].animate([
                        {
                            opacity: 1
                        }, {
                            opacity: 0.6
                        }
                    ], {
                        duration: 250,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        this.effect.target.style.opacity = '0.6';
                        window.doc.restoreChangesDialog.open();
                        $('.pageCont').animate({
                            backgroundColor: 'white'
                        }, 200);
                        $('.crmType').each(function () {
                            this.classList.remove('dim');
                        });
                        $('edit-crm-item').find('.item').animate({
                            opacity: 1
                        }, 200, function () {
                            document.body.style.pointerEvents = 'all';
                        });
                    };
                };
                var path_1 = _this.parent().nodesById[editingObj.id].path;
                var highlightItem_1 = function () {
                    document.body.style.pointerEvents = 'none';
                    var columnConts = $('#mainCont').children('div');
                    var $columnCont = $(columnConts[(path_1.length - 1) + 2]);
                    var $paperMaterial = $($columnCont.children('paper-material')[0]);
                    var $crmEditColumn = $paperMaterial.children('.CRMEditColumn')[0];
                    var editCRMItems = $($crmEditColumn).children('edit-crm-item');
                    var crmElement = editCRMItems[path_1[path_1.length - 1]];
                    if ($(crmElement).find('.item')[0]) {
                        $(crmElement).find('.item')[0].animate([
                            {
                                opacity: 0.6
                            }, {
                                opacity: 1
                            }
                        ], {
                            duration: 250,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                        }).onfinish = function () {
                            this.effect.target.style.opacity = '1';
                        };
                        setTimeout(function () {
                            stopHighlighting_1(crmElement);
                        }, 2000);
                    }
                    else {
                        window.doc.restoreChangesDialog.open();
                        $('.pageCont').animate({
                            backgroundColor: 'white'
                        }, 200);
                        $('.crmType').each(function () {
                            this.classList.remove('dim');
                        });
                        $('edit-crm-item').find('.item').animate({
                            opacity: 1
                        }, 200, function () {
                            document.body.style.pointerEvents = 'all';
                        });
                    }
                };
                window.doc.highlightChangedScript.addEventListener('click', function () {
                    window.doc.restoreChangesDialog.close();
                    $('.pageCont')[0].style.backgroundColor = 'rgba(0,0,0,0.4)';
                    $('edit-crm-item').find('.item').css('opacity', 0.6);
                    $('.crmType').each(function () {
                        this.classList.add('dim');
                    });
                    setTimeout(function () {
                        if (path_1.length === 1) {
                            highlightItem_1();
                        }
                        else {
                            var visible = true;
                            for (var i = 1; i < path_1.length; i++) {
                                if (window.app.editCRM.crm[i].indent.length !== path_1[i - 1]) {
                                    visible = false;
                                    break;
                                }
                            }
                            if (!visible) {
                                var popped = JSON.parse(JSON.stringify(path_1.length));
                                popped.pop();
                                window.app.editCRM.build(popped);
                                setTimeout(highlightItem_1, 700);
                            }
                            else {
                                highlightItem_1();
                            }
                        }
                    }, 500);
                });
                try {
                    window.doc.restoreChangesDialog.open();
                }
                catch (e) {
                    _this.restoreUnsavedInstances(editingObj, errs + 1);
                }
            }
        }
    };
    ;
    CRMAppSetup.bindListeners = function () {
        var urlInput = window.doc.addLibraryUrlInput;
        var manualInput = window.doc.addLibraryManualInput;
        window.doc.addLibraryUrlOption.addEventListener('change', function () {
            manualInput.style.display = 'none';
            urlInput.style.display = 'block';
        });
        window.doc.addLibraryManualOption.addEventListener('change', function () {
            urlInput.style.display = 'none';
            manualInput.style.display = 'block';
        });
        $('#addLibraryDialog').on('iron-overlay-closed', function () {
            $(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
        });
    };
    ;
    CRMAppSetup.setupStorages = function (resolve) {
        var _this = this.parent();
        chrome.storage.local.get(function (storageLocal) {
            resolve(function () {
                function callback(items) {
                    _this.settings = items;
                    _this.settingsCopy = JSON.parse(JSON.stringify(items));
                    for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
                        _this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
                    }
                    _this.updateEditorZoom();
                    _this.setup.orderNodesById(items.crm);
                    _this.pageDemo.create();
                    _this.setup.buildNodePaths(items.crm, []);
                    if (_this.settings.latestId) {
                        _this.latestId = items.latestId;
                    }
                    else {
                        _this.latestId = 0;
                    }
                    if (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] <= 34) {
                        window.doc.CRMOnPage.setCheckboxDisabledValue(true);
                    }
                    window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
                        .CRMOnPage);
                }
                Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                    setting.init(storageLocal);
                });
                _this.setup.bindListeners();
                delete storageLocal.nodeStorage;
                if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
                    _this.requestPermissions(storageLocal.requestPermissions);
                }
                if (storageLocal.editing) {
                    var editing_1 = storageLocal.editing;
                    setTimeout(function () {
                        var node = _this.nodesById[editing_1.id];
                        var nodeCurrentCode = (node.type === 'script' ? node.value.script :
                            node.value.stylesheet);
                        if (nodeCurrentCode.trim() !== editing_1.val.trim()) {
                            _this.setup.restoreUnsavedInstances(editing_1);
                        }
                        else {
                            chrome.storage.local.set({
                                editing: null
                            });
                        }
                    }, 2500);
                }
                if (storageLocal.selectedCrmType !== undefined) {
                    _this.crmType = storageLocal.selectedCrmType;
                    _this.setup.switchToIcons(storageLocal.selectedCrmType);
                }
                else {
                    chrome.storage.local.set({
                        selectedCrmType: 0
                    });
                    _this.crmType = 0;
                    _this.setup.switchToIcons(0);
                }
                if (storageLocal.jsLintGlobals) {
                    _this.jsLintGlobals = storageLocal.jsLintGlobals;
                }
                else {
                    _this.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
                    chrome.storage.local.set({
                        jsLintGlobals: _this.jsLintGlobals
                    });
                }
                if (storageLocal.globalExcludes && storageLocal.globalExcludes.length >
                    1) {
                    _this.globalExcludes = storageLocal.globalExcludes;
                }
                else {
                    _this.globalExcludes = [''];
                    chrome.storage.local.set({
                        globalExcludes: _this.globalExcludes
                    });
                }
                if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
                    window.setTimeout(function () {
                        window.doc.addedPermissionsTabContainer.tab = 0;
                        window.doc.addedPermissionsTabContainer.maxTabs =
                            storageLocal.addedPermissions.length;
                        window.doc.addedPermissionsTabRepeater.items =
                            storageLocal.addedPermissions;
                        if (storageLocal.addedPermissions.length === 1) {
                            window.doc.addedPermissionNextButton.querySelector('.next')
                                .style.display = 'none';
                        }
                        else {
                            window.doc.addedPermissionNextButton.querySelector('.close')
                                .style.display = 'none';
                        }
                        window.doc.addedPermissionPrevButton.style.display = 'none';
                        window.doc.addedPermissionsTabRepeater.render();
                        window.doc.addedPermissionsDialog.open();
                        chrome.storage.local.set({
                            addedPermissions: null
                        });
                    }, 2500);
                }
                if (storageLocal.updatedScripts && storageLocal.updatedScripts.length > 0) {
                    _this.$.scriptUpdatesToast.text = _this._getUpdatedScriptString(storageLocal.updatedScripts[0]);
                    _this.$.scriptUpdatesToast.scripts = storageLocal.updatedScripts;
                    _this.$.scriptUpdatesToast.index = 0;
                    _this.$.scriptUpdatesToast.show();
                    if (storageLocal.updatedScripts.length > 1) {
                        _this.$.nextScriptUpdateButton.style.display = 'inline';
                    }
                    else {
                        _this.$.nextScriptUpdateButton.style.display = 'none';
                    }
                    chrome.storage.local.set({
                        updatedScripts: []
                    });
                    storageLocal.updatedScripts = [];
                }
                if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.wasUpdated) {
                    var versionData = storageLocal.settingsVersionData;
                    versionData.wasUpdated = false;
                    chrome.storage.local.set({
                        settingsVersionData: versionData
                    });
                    var toast = window.doc.updatedSettingsToast;
                    toast.text = 'Settings were updated to those on ' + new Date(versionData.latest.date).toLocaleDateString();
                    toast.show();
                }
                if (storageLocal.isTransfer) {
                    chrome.storage.local.set({
                        isTransfer: false
                    });
                    window.doc.versionUpdateDialog.open();
                }
                _this.storageLocal = storageLocal;
                _this.storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                if (storageLocal.useStorageSync) {
                    chrome.storage.sync.get(function (storageSync) {
                        var indexes = storageSync.indexes;
                        if (!indexes) {
                            chrome.storage.local.set({
                                useStorageSync: false
                            });
                            callback(storageLocal.settings);
                        }
                        else {
                            var settingsJsonArray_1 = [];
                            indexes.forEach(function (index) {
                                settingsJsonArray_1.push(storageSync[index]);
                            });
                            var jsonString = settingsJsonArray_1.join('');
                            _this.settingsJsonLength = jsonString.length;
                            var settings = JSON.parse(jsonString);
                            callback(settings);
                        }
                    });
                }
                else {
                    _this.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
                    if (!storageLocal.settings) {
                        chrome.storage.local.set({
                            useStorageSync: true
                        });
                        chrome.storage.sync.get(function (storageSync) {
                            var indexes = storageSync.indexes;
                            var settingsJsonArray = [];
                            indexes.forEach(function (index) {
                                settingsJsonArray.push(storageSync[index]);
                            });
                            var jsonString = settingsJsonArray.join('');
                            _this.settingsJsonLength = jsonString.length;
                            var settings = JSON.parse(jsonString);
                            callback(settings);
                        });
                    }
                    else {
                        callback(storageLocal.settings);
                    }
                }
            });
        });
    };
    ;
    CRMAppSetup.animateLoadingBar = function (settings, progress) {
        var _this = this;
        var scaleBefore = 'scaleX(' + settings.lastReachedProgress + ')';
        var scaleAfter = 'scaleX(' + progress + ')';
        if (settings.max === settings.lastReachedProgress ||
            settings.toReach >= 1) {
            settings.progressBar.animate([{
                    transform: scaleBefore,
                    WebkitTransform: scaleBefore
                }, {
                    transform: scaleAfter,
                    WebkitTransform: scaleAfter
                }], {
                duration: 200,
                easing: 'linear'
            }).onfinish = function () {
                settings.lastReachedProgress = progress;
                settings.isAnimating = false;
                settings.progressBar.style.transform = scaleAfter;
                settings.progressBar.style.WebkitTransform = scaleAfter;
            };
            return;
        }
        if (settings.progressBar.animate.isJqueryFill) {
            settings.progressBar.style.transform = scaleAfter;
            settings.progressBar.style.WebkitTransform = scaleAfter;
        }
        else {
            if (settings.isAnimating) {
                settings.toReach = progress;
                settings.shouldAnimate = true;
            }
            else {
                settings.isAnimating = true;
                settings.progressBar.animate([{
                        transform: scaleBefore,
                        WebkitTransform: scaleBefore
                    }, {
                        transform: scaleAfter,
                        WebkitTransform: scaleAfter
                    }], {
                    duration: 200,
                    easing: 'linear'
                }).onfinish = function () {
                    settings.lastReachedProgress = progress;
                    settings.isAnimating = false;
                    settings.progressBar.style.transform = scaleAfter;
                    settings.progressBar.style.WebkitTransform = scaleAfter;
                    _this.animateLoadingBar(settings, settings.toReach);
                };
            }
        }
    };
    ;
    CRMAppSetup.setupLoadingBar = function (fn) {
        var callback = null;
        fn(function (cb) {
            callback = cb;
        });
        var _this = this;
        var importsAmount = 62;
        var loadingBarSettings = {
            lastReachedProgress: 0,
            progressBar: document.getElementById('splashScreenProgressBarLoader'),
            toReach: 0,
            isAnimating: false,
            shouldAnimate: false,
            max: importsAmount
        };
        var registeredElements = Polymer.telemetry.registrations.length;
        var registrationArray = Array.prototype.slice.apply(Polymer.telemetry.registrations);
        registrationArray.push = function (element) {
            Array.prototype.push.call(registrationArray, element);
            registeredElements++;
            var progress = Math.round((registeredElements / importsAmount) * 100) / 100;
            _this.animateLoadingBar(loadingBarSettings, progress);
            if (registeredElements === importsAmount) {
                window.setTimeout(function () {
                    callback && callback();
                    window.setTimeout(function () {
                        document.documentElement.classList.remove('elementsLoading');
                        if (!window.lastError && location.hash.indexOf('noClear') === -1) {
                            console.clear();
                        }
                        window.setTimeout(function () {
                            window.polymerElementsLoaded = true;
                            document.getElementById('splashScreen').style.display = 'none';
                        }, 500);
                        console.log('%cHey there, if you\'re interested in how this extension works check out the github repository over at https://github.com/SanderRonde/CustomRightClickMenu', 'font-size:120%;font-weight:bold;');
                    }, 200);
                    window.CRMLoaded = window.CRMLoaded || {
                        listener: null,
                        register: function (fn) {
                            fn();
                        }
                    };
                    window.CRMLoaded.listener && window.CRMLoaded.listener();
                }, 25);
            }
        };
        Polymer.telemetry.registrations = registrationArray;
    };
    ;
    CRMAppSetup.initCheckboxes = function (defaultLocalStorage) {
        var _this = this;
        if (window.doc.editCRMInRM.setCheckboxDisabledValue) {
            window.doc.editCRMInRM.setCheckboxDisabledValue &&
                window.doc.editCRMInRM.setCheckboxDisabledValue(false);
            Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                setting.init && setting.init(defaultLocalStorage);
            });
        }
        else {
            window.setTimeout(function () {
                _this.initCheckboxes.apply(_this, [defaultLocalStorage]);
            }, 1000);
        }
    };
    ;
    CRMAppSetup.buildNodePaths = function (tree, currentPath) {
        for (var i = 0; i < tree.length; i++) {
            var childPath = currentPath.concat([i]);
            var node = tree[i];
            node.path = childPath;
            if (node.children) {
                this.buildNodePaths(node.children, childPath);
            }
        }
    };
    ;
    CRMAppSetup.orderNodesById = function (tree) {
        for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            this.parent().nodesById[node.id] = node;
            node.children && this.orderNodesById(node.children);
        }
    };
    ;
    CRMAppSetup.switchToIcons = function (index) {
        var i;
        var element;
        var crmTypes = document.querySelectorAll('.crmType');
        for (i = 0; i < 6; i++) {
            if (index === i) {
                element = crmTypes[i];
                element.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                element.classList.add('toggled');
                var child = document.createElement('div');
                if (index === 5) {
                    child.classList.add('crmTypeShadowMagicElementRight');
                }
                else {
                    child.classList.add('crmTypeShadowMagicElement');
                }
                element.appendChild(child);
            }
        }
        this.parent().crmType = index;
        this.parent().fire('crmTypeChanged', {});
    };
    ;
    CRMAppSetup.parent = function () {
        return window.app;
    };
    return CRMAppSetup;
}());
CA.uploading = (function () {
    function CRMAppUploading() {
    }
    CRMAppUploading.areValuesDifferent = function (val1, val2) {
        var obj1ValIsArray = Array.isArray(val1);
        var obj2ValIsArray = Array.isArray(val2);
        var obj1ValIsObjOrArray = typeof val1 === 'object';
        var obj2ValIsObjOrArray = typeof val2 === 'object';
        if (obj1ValIsObjOrArray) {
            if (!obj2ValIsObjOrArray) {
                return true;
            }
            else {
                if (obj1ValIsArray) {
                    if (!obj2ValIsArray) {
                        return true;
                    }
                    else {
                        if (!this.parent().util.compareArray(val1, val2)) {
                            return true;
                        }
                    }
                }
                else {
                    if (obj2ValIsArray) {
                        return true;
                    }
                    else {
                        if (!this.parent().util.compareObj(val1, val2)) {
                            return true;
                        }
                    }
                }
            }
        }
        else if (val1 !== val2) {
            return true;
        }
        return false;
    };
    ;
    CRMAppUploading.getObjDifferences = function (obj1, obj2, changes) {
        for (var key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (this.areValuesDifferent(obj1[key], obj2[key])) {
                    changes.push({
                        oldValue: obj2[key],
                        newValue: obj1[key],
                        key: key
                    });
                }
            }
        }
        return changes.length > 0;
    };
    ;
    CRMAppUploading.upload = function (force) {
        var localChanges = [];
        var storageLocal = this.parent().storageLocal;
        var storageLocalCopy = force ? {} : this.parent().storageLocalCopy;
        var settingsChanges = [];
        var settings = this.parent().settings;
        var settingsCopy = force ? {} : this.parent().settingsCopy;
        var hasLocalChanged = this.getObjDifferences(storageLocal, storageLocalCopy, localChanges);
        var haveSettingsChanged = this.getObjDifferences(settings, settingsCopy, settingsChanges);
        if (hasLocalChanged || haveSettingsChanged) {
            chrome.runtime.sendMessage({
                type: 'updateStorage',
                data: {
                    type: 'optionsPage',
                    localChanges: hasLocalChanged && localChanges,
                    settingsChanges: haveSettingsChanged && settingsChanges
                }
            });
        }
        this.parent().pageDemo.create();
    };
    ;
    CRMAppUploading.parent = function () {
        return window.app;
    };
    return CRMAppUploading;
}());
CA.legacyScriptReplace = (_a = (function () {
        function LegacyScriptReplace() {
        }
        LegacyScriptReplace.generateScriptUpgradeErrorHandler = function (id) {
            return function (oldScriptErrors, newScriptErrors, parseError) {
                chrome.storage.local.get(function (keys) {
                    if (!keys.upgradeErrors) {
                        var val = {};
                        val[id] = {
                            oldScript: oldScriptErrors,
                            newScript: newScriptErrors,
                            generalError: parseError
                        };
                        keys.upgradeErrors = val;
                        window.app.storageLocal.upgradeErrors = val;
                    }
                    keys.upgradeErrors[id] = window.app.storageLocal.upgradeErrors[id] = {
                        oldScript: oldScriptErrors,
                        newScript: newScriptErrors,
                        generalError: parseError
                    };
                    chrome.storage.local.set({ upgradeErrors: keys.upgradeErrors });
                });
            };
        };
        ;
        LegacyScriptReplace.convertScriptFromLegacy = function (script, id, method) {
            var usedExecuteLocally = false;
            var lineIndex = script.indexOf('/*execute locally*/');
            if (lineIndex !== -1) {
                script = script.replace('/*execute locally*/\n', '');
                if (lineIndex === script.indexOf('/*execute locally*/')) {
                    script = script.replace('/*execute locally*/', '');
                }
                usedExecuteLocally = true;
            }
            try {
                switch (method) {
                    case 0:
                        script = this.chromeCallsReplace.replace(script, this.generateScriptUpgradeErrorHandler(id));
                        break;
                    case 1:
                        script = usedExecuteLocally ?
                            this.localStorageReplace.replaceCalls(script.split('\n')) : script;
                        break;
                    case 2:
                        var localStorageConverted = usedExecuteLocally ?
                            this.localStorageReplace.replaceCalls(script.split('\n')) : script;
                        script = this.chromeCallsReplace.replace(localStorageConverted, this.generateScriptUpgradeErrorHandler(id));
                        break;
                }
            }
            catch (e) {
                return script;
            }
            return script;
        };
        return LegacyScriptReplace;
    }()),
    _a.localStorageReplace = (function () {
        function LogalStorageReplace() {
        }
        LogalStorageReplace.findExpression = function (expression, data, strToFind, onFind) {
            if (!expression) {
                return false;
            }
            switch (expression.type) {
                case 'Identifier':
                    if (expression.name === strToFind) {
                        onFind(data, expression);
                        return true;
                    }
                    break;
                case 'VariableDeclaration':
                    for (var i = 0; i < expression.declarations.length; i++) {
                        var declaration = expression.declarations[i];
                        if (declaration.init) {
                            if (this.findExpression(declaration.init, data, strToFind, onFind)) {
                                return true;
                            }
                        }
                    }
                    break;
                case 'MemberExpression':
                    data.isObj = true;
                    if (this.findExpression(expression.object, data, strToFind, onFind)) {
                        return true;
                    }
                    data.siblingExpr = expression.object;
                    data.isObj = false;
                    return this.findExpression(expression.property, data, strToFind, onFind);
                case 'CallExpression':
                    if (expression.arguments && expression.arguments.length > 0) {
                        for (var i = 0; i < expression.arguments.length; i++) {
                            if (this.findExpression(expression.arguments[i], data, strToFind, onFind)) {
                                return true;
                            }
                        }
                    }
                    if (expression.callee) {
                        return this.findExpression(expression.callee, data, strToFind, onFind);
                    }
                    break;
                case 'AssignmentExpression':
                    return this.findExpression(expression.right, data, strToFind, onFind);
                case 'FunctionExpression':
                case 'FunctionDeclaration':
                    for (var i = 0; i < expression.body.body.length; i++) {
                        if (this.findExpression(expression.body.body[i], data, strToFind, onFind)) {
                            return true;
                        }
                    }
                    break;
                case 'ExpressionStatement':
                    return this.findExpression(expression.expression, data, strToFind, onFind);
                case 'SequenceExpression':
                    for (var i = 0; i < expression.expressions.length; i++) {
                        if (this.findExpression(expression.expressions[i], data, strToFind, onFind)) {
                            return true;
                        }
                    }
                    break;
                case 'UnaryExpression':
                case 'ConditionalExpression':
                    if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
                        return true;
                    }
                    return this.findExpression(expression.alternate, data, strToFind, onFind);
                case 'IfStatement':
                    ;
                    if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
                        return true;
                    }
                    if (expression.alternate) {
                        return this.findExpression(expression.alternate, data, strToFind, onFind);
                    }
                    break;
                case 'LogicalExpression':
                case 'BinaryExpression':
                    if (this.findExpression(expression.left, data, strToFind, onFind)) {
                        return true;
                    }
                    return this.findExpression(expression.right, data, strToFind, onFind);
                case 'BlockStatement':
                    for (var i = 0; i < expression.body.length; i++) {
                        if (this.findExpression(expression.body[i], data, strToFind, onFind)) {
                            return true;
                        }
                    }
                    break;
                case 'ReturnStatement':
                    return this.findExpression(expression.argument, data, strToFind, onFind);
                case 'ObjectExpressions':
                    for (var i = 0; i < expression.properties.length; i++) {
                        if (this.findExpression(expression.properties[i].value, data, strToFind, onFind)) {
                            return true;
                        }
                    }
                    break;
            }
            return false;
        };
        LogalStorageReplace.getLineSeperators = function (lines) {
            var index = 0;
            var lineSeperators = [];
            for (var i = 0; i < lines.length; i++) {
                lineSeperators.push({
                    start: index,
                    end: index += lines[i].length + 1
                });
            }
            return lineSeperators;
        };
        LogalStorageReplace.replaceCalls = function (lines) {
            var file = new window.TernFile('[doc]');
            file.text = lines.join('\n');
            var srv = new window.CodeMirror.TernServer({
                defs: [window.ecma5, window.ecma6, window.browserDefs]
            });
            window.tern.withContext(srv.cx, function () {
                file.ast = window.tern.parse(file.text, srv.passes, {
                    directSourceFile: file,
                    allowReturnOutsideFunction: true,
                    allowImportExportEverywhere: true,
                    ecmaVersion: srv.ecmaVersion
                });
            });
            var scriptExpressions = file.ast.body;
            var script = file.text;
            var persistentData = {
                lines: lines,
                lineSeperators: this.getLineSeperators(lines),
                script: script
            };
            for (var i = 0; i < scriptExpressions.length; i++) {
                var expression = scriptExpressions[i];
                if (this.findExpression(expression, persistentData, 'localStorage', function (data, expression) {
                    data.script =
                        data.script.slice(0, expression.start) +
                            'localStorageProxy' +
                            data.script.slice(expression.end);
                    data.lines = data.script.split('\n');
                })) {
                    return this.replaceCalls(persistentData.lines);
                }
            }
            return persistentData.script;
        };
        return LogalStorageReplace;
    }()),
    _a.chromeCallsReplace = (function () {
        function ChromeCallsReplace() {
        }
        ChromeCallsReplace.isProperty = function (toCheck, prop) {
            if (toCheck === prop) {
                return true;
            }
            return toCheck.replace(/['|"|`]/g, '') === prop;
        };
        ChromeCallsReplace.getCallLines = function (lineSeperators, start, end) {
            var line = {};
            for (var i = 0; i < lineSeperators.length; i++) {
                var sep = lineSeperators[i];
                if (sep.start <= start) {
                    line.from = {
                        index: sep.start,
                        line: i
                    };
                }
                if (sep.end >= end) {
                    line.to = {
                        index: sep.end,
                        line: i
                    };
                    break;
                }
            }
            return line;
        };
        ChromeCallsReplace.getFunctionCallExpressions = function (data) {
            var index = data.parentExpressions.length - 1;
            var expr = data.parentExpressions[index];
            while (expr && expr.type !== 'CallExpression') {
                expr = data.parentExpressions[--index];
            }
            return data.parentExpressions[index];
        };
        ChromeCallsReplace.getChromeAPI = function (expr, data) {
            data.functionCall = data.functionCall.map(function (prop) {
                return prop.replace(/['|"|`]/g, '');
            });
            var functionCall = data.functionCall;
            functionCall = functionCall.reverse();
            if (functionCall[0] === 'chrome') {
                functionCall.splice(0, 1);
            }
            var argsStart = expr.callee.end;
            var argsEnd = expr.end;
            var args = data.persistent.script.slice(argsStart, argsEnd);
            return {
                call: functionCall.join('.'),
                args: args
            };
        };
        ChromeCallsReplace.getLineIndexFromTotalIndex = function (lines, line, index) {
            for (var i = 0; i < line; i++) {
                index -= lines[i].length + 1;
            }
            return index;
        };
        ChromeCallsReplace.replaceChromeFunction = function (data, expr, callLine) {
            if (data.isReturn && !data.isValidReturn) {
                return;
            }
            var lines = data.persistent.lines;
            var i;
            var chromeAPI = this.getChromeAPI(expr, data);
            var firstLine = data.persistent.lines[callLine.from.line];
            var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
                expr.callee.start));
            var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, expr.callee.end);
            var newLine = firstLine.slice(0, lineExprStart) +
                ("window.crmAPI.chrome('" + chromeAPI.call + "')");
            var lastChar = null;
            while (newLine[(lastChar = newLine.length - 1)] === ' ') {
                newLine = newLine.slice(0, lastChar);
            }
            if (newLine[(lastChar = newLine.length - 1)] === ';') {
                newLine = newLine.slice(0, lastChar);
            }
            if (chromeAPI.args !== '()') {
                var argsLines = chromeAPI.args.split('\n');
                newLine += argsLines[0];
                for (i = 1; i < argsLines.length; i++) {
                    lines[callLine.from.line + i] = argsLines[i];
                }
            }
            if (data.isReturn) {
                var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
                while (lineRest.indexOf(';') === 0) {
                    lineRest = lineRest.slice(1);
                }
                newLine += ".return(function(" + data.returnName + ") {" + lineRest;
                var usesTabs = true;
                var spacesAmount = 0;
                for (var i_1 = 0; i_1 < data.persistent.lines.length; i_1++) {
                    if (data.persistent.lines[i_1].indexOf('	') === 0) {
                        usesTabs = true;
                        break;
                    }
                    else if (data.persistent.lines[i_1].indexOf('  ') === 0) {
                        var split = data.persistent.lines[i_1].split(' ');
                        for (var j = 0; j < split.length; j++) {
                            if (split[j] === ' ') {
                                spacesAmount++;
                            }
                            else {
                                break;
                            }
                        }
                        usesTabs = false;
                        break;
                    }
                }
                var indent;
                if (usesTabs) {
                    indent = '	';
                }
                else {
                    indent = [];
                    indent[spacesAmount] = ' ';
                    indent = indent.join(' ');
                }
                var scopeLength = null;
                var idx = null;
                for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
                    if (data.parentExpressions[i].type === 'BlockStatement' ||
                        (data.parentExpressions[i].type === 'FunctionExpression' &&
                            data.parentExpressions[i].body.type === 'BlockStatement')) {
                        scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
                        idx = 0;
                        while (scopeLength > 0) {
                            scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
                        }
                        scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
                    }
                }
                if (idx === null) {
                    idx = (lines.length - callLine.from.line) + 1;
                }
                var indents = 0;
                var newLineData = lines[callLine.from.line];
                while (newLineData.indexOf(indent) === 0) {
                    newLineData = newLineData.replace(indent, '');
                    indents++;
                }
                var prevLine;
                var indentArr = [];
                indentArr[indents] = '';
                var prevLine2 = indentArr.join(indent) + '}).send();';
                var max = data.persistent.lines.length + 1;
                for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
                    lines[i] = indent + lines[i];
                }
                for (i = callLine.from.line + (idx - 1); i < max; i++) {
                    prevLine = lines[i];
                    lines[i] = prevLine2;
                    prevLine2 = prevLine;
                }
            }
            else {
                lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
                if (i === 1) {
                    newLine += '.send();';
                }
            }
            lines[callLine.from.line] = newLine;
            return;
        };
        ChromeCallsReplace.callsChromeFunction = function (callee, data, onError) {
            data.parentExpressions.push(callee);
            if (callee.arguments && callee.arguments.length > 0) {
                for (var i = 0; i < callee.arguments.length; i++) {
                    if (this.findChromeExpression(callee.arguments[i], this
                        .removeObjLink(data), onError)) {
                        return true;
                    }
                }
            }
            if (callee.type !== 'MemberExpression') {
                return this.findChromeExpression(callee, this.removeObjLink(data), onError);
            }
            if (callee.property) {
                data.functionCall = data.functionCall || [];
                data.functionCall.push(callee.property.name || callee.property.raw);
            }
            if (callee.object && callee.object.name) {
                var isWindowCall = (this.isProperty(callee.object.name, 'window') &&
                    this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
                if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
                    data.expression = callee;
                    var expr = this.getFunctionCallExpressions(data);
                    var callLines = this.getCallLines(data
                        .persistent
                        .lineSeperators, expr.start, expr.end);
                    if (data.isReturn && !data.isValidReturn) {
                        callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent
                            .lines, callLines.from.line, callLines.from.index);
                        callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent
                            .lines, callLines.to.line, callLines.to.index);
                        onError(callLines, data.persistent.passes);
                        return false;
                    }
                    if (!data.persistent.diagnostic) {
                        this.replaceChromeFunction(data, expr, callLines);
                    }
                    return true;
                }
            }
            else if (callee.object) {
                return this.callsChromeFunction(callee.object, data, onError);
            }
            return false;
        };
        ChromeCallsReplace.removeObjLink = function (data) {
            var parentExpressions = data.parentExpressions || [];
            var newObj = {};
            for (var key in data) {
                if (data.hasOwnProperty(key) &&
                    key !== 'parentExpressions' &&
                    key !== 'persistent') {
                    newObj[key] = data[key];
                }
            }
            var newParentExpressions = [];
            for (var i = 0; i < parentExpressions.length; i++) {
                newParentExpressions.push(parentExpressions[i]);
            }
            newObj.persistent = data.persistent;
            newObj.parentExpressions = newParentExpressions;
            return newObj;
        };
        ChromeCallsReplace.findChromeExpression = function (expression, data, onError) {
            data.parentExpressions = data.parentExpressions || [];
            data.parentExpressions.push(expression);
            switch (expression.type) {
                case 'VariableDeclaration':
                    data.isValidReturn = expression.declarations.length === 1;
                    for (var i = 0; i < expression.declarations.length; i++) {
                        var declaration = expression.declarations[i];
                        if (declaration.init) {
                            var decData = this.removeObjLink(data);
                            var returnName = declaration.id.name;
                            decData.isReturn = true;
                            decData.returnExpr = expression;
                            decData.returnName = returnName;
                            if (this.findChromeExpression(declaration.init, decData, onError)) {
                                return true;
                            }
                        }
                    }
                    break;
                case 'CallExpression':
                case 'MemberExpression':
                    var argsTocheck = [];
                    if (expression.arguments && expression.arguments.length > 0) {
                        for (var i = 0; i < expression.arguments.length; i++) {
                            if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
                                argsTocheck.push(expression.arguments[i]);
                            }
                            else {
                                if (this.findChromeExpression(expression.arguments[i], this.removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                        }
                    }
                    data.functionCall = [];
                    if (expression.callee) {
                        if (this.callsChromeFunction(expression.callee, data, onError)) {
                            return true;
                        }
                    }
                    for (var i = 0; i < argsTocheck.length; i++) {
                        if (this.findChromeExpression(argsTocheck[i], this.removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'AssignmentExpression':
                    data.isReturn = true;
                    data.returnExpr = expression;
                    data.returnName = expression.left.name;
                    return this.findChromeExpression(expression.right, data, onError);
                case 'FunctionExpression':
                case 'FunctionDeclaration':
                    data.isReturn = false;
                    for (var i = 0; i < expression.body.body.length; i++) {
                        if (this.findChromeExpression(expression.body.body[i], this
                            .removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'ExpressionStatement':
                    return this.findChromeExpression(expression.expression, data, onError);
                case 'SequenceExpression':
                    data.isReturn = false;
                    var lastExpression = expression.expressions.length - 1;
                    for (var i = 0; i < expression.expressions.length; i++) {
                        if (i === lastExpression) {
                            data.isReturn = true;
                        }
                        if (this.findChromeExpression(expression.expressions[i], this
                            .removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'UnaryExpression':
                case 'ConditionalExpression':
                    data.isValidReturn = false;
                    data.isReturn = true;
                    if (this.findChromeExpression(expression.consequent, this
                        .removeObjLink(data), onError)) {
                        return true;
                    }
                    if (this.findChromeExpression(expression.alternate, this
                        .removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'IfStatement':
                    data.isReturn = false;
                    if (this.findChromeExpression(expression.consequent, this
                        .removeObjLink(data), onError)) {
                        return true;
                    }
                    if (expression.alternate &&
                        this.findChromeExpression(expression.alternate, this
                            .removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'LogicalExpression':
                case 'BinaryExpression':
                    data.isReturn = true;
                    data.isValidReturn = false;
                    if (this.findChromeExpression(expression.left, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    if (this.findChromeExpression(expression.right, this
                        .removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'BlockStatement':
                    data.isReturn = false;
                    for (var i = 0; i < expression.body.length; i++) {
                        if (this.findChromeExpression(expression.body[i], this
                            .removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'ReturnStatement':
                    data.isReturn = true;
                    data.returnExpr = expression;
                    data.isValidReturn = false;
                    return this.findChromeExpression(expression.argument, data, onError);
                case 'ObjectExpressions':
                    data.isReturn = true;
                    data.isValidReturn = false;
                    for (var i = 0; i < expression.properties.length; i++) {
                        if (this.findChromeExpression(expression.properties[i].value, this
                            .removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
            }
            return false;
        };
        ChromeCallsReplace.generateOnError = function (container) {
            return function (position, passes) {
                if (!container[passes]) {
                    container[passes] = [position];
                }
                else {
                    container[passes].push(position);
                }
            };
        };
        ChromeCallsReplace.replaceChromeCalls = function (lines, passes, onError) {
            var file = new window.TernFile('[doc]');
            file.text = lines.join('\n');
            var srv = new window.CodeMirror.TernServer({
                defs: [window.ecma5, window.ecma6, window.browserDefs]
            });
            window.tern.withContext(srv.cx, function () {
                file.ast = window.tern.parse(file.text, srv.passes, {
                    directSourceFile: file,
                    allowReturnOutsideFunction: true,
                    allowImportExportEverywhere: true,
                    ecmaVersion: srv.ecmaVersion
                });
            });
            var scriptExpressions = file.ast.body;
            var index = 0;
            var lineSeperators = [];
            for (var i = 0; i < lines.length; i++) {
                lineSeperators.push({
                    start: index,
                    end: index += lines[i].length + 1
                });
            }
            var script = file.text;
            var persistentData = {
                lines: lines,
                lineSeperators: lineSeperators,
                script: script,
                passes: passes
            };
            var expression;
            if (passes === 0) {
                persistentData.diagnostic = true;
                for (var i = 0; i < scriptExpressions.length; i++) {
                    expression = scriptExpressions[i];
                    this.findChromeExpression(expression, {
                        persistent: persistentData
                    }, onError);
                }
                persistentData.diagnostic = false;
            }
            for (var i = 0; i < scriptExpressions.length; i++) {
                expression = scriptExpressions[i];
                if (this.findChromeExpression(expression, {
                    persistent: persistentData
                }, onError)) {
                    script = this.replaceChromeCalls(persistentData.lines.join('\n')
                        .split('\n'), passes + 1, onError);
                    break;
                }
            }
            return script;
        };
        ChromeCallsReplace.removePositionDuplicates = function (arr) {
            var jsonArr = [];
            arr.forEach(function (item, index) {
                jsonArr[index] = JSON.stringify(item);
            });
            jsonArr = jsonArr.filter(function (item, pos) {
                return jsonArr.indexOf(item) === pos;
            });
            return jsonArr.map(function (item) {
                return JSON.parse(item);
            });
        };
        ChromeCallsReplace.replace = function (script, onError) {
            var lineIndex = script.indexOf('/*execute locally*/');
            if (lineIndex !== -1) {
                script = script.replace('/*execute locally*/\n', '');
                if (lineIndex === script.indexOf('/*execute locally*/')) {
                    script = script.replace('/*execute locally*/', '');
                }
            }
            var errors = [];
            try {
                script = this.replaceChromeCalls(script.split('\n'), 0, this.generateOnError(errors));
            }
            catch (e) {
                onError(null, null, true);
                return script;
            }
            var firstPassErrors = errors[0];
            var finalPassErrors = errors[errors.length - 1];
            if (finalPassErrors) {
                onError(this.removePositionDuplicates(firstPassErrors), this.removePositionDuplicates(finalPassErrors));
            }
            return script;
        };
        return ChromeCallsReplace;
    }()),
    _a);
CA.listeners = (function () {
    function CRMAppListeners() {
    }
    CRMAppListeners._toggleBugReportingTool = function () {
        window.errorReportingTool.toggleVisibility();
    };
    ;
    CRMAppListeners.toggleToolsRibbon = function () {
        if (window.app.storageLocal.hideToolsRibbon) {
            $(window.doc.editorToolsRibbonContainer).animate({
                marginLeft: 0
            }, 250);
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
        }
        else {
            $(window.doc.editorToolsRibbonContainer).animate({
                marginLeft: '-200px'
            }, 250);
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
        }
        window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
        window.app.upload();
    };
    ;
    CRMAppListeners.launchSearchWebsiteTool = function () {
        if (this.parent().item && this.parent().item.type === 'script' && window.scriptEdit) {
            var paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
            paperSearchWebsiteDialog.init();
            paperSearchWebsiteDialog.show();
        }
    };
    ;
    CRMAppListeners.launchExternalEditorDialog = function () {
        if (!window.doc.externalEditorDialogTrigger.disabled) {
            window.externalEditor.init();
            window.externalEditor.editingCRMItem =
                ((window.scriptEdit && window.scriptEdit.active) ?
                    window.scriptEdit.item : window.stylesheetEdit.item);
            window.externalEditor.setupExternalEditing();
        }
    };
    ;
    CRMAppListeners.runJsLint = function () {
        window.scriptEdit.editor.performLint();
    };
    ;
    CRMAppListeners.runCssLint = function () {
        window.stylesheetEdit.editor.performLint();
    };
    ;
    CRMAppListeners.showCssTips = function () {
        window.doc.cssEditorInfoDialog.open();
    };
    ;
    CRMAppListeners.showManagePermissions = function () {
        this.parent().requestPermissions([], true);
    };
    ;
    CRMAppListeners.iconSwitch = function (e, type) {
        var i;
        var crmEl;
        var selectedType = this.parent().crmType;
        if (typeof type === 'number') {
            for (i = 0; i < 6; i++) {
                crmEl = document.querySelectorAll('.crmType').item(i);
                if (i === type) {
                    crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                    crmEl.style.backgroundColor = 'rgb(243,243,243)';
                    crmEl.classList.add('toggled');
                    var child = document.createElement('div');
                    if (i === 5) {
                        child.classList.add('crmTypeShadowMagicElementRight');
                    }
                    else {
                        child.classList.add('crmTypeShadowMagicElement');
                    }
                    crmEl.appendChild(child);
                    selectedType = i;
                }
                else {
                    crmEl.style.boxShadow = 'none';
                    crmEl.style.backgroundColor = 'white';
                    crmEl.classList.remove('toggled');
                    $(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
                }
            }
        }
        else {
            var element = this.parent().util.findElementWithClassName(e.path, 'crmType');
            var crmTypes = document.querySelectorAll('.crmType');
            for (i = 0; i < 6; i++) {
                crmEl = crmTypes.item(i);
                if (crmEl === element) {
                    crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                    crmEl.style.backgroundColor = 'rgb(243,243,243)';
                    crmEl.classList.add('toggled');
                    var child = document.createElement('div');
                    if (i === 5) {
                        child.classList.add('crmTypeShadowMagicElementRight');
                    }
                    else {
                        child.classList.add('crmTypeShadowMagicElement');
                    }
                    crmEl.appendChild(child);
                    selectedType = i;
                }
                else {
                    crmEl.style.boxShadow = 'none';
                    crmEl.style.backgroundColor = 'white';
                    crmEl.classList.remove('toggled');
                    $(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
                }
            }
        }
        chrome.storage.local.set({
            selectedCrmType: selectedType
        });
        if (this.parent().crmType !== selectedType) {
            this.parent().crmType = selectedType;
            this.parent().fire('crmTypeChanged', {});
        }
    };
    ;
    CRMAppListeners._generateRegexFile = function () {
        var filePath = this.parent().$.URISchemeFilePath.querySelector('input').value.replace(/\\/g, '\\\\');
        var schemeName = this.parent().$.URISchemeSchemeName.querySelector('input').value;
        var regFile = [
            'Windows Registry Editor Version 5.00',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
            '@="URL:' + schemeName + ' Protocol"',
            '"URL Protocol"=""',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
            '@="\\"' + filePath + '\\""'
        ].join('\n');
        chrome.permissions.contains({
            permissions: ['downloads']
        }, function (hasPermission) {
            if (hasPermission) {
                chrome.downloads.download({
                    url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
                    filename: schemeName + '.reg'
                });
            }
            else {
                chrome.permissions.request({
                    permissions: ['downloads']
                }, function () {
                    chrome.downloads.download({
                        url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
                        filename: schemeName + '.reg'
                    });
                });
            }
        });
    };
    ;
    CRMAppListeners.globalExcludeChange = function (e) {
        var input = this.parent().util.findElementWithTagname(e.path, 'paper-input');
        var excludeIndex = null;
        var allExcludes = document.getElementsByClassName('globalExcludeContainer');
        for (var i = 0; i < allExcludes.length; i++) {
            if (allExcludes[i] === input.parentNode) {
                excludeIndex = i;
                break;
            }
        }
        if (excludeIndex === null) {
            return;
        }
        var value = input.value;
        this.parent().globalExcludes[excludeIndex] = value;
        this.parent().set('globalExcludes', this.parent().globalExcludes);
        chrome.storage.local.set({
            globalExcludes: this.parent().globalExcludes
        });
    };
    ;
    CRMAppListeners.removeGlobalExclude = function (e) {
        var node = this.parent().util.findElementWithTagname(e.path, 'paper-icon-button');
        var excludeIndex = null;
        var allExcludes = document.getElementsByClassName('globalExcludeContainer');
        for (var i = 0; i < allExcludes.length; i++) {
            if (allExcludes[i] === node.parentNode) {
                excludeIndex = i;
                break;
            }
        }
        if (excludeIndex === null) {
            return;
        }
        this.parent().splice('globalExcludes', excludeIndex, 1);
    };
    ;
    CRMAppListeners.importData = function () {
        var _this = this;
        var dataString = this.parent().$.importSettingsInput.value;
        if (!this.parent().$.oldCRMImport.checked) {
            var data = void 0;
            try {
                data = JSON.parse(dataString);
                this.parent().$.importSettingsError.style.display = 'none';
            }
            catch (e) {
                console.log(e);
                this.parent().$.importSettingsError.style.display = 'block';
                return;
            }
            var overWriteImport = this.parent().$.overWriteImport;
            if (overWriteImport.checked && (data.local || data.storageLocal)) {
                this.parent().settings = data.nonLocal || this.parent().settings;
                this.parent().storageLocal = data.local || this.parent().storageLocal;
            }
            if (data.crm) {
                if (overWriteImport.checked) {
                    this.parent().settings.crm = this.parent().util.crmForEach(data.crm, function (node) {
                        node.id = _this.parent().generateItemId();
                    });
                }
                else {
                    this.parent().addImportedNodes(data.crm);
                }
                this.parent().editCRM.build({
                    superquick: true
                });
            }
            this.parent().upload();
        }
        else {
            try {
                var settingsArr = dataString.split('%146%');
                if (settingsArr[0] === 'all') {
                    this.parent().storageLocal.showOptions = settingsArr[2];
                    var rows_1 = settingsArr.slice(6);
                    var LocalStorageWrapper = (function () {
                        function LocalStorageWrapper() {
                        }
                        LocalStorageWrapper.prototype.getItem = function (index) {
                            if (index === 'numberofrows') {
                                return '' + (rows_1.length - 1);
                            }
                            return rows_1[index];
                        };
                        return LocalStorageWrapper;
                    }());
                    var crm = this.parent().transferCRMFromOld(settingsArr[4], new LocalStorageWrapper());
                    this.parent().settings.crm = crm;
                    this.parent().editCRM.build({
                        superquick: true
                    });
                    this.parent().upload();
                }
                else {
                    alert('This method of importing no longer works, please export all your settings instead');
                }
            }
            catch (e) {
                console.log(e);
                this.parent().$.importSettingsError.style.display = 'block';
                return;
            }
        }
    };
    ;
    CRMAppListeners.exportData = function () {
        var _this = this;
        var toExport = {};
        if (this.parent().$.exportCRM.checked) {
            toExport.crm = JSON.parse(JSON.stringify(this.parent().settings.crm));
            for (var i = 0; i < toExport.crm.length; i++) {
                toExport.crm[i] = this.parent().editCRM.makeNodeSafe(toExport.crm[i]);
            }
        }
        if (this.parent().$.exportSettings.checked) {
            toExport.local = this.parent().storageLocal;
            toExport.nonLocal = JSON.parse(JSON.stringify(this.parent().settings));
            delete toExport.nonLocal.crm;
        }
        window.doc.exportSettingsSpinner.hide = false;
        window.setTimeout(function () {
            _this.parent().$.exportSettingsOutput.value = JSON.stringify(toExport);
            window.requestAnimationFrame(function () {
                window.doc.exportSettingsSpinner.hide = true;
            });
        }, 100);
    };
    ;
    CRMAppListeners.addGlobalExcludeField = function () {
        this.parent().push('globalExcludes', '');
    };
    ;
    CRMAppListeners._openLogging = function () {
        window.open(chrome.runtime.getURL('html/logging.html'), '_blank');
    };
    ;
    CRMAppListeners.hideGenericToast = function () {
        this.parent().$.messageToast.hide();
    };
    ;
    CRMAppListeners.nextUpdatedScript = function () {
        var index = this.parent().$.scriptUpdatesToast.index;
        this.parent().$.scriptUpdatesToast.text = this.parent()._getUpdatedScriptString(this.parent().$.scriptUpdatesToast.scripts[++index]);
        this.parent().$.scriptUpdatesToast.index = index;
        if (this.parent().$.scriptUpdatesToast.scripts.length - index > 1) {
            this.parent().$.nextScriptUpdateButton.style.display = 'inline';
        }
        else {
            this.parent().$.nextScriptUpdateButton.style.display = 'none';
        }
    };
    ;
    CRMAppListeners.hideScriptUpdatesToast = function () {
        this.parent().$.scriptUpdatesToast.hide();
    };
    ;
    CRMAppListeners.copyFromElement = function (target, button) {
        var snipRange = document.createRange();
        snipRange.selectNode(target);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(snipRange);
        try {
            document.execCommand('copy');
            button.icon = 'done';
        }
        catch (err) {
            console.error(err);
            button.icon = 'error';
        }
        this.parent().async(function () {
            button.icon = 'content-copy';
        }, 1000);
        selection.removeAllRanges();
    };
    CRMAppListeners.copyExportDialogToClipboard = function () {
        this.copyFromElement(this.parent().$.exportJSONData, this.parent().$.dialogCopyButton);
    };
    ;
    CRMAppListeners.copyExportToClipboard = function () {
        this.copyFromElement(this.parent().$.exportSettingsOutput, this.parent().$.exportCopyButton);
    };
    CRMAppListeners.goNextVersionUpdateTab = function () {
        if (this.parent().versionUpdateTab === 4) {
            this.parent().$.versionUpdateDialog.close();
        }
        else {
            var nextTabIndex_1 = this.parent().versionUpdateTab + 1;
            var tabs = document.getElementsByClassName('versionUpdateTab');
            var selector_1 = tabs[nextTabIndex_1];
            selector_1.style.height = 'auto';
            var i = void 0;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'none';
            }
            var newHeight = $(selector_1).innerHeight();
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'block';
            }
            selector_1.style.height = '0';
            var _this_1 = this;
            var newHeightPx_1 = newHeight + 'px';
            var tabCont_1 = this.parent().$.versionUpdateTabSlider;
            var currentHeight_1 = tabCont_1.getBoundingClientRect().height;
            if (newHeight > currentHeight_1) {
                tabCont_1.animate([
                    {
                        height: currentHeight_1 + 'px'
                    }, {
                        height: newHeightPx_1
                    }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }).onfinish = function () {
                    tabCont_1.style.height = newHeightPx_1;
                    selector_1.style.height = 'auto';
                    _this_1.parent().versionUpdateTab = nextTabIndex_1;
                };
            }
            else {
                selector_1.style.height = 'auto';
                _this_1.parent().versionUpdateTab = nextTabIndex_1;
                setTimeout(function () {
                    tabCont_1.animate([
                        {
                            height: currentHeight_1 + 'px'
                        }, {
                            height: newHeightPx_1
                        }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        tabCont_1.style.height = newHeightPx_1;
                    };
                }, 500);
            }
        }
    };
    CRMAppListeners.goPrevVersionUpdateTab = function () {
        if (this.parent().versionUpdateTab !== 0) {
            var prevTabIndex_1 = this.parent().versionUpdateTab - 1;
            var tabs = document.getElementsByClassName('versionUpdateTab');
            var selector_2 = tabs[prevTabIndex_1];
            selector_2.style.height = 'auto';
            var i = void 0;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'none';
            }
            var newHeight = $(selector_2).innerHeight();
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'block';
            }
            selector_2.style.height = '0';
            var _this_2 = this;
            var newHeightPx_2 = newHeight + 'px';
            var tabCont_2 = this.parent().$.versionUpdateTabSlider;
            var currentHeight_2 = tabCont_2.getBoundingClientRect().height;
            if (newHeight > currentHeight_2) {
                tabCont_2.animate([
                    {
                        height: currentHeight_2 + 'px'
                    }, {
                        height: newHeightPx_2
                    }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }).onfinish = function () {
                    tabCont_2.style.height = newHeightPx_2;
                    selector_2.style.height = 'auto';
                    _this_2.parent().versionUpdateTab = prevTabIndex_1;
                };
            }
            else {
                selector_2.style.height = 'auto';
                _this_2.parent().versionUpdateTab = prevTabIndex_1;
                setTimeout(function () {
                    tabCont_2.animate([
                        {
                            height: currentHeight_2 + 'px'
                        }, {
                            height: newHeightPx_2
                        }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        tabCont_2.style.height = newHeightPx_2;
                    };
                }, 500);
            }
        }
    };
    ;
    CRMAppListeners._applyAddedPermissions = function () {
        var _this = this;
        var panels = Array.prototype.slice.apply(window.doc.addedPermissionsTabContainer
            .querySelectorAll('.nodeAddedPermissionsCont'));
        panels.forEach(function (panel) {
            var node = _this.parent().nodesById[panel.getAttribute('data-id')];
            var permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
                .map(function (checkbox) {
                if (checkbox.checked) {
                    return checkbox.getAttribute('data-permission');
                }
                return null;
            }).filter(function (permission) {
                return !!permission;
            });
            if (!Array.isArray(node.permissions)) {
                node.permissions = [];
            }
            permissions.forEach(function (addedPermission) {
                if (node.permissions.indexOf(addedPermission) === -1) {
                    node.permissions.push(addedPermission);
                }
            });
        });
        this.parent().upload();
    };
    ;
    CRMAppListeners.addedPermissionNext = function () {
        var cont = window.doc.addedPermissionsTabContainer;
        if (cont.tab === cont.maxTabs - 1) {
            window.doc.addedPermissionsDialog.close();
            this._applyAddedPermissions();
            return;
        }
        if (cont.tab + 2 !== cont.maxTabs) {
            window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'none';
            window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'block';
        }
        else {
            window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'block';
            window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'none';
        }
        cont.style.marginLeft = (++cont.tab * -800) + 'px';
        window.doc.addedPermissionPrevButton.style.display = 'block';
    };
    ;
    CRMAppListeners.addedPermissionPrev = function () {
        var cont = window.doc.addedPermissionsTabContainer;
        cont.style.marginLeft = (--cont.tab * -800) + 'px';
        window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
    };
    ;
    CRMAppListeners._getCodeSettingsFromDialog = function () {
        var _this = this;
        var obj = {};
        Array.prototype.slice.apply(this.parent().querySelectorAll('.codeSettingSetting'))
            .forEach(function (element) {
            var value;
            var key = element.getAttribute('data-key');
            var type = element.getAttribute('data-type');
            var currentVal = _this.parent().$.codeSettingsDialog.item.value.options[key];
            switch (type) {
                case 'number':
                    value = _this.parent().templates.mergeObjects(currentVal, {
                        value: ~~element.querySelector('paper-input').value
                    });
                    break;
                case 'string':
                    value = _this.parent().templates.mergeObjects(currentVal, {
                        value: element.querySelector('paper-input').value
                    });
                    break;
                case 'boolean':
                    value = _this.parent().templates.mergeObjects(currentVal, {
                        value: element.querySelector('paper-checkbox').checked
                    });
                    break;
                case 'choice':
                    value = _this.parent().templates.mergeObjects(currentVal, {
                        selected: element.querySelector('paper-dropdown-menu').selected
                    });
                    break;
                case 'array':
                    var arrayInput = element.querySelector('paper-array-input');
                    arrayInput.saveSettings();
                    var values = arrayInput.values;
                    if (currentVal.items === 'string') {
                        values = values.map(function (value) { return value + ''; });
                    }
                    else {
                        values = values.map(function (value) { return ~~value; });
                    }
                    value = _this.parent().templates.mergeObjects(currentVal, {
                        value: values
                    });
                    break;
            }
            obj[key] = value;
        });
        return obj;
    };
    CRMAppListeners.confirmCodeSettings = function () {
        this.parent().$.codeSettingsDialog.item.value.options = this._getCodeSettingsFromDialog();
        this.parent().upload();
    };
    CRMAppListeners._getLocalStorageKey = function (key) {
        var data = localStorage.getItem(key);
        if (data === undefined || data === null) {
            return false;
        }
        return data;
    };
    ;
    CRMAppListeners.exportToLegacy = function () {
        var data = ["all", this._getLocalStorageKey('firsttime'),
            this._getLocalStorageKey('options'),
            this._getLocalStorageKey('firsttime'),
            this._getLocalStorageKey('firsttime'),
            this._getLocalStorageKey('firsttime'),
            localStorage.getItem('optionson'),
            localStorage.getItem('waitforsearch'),
            localStorage.getItem('whatpage'),
            localStorage.getItem('numberofrows')].join('%146%');
        var rows = localStorage.getItem('numberofrows') || 0;
        for (var i = 1; i <= rows; i++) {
            data += "%146%" + localStorage.getItem(i + '');
        }
        window.doc.exportToLegacyOutput.value = data;
    };
    ;
    CRMAppListeners.parent = function () {
        return window.app;
    };
    return CRMAppListeners;
}());
CA.templates = (function () {
    function CRMAppTemplates() {
    }
    CRMAppTemplates.mergeArrays = function (mainArray, additionArray) {
        for (var i = 0; i < additionArray.length; i++) {
            if (mainArray[i] && typeof additionArray[i] === 'object' &&
                mainArray[i] !== undefined && mainArray[i] !== null) {
                if (Array.isArray(additionArray[i])) {
                    mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
                }
                else {
                    mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
                }
            }
            else {
                mainArray[i] = additionArray[i];
            }
        }
        return mainArray;
    };
    ;
    CRMAppTemplates.mergeObjects = function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    typeof mainObject[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
        return mainObject;
    };
    ;
    CRMAppTemplates.mergeObjectsWithoutAssignment = function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        this.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        this.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
    };
    CRMAppTemplates.getDefaultNodeInfo = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNodeInfo = {
            permissions: [],
            installDate: new Date().toLocaleDateString(),
            lastUpdatedAt: Date.now(),
            version: '1.0',
            isRoot: false,
            source: 'local'
        };
        return this.mergeObjects(defaultNodeInfo, options);
    };
    ;
    CRMAppTemplates.getDefaultLinkNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'link',
            showOnSpecified: false,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [{
                    url: '*://*.example.com/*',
                    not: false
                }],
            isLocal: true,
            value: [
                {
                    newTab: true,
                    url: 'https://www.example.com'
                }
            ]
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultStylesheetValue = function (options) {
        if (options === void 0) { options = {}; }
        var value = {
            stylesheet: [].join('\n'),
            launchMode: 0,
            toggle: false,
            defaultOn: false,
            options: {},
            convertedStylesheet: null
        };
        return this.mergeObjects(value, options);
    };
    ;
    CRMAppTemplates.getDefaultScriptValue = function (options) {
        if (options === void 0) { options = {}; }
        var value = {
            launchMode: 0,
            backgroundLibraries: [],
            libraries: [],
            script: [].join('\n'),
            backgroundScript: '',
            metaTags: {},
            options: {}
        };
        return this.mergeObjects(value, options);
    };
    ;
    CRMAppTemplates.getDefaultScriptNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'script',
            isLocal: true,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: this.getDefaultScriptValue(options.value)
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultStylesheetNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'stylesheet',
            isLocal: true,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: this.getDefaultStylesheetValue(options.value)
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultDividerOrMenuNode = function (options, type) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            type: type,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            onContentTypes: [true, true, true, false, false, false],
            isLocal: true,
            value: null
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultDividerNode = function (options) {
        if (options === void 0) { options = {}; }
        return this.getDefaultDividerOrMenuNode(options, 'divider');
    };
    ;
    CRMAppTemplates.getDefaultMenuNode = function (options) {
        if (options === void 0) { options = {}; }
        return this.getDefaultDividerOrMenuNode(options, 'menu');
    };
    ;
    CRMAppTemplates.getPermissions = function () {
        return [
            'alarms',
            'activeTab',
            'background',
            'bookmarks',
            'browsingData',
            'clipboardRead',
            'clipboardWrite',
            'contentSettings',
            'cookies',
            'contentSettings',
            'contextMenus',
            'declarativeContent',
            'desktopCapture',
            'downloads',
            'history',
            'identity',
            'idle',
            'management',
            'pageCapture',
            'power',
            'privacy',
            'printerProvider',
            'sessions',
            'system.cpu',
            'system.memory',
            'system.storage',
            'topSites',
            'tabs',
            'tabCapture',
            'tts',
            'webNavigation',
            'webRequest',
            'webRequestBlocking'
        ];
    };
    ;
    CRMAppTemplates.getScriptPermissions = function () {
        return [
            'alarms',
            'activeTab',
            'background',
            'bookmarks',
            'browsingData',
            'clipboardRead',
            'clipboardWrite',
            'contentSettings',
            'cookies',
            'contentSettings',
            'contextMenus',
            'declarativeContent',
            'desktopCapture',
            'downloads',
            'history',
            'identity',
            'idle',
            'management',
            'pageCapture',
            'power',
            'privacy',
            'printerProvider',
            'sessions',
            'system.cpu',
            'system.memory',
            'system.storage',
            'topSites',
            'tabs',
            'tabCapture',
            'tts',
            'webNavigation',
            'webRequest',
            'webRequestBlocking',
            'crmGet',
            'crmWrite',
            'chrome',
            'GM_info',
            'GM_deleteValue',
            'GM_getValue',
            'GM_listValues',
            'GM_setValue',
            'GM_getResourceText',
            'GM_getResourceURL',
            'GM_addStyle',
            'GM_log',
            'GM_openInTab',
            'GM_registerMenuCommand',
            'GM_setClipboard',
            'GM_xmlhttpRequest',
            'unsafeWindow'
        ];
    };
    ;
    CRMAppTemplates.getPermissionDescription = function (permission) {
        var descriptions = {
            alarms: 'Makes it possible to create, view and remove alarms.',
            activeTab: 'Gives temporary access to the tab on which browserActions or contextmenu items are clicked',
            background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
            bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
            browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
            clipboardRead: 'Allows reading of the users\' clipboard',
            clipboardWrite: 'Allows writing data to the users\' clipboard',
            cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
            contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
            contextMenus: 'Allows for the changing of the chrome contextmenu',
            declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
            desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
            downloads: 'Allows for the creating, pausing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
            history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany times you visited given website. (https://developer.chrome.com/extensions/history)',
            identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
            idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
            management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. (https://developer.chrome.com/extensions/management)',
            notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
            pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
            power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
            privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature. (https://developer.chrome.com/extensions/privacy)',
            printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
            sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. (https://developer.chrome.com/extensions/sessions)',
            "system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
            "system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
            "system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. (https://developer.chrome.com/extensions/system_storage)',
            topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
            tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
            tabs: 'Allows for the opening, closing and getting of tabs',
            tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
            webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
                ' (https://developer.chrome.com/extensions/webNavigation)',
            webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
            webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',
            crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
            crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
            chrome: 'Allows the use of chrome API\'s. Without this permission only the \'crmGet\' and \'crmWrite\' permissions will work.',
            GM_addStyle: 'Allows the adding of certain styles to the document through this API',
            GM_deleteValue: 'Allows the deletion of storage items',
            GM_listValues: 'Allows the listing of all storage data',
            GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
            GM_removeValueChangeListener: 'Allows for the removing of listeners',
            GM_setValue: 'Allows for the setting of storage data values',
            GM_getValue: 'Allows the reading of values from the storage',
            GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
            GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
            GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
            GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
            GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
            GM_openInTab: 'Allows the opening of a tab with given URL',
            GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
            GM_download: 'Allows the downloading of data to the hard disk',
            GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
            GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
            GM_getTabs: 'Allows the reading of all tab object - not implemented',
            GM_notification: 'Allows sending desktop notifications',
            GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
            GM_info: 'Allows the reading of some script info',
            unsafeWindow: 'Allows the running on an unsafe window object - available by default'
        };
        return descriptions[permission];
    };
    ;
    CRMAppTemplates.parent = function () {
        return window.app;
    };
    return CRMAppTemplates;
}());
CA.pageDemo = (_b = (function () {
        function CRMAppPageDemo() {
        }
        CRMAppPageDemo.isNodeVisible = function (node, showContentType) {
            var i;
            var length;
            if (node.children && node.children.length > 0) {
                length = node.children.length;
                var visible = 0;
                for (i = 0; i < length; i++) {
                    visible += this.isNodeVisible(node.children[i], showContentType);
                }
                if (!visible) {
                    return 0;
                }
            }
            else {
                for (i = 0; i < 6; i++) {
                    if (showContentType === i && !node.onContentTypes[i]) {
                        return 0;
                    }
                }
            }
            return 1;
        };
        ;
        CRMAppPageDemo.buildForCrmType = function (crmType) {
            var _this = this;
            var index = {
                num: 0
            };
            var childItems = {};
            var crm = window.app.settings.crm;
            crm.forEach(function (node) {
                if (_this.isNodeVisible(node, crmType)) {
                    if (_this.parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
                        childItems[index.num++] = _this.node.editable(node);
                    }
                    else {
                        switch (node.type) {
                            case 'link':
                                childItems[index.num] = _this.node.link(node);
                                break;
                            case 'script':
                                childItems[index.num] = _this.node.script(node);
                                break;
                            case 'stylesheet':
                                childItems[index.num] = _this.node.stylesheet(node);
                                break;
                            case 'divider':
                                childItems[index.num] = _this.node.divider();
                                break;
                            case 'menu':
                                childItems[index.num] = _this.node.menu(node, crmType, index);
                                break;
                        }
                    }
                }
            });
            return childItems;
        };
        ;
        CRMAppPageDemo.getCrmTypeFromNumber = function (crmType) {
            var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
            return types[crmType];
        };
        ;
        CRMAppPageDemo.getChildrenAmount = function (object) {
            var children = 0;
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    children++;
                }
            }
            return children;
        };
        ;
        CRMAppPageDemo.bindContextMenu = function (crmType) {
            var items;
            var _this = this;
            if (crmType === 0) {
                items = _this.buildForCrmType(0);
                if (_this.getChildrenAmount(items) > 0) {
                    $.contextMenu({
                        selector: '.container, #editCrm.page, .crmType.pageType',
                        items: items
                    });
                }
            }
            else {
                var contentType = _this.getCrmTypeFromNumber(crmType);
                items = _this.buildForCrmType(crmType);
                if (_this.getChildrenAmount(items) > 0) {
                    $.contextMenu({
                        selector: '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type',
                        items: items
                    });
                }
            }
        };
        ;
        CRMAppPageDemo.removeContextMenus = function () {
            var el;
            this.usedStylesheetIds.forEach(function (id) {
                el = document.getElementById('stylesheet' + id);
                el && el.remove();
            });
            $.contextMenu('destroy');
        };
        ;
        CRMAppPageDemo.loadContextMenus = function () {
            var _this = this;
            var toLoad = 0;
            this.removeContextMenus();
            var callbackId;
            function loadContextMenus(deadline) {
                while (toLoad < 6 && deadline.timeRemaining() > 0) {
                    _this.bindContextMenu(toLoad++);
                    window.requestIdleCallback(loadContextMenus);
                }
            }
            if ('requestIdleCallback' in window) {
                callbackId = window.requestIdleCallback(loadContextMenus);
            }
            else {
                while (toLoad < 6) {
                    _this.bindContextMenu(toLoad++);
                }
            }
        };
        ;
        CRMAppPageDemo.create = function () {
            if (!$.contextMenu) {
                window.setTimeout(this.create.bind(this), 500);
                return;
            }
            if (this.parent().storageLocal.CRMOnPage &&
                ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] > 34) {
                this.loadContextMenus();
            }
            else {
                this.removeContextMenus();
            }
        };
        ;
        CRMAppPageDemo.parent = function () {
            return window.app;
        };
        return CRMAppPageDemo;
    }()),
    _b.usedStylesheetIds = [],
    _b.handlers = (_c = (function () {
            function CRMAppPageDemoHandlers() {
            }
            CRMAppPageDemoHandlers.link = function (data) {
                return function () {
                    for (var i = 0; i < data.length; i++) {
                        window.open(data[i].url, '_blank');
                    }
                };
            };
            ;
            CRMAppPageDemoHandlers.script = function (script) {
                return function () {
                    alert("This would run the script " + script);
                };
            };
            ;
            CRMAppPageDemoHandlers.edit = function (node) {
                var _this = this;
                return function () {
                    _this.parent().parent().editCRM.getCRMElementFromPath(node.path, true).openEditPage();
                };
            };
            ;
            CRMAppPageDemoHandlers.parent = function () {
                return window.app.pageDemo;
            };
            return CRMAppPageDemoHandlers;
        }()),
        _c.stylesheet = (function () {
            function CRMAppPageDemoHandlersStylesheet() {
            }
            CRMAppPageDemoHandlersStylesheet.toggle = function (data, checked) {
                var state = checked;
                return function () {
                    alert("This would toggle the stylesheet " + data + " " + (state ? 'on' : 'off'));
                };
            };
            ;
            CRMAppPageDemoHandlersStylesheet.normal = function (stylesheet) {
                return function () {
                    alert("This would run the stylesheet " + stylesheet);
                };
            };
            ;
            return CRMAppPageDemoHandlersStylesheet;
        }()),
        _c),
    _b.node = (function () {
        function CRMAppPageDemoNode() {
        }
        CRMAppPageDemoNode.link = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.link(toAdd.value)
            };
        };
        ;
        CRMAppPageDemoNode.script = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.script(toAdd.value.script)
            };
        };
        ;
        CRMAppPageDemoNode.stylesheet = function (toAdd) {
            var item = {
                name: toAdd.name
            };
            if (toAdd.value.toggle) {
                item.type = 'checkbox';
                item.selected = toAdd.value.defaultOn;
                item.callback = this.parent().handlers.stylesheet.toggle(toAdd.value.stylesheet, toAdd.value.defaultOn);
            }
            else {
                item.callback = this.parent().handlers.stylesheet.normal(toAdd.value.stylesheet);
            }
            return item;
        };
        ;
        CRMAppPageDemoNode.editable = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.edit(toAdd)
            };
        };
        ;
        CRMAppPageDemoNode.divider = function () {
            return '---------';
        };
        ;
        CRMAppPageDemoNode.menu = function (toAdd, crmType, index) {
            var _this = this;
            var item = {
                name: toAdd.name
            };
            var childItems = {};
            if (_this.parent().parent().storageLocal.editCRMInRM) {
                item.callback = this.parent().handlers.edit(toAdd);
            }
            toAdd.children.forEach(function (node) {
                if (_this.parent().isNodeVisible(node, crmType)) {
                    if (_this.parent().parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
                        childItems[index.num++] = _this.editable(node);
                    }
                    else {
                        switch (node.type) {
                            case 'link':
                                childItems[index.num++] = _this.link(node);
                                break;
                            case 'script':
                                childItems[index.num++] = _this.script(node);
                                break;
                            case 'stylesheet':
                                childItems[index.num++] = _this.stylesheet(node);
                                break;
                            case 'divider':
                                childItems[index.num++] = _this.divider();
                                break;
                            case 'menu':
                                childItems[index.num++] = _this.menu(node, crmType, index);
                                break;
                        }
                    }
                }
            });
            item.items = childItems;
            return item;
        };
        ;
        CRMAppPageDemoNode.parent = function () {
            return window.app.pageDemo;
        };
        return CRMAppPageDemoNode;
    }()),
    _b);
CA.crm = (function () {
    function CRMAppCRMFunctions() {
    }
    CRMAppCRMFunctions._getEvalPath = function (path) {
        return 'window.app.settings.crm[' + (path.join('].children[')) + ']';
    };
    ;
    CRMAppCRMFunctions.lookup = function (path, returnArray) {
        if (returnArray === void 0) { returnArray = false; }
        var pathCopy = JSON.parse(JSON.stringify(path));
        if (returnArray) {
            pathCopy.splice(pathCopy.length - 1, 1);
        }
        if (path.length === 0) {
            return window.app.settings.crm;
        }
        if (path.length === 1) {
            return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
        }
        var evalPath = this._getEvalPath(pathCopy);
        var result = eval(evalPath);
        return (returnArray ? result.children : result);
    };
    ;
    CRMAppCRMFunctions._lookupId = function (id, returnArray, node) {
        var nodeChildren = node.children;
        if (nodeChildren) {
            var el = void 0;
            for (var i = 0; i < nodeChildren.length; i++) {
                if (nodeChildren[i].id === id) {
                    return (returnArray ? nodeChildren : node);
                }
                el = this._lookupId(id, returnArray, nodeChildren[i]);
                if (el) {
                    return el;
                }
            }
        }
        return null;
    };
    ;
    CRMAppCRMFunctions.lookupId = function (id, returnArray) {
        if (!returnArray) {
            return window.app.nodesById[id];
        }
        var el;
        for (var i = 0; i < window.app.settings.crm.length; i++) {
            if (window.app.settings.crm[i].id === id) {
                return window.app.settings.crm;
            }
            el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
            if (el) {
                return el;
            }
        }
        return null;
    };
    ;
    CRMAppCRMFunctions.add = function (value, position) {
        if (position === void 0) { position = 'last'; }
        if (position === 'first') {
            this.parent().settings.crm = this.parent().util.insertInto(value, this.parent().settings.crm, 0);
        }
        else if (position === 'last' || position === undefined) {
            this.parent().settings.crm[this.parent().settings.crm.length] = value;
        }
        else {
            this.parent().settings.crm = this.parent().util.insertInto(value, this.parent().settings.crm);
        }
        window.app.upload();
        window.app.editCRM.build({
            setItems: window.app.editCRM.setMenus,
            superquick: true
        });
    };
    ;
    CRMAppCRMFunctions.move = function (toMove, target, sameColumn) {
        var toMoveContainer = this.lookup(toMove, true);
        var toMoveIndex = toMove[toMove.length - 1];
        var toMoveItem = toMoveContainer[toMoveIndex];
        var newTarget = this.lookup(target, true);
        var targetIndex = target[target.length - 1];
        if (sameColumn && toMoveIndex > targetIndex) {
            this.parent().util.insertInto(toMoveItem, newTarget, targetIndex);
            toMoveContainer.splice((~~toMoveIndex) + 1, 1);
        }
        else {
            this.parent().util.insertInto(toMoveItem, newTarget, targetIndex);
            toMoveContainer.splice(toMoveIndex, 1);
        }
        window.app.upload();
        window.app.editCRM.build({
            setItems: window.app.editCRM.setMenus,
            quick: true
        });
    };
    ;
    CRMAppCRMFunctions.parent = function () {
        return window.app;
    };
    return CRMAppCRMFunctions;
}());
CA.util = (function () {
    function CRMAppUtil() {
    }
    CRMAppUtil.waitFor = function (rootObj, key, fn) {
        if (rootObj[key]) {
            fn(rootObj[key]);
        }
        var interval = window.setInterval(function () {
            if (rootObj[key]) {
                window.clearInterval(interval);
                fn(rootObj[key]);
            }
        }, 10);
    };
    CRMAppUtil.createElement = function (tagName, options, children) {
        if (children === void 0) { children = []; }
        var el = document.createElement(tagName);
        if (options.id) {
            el.id = options.id;
        }
        if (options.classes) {
            el.classList.add.apply(el.classList, options.classes);
        }
        if (options.props) {
            for (var key in options.props) {
                el.setAttribute(key, options.props[key]);
            }
        }
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (typeof child === 'string') {
                el.innerText = child;
            }
            else {
                el.appendChild(child);
            }
        }
        return el;
    };
    CRMAppUtil.findElementWithTagname = function (path, tagName) {
        var index = 0;
        var node = path[0];
        while (node.tagName.toLowerCase() !== tagName) {
            node = path[++index];
            if (index > path.length) {
                return null;
            }
        }
        return node;
    };
    CRMAppUtil.findElementWithClassName = function (path, className) {
        var index = 0;
        var node = path[0];
        while (!node.classList.contains(className)) {
            node = path[++index];
            if (index > path.length) {
                return null;
            }
        }
        return node;
    };
    CRMAppUtil.insertInto = function (toAdd, target, position) {
        if (position === void 0) { position = null; }
        if (position) {
            var temp1 = void 0, i = void 0;
            var temp2 = toAdd;
            for (i = position; i < target.length; i++) {
                temp1 = target[i];
                target[i] = temp2;
                temp2 = temp1;
            }
            target[i] = temp2;
        }
        else {
            target.push(toAdd);
        }
        return target;
    };
    ;
    CRMAppUtil.compareObj = function (firstObj, secondObj) {
        if (!secondObj) {
            return !firstObj;
        }
        if (!firstObj) {
            return false;
        }
        for (var key in firstObj) {
            if (firstObj.hasOwnProperty(key)) {
                if (typeof firstObj[key] === 'object') {
                    if (typeof secondObj[key] !== 'object') {
                        return false;
                    }
                    if (Array.isArray(firstObj[key])) {
                        if (!Array.isArray(secondObj[key])) {
                            return false;
                        }
                        if (!this.compareArray(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                    else if (Array.isArray(secondObj[key])) {
                        return false;
                    }
                    else {
                        if (!this.compareObj(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                }
                else if (firstObj[key] !== secondObj[key]) {
                    return false;
                }
            }
        }
        return true;
    };
    ;
    CRMAppUtil.compareArray = function (firstArray, secondArray) {
        if (!firstArray !== !secondArray) {
            return false;
        }
        else if (!firstArray || !secondArray) {
            return false;
        }
        var firstLength = firstArray.length;
        if (firstLength !== secondArray.length) {
            return false;
        }
        var i;
        for (i = 0; i < firstLength; i++) {
            if (typeof firstArray[i] === 'object') {
                if (typeof secondArray[i] !== 'object') {
                    return false;
                }
                if (Array.isArray(firstArray[i])) {
                    if (!Array.isArray(secondArray[i])) {
                        return false;
                    }
                    if (!this.compareArray(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
                else if (Array.isArray(secondArray[i])) {
                    return false;
                }
                else {
                    if (!this.compareObj(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
            }
            else if (firstArray[i] !== secondArray[i]) {
                return false;
            }
        }
        return true;
    };
    CRMAppUtil.treeForEach = function (node, fn) {
        fn(node);
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                this.treeForEach(node.children[i], fn);
            }
        }
    };
    CRMAppUtil.crmForEach = function (tree, fn) {
        for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            if (node.type === 'menu' && node.children) {
                this.crmForEach(node.children, fn);
            }
            fn(node);
        }
        return tree;
    };
    ;
    CRMAppUtil.parent = function () {
        return window.app;
    };
    return CRMAppUtil;
}());
;
Polymer(CA);
var _a, _b, _c;
