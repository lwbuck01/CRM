"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var webdriver = require("selenium-webdriver");
require('mocha-steps');
var secrets = require('./UI/secrets');
var request = require('request');
var btoa = require('btoa');
var assert = chai.assert;
var driver;
var capabilities;
switch (__filename.split('-').pop().split('.')[0]) {
    case '1':
        capabilities = {
            'browserName': 'Chrome',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
        break;
    default:
        capabilities = {
            'browserName': 'Chrome',
            'browser_version': '26.0',
            'os': 'Windows',
            'os_version': '8',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
        break;
}
var timeModifier = 1.2;
before('Driver connect', function (done) {
    this.timeout(600000 * timeModifier);
    var result = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
    var called = false;
    function callDone() {
        if (!called) {
            called = true;
            done();
        }
    }
    result.get('http://localhost:1234/test/UI/UITest.html#noClear-test').then(function () {
        driver = result;
        var timer = setInterval(function () {
            driver.executeScript(inlineFn(function () {
                return window.polymerElementsLoaded;
            })).then(function (loaded) {
                if (loaded) {
                    clearInterval(timer);
                    callDone();
                }
            });
        }, 2500);
    });
});
var sentIds = [];
function getRandomId() {
    var id;
    do {
        id = ~~(Math.random() * 10000);
    } while (sentIds.indexOf(id) > -1);
    sentIds.push(id);
    return id;
}
var templates = {
    mergeArrays: function (mainArray, additionArray) {
        for (var i = 0; i < additionArray.length; i++) {
            if (mainArray[i] &&
                typeof additionArray[i] === 'object' &&
                mainArray[i] !== undefined &&
                mainArray[i] !== null) {
                if (Array.isArray(additionArray[i])) {
                    mainArray[i] = templates.mergeArrays(mainArray[i], additionArray[i]);
                }
                else {
                    mainArray[i] = templates.mergeObjects(mainArray[i], additionArray[i]);
                }
            }
            else {
                mainArray[i] = additionArray[i];
            }
        }
        return mainArray;
    },
    mergeObjects: function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        mainObject[key] = templates.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        mainObject[key] = templates.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
        return mainObject;
    },
    getDefaultNodeInfo: function (options) {
        var defaultNodeInfo = {
            permissions: [],
            source: {}
        };
        return templates.mergeObjects(defaultNodeInfo, options);
    },
    getDefaultLinkNode: function (options) {
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'link',
            showOnSpecified: false,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            isLocal: true,
            value: [
                {
                    newTab: true,
                    url: 'https://www.example.com'
                }
            ]
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultStylesheetValue: function (options) {
        var value = {
            stylesheet: [].join('\n'),
            launchMode: 0,
            options: {},
        };
        return templates.mergeObjects(value, options);
    },
    getDefaultScriptValue: function (options) {
        var value = {
            launchMode: 0,
            backgroundLibraries: [],
            libraries: [],
            script: [].join('\n'),
            backgroundScript: '',
            options: {},
            metaTags: {}
        };
        return templates.mergeObjects(value, options);
    },
    getDefaultScriptNode: function (options) {
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'script',
            isLocal: true,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: templates.getDefaultScriptValue(options.value)
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultStylesheetNode: function (options) {
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'stylesheet',
            isLocal: true,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: templates.getDefaultStylesheetValue(options.value)
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultDividerOrMenuNode: function (options, type) {
        var defaultNode = {
            name: 'name',
            type: type,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            onContentTypes: [true, true, true, false, false, false],
            isLocal: true,
            value: {}
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultDividerNode: function (options) {
        return templates.getDefaultDividerOrMenuNode(options, 'divider');
    },
    getDefaultMenuNode: function (options) {
        return templates.getDefaultDividerOrMenuNode(options, 'menu');
    }
};
function findElementOnPage(selector) {
    var list = JSON.parse(selector);
    var el = document.body;
    for (var i = 0; i < list.length; i++) {
        el = el.querySelectorAll(list[i][0])[list[i][1]];
    }
    return el;
}
function checkIfListContainsElement(element) {
    var keys = Object.getOwnPropertyNames(element);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(0, 2) === '__' && element[keys[i]] !== null) {
            return keys[i];
        }
    }
    throw new Error('Could not find element');
}
function quote(str) {
    return "'" + str + "'";
}
function inlineFn(fn, args) {
    var insertedFunctions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        insertedFunctions[_i - 2] = arguments[_i];
    }
    args = args || {};
    var str = insertedFunctions.map(function (inserted) { return inserted.toString(); }).join('\n') + "\n\t\t\ttry { return (" + fn.toString() + ")(arguments) } catch(err) { throw new Error(err.name + '-' + err.stack); }";
    Object.getOwnPropertyNames(args).forEach(function (key) {
        var arg = args[key];
        if (typeof arg === 'object' || typeof arg === 'function') {
            arg = JSON.stringify(arg);
        }
        if (typeof arg === 'string' && arg.split('\n').length > 1) {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "' + " + JSON.stringify(arg.split('\n')) + ".join('\\n') + '");
        }
        else {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), arg !== undefined &&
                arg !== null && typeof arg === 'string' ?
                arg.replace(/\\\"/g, "\\\\\"") : arg);
        }
    });
    return str;
}
function getSyncSettings(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings);
        }))
            .then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getCRM(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings.crm);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getContextMenu(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.chrome._currentContextMenu[0].children);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function saveDialog(dialog) {
    return dialog
        .findElement(webdriver.By.id('saveButton'))
        .click();
}
function cancelDialog(dialog) {
    return dialog
        .findElement(webdriver.By.id('cancelButton'))
        .click();
}
function getDialog(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        findElement(driver, webdriver.By.tagName(type + "-edit")).then(function (element) {
            setTimeout(function () {
                resolve(element);
            }, 500);
        });
    });
}
function generatePromiseChain(data, fn, index, resolve) {
    if (index !== data.length) {
        fn(data[index]).then(function () {
            generatePromiseChain(data, fn, index + 1, resolve);
        });
    }
    else {
        resolve(null);
    }
}
function forEachPromise(data, fn) {
    return new webdriver.promise.Promise(function (resolve) {
        generatePromiseChain(data, fn, 0, resolve);
    });
}
function getRandomString(length) {
    return new Array(length).join(' ').split(' ').map(function () {
        var randomNum = ~~(Math.random() * 62);
        if (randomNum <= 10) {
            return String(randomNum);
        }
        else if (randomNum < 36) {
            return String.fromCharCode(randomNum + 87);
        }
        else {
            return String.fromCharCode(randomNum + 29);
        }
    }).join('');
}
function resetSettings(_this, driver, done) {
    _this.timeout(30000 * timeModifier);
    var promise = new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            try {
                window.chrome.storage.local.clear();
                window.chrome.storage.sync.clear();
                window.app.refreshPage();
                return null;
            }
            catch (e) {
                return {
                    message: e.message,
                    stack: e.stack
                };
            }
        })).then(function (e) {
            if (e) {
                console.log(e);
                throw e;
            }
            return wait(driver, 1500);
        }).then(function () {
            resolve(null);
        });
    });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
function reloadPage(_this, driver, done) {
    _this.timeout(60000 * timeModifier);
    var promise = new webdriver.promise.Promise(function (resolve) {
        wait(driver, 500).then(function () {
            driver.executeScript(inlineFn(function () {
                try {
                    window.app.refreshPage();
                    return null;
                }
                catch (e) {
                    return {
                        message: e.message,
                        stack: e.stack
                    };
                }
            })).then(function (e) {
                if (e) {
                    console.log(e);
                    throw e;
                }
                return wait(driver, 1000);
            }).then(function () {
                resolve(null);
            });
        });
    });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
function waitForCRM(driver, timeRemaining) {
    return new webdriver.promise.Promise(function (resolve, reject) {
        if (timeRemaining <= 0) {
            reject(null);
            return;
        }
        driver.executeScript(inlineFn(function () {
            var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
            return !!crmItem;
        })).then(function (result) {
            if (result) {
                resolve(null);
            }
            else {
                setTimeout(function () {
                    waitForCRM(driver, timeRemaining - 250).then(resolve, reject);
                }, 250);
            }
        });
    });
}
function switchToTypeAndOpen(driver, type, done) {
    waitForCRM(driver, 4000).then(function () {
        return driver.executeScript(inlineFn(function () {
            var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
            crmItem.querySelector('type-switcher').changeType('REPLACE.type');
        }, {
            type: type
        }));
    }, function () {
        throw new Error('edit-crm-item element could not be found');
    }).then(function () {
        return wait(driver, 100);
    }).then(function () {
        return driver.executeScript(inlineFn(function () {
            (document.getElementsByTagName('edit-crm-item').item(0)).openEditPage();
        }));
    }).then(function () {
        return wait(driver, 500);
    }).then(function () {
        done();
    });
}
function openDialog(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        if (type === 'link') {
            driver.executeScript(inlineFn(function () {
                (document.getElementsByTagName('edit-crm-item').item(0)).openEditPage();
            })).then(function () {
                wait(driver, 1000).then(resolve);
            });
        }
        else {
            switchToTypeAndOpen(driver, type, resolve);
        }
    });
}
function wait(driver, time, resolveParam) {
    return driver.wait(new webdriver.promise.Promise(function (resolve) {
        setTimeout(function () {
            if (resolveParam) {
                resolve(resolveParam);
            }
            else {
                resolve(null);
            }
        }, time);
    }));
}
var FoundElementPromise = (function () {
    function FoundElementPromise(resolver, opt_flow) {
        this.promise = new webdriver.promise.Promise(resolver);
    }
    FoundElementPromise.prototype.then = function (opt_callback, opt_errback) {
        if (opt_callback) {
            if (opt_errback) {
                return this.promise.then(opt_callback, opt_errback);
            }
            return this.promise.then(opt_callback);
        }
        return this.promise.then();
    };
    FoundElementPromise.prototype.click = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.click().then(function () {
                    resolve(undefined);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElement = function (by) {
        var _this = this;
        return new FoundElementPromise(function (resolve) {
            _this.promise.then(function (element) {
                element.findElement(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElements = function (by) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.findElements(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.sendKeys.apply(element, args).then(function () {
                    resolve(undefined);
                });
            });
        });
    };
    FoundElementPromise.prototype.getAttribute = function (attr) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getAttribute(attr).then(function (value) {
                    resolve(value);
                });
            });
        });
    };
    FoundElementPromise.prototype.getProperty = function (prop) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getProperty(prop).then(function (value) {
                    resolve(value);
                });
            });
        });
    };
    FoundElementPromise.prototype.getSize = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getSize().then(function (size) {
                    resolve(size);
                });
            });
        });
    };
    FoundElementPromise.all = function (promises) {
        return new webdriver.promise.Promise(function (resolve) {
            var states = promises.map(function (promise, index) {
                promise.then(function (result) {
                    states[index].done = true;
                    states[index].result = result;
                    if (states.filter(function (state) {
                        return !state.done;
                    }).length === 0) {
                        resolve(states.map(function (state) {
                            return state.result;
                        }));
                    }
                });
                return {
                    promise: promise,
                    done: false
                };
            });
        });
    };
    return FoundElementPromise;
}());
var FoundElement = (function () {
    function FoundElement(selector, index, driver, parent) {
        if (parent === void 0) { parent = null; }
        this.selector = selector;
        this.index = index;
        this.driver = driver;
        this.parent = parent;
    }
    FoundElement.prototype.click = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                findElementOnPage('REPLACE.selector').click();
            }, {
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (e) {
                e && console.log(e);
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.findElement = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new FoundElementPromise(function (resolve, reject) {
            _this.driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector')
                    .querySelector('REPLACE.css');
                if (el === null) {
                    return 'null';
                }
                return 'exists';
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (index) {
                if (index === 'null') {
                    reject(null);
                }
                else {
                    resolve(new FoundElement(css, 0, driver, _this));
                }
            });
        });
    };
    FoundElement.prototype.findElements = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var elList = findElementOnPage('REPLACE.selector').querySelectorAll('REPLACE.css');
                return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
                    if (element === null) {
                        return 'null';
                    }
                    return 'exists';
                }));
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage, checkIfListContainsElement)).then(function (indexes) {
                resolve(JSON.parse(indexes).map(function (found, index) {
                    if (found === 'exists') {
                        return new FoundElement(css, index, driver, _this);
                    }
                    return null;
                }).filter(function (item) { return item !== null; }));
            });
        });
    };
    FoundElement.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            return webdriver.promise.all(args.map(function (arg) {
                if (webdriver.promise.isPromise(arg)) {
                    return arg;
                }
                return new webdriver.promise.Promise(function (instantResolve) {
                    instantResolve(arg);
                });
            })).then(function (keys) {
                var selectorList = [[_this.selector, _this.index]];
                var currentElement = _this;
                while (currentElement.parent) {
                    currentElement = currentElement.parent;
                    selectorList.push([currentElement.selector, currentElement.index]);
                }
                return new webdriver.promise.Promise(function (sentKeysResolve) {
                    _this.driver.executeScript(inlineFn(function (REPLACE) {
                        var el = findElementOnPage('REPLACE.selector');
                        var keyPresses = REPLACE.keypresses;
                        var currentValue = el.value || '';
                        for (var i = 0; i < keyPresses.length; i++) {
                            switch (keyPresses[i]) {
                                case 0:
                                    currentValue = '';
                                    break;
                                case 1:
                                    currentValue = currentValue.slice(0, -1);
                                    break;
                                default:
                                    currentValue += keyPresses[i];
                                    break;
                            }
                        }
                        el.value = currentValue;
                    }, {
                        selector: JSON.stringify(selectorList.reverse()),
                        keypresses: keys
                    }, findElementOnPage)).then(function () {
                        sentKeysResolve(undefined);
                    });
                });
            }).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.getProperty = function (prop) {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector');
                var val = el['REPLACE.prop'];
                return JSON.stringify(val);
            }, {
                selector: JSON.stringify(selectorList.reverse()),
                prop: prop
            }, findElementOnPage)).then(function (value) {
                resolve(JSON.parse(value));
            });
        });
    };
    FoundElement.prototype.getAttribute = function (attr) {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function (REPLACE) {
                var el = findElementOnPage('REPLACE.selector');
                var attr = el.getAttribute(REPLACE.attr);
                return attr === undefined || attr === null ?
                    el[REPLACE.attr] : attr;
            }, {
                selector: selectorList.reverse(),
                attr: quote(attr)
            }, findElementOnPage)).then(function (value) {
                resolve(value);
            });
        });
    };
    FoundElement.prototype.getSize = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var bcr = findElementOnPage('REPLACE.selector').getBoundingClientRect();
                return JSON.stringify({
                    bottom: bcr.bottom,
                    height: bcr.height,
                    left: bcr.left,
                    right: bcr.right,
                    top: bcr.top,
                    width: bcr.width
                });
            }, {
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (bcr) {
                resolve(JSON.parse(bcr));
            });
        });
    };
    return FoundElement;
}());
function locatorToCss(by) {
    switch (by.using) {
        case 'className':
            return "." + by.value;
        case 'css selector':
            return by.value;
        case 'id':
            return "#" + by.value;
        case 'linkText':
            return "*[href=" + by.value + "]";
        case 'name':
            return "*[name=\"" + by.value + "\"]";
        case 'tagName':
            return by.value;
        default:
        case 'js':
        case 'xpath':
        case 'partialLinkText':
            throw new Error('Not implemented');
    }
}
function findElement(driver, by) {
    var selector = locatorToCss(by);
    return new FoundElementPromise(function (resolve, reject) {
        driver.executeScript(inlineFn(function () {
            var elContainer = document.querySelector('REPLACE.css');
            if (elContainer === null) {
                return 'null';
            }
            return 'exists';
        }, {
            css: selector
        })).then(function (found) {
            if (found === 'exists') {
                resolve(new FoundElement(selector, 0, driver));
            }
            else {
                reject(null);
            }
        });
    });
}
function findElements(driver, by) {
    var selector = locatorToCss(by);
    return driver.executeScript(inlineFn(function () {
        var elList = document.querySelectorAll('REPLACE.css');
        return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
            if (element === null) {
                return 'null';
            }
            return 'exists';
        }));
    }, {
        css: selector
    })).then(function (indexes) {
        return new webdriver.promise.Promise(function (resolve) {
            resolve(JSON.parse(indexes).map(function (exists, index) {
                if (exists === 'exists') {
                    return new FoundElement(selector, index, driver);
                }
                return null;
            }).filter(function (item) { return item !== null; }));
        });
    });
}
function getTypeName(index) {
    switch (index) {
        case 1:
            return 'link';
        case 2:
            return 'selection';
        case 3:
            return 'image';
        case 4:
            return 'video';
        case 5:
            return 'audio';
        default:
        case 0:
            return 'page';
    }
}
function prepareTrigger(url) {
    if (url === '<all_urls>') {
        return url;
    }
    if (url.replace(/\s/g, '') === '') {
        return null;
    }
    var newTrigger;
    if (url.split('//')[1].indexOf('/') === -1) {
        newTrigger = url + '/';
    }
    else {
        newTrigger = url;
    }
    return newTrigger;
}
function sanitizeUrl(url) {
    if (url.indexOf('://') === -1) {
        url = "http://" + url;
    }
    return url;
}
function subtractStrings(biggest, smallest) {
    return biggest.slice(smallest.length);
}
function getEditorValue(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function (REPLACE) {
            return window[(REPLACE.editor)].editor.getValue();
        }, {
            editor: quote(type === 'script' ? 'scriptEdit' : 'stylesheetEdit'),
        })).then(function (value) {
            resolve(value);
        });
    });
}
function getCRMNames(crm) {
    return crm.map(function (node) {
        return {
            name: node.name,
            children: (node.children && node.children.length > 0)
                ? getCRMNames(node.children) : undefined
        };
    });
}
function getContextMenuNames(contextMenu) {
    return contextMenu.map(function (item) {
        return {
            name: item.currentProperties.title,
            children: (item.children && item.children.length > 0)
                ? getContextMenuNames(item.children) : undefined
        };
    });
}
function assertContextMenuEquality(contextMenu, CRMNodes) {
    try {
        assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes), 'structures match');
    }
    catch (e) {
        assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes).concat([{
                children: undefined,
                name: undefined
            }, {
                children: undefined,
                name: 'Options'
            }]), 'structures match');
    }
}
function enterEditorFullscreen(_this, driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        resetSettings(_this, driver).then(function () {
            return openDialog(driver, type);
        }).then(function () {
            return getDialog(driver, type);
        }).then(function (dialog) {
            return wait(driver, 500, dialog);
        }).then(function (dialog) {
            return dialog
                .findElement(webdriver.By.id('editorFullScreen'))
                .click()
                .then(function () {
                return wait(driver, 500);
            }).then(function () {
                resolve(dialog);
            });
        });
    });
}
describe('Options Page', function () {
    describe('Loading', function () {
        this.timeout(60000 * timeModifier);
        this.slow(60000);
        it('should happen without errors', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? window.lastError : 'noError';
            })).then(function (result) {
                assert.ifError(result !== 'noError' ? result : false, 'no errors should be thrown when loading');
                done();
            });
        });
    });
    describe('CheckboxOptions', function () {
        var _this = this;
        this.timeout(5000 * timeModifier);
        this.slow(4000);
        var checkboxDefaults = {
            catchErrors: true,
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: true,
            useStorageSync: true
        };
        if (capabilities.browser_version && ~~capabilities.browser_version.split('.')[0] <= 34) {
            delete checkboxDefaults.CRMOnPage;
        }
        Object.getOwnPropertyNames(checkboxDefaults).forEach(function (checkboxId, index) {
            it(checkboxId + " should be clickable", function (done) {
                reloadPage(_this, driver).then(function () {
                    findElement(driver, webdriver.By.css("#" + checkboxId + " paper-checkbox"))
                        .then(function (element) {
                        return element.click();
                    }).then(function () {
                        return driver.executeScript(inlineFn(function (REPLACE) {
                            return JSON.stringify({
                                match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                                checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
                            });
                        }, {
                            checkboxId: checkboxId,
                            expected: !checkboxDefaults[checkboxId]
                        }));
                    }).then(function (result) {
                        var resultObj = JSON.parse(result);
                        assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId], 'checkbox checked status matches expected');
                        assert.strictEqual(resultObj.match, true, "checkbox " + checkboxId + " value reflects settings value");
                        done();
                    });
                });
            });
            it(checkboxId + " should be saved", function (done) {
                reloadPage(this, driver).then(function () {
                    return driver
                        .executeScript(inlineFn(function (REPLACE) {
                        return JSON.stringify({
                            match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                            checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
                        });
                    }, {
                        checkboxId: checkboxId,
                        expected: !checkboxDefaults[checkboxId]
                    }));
                })
                    .then(function (result) {
                    var resultObj = JSON.parse(result);
                    assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId], 'checkbox checked status has been saved');
                    assert.strictEqual(resultObj.match, true, "checkbox " + checkboxId + " value has been saved");
                    done();
                });
            });
        });
    });
    describe('Commonly used links', function () {
        this.timeout(15000 * timeModifier);
        this.slow(10000);
        var searchEngineLink = '';
        var defaultLinkName = '';
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        it('should be addable, renamable and saved', function (done) {
            var _this = this;
            this.retries(3);
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                searchEngineLink = link;
                                defaultLinkName = name;
                                var element = crm[crm.length - 1];
                                assert.strictEqual(name, element.name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                var renameName = 'SomeName';
                                findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                                    elements[0].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                                        elements[0].findElement(webdriver.By.tagName('input')).sendKeys(0, renameName).then(function () {
                                            return button.click();
                                        }).then(function () {
                                            elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                                                getCRM(driver).then(function (crm) {
                                                    var element = crm[crm.length - 1];
                                                    assert.strictEqual(element.name, renameName, 'name is the same as expected');
                                                    assert.strictEqual(element.type, 'link', 'type of element is link');
                                                    assert.isArray(element.value, 'element value is array');
                                                    assert.lengthOf(element.value, 1, 'element has one child');
                                                    assert.isDefined(element.value[0], 'first element is defined');
                                                    assert.isObject(element.value[0], 'first element is an object');
                                                    assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                                    assert.isTrue(element.value[0].newTab, 'newTab is true');
                                                    reloadPage(_this, driver).then(function () {
                                                        return getCRM(driver);
                                                    })
                                                        .then(function (crm) {
                                                        var element = crm[crm.length - 2];
                                                        assert.isDefined(element, 'element is defined');
                                                        assert.strictEqual(element.name, defaultLinkName, 'name is the same as expected');
                                                        assert.strictEqual(element.type, 'link', 'type of element is link');
                                                        assert.isArray(element.value, 'element value is array');
                                                        assert.lengthOf(element.value, 1, 'element has one child');
                                                        assert.isDefined(element.value[0], 'first element is defined');
                                                        assert.isObject(element.value[0], 'first element is an object');
                                                        assert.strictEqual(element.value[0].url, searchEngineLink, 'value url is the same as expected');
                                                        assert.isTrue(element.value[0].newTab, 'newTab is true');
                                                        var element2 = crm[crm.length - 1];
                                                        assert.isDefined(element2, 'element is defined');
                                                        assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                                                        assert.strictEqual(element2.type, 'link', 'type of element is link');
                                                        assert.isArray(element2.value, 'element value is array');
                                                        assert.lengthOf(element2.value, 1, 'element has one child');
                                                        assert.isDefined(element2.value[0], 'first element is defined');
                                                        assert.isObject(element2.value[0], 'first element is an object');
                                                        assert.strictEqual(element2.value[0].url, searchEngineLink, 'value url is the same as expected');
                                                        assert.isTrue(element2.value[0].newTab, 'newTab is true');
                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('SearchEngines', function () {
        this.timeout(150000 * timeModifier);
        this.slow(10000);
        var searchEngineLink = '';
        var searchEngineName = '';
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        it('should be addable, renamable and should be saved', function (done) {
            var _this = this;
            this.retries(3);
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                var index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                var element = crm[crm.length - 1];
                                searchEngineLink = link;
                                searchEngineName = name;
                                assert.strictEqual(element.name, name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'script', 'type of element is script');
                                assert.isObject(element.value, 'element value is object');
                                assert.property(element.value, 'script', 'value has script property');
                                assert.isString(element.value.script, 'script is a string');
                                assert.strictEqual(element.value.script, '' +
                                    'var query;\n' +
                                    'var url = "' + link + '";\n' +
                                    'if (crmAPI.getSelection()) {\n' +
                                    '	query = crmAPI.getSelection();\n' +
                                    '} else {\n' +
                                    '	query = window.prompt(\'Please enter a search query\');\n' +
                                    '}\n' +
                                    'if (query) {\n' +
                                    '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                    '}', 'script1 value matches expected');
                                var renameName = 'SomeName';
                                findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                                    var index = elements.length - 1;
                                    elements[index].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                                        elements[index].findElement(webdriver.By.tagName('input')).sendKeys(0, renameName).then(function () {
                                            return button.click();
                                        }).then(function () {
                                            elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                                                getCRM(driver).then(function (crm) {
                                                    var element = crm[crm.length - 1];
                                                    assert.strictEqual(renameName, element.name, 'name is the same as expected');
                                                    assert.strictEqual(element.type, 'script', 'type of element is script');
                                                    assert.isObject(element.value, 'element value is object');
                                                    assert.property(element.value, 'script', 'value has script property');
                                                    assert.isString(element.value.script, 'script is a string');
                                                    assert.strictEqual(element.value.script, '' +
                                                        'var query;\n' +
                                                        'var url = "' + link + '";\n' +
                                                        'if (crmAPI.getSelection()) {\n' +
                                                        '	query = crmAPI.getSelection();\n' +
                                                        '} else {\n' +
                                                        '	query = window.prompt(\'Please enter a search query\');\n' +
                                                        '}\n' +
                                                        'if (query) {\n' +
                                                        '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                                        '}', 'script value matches expected');
                                                    reloadPage(_this, driver).then(function () {
                                                        return getCRM(driver);
                                                    })
                                                        .then(function (crm) {
                                                        var element1 = crm[crm.length - 2];
                                                        assert.isDefined(element1, 'element is defined');
                                                        assert.strictEqual(element1.name, searchEngineName, 'name is the same as expected');
                                                        assert.strictEqual(element1.type, 'script', 'type of element is script');
                                                        assert.isObject(element1.value, 'element value is object');
                                                        assert.property(element1.value, 'script', 'value has script property');
                                                        assert.isString(element1.value.script, 'script is a string');
                                                        assert.strictEqual(element1.value.script, '' +
                                                            'var query;\n' +
                                                            'var url = "' + searchEngineLink + '";\n' +
                                                            'if (crmAPI.getSelection()) {\n' +
                                                            '	query = crmAPI.getSelection();\n' +
                                                            '} else {\n' +
                                                            '	query = window.prompt(\'Please enter a search query\');\n' +
                                                            '}\n' +
                                                            'if (query) {\n' +
                                                            '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                                            '}', 'script value matches expected');
                                                        var element2 = crm[crm.length - 1];
                                                        assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                                                        assert.strictEqual(element2.type, 'script', 'type of element is script');
                                                        assert.isObject(element2.value, 'element value is object');
                                                        assert.property(element2.value, 'script', 'value has script property');
                                                        assert.isString(element2.value.script, 'script is a string');
                                                        assert.strictEqual(element2.value.script, '' +
                                                            'var query;\n' +
                                                            'var url = "' + searchEngineLink + '";\n' +
                                                            'if (crmAPI.getSelection()) {\n' +
                                                            '	query = crmAPI.getSelection();\n' +
                                                            '} else {\n' +
                                                            '	query = window.prompt(\'Please enter a search query\');\n' +
                                                            '}\n' +
                                                            'if (query) {\n' +
                                                            '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                                            '}', 'script2 value matches expected');
                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('URIScheme', function () {
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        this.slow(5000);
        this.timeout(7500 * timeModifier);
        function testURIScheme(driver, done, toExecutePath, schemeName) {
            findElement(driver, webdriver.By.className('URISchemeGenerator'))
                .findElement(webdriver.By.tagName('paper-button'))
                .click()
                .then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._lastCall);
                }));
            }).then(function (jsonStr) {
                var lastCall = JSON.parse(jsonStr);
                assert.isDefined(lastCall, 'a call to the chrome API was made');
                assert.strictEqual(lastCall.api, 'downloads.download', 'chrome downloads API was called');
                assert.isArray(lastCall.args, 'api args are present');
                assert.lengthOf(lastCall.args, 1, 'api has only one arg');
                assert.strictEqual(lastCall.args[0].url, 'data:text/plain;charset=utf-8;base64,' + btoa([
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
                    '@="\\"' + toExecutePath.replace(/\\/g, '\\\\') + '\\""'
                ].join('\n')), 'file content matches expected');
                assert.strictEqual(lastCall.args[0].filename, schemeName + '.reg', 'filename matches expected');
                done();
            });
        }
        afterEach('Reset page settings', function () {
            return resetSettings(this, driver);
        });
        var defaultToExecutePath = 'C:\\files\\my_file.exe';
        var defaultSchemeName = 'myscheme';
        it('should be able to download the default file', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = defaultSchemeName;
            testURIScheme(driver, done, toExecutePath, schemeName);
        });
        it('should be able to download when a different file path was entered', function (done) {
            var toExecutePath = 'somefile.a.b.c';
            var schemeName = defaultSchemeName;
            findElement(driver, webdriver.By.id('URISchemeFilePath'))
                .sendKeys(0, toExecutePath)
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name was entered', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = getRandomString(25);
            findElement(driver, webdriver.By.id('URISchemeSchemeName'))
                .sendKeys(0, schemeName).then(function () {
                return findElement(driver, webdriver.By.id('URISchemeFilePath'));
            }).then(function (element) {
                return element.sendKeys(0, toExecutePath);
            }).then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name and a different file path are entered', function (done) {
            var toExecutePath = 'somefile.x.y.z';
            var schemeName = getRandomString(25);
            findElement(driver, webdriver.By.id('URISchemeFilePath'))
                .sendKeys(0, toExecutePath)
                .then(function () {
                return findElement(driver, webdriver.By.id('URISchemeSchemeName'));
            }).then(function (element) {
                return element.sendKeys(0, schemeName);
            }).then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
    });
    function testNameInput(type) {
        var defaultName = 'name';
        describe('Name Input', function () {
            this.timeout(10000 * timeModifier);
            this.slow(10000);
            it('should not change when not saved', function (done) {
                before('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                var name = getRandomString(25);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .sendKeys(0, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.strictEqual(crm[0].type, type, "type is " + type);
                        assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                        done();
                    });
                });
            });
            var name = getRandomString(25);
            it('should be editable when saved', function (done) {
                before('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .sendKeys(0, name)
                        .then(function (res) {
                        return wait(driver, 300);
                    }).then(function () {
                        return saveDialog(dialog);
                    }).then(function () {
                        return wait(driver, 300);
                    }).then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, type, 'type is link');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPage(this, driver)
                    .then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, type, "type is " + type);
                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                    done();
                });
            });
        });
    }
    function testVisibilityTriggers(type) {
        describe('Triggers', function () {
            var _this = this;
            this.timeout(15000 * timeModifier);
            this.slow(12000);
            it('should not change when not saved', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            dialog
                                .findElements(webdriver.By.className('executionTrigger'))
                                .then(function (triggers) {
                                return triggers[0]
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    return triggers[0]
                                        .sendKeys(0, 'www.google.com');
                                })
                                    .then(function () {
                                    return triggers[1]
                                        .sendKeys(0, 'www.google.com');
                                });
                            }).then(function () {
                                return cancelDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                done();
                            });
                        }, 500);
                    });
                });
            });
            it('should be addable/editable when saved', function (done) {
                resetSettings(_this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            dialog
                                .findElements(webdriver.By.className('executionTrigger'))
                                .then(function (triggers) {
                                return triggers[0]
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    return triggers[1]
                                        .findElement(webdriver.By.tagName('paper-input'))
                                        .sendKeys(0, 'http://www.google.com');
                                });
                            }).then(function () {
                                return saveDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                assert.strictEqual(crm[0].triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                                done();
                            });
                        }, 500);
                    });
                });
            });
            it('should be preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return wait(driver, 500);
                }).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                    assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                    assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                    assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                    assert.strictEqual(crm[0].triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                    done();
                });
            });
        });
    }
    function testContentTypes(type) {
        describe('Content Types', function () {
            this.timeout(30000 * timeModifier);
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            it('should be editable through clicking on the checkboxes', function (done) {
                this.retries(3);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                .click()
                                .then(function () {
                                return wait(driver, 25);
                            });
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        newContentTypes[2] = true;
                        newContentTypes = crm[0].onContentTypes;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be editable through clicking on the icons', function (done) {
                this.retries(3);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.className('showOnContentItemIcon'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        newContentTypes[2] = true;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be editable through clicking on the names', function (done) {
                this.retries(3);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.className('showOnContentItemTxt'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        newContentTypes[2] = true;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                    var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                    newContentTypes[2] = true;
                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                    done();
                });
            });
            it('should not change when not saved', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].onContentTypes[0], 'content types that were on did not change');
                        assert.isFalse(crm[0].onContentTypes[4], 'content types that were off did not change');
                        assert.deepEqual(crm[0].onContentTypes, defaultContentTypes, 'all content types were not toggled');
                        done();
                    });
                });
            });
        });
    }
    function testClickTriggers(type) {
        describe('Click Triggers', function () {
            this.timeout(30000 * timeModifier);
            this.slow(25000);
            [0, 1, 2, 3, 4].forEach(function (triggerOptionIndex) {
                describe("Trigger option " + triggerOptionIndex, function () {
                    this.retries(3);
                    it("should be possible to select trigger option number " + triggerOptionIndex, function (done) {
                        resetSettings(this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 5000);
                            }).then(function () {
                                return saveDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                                done();
                            });
                        });
                    });
                    it('should be saved on page reload', function (done) {
                        reloadPage(this, driver).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1500);
                            }).then(function () {
                                return cancelDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.strictEqual(crm[0].value.launchMode, 0, 'launchmode is the same as before');
                                done();
                            });
                        });
                    });
                });
            });
            [2, 3].forEach(function (triggerOptionIndex) {
                describe("Trigger Option " + triggerOptionIndex + " with URLs", function () {
                    var _this = this;
                    it('should be editable', function (done) {
                        resetSettings(_this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElement(webdriver.By.id('addTrigger'))
                                    .then(function (button) {
                                    return button.click().then(function () {
                                        return button.click();
                                    });
                                });
                            }).then(function () {
                                setTimeout(function () {
                                    dialog
                                        .findElements(webdriver.By.className('executionTrigger'))
                                        .then(function (triggers) {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return triggers[1]
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return saveDialog(dialog);
                                    }).then(function () {
                                        return getCRM(driver);
                                    }).then(function (crm) {
                                        assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                        assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                        assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                                        done();
                                    });
                                }, 500);
                            });
                        });
                    });
                    it('should be saved on page reload', function (done) {
                        getCRM(driver).then(function (crm) {
                            assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                            assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                            assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                            assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                            assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(_this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElement(webdriver.By.id('addTrigger'))
                                    .then(function (button) {
                                    return button.click().then(function () {
                                        return button.click();
                                    });
                                });
                            }).then(function () {
                                setTimeout(function () {
                                    dialog
                                        .findElements(webdriver.By.className('executionTrigger'))
                                        .then(function (triggers) {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return triggers[1]
                                                .sendKeys(0, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return cancelDialog(dialog);
                                    }).then(function () {
                                        return getCRM(driver);
                                    }).then(function (crm) {
                                        assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                        assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        done();
                                    });
                                }, 500);
                            });
                        });
                    });
                });
            });
        });
    }
    function testEditorSettings(type) {
        describe('Theme', function () {
            this.slow(8000);
            this.timeout(10000 * timeModifier);
            it('is changable', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorThemeSettingWhite'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
        });
        describe('Zoom', function () {
            this.slow(30000);
            this.timeout(40000 * timeModifier);
            var newZoom = '135';
            it('is changable', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .then(function (editorSettings) {
                        editorSettings
                            .click()
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return dialog
                                .findElement(webdriver.By.id('editorThemeFontSizeInput'))
                                .findElement(webdriver.By.tagName('input'))
                                .sendKeys(1, 1, 1, newZoom);
                        }).then(function () {
                            return driver.executeScript(inlineFn(function () {
                                (window.app.item.type === 'stylesheet' ?
                                    window.stylesheetEdit :
                                    window.scriptEdit)._updateZoomEl();
                            }));
                        }).then(function () {
                            return wait(driver, 10000, dialog);
                        });
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
        });
        describe('UseTabs', function () {
            this.slow(10000);
            this.timeout(12000 * timeModifier);
            it('is changable', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabsOrSpacesCheckbox'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
        });
        describe('Tab Size', function () {
            this.slow(15000);
            this.timeout(20000 * timeModifier);
            this.retries(3);
            var newTabSize = '8';
            it('is changable and preserved on page reload', function (done) {
                var _this = this;
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabSizeInput'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(1, 1, newTabSize)
                            .then(function () {
                            return driver.executeScript(inlineFn(function () {
                                (window.app.item.type === 'stylesheet' ?
                                    window.stylesheetEdit :
                                    window.scriptEdit)._updateTabSizeEl();
                            }));
                        });
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, ~~newTabSize, 'tab size has changed to the correct number');
                    reloadPage(_this, driver).then(function () {
                        return getSyncSettings(driver);
                    }).then(function (settings) {
                        assert.strictEqual(settings.editor.tabSize, ~~newTabSize, 'tab size has changed to the correct number');
                        done();
                    });
                });
            });
        });
    }
    describe('CRM Editing', function () {
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        this.timeout(60000 * timeModifier);
        describe('Type Switching', function () {
            function testTypeSwitch(driver, type, done) {
                driver.executeScript(inlineFn(function () {
                    var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                    crmItem.typeIndicatorMouseOver();
                })).then(function () {
                    return wait(driver, 300);
                }).then(function () {
                    return driver.executeScript(inlineFn(function () {
                        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                        var typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.openTypeSwitchContainer();
                    }));
                    ;
                }).then(function () {
                    return wait(driver, 300);
                }).then(function () {
                    return driver.executeScript(inlineFn(function () {
                        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                        var typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                            .click();
                        return window.app.settings.crm[0].type === 'REPLACE.type';
                    }, {
                        type: type
                    }));
                }).then(function (typesMatch) {
                    assert.isTrue(typesMatch, 'new type matches expected');
                    done();
                });
            }
            this.timeout(10000 * timeModifier);
            this.slow(5000);
            it('should be able to switch to a script', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'script', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a menu', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'menu', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a divider', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'divider', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a stylesheet', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'stylesheet', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
                    done();
                });
            });
        });
        describe('Link Dialog', function () {
            var type = 'link';
            this.timeout(30000 * timeModifier);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
            describe('Links', function () {
                this.slow(20000);
                this.timeout(25000 * timeModifier);
                after('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                it('open in new tab property should be editable', function (done) {
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click()
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                            assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
                            done();
                        });
                    });
                });
                it('url property should be editable', function (done) {
                    var newUrl = 'www.google.com';
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('paper-input'))
                            .sendKeys(0, newUrl)
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                            assert.strictEqual(crm[0].value[0].url, newUrl, 'url has been changed');
                            done();
                        });
                    });
                });
                it('should be addable', function (done) {
                    var defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                            assert.deepEqual(crm[0].value, Array.apply(null, Array(4)).map(function () { return defaultLink; }), 'new links match default link value');
                            done();
                        });
                    });
                });
                it('should be editable when newly added', function (done) {
                    var newUrl = 'www.google.com';
                    var newValue = {
                        newTab: true,
                        url: newUrl
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return dialog
                                .findElements(webdriver.By.className('linkChangeCont'));
                        })
                            .then(function (elements) {
                            return forEachPromise(elements, function (element) {
                                return new webdriver.promise.Promise(function (resolve) {
                                    setTimeout(function () {
                                        element
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return element
                                                .findElement(webdriver.By.tagName('paper-input'))
                                                .sendKeys(0, newUrl);
                                        }).then(function () {
                                            resolve(null);
                                        });
                                    }, 250);
                                });
                            });
                        })
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                            var newLinks = Array.apply(null, Array(4))
                                .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                            newLinks[3].newTab = false;
                            assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                            done();
                        });
                    });
                });
                it('should be preserved on page reload', function (done) {
                    var newUrl = 'www.google.com';
                    var newValue = {
                        newTab: true,
                        url: newUrl
                    };
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                        var newLinks = Array.apply(null, Array(4))
                            .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                        newLinks[3].newTab = false;
                        assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                        done();
                    });
                });
                it('should not change when not saved', function (done) {
                    var newUrl = 'www.google.com';
                    var defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return dialog
                                .findElements(webdriver.By.className('linkChangeCont'));
                        })
                            .then(function (elements) {
                            return forEachPromise(elements, function (element) {
                                return element
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    return element
                                        .sendKeys(0, newUrl);
                                });
                            });
                        })
                            .then(function () {
                            return cancelDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
                            assert.deepEqual(crm[0].value, [defaultLink], 'link value has stayed the same');
                            done();
                        });
                    });
                });
            });
        });
        describe('Divider Dialog', function () {
            var type = 'divider';
            this.timeout(60000 * timeModifier);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Menu Dialog', function () {
            var type = 'menu';
            this.timeout(60000 * timeModifier);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Stylesheet Dialog', function () {
            var type = 'stylesheet';
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            describe('Toggling', function () {
                var _this = this;
                this.timeout(15000 * timeModifier);
                this.slow(7500);
                it('should be possible to toggle on', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                            done();
                        });
                    });
                });
                it('should be saved on page reload', function (done) {
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                        done();
                    });
                });
                it('should be possible to toggle on-off', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click()
                                .then(function () {
                                return slider
                                    .click();
                            });
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                            done();
                        });
                    });
                });
                it('should not be saved on cancel', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return cancelDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
                            done();
                        });
                    });
                });
            });
            describe('Default State', function () {
                var _this = this;
                this.slow(7500);
                this.timeout(10000 * timeModifier);
                it('should be togglable to true', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should be saved on page reset', function (done) {
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                        done();
                    });
                });
                it('should be togglable to false', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click()
                                .then(function () {
                                return slider.click();
                            });
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should not be saved when cancelled', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return cancelDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
                            assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
                            done();
                        });
                    });
                });
            });
            describe('Editor', function () {
                describe('Settings', function () {
                    testEditorSettings(type);
                });
            });
        });
        describe('Script Dialog', function () {
            var type = 'script';
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            describe('Editor', function () {
                describe('Settings', function () {
                    testEditorSettings(type);
                });
                describe('Fullscreen Tools', function () {
                    this.slow(70000);
                    this.timeout(100000 * timeModifier);
                    describe('Libraries', function () {
                        var _this = this;
                        afterEach('Close dialog', function (done) {
                            driver.executeScript(inlineFn(function () {
                                window.doc.addLibraryDialog.close();
                            })).then(function () {
                                done();
                            });
                        });
                        it('should be possible to add your own library through a URL', function (done) {
                            var tabId = getRandomId();
                            var libName = getRandomString(25);
                            var libUrl = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js';
                            enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.className('addLibrary'))
                                        .click()
                                        .then(function () {
                                        return wait(driver, 1000);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, libUrl);
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return webdriver.promise.all([
                                        findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .getProperty('invalid'),
                                        findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                            .getSize()
                                    ]).then(function (_a) {
                                        var isInvalid = _a[0], libSizes = _a[1];
                                        assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                        assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter(function (key) {
                                            return libSizes[key] !== 0;
                                        }).length !== 0, 'Current dialog should be visible');
                                        return findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(0, libName);
                                    });
                                }).then(function () {
                                    return wait(driver, 3000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return driver.executeScript(inlineFn(function () {
                                        document.querySelector('#editorFullScreen').click();
                                    }));
                                }).then(function () {
                                    return wait(driver, 2000);
                                }).then(function () {
                                    return saveDialog(dialog);
                                }).then(function () {
                                    return wait(driver, 2000);
                                }).then(function () {
                                    return getCRM(driver);
                                }).then(function (crm) {
                                    assert.include(crm[0].value.libraries, {
                                        name: libName,
                                        url: libUrl
                                    }, 'Library was added');
                                    return wait(driver, 200);
                                });
                            }).then(function () {
                                return new webdriver.promise.Promise(function (resolve) {
                                    request(libUrl, function (err, res, body) {
                                        assert.ifError(err, 'Should not fail the GET request');
                                        if (res.statusCode === 200) {
                                            resolve(body);
                                        }
                                        else {
                                            assert.ifError(new Error('err'), 'Should get 200 statuscode when doing GET request');
                                        }
                                    }).end();
                                });
                            }).then(function (jqCode) {
                                getContextMenu(driver).then(function (contextMenu) {
                                    driver
                                        .executeScript(inlineFn(function (REPLACE) {
                                        window.chrome._clearExecutedScripts();
                                        return window.chrome._currentContextMenu[0]
                                            .children[0]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                                    }, {
                                        page: {
                                            menuItemId: contextMenu[0].id,
                                            editable: false,
                                            pageUrl: 'www.google.com'
                                        },
                                        tab: {
                                            id: tabId,
                                            index: 1,
                                            windowId: getRandomId(),
                                            highlighted: false,
                                            active: true,
                                            pinned: false,
                                            selected: false,
                                            url: 'http://www.google.com',
                                            title: 'Google',
                                            incognito: false
                                        }
                                    })).then(function () {
                                        return driver
                                            .executeScript(inlineFn(function () {
                                            var str = JSON.stringify(window.chrome._executedScripts);
                                            window.chrome._clearExecutedScripts();
                                            return str;
                                        }));
                                    }).then(function (str) {
                                        var activatedScripts = JSON.parse(str);
                                        assert.include(activatedScripts, {
                                            id: tabId,
                                            code: jqCode
                                        }, 'library was properly executed');
                                        ;
                                        done();
                                    });
                                });
                            });
                        });
                        it('should not add a library through url when not saved', function (done) {
                            var libName = getRandomString(25);
                            var libUrl = 'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.1/angular-material.min.js';
                            enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.className('addLibrary'))
                                        .click()
                                        .then(function () {
                                        return wait(driver, 1000);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, libUrl);
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 5000);
                                }).then(function () {
                                    return webdriver.promise.all([
                                        findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .getProperty('invalid'),
                                        findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                            .getSize()
                                    ]).then(function (_a) {
                                        var isInvalid = _a[0], libSizes = _a[1];
                                        assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                        assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter(function (key) {
                                            return libSizes[key] !== 0;
                                        }).length !== 0, 'Current dialog should be visible');
                                        return findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(0, libName);
                                    });
                                }).then(function () {
                                    return wait(driver, 5000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return driver.executeScript(inlineFn(function () {
                                        document.querySelector('#editorFullScreen').click();
                                    }));
                                }).then(function () {
                                    return wait(driver, 2000);
                                }).then(function () {
                                    return cancelDialog(dialog);
                                }).then(function () {
                                    return wait(driver, 2000);
                                }).then(function () {
                                    return getCRM(driver);
                                }).then(function (crm) {
                                    assert.notInclude(crm[0].value.libraries, {
                                        name: libName,
                                        url: libUrl
                                    }, 'Library was added');
                                    done();
                                });
                            });
                        });
                        it('should be possible to add your own library through code', function (done) {
                            var libName = getRandomString(25);
                            var testCode = getRandomString(100);
                            var tabId = getRandomId();
                            enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.className('addLibrary'))
                                        .click()
                                        .then(function () {
                                        return wait(driver, 1000);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryManualOption'))
                                        .click();
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryManualInput'))
                                        .findElement(webdriver.By.tagName('textarea'))
                                        .sendKeys(0, testCode);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return webdriver.promise.all([
                                        findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .getProperty('invalid'),
                                        findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                            .getSize()
                                    ]).then(function (_a) {
                                        var isInvalid = _a[0], libSizes = _a[1];
                                        assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                        assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter(function (key) {
                                            return libSizes[key] !== 0;
                                        }).length !== 0, 'Current dialog should be visible');
                                        return findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(0, libName);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 15000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('editorFullScreen'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return saveDialog(dialog);
                                }).then(function () {
                                    return getCRM(driver);
                                }).then(function (crm) {
                                    assert.include(crm[0].value.libraries, {
                                        name: libName,
                                        url: null
                                    }, 'Library was added');
                                });
                            }).then(function () {
                                getContextMenu(driver).then(function (contextMenu) {
                                    driver
                                        .executeScript(inlineFn(function (REPLACE) {
                                        window.chrome._clearExecutedScripts();
                                        return window.chrome._currentContextMenu[0]
                                            .children[0]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                                    }, {
                                        page: {
                                            menuItemId: contextMenu[0].id,
                                            editable: false,
                                            pageUrl: 'www.google.com'
                                        },
                                        tab: {
                                            id: tabId,
                                            index: 1,
                                            windowId: getRandomId(),
                                            highlighted: false,
                                            active: true,
                                            pinned: false,
                                            selected: false,
                                            url: 'http://www.google.com',
                                            title: 'Google',
                                            incognito: false
                                        }
                                    })).then(function () {
                                        return driver
                                            .executeScript(inlineFn(function () {
                                            return JSON.stringify(window.chrome._executedScripts);
                                        }));
                                    }).then(function (str) {
                                        var activatedScripts = JSON.parse(str);
                                        assert.include(activatedScripts, {
                                            id: tabId,
                                            code: testCode
                                        }, 'library was properly executed');
                                        done();
                                    });
                                });
                            });
                        });
                        it('should not add canceled library that was added through code', function (done) {
                            var libName = getRandomString(25);
                            var testCode = getRandomString(100);
                            enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.className('addLibrary'))
                                        .click()
                                        .then(function () {
                                        return wait(driver, 1000);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryManualOption'))
                                        .click();
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryManualInput'))
                                        .findElement(webdriver.By.tagName('textarea'))
                                        .sendKeys(0, testCode);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return webdriver.promise.all([
                                        findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .getProperty('invalid'),
                                        findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                            .getSize()
                                    ]).then(function (_a) {
                                        var isInvalid = _a[0], libSizes = _a[1];
                                        assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                        assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter(function (key) {
                                            return libSizes[key] !== 0;
                                        }).length !== 0, 'Current dialog should be visible');
                                        return findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(0, libName);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 15000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('editorFullScreen'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 1000);
                                }).then(function () {
                                    return cancelDialog(dialog);
                                }).then(function () {
                                    return getCRM(driver);
                                }).then(function (crm) {
                                    assert.notInclude(crm[0].value.libraries, {
                                        name: libName,
                                        url: testCode
                                    }, 'Library was not added');
                                    done();
                                });
                            });
                        });
                    });
                    describe('GetPageProperties', function () {
                        var _this = this;
                        var pagePropertyPairs = {
                            paperGetPropertySelection: 'crmAPI.getSelection();\n',
                            paperGetPropertyUrl: 'window.location.href;\n',
                            paperGetPropertyHost: 'window.location.host;\n',
                            paperGetPropertyPath: 'window.location.path;\n',
                            paperGetPropertyProtocol: 'window.location.protocol;\n',
                            paperGetPropertyWidth: 'window.innerWidth;\n',
                            paperGetPropertyHeight: 'window.innerHeight;\n',
                            paperGetPropertyPixels: 'window.scrollY;\n',
                            paperGetPropertyTitle: 'document.title;\n'
                        };
                        Object.getOwnPropertyNames(pagePropertyPairs).forEach(function (prop) {
                            it("should be able to insert the " + prop + " property", function (done) {
                                enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                    getEditorValue(driver, type).then(function (prevCode) {
                                        findElement(driver, webdriver.By.id('paperGetPageProperties'))
                                            .click().then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            findElement(driver, webdriver.By.id(prop))
                                                .click()
                                                .then(function () {
                                                return wait(driver, 500);
                                            }).then(function () {
                                                return getEditorValue(driver, type);
                                            }).then(function (newCode) {
                                                assert.strictEqual(subtractStrings(newCode, prevCode), pagePropertyPairs[prop], 'Added text should match expected');
                                            }).then(function () {
                                                return findElement(driver, webdriver.By.id('editorFullScreen'))
                                                    .click();
                                            }).then(function () {
                                                return wait(driver, 500);
                                            }).then(function () {
                                                return cancelDialog(dialog);
                                            }).then(function () {
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                    describe('Search Website', function () {
                        afterEach('Close dialog', function (done) {
                            driver.executeScript(inlineFn(function () {
                                window.doc.paperSearchWebsiteDialog.opened() &&
                                    window.doc.paperSearchWebsiteDialog.hide();
                            })).then(function () {
                                done();
                            });
                        });
                        describe('Default SearchEngines', function () {
                            var _this = this;
                            it('should correctly add a search engine script (new tab)', function (done) {
                                enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                    getEditorValue(driver, type).then(function (prevCode) {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                            .click()
                                            .then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
                                                .findElement(webdriver.By.id('initialWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                                .click();
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return getEditorValue(driver, type);
                                        }).then(function (newCode) {
                                            assert.strictEqual(subtractStrings(newCode, prevCode), [
                                                'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                'var url = \'https://www.google.com/search?q=%s\';',
                                                'var toOpen = url.replace(/%s/g,search);',
                                                'window.open(toOpen, \'_blank\');'
                                            ].join('\n'), 'Added code matches expected');
                                            done();
                                        });
                                    });
                                });
                            });
                            it('should correctly add a search engine script (current tab)', function (done) {
                                enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                    getEditorValue(driver, type).then(function (prevCode) {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                            .click()
                                            .then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
                                                .findElement(webdriver.By.id('initialWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                                .click();
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('howToOpenLink'))
                                                .findElements(webdriver.By.tagName('paper-radio-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return getEditorValue(driver, type);
                                        }).then(function (newCode) {
                                            assert.strictEqual(subtractStrings(newCode, prevCode), [
                                                'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                'var url = \'https://www.google.com/search?q=%s\';',
                                                'var toOpen = url.replace(/%s/g,search);',
                                                'location.href = toOpen;'
                                            ].join('\n'), 'Added code matches expected');
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                        describe('Custom Input', function () {
                            var _this = this;
                            it('should be able to add one from a search URL', function (done) {
                                var exampleSearchURL = "http://www." + getRandomString(10) + "/?" + getRandomString(10) + "=customRightClickMenu}";
                                enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                    getEditorValue(driver, type).then(function (prevCode) {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                            .click()
                                            .then(function () {
                                            return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
                                                .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                .click();
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                .findElement(webdriver.By.id('manualInputURLInput'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0, exampleSearchURL);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            getEditorValue(driver, type).then(function (newCode) {
                                                assert.strictEqual(subtractStrings(newCode, prevCode), [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    "var url = '" + exampleSearchURL.replace('customRightClickMenu', '%s') + "';",
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'location.href = toOpen;'
                                                ].join('\n'), 'Script should match expected value');
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                            it('should be able to add one from your visited websites', function (done) {
                                var exampleVisitedWebsites = [{
                                        name: getRandomString(20),
                                        url: "http://www." + getRandomString(20) + ".com",
                                        searchUrl: getRandomString(20) + "%s" + getRandomString(10)
                                    }];
                                enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                    getEditorValue(driver, type).then(function (oldValue) {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                            .click()
                                            .then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
                                                .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                .click();
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('manulInputSavedChoice'))
                                                .click();
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return driver.executeScript(inlineFn(function () {
                                                document.querySelector('#manualInputListChoiceInput')
                                                    .querySelector('textarea').value = 'REPLACE.websites';
                                            }, {
                                                websites: JSON.stringify(exampleVisitedWebsites)
                                            }));
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('processedListWindow'))
                                                .findElement(webdriver.By.className('searchOptionCheckbox'))
                                                .click();
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('processedListWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then(function (elements) {
                                                elements[1].click();
                                            });
                                        }).then(function () {
                                            return wait(driver, 500);
                                        }).then(function () {
                                            return getEditorValue(driver, type);
                                        }).then(function (newValue) {
                                            assert.strictEqual(subtractStrings(newValue, oldValue), [
                                                'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                "var url = '" + exampleVisitedWebsites[0].searchUrl + "';",
                                                'var toOpen = url.replace(/%s/g,search);',
                                                'location.href = toOpen;'
                                            ].join('\n'), 'Added script should match expected');
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('Errors', function () {
        this.timeout(60000 * timeModifier);
        this.slow(100);
        it('should not have been thrown', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? {
                    message: window.lastError.message,
                    stack: window.lastError.stack
                } : 'noError';
            })).then(function (result) {
                if (result !== 'noError' &&
                    result.message.indexOf('Object [object global] has no method') !== -1) {
                    console.log(result);
                    assert.ifError(result, 'no errors should be thrown during testing');
                }
                else {
                    assert.ifError(false, 'no errors should be thrown during testing');
                }
                done();
            });
        });
    });
});
describe('On-Page CRM', function () {
    describe('Redraws on new CRM', function () {
        this.slow(250);
        this.timeout(1500 * timeModifier);
        var CRM1 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        var CRM2 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(4000);
            this.timeout(5000 * timeModifier);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                    }, {
                        crm: CRM1
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should be using the first CRM', function (done) {
            this.timeout(60000 * timeModifier);
            getContextMenu(driver).then(function (contextMenu) {
                assertContextMenuEquality(contextMenu, CRM1);
                done();
            });
        });
        it('should be able to switch to a new CRM', function (done) {
            assert.doesNotThrow(function () {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.app.settings.crm = REPLACE.crm;
                    window.app.upload();
                    return true;
                }, {
                    crm: CRM2
                })).then(function () {
                    done();
                });
            }, 'settings CRM does not throw');
        });
        it('should be using the new CRM', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assertContextMenuEquality(contextMenu, CRM2);
                done();
            });
        });
    });
    describe('Links', function () {
        var _this = this;
        this.slow(150);
        this.timeout(1500 * timeModifier);
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: false,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: true
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                onContentTypes: [true, false, false, false, false, false]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                onContentTypes: [false, false, false, false, false, true]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                value: [{
                        url: 'www.a.com',
                        newTab: true
                    }, {
                        url: 'www.b.com',
                        newTab: false
                    }, {
                        url: 'www.c.com',
                        newTab: true
                    }]
            }),
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(4000);
            this.timeout(5000 * timeModifier);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: CRMNodes
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should match the given names and types', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                for (var i = 0; i < CRMNodes.length; i++) {
                    assert.isDefined(contextMenu[i], "node " + i + " is defined");
                    assert.strictEqual(contextMenu[i].currentProperties.title, CRMNodes[i].name, "names for " + i + " match");
                    assert.strictEqual(contextMenu[i].currentProperties.type, 'normal', "type for " + i + " is normal");
                }
                done();
            });
        });
        it('should match the given triggers', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.lengthOf(contextMenu[0].createProperties.documentUrlPatterns, 0, 'triggers are turned off');
                assert.deepEqual(contextMenu[1].createProperties.documentUrlPatterns, CRMNodes[1].triggers.map(function (trigger) {
                    return prepareTrigger(trigger.url);
                }), 'triggers are turned on');
                done();
            });
        });
        it('should match the given content types', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                for (var i = 0; i < CRMNodes.length; i++) {
                    assert.includeMembers(contextMenu[i].currentProperties.contexts, CRMNodes[i].onContentTypes.map(function (enabled, index) {
                        if (enabled) {
                            return getTypeName(index);
                        }
                        else {
                            return null;
                        }
                    }).filter(function (item) { return item !== null; }), "content types for " + i + " match");
                }
                done();
            });
        });
        it('should open the correct links when clicked for the default link', function (done) {
            this.timeout(2000 * timeModifier);
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._currentContextMenu[0].children[4]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                    return true;
                }, {
                    page: {
                        menuItemId: contextMenu[4].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: tabId,
                        index: 1,
                        windowId: windowId,
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._activeTabs);
                    }));
                }).then(function (str) {
                    var activeTabs = JSON.parse(str);
                    var expectedTabs = CRMNodes[4].value.map(function (link) {
                        if (!link.newTab) {
                            return {
                                id: tabId,
                                data: {
                                    url: sanitizeUrl(link.url)
                                },
                                type: 'update'
                            };
                        }
                        else {
                            return {
                                type: 'create',
                                data: {
                                    windowId: windowId,
                                    url: sanitizeUrl(link.url),
                                    openerTabId: tabId
                                }
                            };
                        }
                    });
                    assert.sameDeepMembers(activeTabs, expectedTabs, 'opened tabs match expected');
                    done();
                });
            });
        });
        it('should open the correct links when clicked for multiple links', function (done) {
            _this.timeout(2000 * timeModifier);
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    while (window.chrome._activeTabs.length > 0) {
                        window.chrome._activeTabs.pop();
                    }
                    return window.chrome._currentContextMenu[0].children[5]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[5].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: tabId,
                        index: 1,
                        windowId: windowId,
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function (result) {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._activeTabs);
                    }));
                }).then(function (str) {
                    var activeTabs = JSON.parse(str);
                    var expectedTabs = CRMNodes[5].value.map(function (link) {
                        if (!link.newTab) {
                            return {
                                id: tabId,
                                data: {
                                    url: sanitizeUrl(link.url)
                                },
                                type: 'update'
                            };
                        }
                        else {
                            return {
                                type: 'create',
                                data: {
                                    windowId: windowId,
                                    url: sanitizeUrl(link.url),
                                    openerTabId: tabId
                                }
                            };
                        }
                    });
                    assert.sameDeepMembers(activeTabs, expectedTabs, 'opened tabs match expected');
                    done();
                });
            });
        });
    });
    describe('Menu & Divider', function () {
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultMenuNode({
                name: getRandomString(25),
                id: getRandomId(),
                children: [
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultMenuNode({
                        name: getRandomString(25),
                        id: getRandomId(),
                        children: [
                            templates.getDefaultMenuNode({
                                name: getRandomString(25),
                                id: getRandomId(),
                                children: [
                                    templates.getDefaultMenuNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: [
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                        ]
                                    }),
                                    templates.getDefaultLinkNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: []
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(5000 * timeModifier);
            this.slow(4000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: CRMNodes
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should have the correct structure', function (done) {
            this.slow(400);
            this.timeout(1400 * timeModifier);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    return window.logs;
                }))
                    .then(function (logs) {
                    assertContextMenuEquality(contextMenu, CRMNodes);
                    done();
                });
            });
        });
    });
    describe('Scripts', function () {
        this.slow(900);
        this.timeout(2000 * timeModifier);
        var CRMNodes = [
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example2.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example3.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 0,
                    backgroundScript: 'console.log(\'executed backgroundscript\')'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4,
                    script: 'console.log(\'executed script\');'
                }
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(5000 * timeModifier);
            this.slow(4000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: CRMNodes
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.notexample.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on right tab');
                done();
            });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    done();
                });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 2, 'two scripts activated');
                assert.strictEqual(activatedScripts[1].id, fakeTabId, 'new script was executed on right tab');
                done();
            });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example2.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return getContextMenu(driver);
            }).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                return driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                }));
            }).then(function () {
                return driver
                    .executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script was activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                done();
            });
        });
        it('should run the backgroundscript when one is specified', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 1, 'contextmenu contains at least 1 items');
                assert.doesNotThrow(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        return window.chrome._currentContextMenu[0]
                            .children[2]
                            .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                    }, {
                        page: {
                            menuItemId: contextMenu[0].id,
                            editable: false,
                            pageUrl: 'www.google.com'
                        },
                        tab: {
                            id: fakeTabId,
                            index: 1,
                            windowId: getRandomId(),
                            highlighted: false,
                            active: true,
                            pinned: false,
                            selected: false,
                            url: 'http://www.google.com',
                            title: 'Google',
                            incognito: false
                        }
                    })).then(function () {
                        return driver
                            .executeScript(inlineFn(function () {
                            return JSON.stringify(window.chrome._activatedBackgroundPages);
                        }));
                    }).then(function (str) {
                        var activatedBackgroundScripts = JSON.parse(str);
                        assert.lengthOf(activatedBackgroundScripts, 1, 'one backgroundscript was activated');
                        assert.strictEqual(activatedBackgroundScripts[0], CRMNodes[4].id, 'correct backgroundscript was executed');
                        done();
                    });
                }, 'clicking the node does not throw');
            });
        });
        it('should not show the disabled node', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[5].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    assert.include(activatedScripts[0].code, CRMNodes[1].value.script, 'executed code is the same as set code');
                    done();
                });
            });
        });
    });
    describe('Stylesheets', function () {
        this.slow(900);
        this.timeout(2000 * timeModifier);
        var CRMNodes = [
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: false,
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: true,
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example2.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    stylesheet: "\n\t\t\t\t\t/*if false then*/\n\t\t\t\t\ta\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if true then*/\n\t\t\t\t\tb\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if 1 < 0 then*/\n\t\t\t\t\tc\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if -1 < 0 then*/\n\t\t\t\t\td\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if 'a' === 'b' then*/\n\t\t\t\t\te\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if true && true then*/\n\t\t\t\t\tf\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if false || false then*/\n\t\t\t\t\tg\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t"
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    options: {
                        a: {
                            type: 'number',
                            value: 5
                        },
                        b: {
                            type: 'string',
                            value: 'str'
                        },
                        c: {
                            type: 'boolean',
                            value: true
                        },
                        d: {
                            type: 'choice',
                            values: [1, 2, 3, 4],
                            selected: 2
                        },
                        e: {
                            type: 'choice',
                            values: ['a', 'b', 'c', 'd'],
                            selected: 2
                        }
                    },
                    stylesheet: "\n\t\t\t\t\t/*if a === 5 then*/\n\t\t\t\t\ta\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if a === 3 then*/\n\t\t\t\t\tb\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if b === 'str' then*/\n\t\t\t\t\tc\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if c then*/\n\t\t\t\t\td\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if d === 3 then*/\n\t\t\t\t\te\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if e === 'c' then*/\n\t\t\t\t\tf\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t"
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    stylesheet: "\n\t\t\t\t\t/*if true then*/\n\t\t\t\t\ta\n\t\t\t\t\t/*else*/\n\t\t\t\t\tb\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*if false then*/\n\t\t\t\t\tc\n\t\t\t\t\t/*else*/\n\t\t\t\t\td\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t"
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    stylesheet: "\n\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\t\t/*if false then*/\n\t\t\t\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\t\t\ta\n\t\t\t\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t\t\t\t\tb\n\t\t\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t\t\t\tc\n\t\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t\t\td\n\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t\te\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t"
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    stylesheet: "\n\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\t/*if false then*/\n\t\t\t\t\t\t\t\ta\n\t\t\t\t\t\t\t/*else*/\n\t\t\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\t\t\tb\n\t\t\t\t\t\t\t\t/*else*/\n\t\t\t\t\t\t\t\t\tc\n\t\t\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t\t\t\td\n\t\t\t\t\t\t\t/*endif*/\t\t\t\t\t\t\n\t\t\t\t\t\t/*else*/\n\t\t\t\t\t\t\te\n\t\t\t\t\t\t/*endif*/\t\n\t\t\t\t\t\tf\n\t\t\t\t\t/*else*/\n\t\t\t\t\t\t/*if true then*/\n\t\t\t\t\t\t\tg\n\t\t\t\t\t\t/*else*/\n\t\t\t\t\t\t\th\n\t\t\t\t\t\t/*endif*/\n\t\t\t\t\t/*endif*/\n\t\t\t\t\t"
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    options: {
                        margin: {
                            type: 'number',
                            value: 50
                        }
                    },
                    stylesheet: "\n\t\t\t\t\tbody {\n\t\t\t\t\t\t/*margin-top: {{margin}}px;*/\n\t\t\t\t\t}\n\t\t\t\t\t"
                }
            })
        ];
        function runStylesheet(index, expectedReg, done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[REPLACE.index - 3]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    index: index,
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function (e) {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var executedScripts = JSON.parse(str);
                    assert.lengthOf(executedScripts, 1, 'one stylesheet was activated');
                    assert.strictEqual(executedScripts[0].id, fakeTabId, 'stylesheet was executed on the right tab');
                    assert.isTrue(!!expectedReg.exec(executedScripts[0].code), 'executed code is the same as expected code');
                    done();
                });
            });
        }
        function genContainsRegex() {
            var contains = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                contains[_i] = arguments[_i];
            }
            var whitespace = '(\\\\t|\\\\s|\\\\n)*';
            return new RegExp(".*\\(\"" + (whitespace + contains.join(whitespace) + whitespace) + "\"\\).*");
        }
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(5000 * timeModifier);
            this.slow(4000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function (REPLACE) {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: CRMNodes
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.notexample.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
                assert.strictEqual(activatedScripts[1].id, fakeTabId, 'stylesheet was executed on right tab');
                done();
            });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[2]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'stylesheet was executed on the right tab');
                    done();
                });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
                assert.strictEqual(activatedScripts[2].id, fakeTabId, 'new stylesheet was executed on right tab');
                done();
            });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function (REPLACE) {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example2.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return getContextMenu(driver);
            }).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                return driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[3]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                }));
            }).then(function () {
                return driver
                    .executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script was activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                done();
            });
        });
        it('should not show the disabled node', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[6].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function (REPLACE) {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[2]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: {
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    },
                    tab: {
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    }
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var executedScripts = JSON.parse(str);
                    assert.lengthOf(executedScripts, 1, 'one script was activated');
                    assert.strictEqual(executedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    assert.include(executedScripts[0].code, CRMNodes[3].value.stylesheet.replace(/(\t|\s|\n)/g, ''), 'executed code is the same as set code');
                    done();
                });
            });
        });
        it('should actually be applied to the page', function (done) {
            driver
                .executeScript(inlineFn(function (args) {
                var dummyEl = document.createElement('div');
                dummyEl.id = 'stylesheetTestDummy';
                window.dummyContainer.appendChild(dummyEl);
            })).then(function () {
                return wait(driver, 100);
            }).then(function () {
                return findElement(driver, webdriver.By.id('stylesheetTestDummy'));
            }).then(function (dummy) {
                return dummy.getSize();
            }).then(function (dimensions) {
                assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
                done();
            });
        });
        it('should work with an if-then statement with no variables', function (done) {
            runStylesheet(7, genContainsRegex('b', 'd', 'f'), done);
        });
        it('should work with an if-then statement with variables', function (done) {
            runStylesheet(8, genContainsRegex('a', 'c', 'd', 'e', 'f'), done);
        });
        it('should work with an if-then-else statement', function (done) {
            runStylesheet(9, genContainsRegex('a', 'd'), done);
        });
        it('should work with multiple nested if statements', function (done) {
            this.timeout(5000 * timeModifier);
            runStylesheet(10, genContainsRegex('c', 'd', 'e'), done);
        });
        it('should work with multiple nested if-else statements', function (done) {
            runStylesheet(11, genContainsRegex('b', 'd', 'f'), done);
        });
        it('should work with statements in blocks', function (done) {
            runStylesheet(12, genContainsRegex('body', '{', 'margin-top:', '50px;', '}'), done);
        });
        describe('Toggling', function () {
            var dummy1;
            var dummy2;
            before('Setting up dummy elements', function (done) {
                driver
                    .executeScript(inlineFn(function () {
                    var dummy1 = document.createElement('div');
                    dummy1.id = 'stylesheetTestDummy1';
                    var dummy2 = document.createElement('div');
                    dummy2.id = 'stylesheetTestDummy2';
                    window.dummyContainer.appendChild(dummy1);
                    window.dummyContainer.appendChild(dummy2);
                })).then(function () {
                    return wait(driver, 50);
                }).then(function () {
                    return FoundElementPromise.all([
                        findElement(driver, webdriver.By.id('stylesheetTestDummy1')),
                        findElement(driver, webdriver.By.id('stylesheetTestDummy2'))
                    ]);
                }).then(function (results) {
                    wait(driver, 150).then(function () {
                        dummy1 = results[0];
                        dummy2 = results[1];
                        done();
                    });
                });
            });
            describe('Default off', function () {
                var tabId = getRandomId();
                this.slow(600);
                this.timeout(1600 * timeModifier);
                it('should be off by default', function (done) {
                    wait(driver, 150).then(function () {
                        dummy1.getSize().then(function (dimensions) {
                            assert.notStrictEqual(dimensions.width, 50, 'dummy element is not 50px wide');
                            done();
                        });
                    });
                });
                it('should be on when clicked', function (done) {
                    getContextMenu(driver).then(function (contextMenu) {
                        driver.executeScript(inlineFn(function (REPLACE) {
                            return window.chrome._currentContextMenu[0]
                                .children[0]
                                .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                        }, {
                            page: {
                                menuItemId: contextMenu[0].id,
                                editable: false,
                                pageUrl: 'www.google.com',
                                wasChecked: false
                            },
                            tab: {
                                id: tabId,
                                index: 1,
                                windowId: getRandomId(),
                                highlighted: false,
                                active: true,
                                pinned: false,
                                selected: false,
                                url: 'http://www.google.com',
                                title: 'Google',
                                incognito: false
                            }
                        }));
                    }).then(function () {
                        return wait(driver, 100);
                    }).then(function () {
                        return dummy1.getSize();
                    }).then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                        done();
                    });
                });
                it('should be off when clicked again', function (done) {
                    getContextMenu(driver).then(function (contextMenu) {
                        driver.executeScript(inlineFn(function (REPLACE) {
                            return window.chrome._currentContextMenu[0]
                                .children[0]
                                .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                        }, {
                            page: {
                                menuItemId: contextMenu[0].id,
                                editable: false,
                                pageUrl: 'www.google.com',
                                wasChecked: true
                            },
                            tab: {
                                id: tabId,
                                index: 1,
                                windowId: getRandomId(),
                                highlighted: false,
                                active: true,
                                pinned: false,
                                selected: false,
                                url: 'http://www.google.com',
                                title: 'Google',
                                incognito: false
                            }
                        }));
                    }).then(function () {
                        return wait(driver, 100);
                    }).then(function () {
                        return dummy1.getSize();
                    }).then(function (dimensions) {
                        assert.notStrictEqual(dimensions.width, 50, 'dummy element is not 50px wide');
                        done();
                    });
                });
            });
            describe('Default on', function () {
                this.slow(300);
                this.timeout(1500 * timeModifier);
                it('should be on by default', function (done) {
                    dummy2.getSize().then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                        done();
                    });
                });
            });
        });
    });
    describe('Errors', function () {
        this.timeout(60000 * timeModifier);
        this.slow(100);
        it('should not have been thrown', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? {
                    message: window.lastError.message,
                    stack: window.lastError.stack
                } : 'noError';
            })).then(function (result) {
                if (result !== 'noError' &&
                    result.message.indexOf('Object [object global] has no method') !== -1) {
                    console.log(result);
                    assert.ifError(result, 'no errors should be thrown during testing');
                }
                else {
                    assert.ifError(false, 'no errors should be thrown during testing');
                }
                done();
            });
        });
    });
});
after('quit driver', function () {
    this.timeout(21000);
    return webdriver.promise.all([
        new webdriver.promise.Promise(function (resolve) {
            driver.quit().then(function () {
                resolve(null);
            });
            setTimeout(function () {
                resolve(null);
            }, 20000);
        }),
        new webdriver.promise.Promise(function (resolve) {
            setTimeout(function () {
                resolve(null);
            }, 19000);
        })
    ]);
});
