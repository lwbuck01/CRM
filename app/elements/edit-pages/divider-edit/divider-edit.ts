﻿/// <reference path="../../elements.d.ts" />

const dividerEditProperties: {
	item: CRM.DividerNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

class DE {
	static is: string = 'divider-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = dividerEditProperties;

	static init(this: NodeEditBehaviorDividerInstance) {
		this._init();
	};

	static ready(this: NodeEditBehaviorDividerInstance) {
		window.dividerEdit = this;
	}

}

type DividerEdit = Polymer.El<'divider-edit', typeof DE & typeof dividerEditProperties>;

Polymer(DE);