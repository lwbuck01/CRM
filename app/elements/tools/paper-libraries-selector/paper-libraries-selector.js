"use strict";
var paperLibrariesSelectorProperties = {
    usedlibraries: {
        type: Array,
        notify: true
    },
    libraries: {
        type: Array,
        notify: true
    },
    selected: {
        type: Array,
        notify: true
    },
    installedLibraries: {
        type: Array
    },
    mode: {
        type: String,
        value: 'main'
    }
};
var PLS = (function () {
    function PLS() {
    }
    PLS.ready = function () {
        var _this = this;
        window.paperLibrariesSelector = this;
        chrome.storage.local.get('libraries', function (keys) {
            if (keys.libraries) {
                _this.installedLibraries = keys.libraries;
            }
            else {
                _this.installedLibraries = [];
                chrome.storage.local.set({
                    libaries: _this.installedLibraries
                });
            }
        });
        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (areaName === 'local' && changes['libraries']) {
                _this.installedLibraries = changes['libraries'].newValue;
            }
        });
    };
    ;
    PLS.sortByName = function (first, second) {
        return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
    };
    PLS.categorizeLibraries = function () {
        var anonymous = [];
        var selectedObj = {};
        this.usedlibraries.forEach(function (item) {
            if (item.name === null) {
                anonymous.push(item);
            }
            else {
                selectedObj[item.name.toLowerCase()] = true;
            }
        });
        return {
            anonymous: anonymous,
            selectedObj: selectedObj
        };
    };
    PLS.getLibraries = function (selectedObj) {
        var libraries = [];
        this.installedLibraries.forEach(function (item) {
            var itemCopy = {};
            itemCopy.name = item.name;
            itemCopy.isLibrary = true;
            itemCopy.url = item.url;
            if (selectedObj[item.name.toLowerCase()]) {
                itemCopy.classes = 'library iron-selected';
                itemCopy.selected = 'true';
            }
            else {
                itemCopy.classes = 'library';
                itemCopy.selected = 'false';
            }
            libraries.push(itemCopy);
        });
        libraries.sort(this.sortByName);
        return libraries;
    };
    PLS.setSelectedLibraries = function (libraries) {
        var selected = [];
        libraries.forEach(function (item, index) {
            if (item.selected === 'true') {
                selected.push(index);
            }
        });
        this.selected = selected;
    };
    PLS.init = function () {
        var _this = this;
        if (this._expanded) {
            this.close();
        }
        var _a = this.categorizeLibraries(), anonymous = _a.anonymous, selectedObj = _a.selectedObj;
        var libraries = this.getLibraries(selectedObj);
        this.setSelectedLibraries(libraries);
        var anonymousLibraries = [];
        anonymous.forEach(function (item) {
            var itemCopy = {
                isLibrary: true,
                name: item.url + " (anonymous)",
                classes: 'library iron-selected anonymous',
                selected: 'true'
            };
            anonymousLibraries.push(itemCopy);
        });
        anonymousLibraries.sort(this.sortByName);
        libraries = libraries.concat(anonymousLibraries);
        libraries.push({
            name: 'Add your own',
            classes: 'library addLibrary',
            selected: 'false',
            isLibrary: false
        });
        _this.libraries = libraries;
    };
    ;
    PLS.resetAfterAddDesision = function () {
        window.doc.addLibraryConfirmAddition.removeEventListener('click');
        window.doc.addLibraryDenyConfirmation.removeEventListener('click');
        window.doc.addLibraryUrlInput.removeAttribute('invalid');
    };
    PLS.confirmLibraryFile = function (_this, name, code, url) {
        window.doc.addLibraryProcessContainer.style.display = 'none';
        window.doc.addLibraryLoadingDialog.style.display = 'flex';
        setTimeout(function () {
            window.doc.addLibraryConfirmationInput.value = code;
            window.doc.addLibraryConfirmAddition.addEventListener('click', function () {
                window.doc.addLibraryConfirmationInput.value = '';
                _this.addLibraryFile(_this, name, code, url);
                _this.resetAfterAddDesision();
            });
            window.doc.addLibraryDenyConfirmation.addEventListener('click', function () {
                window.doc.addLibraryConfirmationContainer.style.display = 'none';
                window.doc.addLibraryProcessContainer.style.display = 'block';
                _this.resetAfterAddDesision();
                window.doc.addLibraryConfirmationInput.value = '';
            });
            window.doc.addLibraryLoadingDialog.style.display = 'none';
            window.doc.addLibraryConfirmationContainer.style.display = 'block';
        }, 250);
    };
    ;
    PLS.addLibraryToState = function (_this, name, code, url) {
        _this.installedLibraries.push({
            name: name,
            code: code,
            url: url
        });
        _this.usedlibraries.push({
            name: name,
            url: url
        });
    };
    PLS.hideElements = function () {
        var els = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            els[_i] = arguments[_i];
        }
        for (var i = 0; i < els.length; i++) {
            window.doc[els[i]].style.display = 'none';
        }
    };
    PLS.showElements = function () {
        var els = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            els[_i] = arguments[_i];
        }
        for (var i = 0; i < els.length; i++) {
            window.doc[els[i]].style.display = 'block';
        }
    };
    PLS.addLibraryFile = function (_this, name, code, url) {
        if (url === void 0) { url = null; }
        window.doc.addLibraryConfirmationContainer.style.display = 'none';
        window.doc.addLibraryLoadingDialog.style.display = 'flex';
        setTimeout(function () {
            _this.addLibraryToState(_this, name, code, url);
            chrome.storage.local.set({
                libraries: _this.installedLibraries
            });
            if (_this.mode === 'main' && url !== null) {
                window.scriptEdit.editor.addMetaTags(window.scriptEdit.editor, 'require', url);
            }
            chrome.runtime.sendMessage({
                type: 'updateStorage',
                data: {
                    type: 'libraries',
                    libraries: _this.installedLibraries
                }
            });
            _this.splice('libraries', _this.libraries.length - 1, 0, {
                name: name,
                classes: 'library iron-selected',
                selected: 'true',
                isLibrary: 'true'
            });
            var dropdownContainer = $(_this).find('.content');
            dropdownContainer.animate({
                height: dropdownContainer[0].scrollHeight
            }, {
                duration: 250,
                easing: 'easeInCubic'
            });
            _this.hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer', 'addLibraryProcessContainer', 'addLibraryDialogSuccesCheckmark');
            _this.showElements('addLibraryDialogSucces');
            $(window.doc.addLibraryDialogSucces).animate({
                backgroundColor: 'rgb(38,153,244)'
            }, {
                duration: 300,
                easing: 'easeOutCubic',
                complete: function () {
                    _this.showElements('addLibraryDialogSuccesCheckmark');
                    window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
                    setTimeout(function () {
                        window.doc.addLibraryDialog.toggle();
                        _this.hideElements('addLibraryDialogSucces');
                        _this.showElements('addLibraryLoadingDialog');
                    }, 2500);
                }
            });
            var contentEl = _this.$$('paper-menu').querySelector('.content');
            contentEl.style.height +=
                (~~contentEl.style.height.split('px')[0] + 48) + 'px';
            _this.init();
        }, 250);
    };
    ;
    PLS.addNewLibrary = function () {
        var _this = this;
        window.doc.addedLibraryName.querySelector('input').value = '';
        window.doc.addLibraryUrlInput.querySelector('input').value = '';
        window.doc.addLibraryManualInput.querySelector('textarea').value = '';
        this.showElements('addLibraryProcessContainer');
        this.hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer', 'addLibraryDialogSucces');
        window.doc.addedLibraryName.invalid = false;
        window.doc.addLibraryDialog.open();
        $(window.doc.addLibraryDialog)
            .find('#addLibraryButton')
            .on('click', function () {
            var name = window.doc.addedLibraryName.querySelector('input').value;
            var taken = false;
            for (var i = 0; i < _this.installedLibraries.length; i++) {
                if (_this.installedLibraries[i].name === name) {
                    taken = true;
                }
            }
            if (name !== '' && !taken) {
                _this.removeAttribute('invalid');
                if (window.doc.addLibraryRadios.selected === 'url') {
                    var libraryInput_1 = window.doc.addLibraryUrlInput;
                    var url_1 = libraryInput_1.querySelector('input').value;
                    if (url_1[0] === '/' && url_1[1] === '/') {
                        url_1 = 'http:' + url_1;
                    }
                    $.ajax({
                        url: url_1,
                        dataType: 'html'
                    }).done(function (data) {
                        _this.confirmLibraryFile(_this, name, data, url_1);
                    }).fail(function () {
                        libraryInput_1.setAttribute('invalid', 'true');
                    });
                }
                else {
                    _this.addLibraryFile(_this, name, window.doc.addLibraryManualInput.querySelector('textarea').value);
                }
            }
            else {
                if (taken) {
                    window.doc.addedLibraryName.errorMessage = 'That name is already taken';
                }
                else {
                    window.doc.addedLibraryName.errorMessage = 'Please enter a name';
                }
                window.doc.addedLibraryName.invalid = true;
            }
        });
    };
    PLS.addAnonymousLibrary = function (e) {
        var url = e.target.getAttribute('data-url');
        if (this.mode === 'main') {
            window.scriptEdit.editor.removeMetaTags(window.scriptEdit.editor, 'require', url);
        }
        chrome.runtime.sendMessage({
            type: 'anonymousLibrary',
            data: {
                type: 'remove',
                name: url,
                url: url,
                scriptId: window.app.scriptItem.id
            }
        });
    };
    PLS.handleCheckmarkClick = function (e) {
        var lib = e.target.dataLib;
        var changeType = (e.target.classList.contains('iron-selected') ? 'removeMetaTags' : 'addMetaTags');
        if (lib.url) {
            window.scriptEdit.editor[changeType](window.scriptEdit.editor, 'require', lib.url);
        }
        if (changeType === 'addMetaTags') {
            window.scriptEdit.newSettings.value.libraries.push({
                name: lib.name || null,
                url: lib.url
            });
        }
        else {
            var index = -1;
            for (var i = 0; i < window.scriptEdit.newSettings.value.libraries.length; i++) {
                if (window.scriptEdit.newSettings.value.libraries[i].url === lib.url &&
                    window.scriptEdit.newSettings.value.libraries[i].name === lib.name) {
                    index = i;
                    break;
                }
            }
            window.scriptEdit.newSettings.value.libraries.splice(index, 1);
        }
    };
    PLS._click = function (e) {
        var _this = this;
        if (e.target.classList.contains('addLibrary')) {
            this.addNewLibrary();
        }
        else if (e.target.classList.contains('anonymous')) {
            this.addAnonymousLibrary(e);
        }
        else if (_this.mode === 'main') {
            this.handleCheckmarkClick(e);
        }
    };
    ;
    PLS.updateLibraries = function (libraries, mode) {
        if (mode === void 0) { mode = 'main'; }
        this.set('usedlibraries', libraries);
        this.mode = mode;
        this.init();
    };
    ;
    return PLS;
}());
PLS.is = 'paper-libraries-selector';
PLS.properties = paperLibrariesSelectorProperties;
PLS.behaviors = [Polymer.PaperDropdownBehavior];
Polymer(PLS);
