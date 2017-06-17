"use strict";
var logPageProperties = {
    isLoading: {
        type: Boolean,
        value: true,
        notify: true
    }
};
var LP = (function () {
    function LP() {
    }
    LP.ready = function () {
        if (window.logConsole && window.logConsole.done) {
            this.isLoading = false;
        }
        window.logPage = this;
        window.setTimeout(function () {
            window.CRMLoaded = window.CRMLoaded || {
                listener: null,
                register: function (fn) {
                    fn();
                }
            };
            window.CRMLoaded.listener && window.CRMLoaded.listener();
        }, 2500);
    };
    return LP;
}());
LP.is = 'log-page';
LP.properties = logPageProperties;
Polymer(LP);
