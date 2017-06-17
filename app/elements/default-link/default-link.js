"use strict";
var defaultLinkProperties = {
    href: {
        type: String,
        notify: true
    },
    defaultName: {
        type: String,
        notify: true
    }
};
var DL = (function () {
    function DL() {
    }
    DL.onClick = function () {
        var link = this.href;
        var name = $(this.$.input).val();
        var script = "var query;\nvar url = \"" + link + "\";\nif (crmAPI.getSelection()) {\n\tquery = crmAPI.getSelection();\n} else {\n\tquery = window.prompt('Please enter a search query');\n}\nif (query) {\n\twindow.open(url.replace(/%s/g,query), '_blank');\n}";
        var newItem;
        if (this.searchEngine !== undefined) {
            newItem = window.app.templates.getDefaultScriptNode({
                id: window.app.generateItemId(),
                name: name,
                value: {
                    script: script
                }
            });
        }
        else {
            newItem = window.app.templates.getDefaultLinkNode({
                id: window.app.generateItemId(),
                name: name,
                value: [
                    {
                        url: link,
                        newTab: true
                    }
                ]
            });
        }
        window.app.crm.add(newItem);
    };
    ;
    DL.reset = function () {
        this.querySelector('input').value = this.defaultName;
    };
    return DL;
}());
DL.is = 'default-link';
DL.searchEngine = false;
DL.properties = defaultLinkProperties;
Polymer(DL);
