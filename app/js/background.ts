/// <reference path="../../tools/definitions/chrome.d.ts"/>
/// <reference path="../../tools/definitions/specialJSON.d.ts" />
/// <reference path="../../tools/definitions/crm.d.ts" />
/// <reference path="../../tools/definitions/tern.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />

interface TabData {
	id: number | 'background';
	title: string;
}

interface ContextData {
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
	pageX: number;
	pageY: number;
	screenX: number;
	screenY: number;
	which: number;
	x: number;
	y: number;
	srcElement: number;
	target: number;
	toElement: number;
}

interface Resource {
	dataURI: string;
	name?: string;
	sourceUrl: string;
	crmUrl: string;
}

type Resources = { [name: string]: Resource };

interface GreaseMonkeyDataInfo {
	script: {
		author?: string;
		copyright?: string;
		description?: string;
		excludes?: Array<string>;
		homepage?: string;
		icon?: string;
		icon64?: string;
		includes?: Array<string>;
		lastUpdated: number; //Never updated
		matches?: Array<string>;
		isIncognito: boolean;
		downloadMode: string;
		name: string;
		namespace?: string;
		options: {
			awareOfChrome: boolean;
			compat_arrayleft: boolean;
			compat_foreach: boolean;
			compat_forvarin: boolean;
			compat_metadata: boolean;
			compat_prototypes: boolean;
			compat_uW_gmonkey: boolean;
			noframes?: string;
			override: {
				excludes: boolean;
				includes: boolean;
				orig_excludes?: Array<string>;
				orig_includes?: Array<string>;
				use_excludes: Array<string>;
				use_includes: Array<string>;
			}
		},
		position: number;
		resources: Array<Resource>;
		"run-at": string;
		system: boolean;
		unwrap: boolean;
		version?: number;
	};
	scriptMetaStr: string;
	scriptSource: string;
	scriptUpdateURL?: string;
	scriptWillUpdate: boolean;
	scriptHandler: string;
	version: string;
}

interface GreaseMonkeyData {
	info: GreaseMonkeyDataInfo;
	resources: Resources;
}

const enum TypecheckOptional {
	OPTIONAL = 1,
	REQUIRED = 0
}

interface StorageChange {
	oldValue: any;
	newValue: any;
	key: string;
}

interface CRMAPIMessage<T, TD> {
	id: number;
	tabId: number;
	tabIndex: number;
	type: T;
	data: TD;
	onFinish: any;
	lineNumber?: string;
}

interface CRMAPIResponse<T> {
	type: string;
	callbackId: number;
	messageType: string;
	data: {
		error: string,
		stackTrace: string,
		lineNumber: string;
	} | T;
}

interface ChromeAPIMessage extends CRMAPIMessage<'chrome', void> {
	api: string;
	args: Array<{
		type: 'fn' | 'return' | 'arg';
		isPersistent?: boolean;
		val: any;
	}>;
	requestType: CRM.Permission;
}

interface ContextMenuSettings extends chrome.contextMenus.CreateProperties {
	generatedId?: number;
}

interface Logging {
	[nodeId: number]: {
		logMessages: Array<{
			tabId: number | string;
			value?: Array<any>;
			logId?: number;
			timestamp?: string;
		}>;
		values: Array<any>;
		[tabId: number]: any;
	};
	filter: {
		id: number;
		tabId: number;
	};
}

interface Window {
	logging?: Logging;
	isDev: boolean;
	createHandlerFunction: (port: {
		postMessage: (message: Object) => void;
	}) => (message: any, port: chrome.runtime.Port) => void;
	backgroundPageLog: (id: number, sourceData: [string, number], ...params: Array<any>) => void;
	filter: (nodeId: any, tabId: any) => void;
	_getIdCurrentTabs: (id: number, currentTabs: Array<TabData>, callback: (tabs: Array<TabData>) => void) => void;
	_getCurrentTabIndex: (id: number, currentTab: TabData, callback: (newTabIndexes: Array<number>) => void) => void;
	_listenIds: (listener: (newIds: Array<{
		id: number;
		title: string;
	}>) => void) => void;
	_listenTabs: (listener: (newTabs: Array<TabData>) => void) => void;
	_listenLog: (listener: LogListener,
		callback: (result: LogListenerObject) => void) => Array<LogListenerLine>;
	XMLHttpRequest: any;
	TextEncoder: any;
	getID: (name: string) => void;
	md5: (data: any) => string;
	TernFile: Tern.File;
	CodeMirror: CodeMirror;
	ecma5: any;
	ecma6: any;
	browserDefs: any;
	tern: Tern.Tern;
}

interface ContextMenuItemTreeItem {
	index: number;
	id: number;
	enabled: boolean;
	node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
	parentId: number;
	children: Array<ContextMenuItemTreeItem>;
	parentTree: Array<ContextMenuItemTreeItem>;
}

interface CRMSandboxWorker extends Worker {
	id: number;
	post: (message: any) => void;
	listen: (callback: (data: any) => void) => void;
	worker: Worker;
	script: string;
}

type SendCallbackMessage = (tabId: number, tabIndex: number, id: number, data: {
	err: boolean,
	errorMessage?: string;
	args?: Array<any>;
	callbackId: number;
}) => void;

interface LogLineData {
	code: string;
	result?: string;
	hasResult?: boolean;
}

interface LogListenerLine {
	id: number | string;
	tabId: number | string;
	tabIndex: number;
	nodeTitle?: string;
	tabTitle?: string;
	data?: Array<LogLineData>;
	val?: {
		type: 'success';
		result: any;
	} | {
		type: 'error';
		result: {
			stack: string;
			name: string;
			message: string;
		}
	};
	logId?: number;
	lineNumber?: string;
	timestamp?: string;
	type?: string;
	isEval?: boolean;
	isError?: boolean;
	suggestions?: Array<string>;
	value?: Array<LogLineData>;
}

type LogListener = (newLine: LogListenerLine) => void;

interface LogListenerObject {
	listener: LogListener;
	id: number | string;
	tab: number | string;
	update: (id: string | number, tab: string | number, tabIndex: number, textFilter: string) => Array<LogListenerLine>;
	text: string;
	index: number;
}

interface MatchPattern {
	scheme: string;
	host: string;
	path: string;
	invalid?: boolean;
}

interface CRMTemplates {
	mergeArrays<T extends Array<T> | Array<U>, U>(this: CRMTemplates, mainArray: T, additionArray: T): T;
	mergeObjects<T extends {
		[key: string]: any;
		[key: number]: any;
	}, Y extends Partial<T>>(this: CRMTemplates, mainObject: T, additions: Y): T & Y;
	getDefaultNodeInfo(options?: Partial<CRM.NodeInfo>): CRM.NodeInfo;
	getDefaultLinkNode(options?: Partial<CRM.LinkNode>): CRM.LinkNode;
	getDefaultStylesheetValue(options?: Partial<CRM.StylesheetVal>): CRM.StylesheetVal;
	getDefaultScriptValue(options?: Partial<CRM.ScriptVal>): CRM.ScriptVal;
	getDefaultScriptNode(options?: CRM.PartialScriptNode): CRM.ScriptNode;
	getDefaultStylesheetNode(options?: CRM.PartialStylesheetNode): CRM.StylesheetNode;
	getDefaultDividerOrMenuNode(options: Partial<CRM.DividerNode> | Partial<CRM.MenuNode>, type: 'menu' | 'divider'): CRM.DividerNode | CRM.MenuNode;
	getDefaultDividerNode(options?: Partial<CRM.DividerNode>): CRM.DividerNode;
	getDefaultMenuNode(options?: Partial<CRM.MenuNode>): CRM.MenuNode;
	globalObjectWrapperCode(name: string, wrapperName: string, chromeVal: string): string;
}

const enum SCRIPT_CONVERSION_TYPE {
	CHROME = 0,
	LOCAL_STORAGE = 1,
	BOTH = 2
}

interface GlobalObject {
	globals?: {
		latestId: number;
		storages: {
			settingsStorage: CRM.SettingsStorage;
			globalExcludes: Array<MatchPattern | '<all_urls>'>;
			resourceKeys: Array<{
				name: string;
				sourceUrl: string;
				hashes: Array<{
					algorithm: string;
					hash: string;
				}>;
				scriptId: number;
			}>;
			urlDataPairs: {
				[url: string]: {
					dataString: string;
					refs: Array<number>;
					dataURI: string;
				};
			};
			storageLocal: CRM.StorageLocal;
			nodeStorage: {
				[nodeId: number]: any;
			};
			resources: {
				[scriptId: number]: {
					[name: string]: {
						name: string;
						sourceUrl: string;
						matchesHashes: boolean;
						dataURI: string;
						crmUrl: string;
						hashes: Array<{
							algorithm: string;
							hash: string;
						}>
					};
				};
			};
		};
		background: {
			workers: Array<CRMSandboxWorker>;
			byId: {
				[nodeId: number]: CRMSandboxWorker;
			};
		};
		crm: {
			crmTree: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
			crmById: {
				[id: number]: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			};
			safeTree: Array<CRM.SafeNode>;
			crmByIdSafe: {
				[id: number]: CRM.SafeNode;
			};
		};
		keys: {
			[secretKey: string]: boolean;
		};
		availablePermissions: Array<string>;
		crmValues: {
			tabData: {
				[tabId: number]: {
					nodes: {
						[nodeId: number]: Array<{
							secretKey: Array<number>;
							port?: chrome.runtime.Port | {
								postMessage(message: Object): void;
							};
							usesLocalStorage: boolean;
						}>;
					};
					libraries: {
						[library: string]: boolean;
					};
				};
			};
			rootId: number;
			contextMenuIds: {
				[nodeId: number]: number;
			};
			nodeInstances: {
				[nodeId: number]: {
					[instanceId: number]: Array<{
						hasHandler: boolean;
					}>;
				};
			};
			contextMenuInfoById: {
				[nodeId: number]: {
					path: Array<number>;
					settings: ContextMenuSettings;
					enabled: boolean;
				};
			};
			contextMenuItemTree: Array<ContextMenuItemTreeItem>;
			hideNodesOnPagesData: {
				[nodeId: number]: Array<{
					not: boolean;
					url: string;
				}>;
			};
			stylesheetNodeStatusses: {
				[nodeId: number]: {
					[tabId: number]: boolean;
					defaultValue: boolean;
				};
			};
		};
		toExecuteNodes: {
			onUrl: {
				[nodeId: number]: Array<CRM.Trigger>;
			};
			always: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
		};
		sendCallbackMessage: SendCallbackMessage;
		notificationListeners: {
			[notificationId: string]: {
				id: number;
				tabId: number;
				tabIndex: number;
				notificationId: number;
				onDone: number;
				onClick: number;
			};
		};
		scriptInstallListeners: {
			[tabId: number]: {
				id: number;
				tabId: number;
				callback: any;
			};
		};
		logging: Logging;
		constants: {
			supportedHashes: Array<string>;
			validSchemes: Array<string>;
			templates: CRMTemplates;
			specialJSON: SpecialJSON;
			permissions: Array<CRM.Permission>;
			contexts: Array<string>;
			tamperMonkeyExtensions: Array<string>;
		};
		listeners: {
			idVals: Array<number>;
			tabVals: Array<number>;
			ids: Array<(updatedIds: Array<{
				id: number;
				title: string;
			}>) => void>;
			tabs: Array<(updatedTabs: Array<TabData>) => void>;
			log: Array<LogListenerObject>;
		};
	};
	TransferFromOld?: {
		transferCRMFromOld(openInNewTab: boolean, storageSource: {
			getItem(index: string | number): any;
		}, method: SCRIPT_CONVERSION_TYPE): CRM.Tree;
	};
	Storages?: any;
}

interface Extensions<T> extends CRM.Extendable<T> { }

class Promiselike<T> {
	_listeners: Array<(result: T) => void> = [];
	_rejectListeners: Array<(reason: any) => void> = [];
	_status: 'pending' | 'rejected' | 'fulfilled' = 'pending';
	_result: T;
	_rejectReason: any;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void) {
		initializer((result: T) => {
			if (this._status !== 'pending') {
				return;
			}
			this._status = 'fulfilled';
			this._result = result;
			this._listeners.forEach((listener) => {
				listener(result);
			});
		}, (rejectReason) => {
			if (this._status !== 'pending') {
				return;
			}
			this._rejectReason = rejectReason;
			this._status = 'rejected';
			this._rejectListeners.forEach((rejectListener) => {
				rejectListener(rejectReason);
			});
		});
	}

	then(callback: (result: T) => void, onrejected?: (reason: any) => void): Promiselike<T> {
		if (this._status === 'fulfilled') {
			callback(this._result);
		}
		this._listeners.push(callback);
		if (onrejected) {
			if (this._status === 'rejected') {
				onrejected(this._rejectReason);
			}
			this._rejectListeners.push(onrejected);
		}
		return this;
	}
	catch(onrejected: (reason: any) => void): Promiselike<T> {
		this._rejectListeners.push(onrejected);
		if (this._status === 'rejected') {
			onrejected(this._rejectReason);
		}
		return this;
	}
	static all(values: Array<Promiselike<any>>) {
		let rejected: boolean = false;
		return new Promiselike((resolve, reject) => {
			const promises: Array<{
				done: boolean;
				result?: any;
				promise: Promiselike<any>
			}> = Array.prototype.slice.apply(values).map((promise: Promiselike<any>) => {
				return {
					done: false,
					promise: promise
				};
			});
			promises.forEach((obj) => {
				obj.promise.then((result) => {
					obj.done = true;
					obj.result = result;
					if (rejected) {
						return;
					}
					if (promises.filter((listPromise) => {
						return !listPromise.done;
					}).length === 0) {
						resolve(promises.map((listPromise) => {
							return listPromise.result;
						}));
					}
				}, (reason) => {
					reject(reason);
				});
			});
		});
	}
	static race(values: Array<Promiselike<any>>) {
		return new Promiselike((resolve, reject) => {
			Array.prototype.slice.apply(values).map((promise: Promiselike<any>) => {
				promise.then((result) => {
					resolve(result);
				}, (reason) => {
					reject(reason);
				});
			});
		});
	}
}

window.isDev = chrome.runtime.getManifest().short_name.indexOf('dev') > -1;

((globalObject: GlobalObject, sandboxes: {
	sandboxChrome: (api: string, args: Array<any>) => any;
	sandbox: (id: number, script: string, libraries: Array<string>,
		secretKey: Array<number>, getInstances: () => Array<{
			id: string;
			tabIndex: number;
		}>,
		callback: (worker: any) => void) => void;
}) => {
	globalObject.globals = {
		latestId: 0,
		storages: {
			settingsStorage: null,
			globalExcludes: null,
			resourceKeys: null,
			urlDataPairs: null,
			storageLocal: null,
			nodeStorage: null,
			resources: null
		},
		background: {
			workers: [],
			byId: {}
		},
		crm: {
			crmTree: [],
			crmById: {},
			safeTree: [],
			crmByIdSafe: {}
		},
		keys: {},
		availablePermissions: [],
		crmValues: {
			tabData: {
				0: {
					nodes: {},
					libraries: {}
				}
			},
			rootId: null,
			contextMenuIds: {},
			nodeInstances: {},
			contextMenuInfoById: {},
			contextMenuItemTree: [],
			hideNodesOnPagesData: {},
			stylesheetNodeStatusses: {}
		},
		toExecuteNodes: {
			onUrl: {},
			always: []
		},
		sendCallbackMessage: (tabId: number, tabIndex: number, id: number, data: {
			err: boolean;
			errorMessage?: string;
			args?: Array<any>;
			callbackId: number;
		}) => {
			const message = {
				type: (data.err ? 'error' : 'success'),
				data: (data.err ? data.errorMessage : data.args),
				callbackId: data.callbackId,
				messageType: 'callback'
			};

			try {
				globalObject.globals.crmValues.tabData[tabId].nodes[id][tabIndex].port
					.postMessage(message);
			} catch (e) {
				if (e.message === 'Converting circular structure to JSON') {
					message.data =
						'Converting circular structure to JSON, getting a response from this API will not work';
					message.type = 'error';
					globalObject.globals.crmValues.tabData[tabId].nodes[id][tabIndex].port
						.postMessage(message);
				} else {
					throw e;
				}
			}
		},
		notificationListeners: {},
		scriptInstallListeners: {},
		logging: {
			filter: {
				id: null,
				tabId: null
			}
		},
		constants: {
			supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'],
			validSchemes: ['http', 'https', 'file', 'ftp', '*'],
			templates: {
				mergeArrays<T extends Array<T> | Array<U>, U>(this: CRMTemplates, mainArray: T, additionArray: T): T {
					for (let i = 0; i < additionArray.length; i++) {
						if (mainArray[i] &&
							typeof additionArray[i] === 'object' &&
							typeof mainArray[i] === 'object' &&
							mainArray[i] !== undefined &&
							mainArray[i] !== null) {
							if (Array.isArray(additionArray[i])) {
								mainArray[i] = this.mergeArrays(mainArray[i] as T, additionArray[i] as T);
							} else {
								mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
							}
						} else {
							mainArray[i] = additionArray[i];
						}
					}
					return mainArray;
				},
				mergeObjects<T extends {
					[key: string]: any;
					[key: number]: any;
				}, Y extends Partial<T>>(this: CRMTemplates, mainObject: T, additions: Y): T & Y {
					for (let key in additions) {
						if (additions.hasOwnProperty(key)) {
							if (typeof additions[key] === 'object' &&
								typeof mainObject[key] === 'object' &&
								mainObject[key] !== undefined &&
								mainObject[key] !== null) {
								if (Array.isArray(additions[key])) {
									mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
								} else {
									mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
								}
							} else {
								mainObject[key] = additions[key];
							}
						}
					}
					return mainObject as T & Y;
				},
				getDefaultNodeInfo(this: CRMTemplates, options: Partial<CRM.NodeInfo> = {}): CRM.NodeInfo {
					const defaultNodeInfo: Partial<CRM.NodeInfo> = {
						permissions: [],
						installDate: new Date().toLocaleDateString(),
						lastUpdatedAt: Date.now(),
						version: '1.0',
						isRoot: false,
						source: 'local'
					};

					return this.mergeObjects(defaultNodeInfo, options) as CRM.NodeInfo;
				},
				getDefaultLinkNode(this: CRMTemplates, options: Partial<CRM.LinkNode> = {}): CRM.LinkNode {
					const defaultNode: Partial<CRM.LinkNode> = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'link',
						showOnSpecified: false,
						nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
						triggers: [
							{
								url: '*://*.example.com/*',
								not: false
							}
						],
						isLocal: false,
						value: [
							{
								newTab: true,
								url: 'https://www.example.com'
							}
						]
					};

					return this.mergeObjects(defaultNode, options) as CRM.LinkNode;
				},
				getDefaultStylesheetValue(this: CRMTemplates, options: Partial<CRM.StylesheetVal> = {}): CRM.StylesheetVal {
					const value: CRM.StylesheetVal = {
						stylesheet: [].join('\n'),
						launchMode: CRMLaunchModes.RUN_ON_CLICKING,
						toggle: false,
						defaultOn: false,
						options: {},
						convertedStylesheet: null
					};

					return this.mergeObjects(value, options) as CRM.StylesheetVal;
				},
				getDefaultScriptValue(this: CRMTemplates, options: Partial<CRM.ScriptVal> = {}): CRM.ScriptVal {
					const value: CRM.ScriptVal = {
						launchMode: CRMLaunchModes.RUN_ON_CLICKING,
						backgroundLibraries: [],
						libraries: [],
						script: [].join('\n'),
						backgroundScript: '',
						metaTags: {},
						options: {}
					};

					return this.mergeObjects(value, options) as CRM.ScriptVal;
				},
				getDefaultScriptNode(this: CRMTemplates, options: CRM.PartialScriptNode = {}): CRM.ScriptNode {
					const defaultNode: CRM.PartialScriptNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'script',
						isLocal: false,
						nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
						triggers: [
							{
								url: '*://*.example.com/*',
								not: false
							}
						],
						value: this.getDefaultScriptValue(options.value)
					};

					return this.mergeObjects(defaultNode, options) as CRM.ScriptNode;
				},
				getDefaultStylesheetNode(this: CRMTemplates, options: CRM.PartialStylesheetNode = {}): CRM.StylesheetNode {
					const defaultNode: CRM.PartialStylesheetNode = {
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

					return this.mergeObjects(defaultNode, options) as CRM.StylesheetNode;
				},
				getDefaultDividerOrMenuNode(this: CRMTemplates, options: Partial<CRM.PassiveNode> = {}, type: 'divider' | 'menu'):
					CRM.DividerNode | CRM.MenuNode {
					const defaultNode: Partial<CRM.PassiveNode> = {
						name: 'name',
						type: type,
						nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
						onContentTypes: [true, true, true, false, false, false],
						isLocal: true,
						value: null,
						showOnSpecified: true,
						children: type === 'menu' ? [] : null,
						permissions: [],
					};

					return this.mergeObjects(defaultNode, options) as any;
				},
				getDefaultDividerNode(this: CRMTemplates, options: Partial<CRM.DividerNode> = {}): CRM.DividerNode {
					return this.getDefaultDividerOrMenuNode(options, 'divider') as CRM.DividerNode;
				},
				getDefaultMenuNode(this: CRMTemplates, options: Partial<CRM.MenuNode> = {}): CRM.MenuNode {
					return this.getDefaultDividerOrMenuNode(options, 'menu') as CRM.MenuNode;
				},
				globalObjectWrapperCode(name: string, wrapperName: string, chromeVal: string): string {
					return `var ${wrapperName} = {};` +
						`for (var prop in ${name}) {` +
						'(function(prop) {' +
						`if (typeof(${name}[prop]) === 'function')  {` +
						`${wrapperName}[prop] = function() { return ${name}[prop].apply(${name}, arguments); }` +
						'}' +
						'else {' +
						`Object.defineProperty(${wrapperName}, prop, {` +
						"'get': function() {" +
						`if (${name}[prop] === ${name}) {` +
						`return ${wrapperName};` +
						'}' +
						"else if (prop === 'crmAPI') {" +
						'return crmAPI' +
						'}' +
						"else if (prop === 'crome') {" +
						`return ${chromeVal}` +
						'}' +
						'else {' +
						`return ${name}[prop];` +
						'}' +
						'},' +
						`'set': function(value) { ${wrapperName}[prop] = value; }` +
						'});' +
						'}' +
						'})(prop);' +
						'}';
				}
			},
			specialJSON: {
				_regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'],
				_getRegexFlags(this: SpecialJSON, expr: RegExp): Array<string> {
					const flags: Array<string> = [];
					this._regexFlagNames.forEach((flagName: string) => {
						if ((expr as any)[flagName]) {
							if (flagName === 'sticky') {
								flags.push('y');
							} else {
								flags.push(flagName[0]);
							}
						}
					});
					return flags;
				},
				_stringifyNonObject(this: SpecialJSON, data: string | number | Function | RegExp | Date | boolean): string {
					if (typeof data === 'function') {
						const fn = data.toString();
						const match = this._fnRegex.exec(fn);
						data = `__fn$${`(${match[2]}){${match[10]}}`}$fn__`;
					} else if (data instanceof RegExp) {
						data = `__regexp$${JSON.stringify({
							regexp: (data as RegExp).source,
							flags: this._getRegexFlags(data)
						})}$regexp__`;
					} else if (data instanceof Date) {
						data = `__date$${data + ''}$date__`;
					} else if (typeof data === 'string') {
						data = (data as string).replace(/\$/g, '\\$');
					}
					return JSON.stringify(data);
				},
				_fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
				_specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,
				_fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
				_parseNonObject(this: SpecialJSON, data: string): string | number | Function | RegExp | Date | boolean {
					const dataParsed = JSON.parse(data);
					if (typeof dataParsed === 'string') {
						let matchedData: RegExpExecArray;
						if ((matchedData = this._specialStringRegex.exec(dataParsed))) {
							const dataContent = matchedData[2];
							switch (matchedData[1]) {
								case 'fn':
									const fnRegexed = this._fnCommRegex.exec(dataContent);
									if (fnRegexed[1].trim() !== '') {
										return Function(...fnRegexed[1].split(','), fnRegexed[6]);
									} else {
										return new Function(fnRegexed[6]);
									}
								case 'regexp':
									const regExpParsed = JSON.parse(dataContent);
									return new RegExp(regExpParsed.regexp, regExpParsed.flags.join(''));
								case 'date':
									return new Date();
							}
						} else {
							return dataParsed.replace(/\\\$/g, '$');
						}
					}
					return dataParsed;
				},
				_iterate(this: SpecialJSON, copyTarget: ArrOrObj, iterable: ArrOrObj,
					fn: (data: any, index: string | number, container: ArrOrObj) => any) {
					if (Array.isArray(iterable)) {
						copyTarget = copyTarget || [];
						(iterable as Array<any>).forEach((data: any, key: number, container: Array<any>) => {
							(copyTarget as any)[key] = fn(data, key, container);
						});
					} else {
						copyTarget = copyTarget || {};
						Object.getOwnPropertyNames(iterable).forEach((key) => {
							(copyTarget as any)[key] = fn(iterable[key], key, iterable);
						});
					}
					return copyTarget;
				},
				_isObject(this: SpecialJSON, data: any): boolean {
					if (data instanceof Date || data instanceof RegExp || data instanceof Function) {
						return false;
					}
					return typeof data === 'object' && !Array.isArray(data);
				},
				_toJSON(this: SpecialJSON, copyTarget: ArrOrObj, data: any, path: Array<string | number>, refData: {
					refs: Refs,
					paths: Array<Array<string | number>>,
					originalValues: Array<any>
				}): {
					refs: Refs;
					data: Array<any>;
					rootType: 'array';
				} | {
						refs: Refs;
						data: {
							[key: string]: any;
						};
						rootType: 'object';
					} | {
						refs: Refs;
						data: string;
						rootType: 'normal';
					} {
					if (!(this._isObject(data) || Array.isArray(data))) {
						return {
							refs: [],
							data: this._stringifyNonObject(data),
							rootType: 'normal'
						};
					} else {
						if (refData.originalValues.indexOf(data) === -1) {
							const index = refData.refs.length;
							refData.refs[index] = copyTarget;
							refData.paths[index] = path;
							refData.originalValues[index] = data;
						}
						copyTarget = this._iterate(copyTarget, data, (element: any, key: string | number) => {
							if (!(this._isObject(element) || Array.isArray(element))) {
								return this._stringifyNonObject(element);
							} else {
								let index: number;
								if ((index = refData.originalValues.indexOf(element)) === -1) {
									index = refData.refs.length;

									copyTarget = (Array.isArray(element) ? [] : {});

									//Filler
									refData.refs.push(null);
									refData.paths[index] = path;
									const newData = this._toJSON(copyTarget[key], element, path.concat(key), refData);
									refData.refs[index] = newData.data;
									refData.originalValues[index] = element;
								}
								return `__$${index}$__`;
							}
						});
						const isArr = Array.isArray(data);
						if (isArr) {
							return {
								refs: refData.refs,
								data: copyTarget as Array<any>,
								rootType: 'array'
							};
						} else {
							return {
								refs: refData.refs,
								data: copyTarget as {
									[key: string]: any;
								},
								rootType: 'object'
							};
						}
					}
				},
				toJSON(this: SpecialJSON, data: any, refs: Refs = []): string {
					const paths: Array<Array<string | number>> = [[]];
					const originalValues = [data];

					if (!(this._isObject(data) || Array.isArray(data))) {
						return JSON.stringify({
							refs: [],
							data: this._stringifyNonObject(data),
							rootType: 'normal',
							paths: []
						});
					} else {
						let copyTarget = (Array.isArray(data) ? [] : {});

						refs.push(copyTarget);
						copyTarget = this._iterate(copyTarget, data, (element: any, key: string | number) => {
							if (!(this._isObject(element) || Array.isArray(element))) {
								return this._stringifyNonObject(element);
							} else {
								let index: number;
								if ((index = originalValues.indexOf(element)) === -1) {
									index = refs.length;

									//Filler
									refs.push(null);
									const newData = this._toJSON((copyTarget as any)[key], element, [key], {
										refs: refs,
										paths: paths,
										originalValues: originalValues
									}).data;
									originalValues[index] = element;
									paths[index] = [key];
									refs[index] = newData;
								}
								return `__$${index}$__`;
							}
						});
						return JSON.stringify({
							refs: refs,
							data: copyTarget,
							rootType: Array.isArray(data) ? 'array' : 'object',
							paths: paths
						});
					}
				},
				_refRegex: /^__\$(\d+)\$__$/,
				_replaceRefs(this: SpecialJSON, data: ArrOrObj, refs: ParsingRefs): ArrOrObj {
					this._iterate(data, data, (element: string) => {
						let match: RegExpExecArray;
						if ((match = this._refRegex.exec(element))) {
							const refNumber = match[1];
							const ref = refs[~~refNumber];
							if (ref.parsed) {
								return ref.ref;
							}
							ref.parsed = true;
							return this._replaceRefs(ref.ref, refs);
						} else {
							return this._parseNonObject(element);
						}
					});

					return data;
				},
				fromJSON(this: SpecialJSON, str: string): any {
					const parsed: {
						refs: Refs;
						data: any;
						rootType: 'normal' | 'array' | 'object';
					} = JSON.parse(str);

					parsed.refs = parsed.refs.map((ref) => {
						return {
							ref: ref,
							parsed: false
						};
					});

					const refs = parsed.refs as Array<{
						ref: Array<any> | {
							[key: string]: any
						};
						parsed: boolean;
					}>;

					if (parsed.rootType === 'normal') {
						return JSON.parse(parsed.data);
					}

					refs[0].parsed = true;
					return this._replaceRefs(refs[0].ref, refs as ParsingRefs);
				}
			},
			contexts: ['page', 'link', 'selection', 'image', 'video', 'audio'],
			permissions: [
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
				'notifications',
				'pageCapture',
				'power',
				'printerProvider',
				'privacy',
				'sessions',
				'system.cpu',
				'system.memory',
				'system.storage',
				'tabs',
				'topSites',
				'tabCapture',
				'tts',
				'webNavigation',
				'webRequest',
				'webRequestBlocking'
			],
			tamperMonkeyExtensions: [
				'gcalenpjmijncebpfijmoaglllgpjagf',
				'dhdgffkkebhmkfjojejmpbldmpobfkfo'
			]
		},
		listeners: {
			idVals: [],
			tabVals: [],
			ids: [],
			tabs: [],
			log: []
		}
	};
	window.logging = globalObject.globals.logging;


	class Helpers {
		/**
		 * JSONfn - javascript (both node.js and browser) plugin to stringify,
		 *          parse and clone objects with Functions, Regexp and Date.
		 *
		 * Version - 0.60.00
		 * Copyright (c) 2012 - 2014 Vadim Kiryukhin
		 * vkiryukhin @ gmail.com
		 * http://www.eslinstructor.net/jsonfn/
		 *
		 * Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
		 */
		static jsonFn = {
			stringify: (obj: any): string => {
				return JSON.stringify(obj, (_: string, value: any) => {
					if (value instanceof Function || typeof value === 'function') {
						return value.toString();
					}
					if (value instanceof RegExp) {
						return '_PxEgEr_' + value;
					}
					return value;
				});
			},
			parse: (str: string, date2Obj?: boolean): any => {
				const iso8061 = date2Obj ?
					/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ :
					false;
				return JSON.parse(str, (key: string, value: any) => {
					if (typeof value !== 'string') {
						return value;
					}
					if (value.length < 8) {
						return value;
					}

					const prefix = value.substring(0, 8);

					if (iso8061 && value.match(iso8061 as RegExp)) {
						return new Date(value);
					}
					if (prefix === 'function') {
						return eval(`(${value})`);
					}
					if (prefix === '_PxEgEr_') {
						return eval(value.slice(8));
					}

					return value;
				});
			}
		};
		static compareArray(firstArray: Array<any>, secondArray: Array<any>): boolean {
			if (!firstArray && !secondArray) {
				return false;
			} else if (!firstArray || !secondArray) {
				return true;
			}
			const firstLength = firstArray.length;
			if (firstLength !== secondArray.length) {
				return false;
			}
			for (let i = 0; i < firstLength; i++) {
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
					} else if (!this._compareObj(firstArray[i], secondArray[i])) {
						return false;
					}
				} else if (firstArray[i] !== secondArray[i]) {
					return false;
				}
			}
			return true;
		}
		static safe(node: CRM.MenuNode): CRM.SafeMenuNode;
		static safe(node: CRM.LinkNode): CRM.SafeLinkNode;
		static safe(node: CRM.ScriptNode): CRM.SafeScriptNode;
		static safe(node: CRM.DividerNode): CRM.SafeDividerNode;
		static safe(node: CRM.StylesheetNode): CRM.SafeStylesheetNode;
		static safe(node: CRM.Node): CRM.SafeNode;
		static safe(node: CRM.Node): CRM.SafeNode {
			return globalObject.globals.crm.crmByIdSafe[node.id];
		}
		static createSecretKey(): Array<number> {
			const key: Array<number> = [];
			for (let i = 0; i < 25; i++) {
				key[i] = Math.round(Math.random() * 100);
			}
			if (!globalObject.globals.keys[key.join(',')]) {
				globalObject.globals.keys[key.join(',')] = true;
				return key;
			} else {
				return this.createSecretKey();
			}
		}
		static generateItemId(): number {
			globalObject.globals.latestId = globalObject.globals.latestId || 0;
			globalObject.globals.latestId++;
			if (globalObject.globals.storages.settingsStorage) {
				Storages.applyChanges({
					type: 'optionsPage',
					settingsChanges: [{
						key: 'latestId',
						oldValue: globalObject.globals.latestId - 1,
						newValue: globalObject.globals.latestId
					}]
				});
			}
			return globalObject.globals.latestId;
		}
		static convertFileToDataURI(url: string, callback: (dataURI: string,
			dataString: string) => void,
			onError?: () => void) {
			const xhr = new window.XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.onload = () => {
				const readerResults: [string, string] = [null, null];

				const blobReader = new FileReader();
				blobReader.onloadend = () => {
					readerResults[0] = blobReader.result;
					if (readerResults[1]) {
						callback(readerResults[0], readerResults[1]);
					}
				};
				blobReader.readAsDataURL(xhr.response);

				const textReader = new FileReader();
				textReader.onloadend = () => {
					readerResults[1] = textReader.result;
					if (readerResults[0]) {
						callback(readerResults[0], readerResults[1]);
					}
				};
				textReader.readAsText(xhr.response);
			};
			if (onError) {
				xhr.onerror = onError;
			}
			xhr.open('GET', url);
			xhr.send();
		}
		static isNewer(newVersion: string, oldVersion: string): boolean {
			const newSplit = newVersion.split('.');
			const oldSplit = oldVersion.split('.');

			const longest = (newSplit.length > oldSplit.length ?
				newSplit.length :
				oldSplit.length);
			for (let i = 0; i < longest; i++) {
				const newNum = ~~newSplit[i];
				const oldNum = ~~oldSplit[i];
				if (newNum > oldNum) {
					return true;
				} else if (newNum < oldNum) {
					return false;
				}
			}
			return false;
		}
		static pushIntoArray<T, U>(toPush: T, position: number, target: Array<T | U>): Array<T | U> {
			if (position === target.length) {
				target[position] = toPush;
			} else {
				const length = target.length + 1;
				let temp1: T | U = target[position];
				let temp2: T | U = toPush;
				for (let i = position; i < length; i++) {
					target[i] = temp2;
					temp2 = temp1;
					temp1 = target[i + 1];
				}
			}
			return target;
		}
		static flattenCrm(searchScope: Array<CRM.Node>, obj: CRM.Node) {
			searchScope.push(obj);
			if (obj.type === 'menu' && obj.children) {
				obj.children.forEach((child: CRM.Node) => {
					this.flattenCrm(searchScope, child);
				});
			}
		}
		static checkForChromeErrors(log: boolean) {
			if (chrome.runtime.lastError && log) {
				console.log('chrome runtime error', chrome.runtime.lastError);
			}
		}
		static removeTab(tabId: number) {
			const nodeStatusses = globalObject.globals.crmValues.stylesheetNodeStatusses;
			for (let nodeId in nodeStatusses) {
				if (nodeStatusses.hasOwnProperty(nodeId)) {
					if (nodeStatusses[nodeId][tabId]) {
						delete nodeStatusses[nodeId][tabId];
					}
				}
			}

			delete globalObject.globals.crmValues.tabData[tabId];
		}
		static leftPad(char: string, amount: number): string {
			let res = '';
			for (let i = 0; i < amount; i++) {
				res += char;
			}
			return res;
		}
		static getLastItem<T>(arr: Array<T>): T {
			return arr[arr.length - 1];
		}
		static endsWith(haystack: string, needle: string): boolean {
			return haystack.split('').reverse().join('').indexOf(needle.split('').reverse().join('')) === 0;
		}
		static isTamperMonkeyEnabled(callback: (result: boolean) => void) {
			chrome.management.getAll((installedExtensions) => {
				const TMExtensions = installedExtensions.filter((extension) => {
					return globalObject.globals.constants.tamperMonkeyExtensions.indexOf(extension.id) > -1 &&
						extension.enabled;
				});
				callback(TMExtensions.length > 0);
			});
		}

		private static _compareObj(firstObj: {
			[key: string]: any;
			[key: number]: any;
		}, secondObj: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			for (let key in firstObj) {
				if (firstObj.hasOwnProperty(key) && firstObj[key] !== undefined) {
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
						} else if (!this._compareObj(firstObj[key], secondObj[key])) {
							return false;
						}
					} else if (firstObj[key] !== secondObj[key]) {
						return false;
					}
				}
			}
			return true;
		}
	}

	class GlobalDeclarations {
		static initGlobalFunctions() {
			window.getID = (name: string) => {
				name = name.toLocaleLowerCase();
				const matches: Array<{
					id: number;
					node: CRM.ScriptNode;
				}> = [];
				for (let id in globalObject.globals.crm.crmById) {
					if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
						const node = globalObject.globals.crm.crmById[id];
						const nodeName = node.name;
						if (node.type === 'script' &&
							typeof nodeName === 'string' &&
							name === nodeName.toLocaleLowerCase()) {
							matches.push({
								id: (id as any) as number,
								node: node
							});
						}
					}
				}

				if (matches.length === 0) {
					console.log('Unfortunately no matches were found, please try again');
				} else if (matches.length === 1) {
					console.log('One match was found, the id is ', matches[0].id,
						' and the script is ', matches[0].node);
				} else {
					console.log('Found multiple matches, here they are:');
					matches.forEach((match) => {
						console.log('Id is', match.id, ', script is', match.node);
					});
				}
			};

			window.filter = (nodeId: number | string, tabId: string | number | void) => {
				globalObject.globals.logging.filter = {
					id: ~~nodeId,
					tabId: tabId !== undefined ? ~~tabId : null
				};
			};

			window._listenIds = (listener: (ids: Array<{
				id: number;
				title: string;
			}>) => void) => {
				listener(Logging.Listeners.updateTabAndIdLists(true).ids);
				globalObject.globals.listeners.ids.push(listener);
			};

			window._listenTabs = (listener: (tabs: Array<TabData>) => void) => {
				listener(Logging.Listeners.updateTabAndIdLists(true).tabs);
				globalObject.globals.listeners.tabs.push(listener);
			};

			function sortMessages(messages: Array<LogListenerLine>):
				Array<LogListenerLine> {
				return messages.sort((a, b) => {
					return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
				});
			}

			function filterMessageText(messages: Array<LogListenerLine>,
				filter: string):
				Array<LogListenerLine> {
				if (filter === '') {
					return messages;
				}

				const filterRegex = new RegExp(filter);
				return messages.filter((message: LogListenerLine) => {
					for (let i = 0; i < message.data.length; i++) {
						if (typeof message.data[i] !== 'function' &&
							typeof message.data[i] !== 'object') {
							if (filterRegex.test(String(message.data[i]))) {
								return true;
							}
						}
					}
					return false;
				});
			}

			function getLog(id: string | number, tab: string | number, text: string):
				Array<LogListenerLine> {
				let messages: Array<LogListenerLine> = [];
				if (id === 'all') {
					for (let nodeId in globalObject.globals.logging) {
						if (globalObject.globals.logging.hasOwnProperty(nodeId) &&
							nodeId !== 'filter') {
							messages = messages.concat(
								globalObject.globals.logging[nodeId].logMessages as Array<LogListenerLine>
							);
						}
					}
				} else {
					messages = globalObject.globals.logging[id as number].logMessages as Array<LogListenerLine> || [];
				}
				if (tab === 'all') {
					return sortMessages(filterMessageText(messages, text));
				} else {
					return sortMessages(filterMessageText(messages.filter((message) => {
						return message.tabId === tab;
					}), text));
				}
			}

			function updateLog(this: LogListenerObject, id: number | 'ALL', tab: number | 'ALL' | 'background', textFilter: string): Array<LogListenerLine> {
				if (id === 'ALL' || id === 0) {
					this.id = 'all';
				} else {
					this.id = id;
				}
				if (tab === 'ALL' || tab === 0) {
					this.tab = 'all';
				} else if (typeof tab === 'string' && tab.toLowerCase() === 'background') {
					this.tab = 0;
				} else {
					this.tab = tab;
				}
				if (!textFilter) {
					this.text = '';
				} else {
					this.text = textFilter;
				}

				return getLog(this.id, this.tab, this.text);
			}

			window._listenLog = (listener: LogListener,
				callback: (filterObj: LogListenerObject) => void):
				Array<LogListenerLine> => {
				const filterObj: LogListenerObject = {
					id: 'all',
					tab: 'all',
					text: '',
					listener: listener,
					update(id, tab, textFilter) {
						return updateLog.apply(filterObj, [id, tab, textFilter]);
					},
					index: globalObject.globals.listeners.log.length
				};

				callback(filterObj);

				globalObject.globals.listeners.log.push(filterObj);

				return getLog('all', 'all', '');
			};

			function checkJobs<T>(jobs: Array<{
				done: boolean;
				result?: T;
				finished?: boolean;
			}>, oldResults: Array<T>, onDone: (results: Array<T>) => void): void {
				if (jobs[0].finished) {
					return;
				}
				for (let i = 0; i < jobs.length; i++) {
					if (jobs[i].done === false) {
						return;
					}
				}
				jobs[0].finished = true;
				const newResults = jobs
					.map((job) => job.result)
					.filter((jobResult) => !!jobResult);

				//Preserve === equality if nothing changed
				if (JSON.stringify(newResults) === JSON.stringify(oldResults)) {
					onDone(oldResults);
				} else {
					onDone(newResults);
				}
			}

			window._getIdCurrentTabs = (id: number, currentTabs: Array<TabData>, callback: (tabs: Array<TabData>) => void) => {
				const jobs: Array<{
					done: boolean;
					result?: {
						id: number | 'background';
						title: string;
					};
					finished?: boolean;
				}> = [];

				const tabData = globalObject.globals.crmValues.tabData;
				for (let tabId in tabData) {
					if (tabData.hasOwnProperty(tabId)) {
						if (tabData[tabId].nodes[id] || id === 0) {
							if (tabId === '0') {
								jobs.push({
									done: true,
									result: {
										id: 'background',
										title: 'background'
									}
								});
							} else {
								let index = jobs.length;
								jobs.push({
									done: false
								});
								chrome.tabs.get(~~tabId, (tab) => {
									if (chrome.runtime.lastError) {
										//Tab does not exist, remove it from tabData
										Helpers.removeTab(~~tabId);
										return;
									}

									jobs[index].done = true;
									jobs[index].result = ({
										id: ~~tabId,
										title: tab.title
									});
									checkJobs(jobs, currentTabs, callback);
								});
							}
						}
					}
				}
				checkJobs(jobs, currentTabs, callback);
			};
			window._getCurrentTabIndex = (id: number, currentTab: TabData, listener: (newTabIndexes: Array<number>) => void) => {
				if (currentTab.id === 'background') {
					listener([0]);
				} else {
					listener(globalObject
						.globals
						.crmValues
						.tabData[currentTab.id as number]
						.nodes[id].map((element, index) => {
							return index;
						}));
				}
			}
		}
		private static permissionsChanged(available: chrome.permissions.Permissions) {
			globalObject.globals.availablePermissions = available.permissions;
		}
		static refreshPermissions() {
			chrome.permissions.onRemoved.addListener(this.permissionsChanged);
			chrome.permissions.onAdded.addListener(this.permissionsChanged);
			chrome.permissions.getAll(this.permissionsChanged);
		}
		static setHandlerFunction() {
			interface HandshakeMessage extends CRMAPIMessage<string, any> {
				key?: Array<number>;
			}

			window.createHandlerFunction = (port) => {
				return (message: HandshakeMessage) => {
					const crmValues = globalObject.globals.crmValues;
					const tabData = crmValues.tabData;
					const nodeInstances = crmValues.nodeInstances;
					const tabNodeData = Helpers.getLastItem(
						tabData[message.tabId].nodes[message.id]
					);
					if (!tabNodeData.port) {
						if (Helpers.compareArray(tabNodeData.secretKey, message.key)) {
							delete tabNodeData.secretKey;
							tabNodeData.port = port;

							if (!nodeInstances[message.id]) {
								nodeInstances[message.id] = {};
							}

							const instancesArr: Array<{
								id: number;
								tabIndex: number;
							}> = [];
							for (let instance in nodeInstances[message.id]) {
								if (nodeInstances[message.id].hasOwnProperty(instance) &&
									nodeInstances[message.id][instance]) {

									try {
										tabData[instance].nodes[message.id].forEach((tabInstance, index, arr) => {
											if (~~instance === message.tabId && index === arr.length - 1) {
												return;
											}
											instancesArr.push({
												id: ~~instance,
												tabIndex: index
											});
											tabInstance.port.postMessage({
												change: {
													type: 'added',
													value: ~~message.tabId,
													tabIndex: index
												},
												messageType: 'instancesUpdate'
											});
										});
									} catch (e) {
										delete nodeInstances[message.id][instance];
									}
								}
							}

							nodeInstances[message.id][message.tabId] =
								nodeInstances[message.id][message.tabId] || [];
							nodeInstances[message.id][message.tabId].push({
								hasHandler: false
							});

							port.postMessage({
								data: 'connected',
								instances: instancesArr
							});
						}
					} else {
						MessageHandling.handleCrmAPIMessage((message as any) as CRMFunctionMessage | ChromeAPIMessage);
					}
				};
			};
		}
		static init() {
			function removeNode(node: ContextMenuItemTreeItem) {
				chrome.contextMenus.remove(node.id, () => {
					Helpers.checkForChromeErrors(false);
				});
			}

			function setStatusForTree(tree: Array<ContextMenuItemTreeItem>,
				enabled: boolean) {
				for (let i = 0; i < tree.length; i++) {
					tree[i].enabled = enabled;
					if (tree[i].children) {
						setStatusForTree(tree[i].children, enabled);
					}
				}
			}

			function getFirstRowChange(row: Array<ContextMenuItemTreeItem>, changes: {
				[nodeId: number]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
			}) {
				for (let i = 0; i < row.length; i++) {
					if (row[i] && changes[row[i].id]) {
						return i;
					}
				}
				return Infinity;
			}

			function reCreateNode(parentId: number, node: ContextMenuItemTreeItem, changes: {
				[nodeId: number]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
			}) {
				const oldId = node.id;
				node.enabled = true;
				const settings = globalObject.globals.crmValues.contextMenuInfoById[node
					.id]
					.settings;
				if (node.node.type === 'stylesheet' && node.node.value.toggle) {
					settings.checked = node.node.value.defaultOn;
				}
				settings.parentId = parentId;

				//This is added by chrome to the object during/after creation so delete it manually
				delete settings.generatedId;
				const id = chrome.contextMenus.create(settings);

				//Update ID
				node.id = id;
				globalObject.globals.crmValues.contextMenuIds[node.node.id] = id;
				globalObject.globals.crmValues.contextMenuInfoById[id] = globalObject
					.globals
					.crmValues.contextMenuInfoById[oldId];
				globalObject.globals.crmValues.contextMenuInfoById[oldId] = undefined;
				globalObject.globals.crmValues.contextMenuInfoById[id].enabled = true;

				if (node.children) {
					buildSubTreeFromNothing(id, node.children, changes);
				}
			}

			function buildSubTreeFromNothing(parentId: number,
				tree: Array<ContextMenuItemTreeItem>, changes: {
					[nodeId: number]: {
						node: CRM.Node;
						type: 'hide' | 'show';
					}
				}) {
				for (let i = 0; i < tree.length; i++) {
					if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') ||
						!changes[tree[i].id]) {
						reCreateNode(parentId, tree[i], changes);
					} else {
						globalObject.globals.crmValues.contextMenuInfoById[tree[i].id]
							.enabled = false;
					}
				}
			}

			function applyNodeChangesOntree(parentId: number,
				tree: Array<ContextMenuItemTreeItem>, changes: {
					[nodeId: number]: {
						node: CRM.Node;
						type: 'hide' | 'show';
					}
				}) {
				//Remove all nodes below it and re-enable them and its children

				//Remove all nodes below it and store them
				const firstChangeIndex = getFirstRowChange(tree, changes);
				if (firstChangeIndex < tree.length) {
					for (let i = 0; i < firstChangeIndex; i++) {
						//Normally check its children
						if (tree[i].children && tree[i].children.length > 0) {
							applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
						}
					}
				}

				for (let i = firstChangeIndex; i < tree.length; i++) {
					if (changes[tree[i].id]) {
						if (changes[tree[i].id].type === 'hide') {
							//Don't check its children, just remove it
							removeNode(tree[i]);

							//Set it and its children's status to hidden
							tree[i].enabled = false;
							if (tree[i].children) {
								setStatusForTree(tree[i].children, false);
							}
						} else {
							//Remove every node after it and show them again
							const enableAfter = [tree[i]];
							for (let j = i + 1; j < tree.length; j++) {
								if (changes[tree[j].id]) {
									if (changes[tree[j].id].type === 'hide') {
										removeNode(tree[j]);
										globalObject.globals.crmValues.contextMenuItemTree[tree[j].id]
											.enabled = false;
									} else { //Is in toShow
										enableAfter.push(tree[j]);
									}
								} else if (tree[j].enabled) {
									enableAfter.push(tree[j]);
									removeNode(tree[j]);
								}
							}

							for (let j = 0; j < enableAfter.length; j++) {
								reCreateNode(parentId, enableAfter[j], changes);
							}
						}
					}
				}

			}

			function getNodeStatusses(subtree: Array<ContextMenuItemTreeItem>,
				hiddenNodes: Array<ContextMenuItemTreeItem>,
				shownNodes: Array<ContextMenuItemTreeItem>) {
				for (let i = 0; i < subtree.length; i++) {
					if (subtree[i]) {
						(subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
						getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
					}
				}
			}

			function tabChangeListener(changeInfo: {
				tabIds?: Array<number>;
				tabs: Array<number>;
				windowId?: number;
			}) {
				//Horrible workaround that allows the hiding of nodes on certain url's that
				//	surprisingly only takes ~1-2ms per tab switch.
				const currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
				chrome.tabs.get(currentTabId, (tab) => {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError.message);
						return;
					}

					//Show/remove nodes based on current URL
					const toHide: Array<{
						node: CRM.Node;
						id: number;
					}> = [];
					const toEnable: Array<{
						node: CRM.Node;
						id: number;
					}> = [];

					const changes: {
						[nodeId: number]: {
							node: CRM.Node;
							type: 'hide' | 'show';
						}
					} = {};
					const shownNodes: Array<ContextMenuItemTreeItem> = [];
					const hiddenNodes: Array<ContextMenuItemTreeItem> = [];
					getNodeStatusses(globalObject.globals.crmValues.contextMenuItemTree,
						hiddenNodes, shownNodes);


					//Find nodes to enable
					let hideOn: Array<{
						not: boolean;
						url: string;
					}>;
					for (let i = 0; i < hiddenNodes.length; i++) {
						hideOn = globalObject.globals.crmValues
							.hideNodesOnPagesData[hiddenNodes[i]
								.node.id];
						if (!hideOn || !URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
							//Don't hide on current url
							toEnable.push({
								node: hiddenNodes[i].node,
								id: hiddenNodes[i].id
							});
						}
					}

					//Find nodes to hide
					for (let i = 0; i < shownNodes.length; i++) {
						hideOn = globalObject.globals.crmValues
							.hideNodesOnPagesData[shownNodes[i]
								.node.id];
						if (hideOn) {
							if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
								//Don't hide on current url
								toHide.push({
									node: shownNodes[i].node,
									id: shownNodes[i].id
								});
							}
						}
					}

					//Re-check if the toEnable nodes might be disabled after all
					let length = toEnable.length;
					for (let i = 0; i < length; i++) {
						hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[toEnable[i]
							.node.id];
						if (hideOn) {
							if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
								//Don't hide on current url
								toEnable.splice(i, 1);
								length--;
								i--;
							}
						}
					}

					for (let i = 0; i < toHide.length; i++) {
						changes[toHide[i].id] = {
							node: toHide[i].node,
							type: 'hide'
						};
					}
					for (let i = 0; i < toEnable.length; i++) {
						changes[toEnable[i].id] = {
							node: toEnable[i].node,
							type: 'show'
						};
					}

					//Apply changes
					applyNodeChangesOntree(globalObject.globals.crmValues.rootId, globalObject
						.globals.crmValues.contextMenuItemTree, changes);
				});

				const statuses = globalObject.globals.crmValues.stylesheetNodeStatusses;

				function checkForRuntimeErrors() {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					}
				}

				for (let nodeId in statuses) {
					if (statuses.hasOwnProperty(nodeId) && statuses[nodeId]) {
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[nodeId], {
								checked: typeof statuses[nodeId][currentTabId] !== 'boolean' ?
									statuses[nodeId].defaultValue :
									statuses[nodeId][currentTabId]
							}, checkForRuntimeErrors);
					}
				}
			}

			function listenTabsRemoved() {
				chrome.tabs.onRemoved.addListener((tabId) => {
					//Delete all data for this tabId
					for (let node in globalObject.globals.crmValues.stylesheetNodeStatusses) {
						if (globalObject.globals.crmValues.stylesheetNodeStatusses
							.hasOwnProperty(node) &&
							globalObject.globals.crmValues.stylesheetNodeStatusses[node]) {
							globalObject.globals.crmValues
								.stylesheetNodeStatusses[node][tabId] = undefined;
						}
					}

					//Delete this instance if it exists
					const deleted: Array<number> = [];
					for (let node in globalObject.globals.crmValues.nodeInstances) {
						if (globalObject.globals.crmValues.nodeInstances.hasOwnProperty(node) &&
							globalObject.globals.crmValues.nodeInstances[node]) {
							if (globalObject.globals.crmValues.nodeInstances[node][tabId]) {
								deleted.push((node as any) as number);
								globalObject.globals.crmValues.nodeInstances[node][tabId] = undefined;
							}
						}
					}

					for (let i = 0; i < deleted.length; i++) {
						if ((deleted[i] as any).node && (deleted[i] as any).node.id !== undefined) {
							globalObject.globals.crmValues.tabData[tabId].nodes[(deleted[i] as any).node.id].forEach((tabInstance) => {
								tabInstance.port.postMessage({
									change: {
										type: 'removed',
										value: tabId
									},
									messageType: 'instancesUpdate'
								});
							});
						}
					}

					delete globalObject.globals.crmValues.tabData[tabId];
					Logging.Listeners.updateTabAndIdLists();
				});
			}

			function listenNotifications() {
				if (chrome.notifications) {
					chrome.notifications.onClicked.addListener((notificationId: string) => {
						const notification = globalObject.globals
							.notificationListeners[notificationId];
						if (notification && notification.onClick !== undefined) {
							globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex,
								notification.id, {
									err: false,
									args: [notificationId],
									callbackId: notification.onClick
								});
						}
					});
					chrome.notifications.onClosed.addListener((notificationId, byUser) => {
						const notification = globalObject.globals
							.notificationListeners[notificationId];
						if (notification && notification.onDone !== undefined) {
							globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex,
								notification.id, {
									err: false,
									args: [notificationId, byUser],
									callbackId: notification.onClick
								});
						}
						delete globalObject.globals.notificationListeners[notificationId];
					});
				}
			}

			function updateTamperMonkeyInstallState() {
				Helpers.isTamperMonkeyEnabled((isEnabled) => {
					globalObject.globals.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
					chrome.storage.local.set({
						useAsUserscriptInstaller: !isEnabled
					});
				});
			}

			function listenTamperMonkeyInstallState() {
				updateTamperMonkeyInstallState();
				chrome.management.onInstalled.addListener(updateTamperMonkeyInstallState);
				chrome.management.onEnabled.addListener(updateTamperMonkeyInstallState);
				chrome.management.onUninstalled.addListener(updateTamperMonkeyInstallState);
				chrome.management.onDisabled.addListener(updateTamperMonkeyInstallState);
			}

			chrome.tabs.onHighlighted.addListener(tabChangeListener);
			chrome.webRequest.onBeforeRequest.addListener(
				(details) => {
					const split = details.url
						.split(`chrome-extension://${chrome.runtime.id}/resource/`)[1].split('/');
					const name = split[0];
					const scriptId = ~~split[1];
					return {
						redirectUrl: this.getResourceData(name, scriptId)
					};
				}, {
					urls: [`chrome-extension://${chrome.runtime.id}/resource/*`]
				}, ['blocking']);
			listenTabsRemoved();
			listenNotifications();
			listenTamperMonkeyInstallState();
		}

		static getResourceData(name: string, scriptId: number) {
			if (globalObject.globals.storages.resources[scriptId][name] &&
				globalObject.globals.storages.resources[scriptId][name].matchesHashes) {
				return globalObject.globals.storages.urlDataPairs[globalObject.globals
					.storages.resources[scriptId][name].sourceUrl].dataURI;
			}
			return null;
		}
	}

	class Logging {
		static LogExecution = class LogExecution {
			static parent = Logging;

			static executeCRMCode(message: {
				code: any,
				id: number,
				tabIndex: number;
				tab: number,
				logListener: LogListenerObject;
			}, type: 'executeCRMCode' | 'getCRMHints' | 'createLocalLogVariable') {
				//Get the port
				if (!globalObject.globals.crmValues.tabData[message.tab]) {
					return;
				}
				globalObject.globals.crmValues.tabData[message.tab].nodes[message.id][message.tabIndex].port
					.postMessage({
						messageType: type,
						code: message.code,
						logCallbackIndex: message.logListener.index
					});
			}
			static displayHints(message: CRMAPIMessage<'displayHints', {
				hints: Array<string>;
				id: number;
				callbackIndex: number;
				tabId: number;
			}>) {
				globalObject.globals.listeners.log[message.data.callbackIndex].listener({
					id: message.id,
					tabId: message.tabId,
					tabIndex: message.tabIndex,
					type: 'hints',
					suggestions: message.data.hints
				});
			}
		};
		static Listeners = class Listeners {
			static parent = Logging;

			static updateTabAndIdLists(force?: boolean): {
				ids: Array<{
					id: number;
					title: string;
				}>;
				tabs: Array<TabData>
			} {
				//Make sure anybody is listening
				const listeners = globalObject.globals.listeners;
				if (!force && listeners.ids.length === 0 && listeners.tabs.length === 0) {
					return {
						ids: [],
						tabs: []
					};
				}

				const ids: {
					[nodeId: number]: boolean;
				} = {};
				const tabIds: {
					[tabId: string]: boolean,
					[tabId: number]: boolean;
				} = {};
				const tabData = globalObject.globals.crmValues.tabData;
				for (let tabId in tabData) {
					if (tabData.hasOwnProperty(tabId)) {
						if (tabId === '0') {
							tabIds['background'] = true;
						} else {
							tabIds[tabId] = true;
						}
						const nodes = tabData[tabId].nodes;
						for (let nodeId in nodes) {
							if (nodes.hasOwnProperty(nodeId)) {
								ids[(nodeId as any) as number] = true;
							}
						}
					}
				}

				let idArr: Array<number> = [];
				for (let id in ids) {
					if (ids.hasOwnProperty(id)) {
						idArr.push((id as any) as number);
					}
				}

				let tabArr: Array<any> = [];
				for (let tabId in tabIds) {
					if (tabIds.hasOwnProperty(tabId)) {
						tabArr.push((tabId as any) as number);
					}
				}

				idArr = idArr.sort((a, b) => {
					return a - b;
				});

				tabArr = tabArr.sort((a, b) => {
					return a - b;
				});

				const idPairs: Array<{
					id: number;
					title: string;
				}> = idArr.map((id) => {
					return {
						id: id,
						title: globalObject.globals.crm.crmById[id].name
					};
				});

				if (!Helpers.compareArray(idArr, listeners.idVals)) {
					listeners.ids.forEach((idListener) => {
						idListener(idPairs);
					});
					listeners.idVals = idArr;
				}
				if (!Helpers.compareArray(tabArr, listeners.tabVals)) {
					listeners.tabs.forEach((tabListener) => {
						tabListener(tabArr);
					});
					listeners.tabVals = tabArr;
				}

				return {
					ids: idPairs,
					tabs: tabArr
				};
			}
		};

		static log(nodeId: number, tabId: number | string, ...args: Array<any>) {
			if (globalObject.globals.logging.filter.id !== null) {
				if (nodeId === globalObject.globals.logging.filter.id) {
					if (globalObject.globals.logging.filter.tabId !== null) {
						if (tabId === '*' ||
							tabId === globalObject.globals.logging.filter.tabId) {
							console.log.apply(console, args);
						}
					} else {
						console.log.apply(console, args);
					}
				}
			} else {
				console.log.apply(console, args);
			}
		}
		static backgroundPageLog(this: Window | Logging, id: number, sourceData: [string, number], ...args: Array<any>) {
			sourceData = sourceData || [undefined, undefined];

			const srcObjDetails = {
				tabId: 'background',
				nodeTitle: globalObject.globals.crm.crmById[id].name,
				tabTitle: 'Background Page',
				value: args,
				lineNumber: sourceData[0],
				logId: sourceData[1],
				timestamp: new Date().toLocaleString()
			};

			const srcObj: LogListenerLine & typeof srcObjDetails = {
				id: id
			} as any;
			const logArgs = [
				'Background page [', srcObj, ']: '
			].concat(args);

			Logging.log.bind(globalObject, id, 'background')
				.apply(globalObject, logArgs);

			for (let key in srcObjDetails) {
				if (srcObjDetails.hasOwnProperty(key)) {
					(srcObj as any)[key as keyof typeof srcObjDetails] = (srcObjDetails as any)[key];
				}
			}
			globalObject.globals.logging[id] = globalObject.globals.logging[id] as any || {
				logMessages: []
			};
			globalObject.globals.logging[id].logMessages.push(srcObj);
			Logging._updateLogs(srcObj);
		}
		static logHandler(message: {
			type: string;
			id: number;
			lineNumber: string;
			tabId: number;
			tabIndex: number;
			logId: number;
			callbackIndex?: number;
			timestamp?: string;
			data?: any;
			value?: {
				type: 'success';
				result: string;
			} | {
				type: 'error';
				result: {
					stack: string;
					name: string;
					message: string;
				}
			}
		}) {
			this._prepareLog(message.id, message.tabId);
			switch (message.type) {
				case 'evalResult':
					chrome.tabs.get(message.tabId, (tab) => {
						globalObject.globals.listeners.log[message.callbackIndex].listener({
							id: message.id,
							tabId: message.tabId,
							tabIndex: message.tabIndex,
							nodeTitle: globalObject.globals.crm.crmById[message.id].name,
							tabTitle: tab.title,
							type: 'evalResult',
							lineNumber: message.lineNumber,
							timestamp: message.timestamp,
							val: (message.value.type === 'success') ?
								{
									type: 'success',
									result: globalObject.globals.constants.specialJSON.fromJSON(message.value.result as string)
								} : message.value
						});
					});
					break;
				case 'log':
				default:
					this._logHandlerLog({
						type: message.type,
						id: message.id,
						data: message.data,
						tabIndex: message.tabIndex,
						lineNumber: message.lineNumber,
						tabId: message.tabId,
						logId: message.logId,
						callbackIndex: message.callbackIndex,
						timestamp: message.type
					});
					break;
			}
		}

		private static _prepareLog(nodeId: number, tabId: number) {
			if (globalObject.globals.logging[nodeId]) {
				if (!globalObject.globals.logging[nodeId][tabId]) {
					globalObject.globals.logging[nodeId][tabId] = {};
				}
			} else {
				const idObj: {
					values: Array<any>;
					logMessages: Array<LogListenerLine>;
					[tabId: number]: any;
				} = {
						values: [],
						logMessages: []
					};
				idObj[tabId] = {};
				globalObject.globals.logging[nodeId] = idObj;
			}
		}
		private static _updateLogs(newLog: LogListenerLine) {
			globalObject.globals.listeners.log.forEach((logListener) => {
				const idMatches = logListener.id === 'all' || ~~logListener.id === ~~newLog.id;
				const tabMatches = logListener.tab === 'all' ||
					(logListener.tab === 'background' && logListener.tab === newLog.tabId) ||
					(logListener.tab !== 'background' && ~~logListener.tab === ~~newLog.tabId);
				if (idMatches && tabMatches) {
					logListener.listener(newLog);
				}
			});
		}
		private static _logHandlerLog(message: {
			type: string;
			id: number;
			data: string;
			lineNumber: string;
			tabIndex: number;
			tabId: number;
			logId: number;
			callbackIndex?: number;
			timestamp?: string;
		}) {
			const srcObj: {
				id: number;
				tabId: number;
				tabIndex: number;
				tab: chrome.tabs.Tab;
				url: string;
				tabTitle: string;
				node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
				nodeName: string;
			} = {} as any;
			let args = [
				'Log[src:',
				srcObj,
				']: '
			];

			const logValue: LogListenerLine = {
				id: message.id,
				tabId: message.tabId,
				logId: message.logId,
				tabIndex: message.tabIndex,
				lineNumber: message.lineNumber || '?',
				timestamp: new Date().toLocaleString()
			} as any;

			chrome.tabs.get(message.tabId, (tab) => {
				const data: Array<any> = globalObject.globals.constants.specialJSON
					.fromJSON(message.data);
				args = args.concat(data);
				this.log.bind(globalObject, message.id, message.tabId)
					.apply(globalObject, args);

				srcObj.id = message.id;
				srcObj.tabId = message.tabId;
				srcObj.tab = tab;
				srcObj.url = tab.url;
				srcObj.tabIndex = message.tabIndex;
				srcObj.tabTitle = tab.title;
				srcObj.node = globalObject.globals.crm.crmById[message.id];
				srcObj.nodeName = srcObj.node.name;

				logValue.tabTitle = tab.title;
				logValue.nodeTitle = srcObj.nodeName;
				logValue.data = data;

				globalObject.globals.logging[message.id].logMessages.push(logValue);
				this._updateLogs(logValue);
			});
		}
	}

	window.backgroundPageLog = Logging.backgroundPageLog;

	class CRMFunctions {
		static getTree(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.respondSuccess(globalObject.globals.crm.safeTree);
			});
		}
		static getSubTree(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				const nodeId = _this.message.data.nodeId;
				if (typeof nodeId === 'number') {
					const node = globalObject.globals.crm.crmByIdSafe[nodeId];
					if (node) {
						_this.respondSuccess([node]);
					} else {
						_this.respondError(`There is no node with id ${nodeId}`);
					}
				} else {
					_this.respondError('No nodeId supplied');
				}
			});
		}
		static getNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				const nodeId = _this.message.data.nodeId;
				if (typeof nodeId === 'number') {
					const node = globalObject.globals.crm.crmByIdSafe[nodeId];
					if (node) {
						_this.respondSuccess(node);
					} else {
						_this.respondError(`There is no node with id ${nodeId}`);
					}
				} else {
					_this.respondError('No nodeId supplied');
				}
			});
		}
		static getNodeIdFromPath(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				const pathToSearch = _this.message.data.path;
				const lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm
					.safeTree, false);
				if (lookedUp === true) {
					return false;
				} else if (lookedUp === false) {
					_this.respondError('Path does not return a valid value');
					return false;
				} else {
					const lookedUpNode = lookedUp as CRM.SafeNode;
					_this.respondSuccess(lookedUpNode.id);
					return lookedUpNode.id;
				}
			});
		}
		static queryCrm(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.typeCheck([
					{
						val: 'query',
						type: 'object'
					}, {
						val: 'query.type',
						type: 'string',
						optional: true
					}, {
						val: 'query.inSubTree',
						type: 'number',
						optional: true
					}, {
						val: 'query.name',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					const query = _this.message.data.query as {
						type: string;
						inSubTree: number;
						name: string;
					};

					const crmArray = [];
					for (let id in globalObject.globals.crm.crmById) {
						if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
							crmArray.push(globalObject.globals.crm.crmByIdSafe[id]);
						}
					}

					let searchScope = null as any;
					if (optionals['query.inSubTree']) {
						const searchScopeObj = _this.getNodeFromId(
							query.inSubTree,
							true, true);
						let searchScopeObjChildren: Array<CRM.Node> = [];
						if (searchScopeObj) {
							const menuSearchScopeObj = searchScopeObj as CRM.MenuNode;
							searchScopeObjChildren = menuSearchScopeObj.children;
						}

						searchScope = [];
						searchScopeObjChildren.forEach((child) => {
							Helpers.flattenCrm(searchScope, child);
						});
					}
					searchScope = searchScope as Array<any> | void || crmArray;
					let searchScopeArr = searchScope as Array<any>;

					if (optionals['query.type']) {
						searchScopeArr = searchScopeArr.filter((candidate) => {
							return candidate.type === query.type;
						});
					}

					if (optionals['query.name']) {
						searchScopeArr = searchScopeArr.filter((candidate) => {
							return candidate.name === query.name;
						});
					}

					//Filter out all nulls
					searchScopeArr = searchScopeArr.filter((result) => {
						return result !== null;
					}) as Array<any>;

					_this.respondSuccess(searchScopeArr);
				});
			});
		}
		static getParentNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					const pathToSearch = JSON.parse(JSON.stringify(node.path));
					pathToSearch.pop();
					if (pathToSearch.length === 0) {
						_this.respondSuccess(globalObject.globals.crm.safeTree);
					} else {
						const lookedUp = _this.lookup<CRM.SafeNode>(pathToSearch, globalObject.globals.crm
							.safeTree, false);
						_this.respondSuccess(lookedUp);
					}
				});
			});
		}
		static getNodeType(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
					_this.respondSuccess(node.type);
				});
			});
		}
		static getNodeValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
					_this.respondSuccess(node.value);
				});
			});
		}
		static createNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.usesTriggers',
						type: 'boolean',
						optional: true
					}, {
						val: 'options.triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
						optional: true
					}, {
						val: 'options.linkData',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}, {
								val: 'newTab',
								type: 'boolean',
								optional: true
							}
						],
						optional: true
					}, {
						val: 'options.scriptData',
						type: 'object',
						optional: true
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.script',
						type: 'string'
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.launchMode',
						type: 'number',
						optional: true,
						min: 0,
						max: 3
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.triggers',
						type: 'array',
						optional: true,
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						]
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.libraries',
						type: 'array',
						optional: true,
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'options.stylesheetData',
						type: 'object',
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.launchMode',
						type: 'number',
						min: 0,
						max: 3,
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.toggle',
						type: 'boolean',
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.defaultOn',
						type: 'boolean',
						optional: true
					}, {
						val: 'options.value',
						type: 'object',
						optional: true
					}
				], () => {
					const id = Helpers.generateItemId();
					let node = _this.message.data.options;
					node = CRM.makeSafe(node);
					node.id = id;
					node.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
						.nodeInfo;
					if (_this.getNodeFromId(_this.message.id, false, true).isLocal) {
						node.isLocal = true;
					}

					let newNode: CRM.Node;
					switch (_this.message.data.options.type) {
						case 'script':
							newNode = globalObject.globals.constants.templates
								.getDefaultScriptNode(node);
							newNode.type = 'script';
							break;
						case 'stylesheet':
							newNode = globalObject.globals.constants.templates
								.getDefaultStylesheetNode(node);
							newNode.type = 'stylesheet';
							break;
						case 'menu':
							newNode = globalObject.globals.constants.templates
								.getDefaultMenuNode(node);
							newNode.type = 'menu';
							break;
						case 'divider':
							newNode = globalObject.globals.constants.templates
								.getDefaultDividerNode(node);
							newNode.type = 'divider';
							break;
						default:
						case 'link':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'link';
							break;
					}

					if ((newNode = _this.moveNode(newNode, _this.message.data.options.position) as CRM.Node)) {
						CRM.updateCrm([newNode.id]);
						_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
					} else {
						_this.respondError('Failed to place node');
					}
					return true;
				});
			});
		}
		static copyNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.name',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					_this.getNodeFromId(_this.message.data.nodeId, true).run((node: CRM.Node) => {
						let newNode = JSON.parse(JSON.stringify(node));
						newNode.id = Helpers.generateItemId();
						if (_this.getNodeFromId(_this.message.id, false, true).local === true &&
							node.isLocal === true) {
							newNode.isLocal = true;
						}
						newNode.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
							.nodeInfo;
						delete newNode.storage;
						delete newNode.file;
						if (optionals['options.name']) {
							newNode.name = _this.message.data.options.name;
						}
						if ((newNode = _this.moveNode(newNode, _this.message.data.options
							.position))) {
							CRM.updateCrm([newNode.id]);
							_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
						}
						return true;
					});
					return true;
				});
			});
			return true;
		}
		static moveNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					//Remove original from CRM
					const parentChildren = _this.lookup(node.path, globalObject.globals.crm
						.crmTree, true);
					//parentChildren.splice(node.path[node.path.length - 1], 1);

					if ((node = _this.moveNode(node, _this.message.data.position as {
						position: number;
					}, {
							children: parentChildren,
							index: node.path[node.path.length - 1]
						}) as CRM.Node)) {
						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
					}
				});
			});
		}
		static deleteNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					const parentChildren = _this.lookup(node.path, globalObject.globals.crm
						.crmTree, true) as Array<CRM.Node>;
					parentChildren.splice(node.path[node.path.length - 1], 1);
					if (globalObject.globals.crmValues.contextMenuIds[node
						.id] !==
						undefined) {
						chrome.contextMenus.remove(globalObject.globals.crmValues
							.contextMenuIds[node.id], () => {
								CRM.updateCrm([_this.message.data.nodeId]);
								_this.respondSuccess(true);
							});
					} else {
						CRM.updateCrm([_this.message.data.nodeId]);
						_this.respondSuccess(true);
					}
				});
			});
		}
		static editNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.name',
						type: 'string',
						optional: true
					}, {
						val: 'options.type',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							options: {
								type: string;
							}
						};

						if (optionals['options.type']) {
							if (_this.message.data.options.type !== 'link' &&
								_this.message.data.options.type !== 'script' &&
								_this.message.data.options.type !== 'stylesheet' &&
								_this.message.data.options.type !== 'menu' &&
								_this.message.data.options.type !== 'divider') {
								_this
									.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
								return false;
							} else {
								const oldType = node.type.toLowerCase();
								node.type = _this.message.data.options.type;

								if (oldType === 'menu') {
									node.menuVal = node.children;
									node.value = (node as any)[msg.options.type + 'Val'] || {};
								} else {
									(node as any)[oldType + 'Val'] = node.value;
									node.value = (node as any)[msg.options.type + 'Val'] || {};
								}

								if (node.type === 'menu') {
									node.children = (node.value as CRM.Tree) || [];
									node.value = null;
								}
							}
						}
						if (optionals['options.name']) {
							node.name = _this.message.data.options.name;
						}
						CRM.updateCrm([_this.message.id]);
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		}
		static getTriggers(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					_this.respondSuccess(node.triggers);
				});
			});
		}
		static setTriggers(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						]
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							triggers: Array<{
								url: string;
								not: boolean;
							}>;
						};
						const triggers = msg['triggers'];
						node['showOnSpecified'] = true;
						CRM.updateCrm();
						const matchPatterns: Array<string> = [];
						globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
						if ((node.type === 'script' || node.type === 'stylesheet') &&
							node.value.launchMode === CRMLaunchModes.RUN_ON_SPECIFIED) {
							for (let i = 0; i < triggers.length; i++) {
								const pattern = URLParsing.validatePatternUrl(triggers[i].url);
								if (!pattern) {
									_this.respondSuccess('Triggers don\'t match URL scheme');
									return;
								}
							}
						} else {
							const isShowOnSpecified = ((node.type === 'script' || node.type === 'stylesheet') &&
								node.value.launchMode === CRMLaunchModes.RUN_ON_SPECIFIED);
							for (let i = 0; i < triggers.length; i++) {
								if (!URLParsing.triggerMatchesScheme(triggers[i].url)) {
									_this.respondError('Triggers don\'t match URL scheme');
									return;
								}
								triggers[i].url = URLParsing.prepareTrigger(triggers[i].url);
								if (isShowOnSpecified) {
									if (triggers[i].not) {
										globalObject.globals.crmValues.hideNodesOnPagesData[node.id].push({
											not: false,
											url: triggers[i].url
										});
									} else {
										matchPatterns.push(triggers[i].url);
									}
								}
							}
						}
						node.triggers = triggers;
						if (matchPatterns.length === 0) {
							matchPatterns[0] = '<all_urls>';
						}
						if (globalObject.globals.crmValues.contextMenuIds[node.id]) {
							chrome.contextMenus.update(globalObject.globals.crmValues
								.contextMenuIds[node.id], {
									documentUrlPatterns: matchPatterns
								}, () => {
									CRM.updateCrm();
									_this.respondSuccess(Helpers.safe(node));
								});
						} else {
							CRM.updateCrm();
							_this.respondSuccess(Helpers.safe(node));
						}
					});
				});
			});
		}
		static getTriggerUsage(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					if (node.type === 'menu' ||
						node.type === 'link' ||
						node.type === 'divider') {
						_this.respondSuccess(node['showOnSpecified']);
					} else {
						_this.respondError('Node is not of right type, can only be menu, link or divider');
					}
				});
			});
		}
		static setTriggerUsage(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'useTriggers',
						type: 'boolean'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						useTriggers: boolean;
					};

					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						if (node.type === 'menu' ||
							node.type === 'link' ||
							node.type === 'divider') {
							node['showOnSpecified'] = msg['useTriggers'];
							CRM.updateCrm();
							if (globalObject.globals.crmValues.contextMenuIds[node.id]) {
								chrome.contextMenus.update(globalObject.globals.crmValues
									.contextMenuIds[node.id], {
										documentUrlPatterns: ['<all_urls>']
									}, () => {
										CRM.updateCrm();
										_this.respondSuccess(Helpers.safe(node));
									});
							} else {
								CRM.updateCrm();
								_this.respondSuccess(Helpers.safe(node));
							}
						} else {
							_this.respondError('Node is not of right type, can only be menu, link or divider');
						}
					});
				});
			});
		}
		static getContentTypes(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					_this.respondSuccess(node.onContentTypes);
				});
			});
		}
		static setContentType(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'index',
						type: 'number',
						min: 0,
						max: 5
					}, {
						val: 'value',
						type: 'boolean'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						index: number;
						value: boolean;
					};

					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						node.onContentTypes[msg['index']] = msg['value'];
						CRM.updateCrm();
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[node.id], {
								contexts: CRM.getContexts(node.onContentTypes)
							}, () => {
								CRM.updateCrm();
								_this.respondSuccess(node.onContentTypes);
							});
					});
				});
			});
		}
		static setContentTypes(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'contentTypes',
						type: 'array'
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							contentTypes: Array<string>;
						};

						for (let i = 0; i < msg['contentTypes'].length; i++) {
							if (typeof msg['contentTypes'][i] !== 'string') {
								_this
									.respondError('Not all values in array contentTypes are of type string');
								return false;
							}
						}

						let matches = 0;
						let hasContentType: boolean;
						let contentTypes: [
							boolean, boolean, boolean, boolean, boolean, boolean
						] = [] as any;
						const contentTypeStrings: Array<string> = [
							'page', 'link', 'selection', 'image', 'video', 'audio'
						];
						for (let i = 0; i < msg['contentTypes'].length; i++) {
							hasContentType = msg['contentTypes'].indexOf(contentTypeStrings[i]) >
								-1;
							if (hasContentType) {
								matches++;
							}
							contentTypes[i] = hasContentType;
						}

						if (!matches) {
							contentTypes = [true, true, true, true, true, true];
						}
						node['onContentTypes'] = contentTypes;
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[node.id], {
								contexts: CRM.getContexts(node.onContentTypes)
							}, () => {
								CRM.updateCrm();
								_this.respondSuccess(Helpers.safe(node));
							});
						return true;
					});
				});
			});
		}
		static linkGetLinks(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					if (node.type === 'link') {
						_this.respondSuccess(node.value);
					} else {
						_this.respondSuccess(node['linkVal']);
					}
					return true;
				});
			});
		}
		static linkSetLinks(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'items',
						type: ['object', 'array'],
						forChildren: [
							{
								val: 'newTab',
								type: 'boolean',
								optional: true
							}, {
								val: 'url',
								type: 'string'
							}
						]
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							items: Array<{
								newTab: boolean;
								url: string;
							}> | {
								newTab: boolean;
								url: string;
							};
						};

						const items = msg['items'];
						if (Array.isArray(items)) { //Array
							if (node.type !== 'link') {
								node['linkVal'] = node['linkVal'] || [];
							}
							node.value = [];
							for (let i = 0; i < items.length; i++) {
								items[i].newTab = !!items[i].newTab;
								if (node.type === 'link') {
									node.value.push(items[i]);
								} else {
									node.linkVal = node.linkVal || [];
									node.linkVal.push(items[i]);
								}
							}
						} else { //Object
							items.newTab = !!items.newTab;
							if (!items.url) {
								_this
									.respondError('For not all values in the array items is the property url defined');
								return false;
							}
							if (node.type === 'link') {
								node.value = [items];
							} else {
								node.linkVal = [items];
							}
						}
						CRM.updateCrm();
						if (node.type === 'link') {
							_this.respondSuccess(Helpers.safe(node).value);
						} else {
							_this.respondSuccess(Helpers.safe(node)['linkVal']);
						}
						return true;
					});
				});
			});
		}
		static linkPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'items',
						type: ['object', 'array'],
						forChildren: [
							{
								val: 'newTab',
								type: 'boolean',
								optional: true
							}, {
								val: 'url',
								type: 'string'
							}
						]
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							items: Array<{
								newTab: boolean;
								url: string;
							}> | {
								newTab: boolean;
								url: string;
							};
						};

						const items = msg['items'];
						if (Array.isArray(items)) { //Array
							if (node.type !== 'link') {
								node['linkVal'] = node['linkVal'] || [];
							}
							for (let i = 0; i < items.length; i++) {
								items[i].newTab = !!items[i].newTab;
								if (node.type === 'link') {
									node.value.push(items[i]);
								} else {
									node.linkVal = node.linkVal || [];
									node.linkVal.push(items[i]);
								}
							}
						} else { //Object
							items.newTab = !!items.newTab;
							if (!items.url) {
								_this
									.respondError('For not all values in the array items is the property url defined');
								return false;
							}
							if (node.type === 'link') {
								node.value.push(items);
							} else {
								node.linkVal = node.linkVal || [];
								node.linkVal.push(items);
							}
						}
						CRM.updateCrm();
						if (node.type === 'link') {
							_this.respondSuccess(Helpers.safe(node).value);
						} else {
							_this.respondSuccess(Helpers.safe(node)['linkVal']);
						}
						return true;
					});
				});
			});
		}
		static linkSplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					_this.typeCheck([
						{
							val: 'start',
							type: 'number'
						}, {
							val: 'amount',
							type: 'number'
						}
					], () => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							start: number;
							amount: number;
						};

						let spliced;
						if (node.type === 'link') {
							spliced = node.value.splice(msg['start'], msg['amount']);
							CRM.updateCrm();
							_this.respondSuccess(spliced, Helpers.safe(node).value);
						} else {
							node.linkVal = node.linkVal || [];
							spliced = node.linkVal.splice(msg['start'],
								msg['amount']);
							CRM.updateCrm();
							_this.respondSuccess(spliced, Helpers.safe(node)['linkVal']);
						}
					}
					);
				});

			});
		}
		static setLaunchMode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'launchMode',
						type: 'number',
						min: 0,
						max: 4
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							launchMode: CRMLaunchModes;
						};

						if (node.type === 'script' || node.type === 'stylesheet') {
							node.value.launchMode = msg['launchMode'];
						} else {
							_this.respondError('Node is not of type script or stylesheet');
							return false;
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		}
		static getLaunchMode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
					if (node.type === 'script' || node.type === 'stylesheet') {
						_this.respondSuccess(node.value.launchMode);
					} else {
						_this.respondError('Node is not of type script or stylesheet');
					}
				});

			});
		}
		static registerLibrary(_this: CRMFunction) {
			_this.checkPermissions(['crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'name',
						type: 'string'
					}, {
						val: 'url',
						type: 'string',
						optional: true
					}, {
						val: 'code',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						url?: string;
						name: string;
						code?: string;
					};

					let newLibrary;
					if (optionals['url']) {
						if (msg['url'].indexOf('.js') ===
							msg['url'].length - 3) {
							//Use URL
							let done = false;
							const xhr = new window.XMLHttpRequest();
							xhr.open('GET', msg['url'], true);
							xhr.onreadystatechange = () => {
								if (xhr.readyState === 4 && xhr.status === 200) {
									done = true;
									newLibrary = {
										name: msg['name'],
										code: xhr.responseText,
										url: msg['url']
									};
									globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
									chrome.storage.local.set({
										libraries: globalObject.globals.storages.storageLocal.libraries
									});
									_this.respondSuccess(newLibrary);
								}
							};
							setTimeout(() => {
								if (!done) {
									_this.respondError('Request timed out');
								}
							}, 5000);
							xhr.send();
						} else {
							_this.respondError('No valid URL given');
							return false;
						}
					} else if (optionals['code']) {
						newLibrary = {
							name: msg['name'],
							code: msg['code']
						};
						globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
						chrome.storage.local.set({
							libraries: globalObject.globals.storages.storageLocal.libraries
						});
						_this.respondSuccess(newLibrary);
					} else {
						_this.respondError('No URL or code given');
						return false;
					}
					return true;
				});
			});
		}
		static scriptLibraryPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'libraries',
						type: ['object', 'array'],
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'libraries.name',
						type: 'string',
						optional: true
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						libraries: Array<CRM.Library> | CRM.Library;
					};
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						function doesLibraryExist(lib: {
							name: string;
						}): string | boolean {
							for (let i = 0;
								i < globalObject.globals.storages.storageLocal.libraries.length;
								i++) {
								if (globalObject.globals.storages.storageLocal.libraries[i].name.toLowerCase() ===
									lib.name.toLowerCase()) {
										return globalObject.globals.storages.storageLocal.libraries[i].name;
									}
							}
							return false;
						}

						function isAlreadyUsed(script: CRM.ScriptNode, lib: CRM.Library): boolean {
							for (let i = 0; i < script.value.libraries.length; i++) {
								if (script.value.libraries[i].name === (lib.name || null) &&
									script.value.libraries[i].url === (lib.url || null)) {
									return true;
								}
							}
							return false;
						}

						if (node.type !== 'script') {
							_this.respondError('Node is not of type script');
							return false;
						}
						const libraries = msg['libraries'];
						if (Array.isArray(libraries)) { //Array
							for (let i = 0; i < libraries.length; i++) {
								const originalName = libraries[i].name;
								if (!(libraries[i].name = doesLibraryExist(libraries[i]) as string)) {
									_this.respondError('Library ' + originalName + ' is not registered');
									return false;
								}
								if (!isAlreadyUsed(node, libraries[i])) {
									node.value.libraries.push(libraries[i]);
								}
							}
						} else { //Object
							const name = libraries.name;
							if (!(libraries.name = doesLibraryExist(libraries) as string)) {
								_this.respondError('Library ' + name + ' is not registered');
								return false;
							}
							if (!isAlreadyUsed(node, libraries)) {
								node.value.libraries.push(libraries);
							}
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node).value.libraries);
						return true;
					});
				});
			});
		}
		static scriptLibrarySplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							start: number;
							amount: number;
						};

						let spliced;
						if (node.type === 'script') {
							spliced = Helpers.safe(node).value.libraries.splice(msg['start'], msg['amount']);
							CRM.updateCrm();
							_this.respondSuccess(spliced, Helpers.safe(node).value.libraries);
						} else {
							_this.respondError('Node is not of type script');
						}
						return true;
					});
				});
			});
		}
		static scriptBackgroundLibraryPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'libraries',
						type: ['object', 'array'],
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'libraries.name',
						type: 'string',
						optional: true
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							libraries: Array<CRM.Library> | CRM.Library
						};

						function doesLibraryExist(lib: {
							name: string;
						}): string | boolean {
							for (let i = 0;
								i < globalObject.globals.storages.storageLocal.libraries.length;
								i++) {
								if (globalObject.globals.storages.storageLocal.libraries[i].name.toLowerCase() ===
									lib.name.toLowerCase()) {
										return globalObject.globals.storages.storageLocal.libraries[i].name;
									}
							}
							return false;
						}

						function isAlreadyUsed(script: CRM.ScriptNode, lib: CRM.Library) {
							for (let i = 0; i < script.value.libraries.length; i++) {
								if (script.value.libraries[i].name === (lib.name || null) &&
									script.value.libraries[i].url === (lib.url || null)) {
									return true;
								}
							}
							return false;
						}

						if (node.type !== 'script') {
							_this.respondError('Node is not of type script');
							return false;
						}
						const libraries = msg['libraries'];
						if (Array.isArray(libraries)) { //Array
							for (let i = 0; i < libraries.length; i++) {
								const originalName = libraries[i].name;
								if (!(libraries[i].name = doesLibraryExist(libraries[i]) as string)) {
									_this.respondError('Library ' + originalName + ' is not registered');
									return false;
								}
								if (!isAlreadyUsed(node, libraries[i])) {
									node.value.backgroundLibraries.push(libraries[i]);
								}
							}
						} else { //Object
							const name = libraries.name;
							if (!(libraries.name = doesLibraryExist(libraries) as string)) {
								_this.respondError('Library ' + name + ' is not registered');
								return false;
							}
							if (!isAlreadyUsed(node, libraries)) {
								node.value.backgroundLibraries.push(msg['libraries'] as CRM.Library);
							}
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node).value.backgroundLibraries);
						return true;
					});
				});
			});
		}
		static scriptBackgroundLibrarySplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						start: number;
						amount: number;
					};

					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						let spliced;
						if (node.type === 'script') {
							spliced = Helpers.safe(node).value.backgroundLibraries.splice(msg['start'], msg['amount']);
							CRM.updateCrm([_this.message.data.nodeId]);
							_this.respondSuccess(spliced, Helpers.safe(node).value
								.backgroundLibraries);
						} else {
							node.scriptVal = node.scriptVal ||
								globalObject.globals.constants.templates.getDefaultScriptValue();
							node.scriptVal.backgroundLibraries = node.scriptVal.backgroundLibraries || [];
							spliced = node.scriptVal.backgroundLibraries.splice(msg['start'],
								msg['amount']);
							CRM.updateCrm([_this.message.data.nodeId]);
							_this.respondSuccess(spliced, node.scriptVal.backgroundLibraries);
						}
						return true;
					});
				});
			});
		}
		static setScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'script',
						type: 'string'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						script: string;
					};
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						if (node.type === 'script') {
							node.value.script = msg['script'];
						} else {
							node.scriptVal = node.scriptVal ||
								globalObject.globals.constants.templates.getDefaultScriptValue();
							node.scriptVal.script = msg['script'];
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		}
		static getScriptValue(__this: CRMFunction) {
			__this.checkPermissions(['crmGet'], () => {
				__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
					if (node.type === 'script') {
						__this.respondSuccess(node.value.script);
					} else {
						if (node.scriptVal) {
							__this.respondSuccess(node.scriptVal.script);
						} else {
							__this.respondSuccess(undefined);
						}
					}
				});

			});
		}
		static setStylesheetValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'stylesheet',
						type: 'string'
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							stylesheet: string;
						};
						if (node.type === 'stylesheet') {
							node.value.stylesheet = msg['stylesheet'];
						} else {
							node.stylesheetVal = node.stylesheetVal ||
								globalObject.globals.constants.templates.getDefaultStylesheetValue();
							node.stylesheetVal.stylesheet = msg['stylesheet'];
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		}
		static getStylesheetValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
					if (node.type === 'stylesheet') {
						_this.respondSuccess(node.value.stylesheet);
					} else {
						if (node.stylesheetVal) {
							_this.respondSuccess(node.stylesheetVal.stylesheet);
						} else {
							_this.respondSuccess(undefined);
						}
					}
				});

			});
		}
		static setBackgroundScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'script',
						type: 'string'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						script: string;
					};
					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						if (node.type === 'script') {
							node.value.backgroundScript = msg['script'];
						} else {
							node.scriptVal = node.scriptVal ||
								globalObject.globals.constants.templates.getDefaultScriptValue();
							node.scriptVal.backgroundScript = msg['script'];
						}
						CRM.updateCrm([_this.message.data.nodeId]);
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		}
		static getBackgroundScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
					if (node.type === 'script') {
						_this.respondSuccess(node.value.backgroundScript);
					} else {
						if (node.scriptVal) {
							_this.respondSuccess(node.scriptVal.backgroundScript);
						} else {
							_this.respondSuccess(undefined);
						}
					}
				});

			});
		}
		static getMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
					if (node.type === 'menu') {
						_this.respondSuccess(node.children);
					} else {
						_this.respondError('Node is not of type menu');
					}
				});

			});
		}
		static setMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], () => {
					_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
						const msg = _this.message.data as CRMFunctionDataBase & {
							childrenIds: Array<number>;
						};

						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
							return false;
						}

						for (let i = 0; i < msg['childrenIds'].length; i++) {
							if (typeof msg['childrenIds'][i] !== 'number') {
								_this
									.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}

						const oldLength = node.children.length;

						for (let i = 0; i < msg['childrenIds'].length; i++) {
							const toMove = _this.getNodeFromId(msg['childrenIds'][i], false,
								true);
							_this.moveNode(toMove, {
								relation: 'lastChild',
								node: _this.message.data.nodeId
							}, {
									children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree,
										true),
									index: toMove.path[toMove.path.length - 1]
								});
						}

						_this.getNodeFromId(node.id, false, true).children.splice(0, oldLength);

						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
						return true;
					});
				});
			});
		}
		static pushMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						childrenIds: Array<number>;
					};

					_this.getNodeFromId(_this.message.data.nodeId, true).run((node) => {
						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
						}

						for (let i = 0; i < msg['childrenIds'].length; i++) {
							if (typeof msg['childrenIds'][i] !== 'number') {
								_this
									.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}

						for (let i = 0; i < msg['childrenIds'].length; i++) {
							const toMove = _this.getNodeFromId(msg['childrenIds'][i], false,
								true);
							_this.moveNode(toMove, {
								relation: 'lastChild',
								node: _this.message.data.nodeId
							}, {
									children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree,
										true),
									index: toMove.path[toMove.path.length - 1]
								});
						}

						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
						return true;
					});
				});
			});
		}
		static spliceMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					const msg = _this.message.data as CRMFunctionDataBase & {
						start: number;
						amount: number;
					};

					_this.getNodeFromId(_this.message.data.nodeId).run((node) => {
						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
							return false;
						}

						const spliced = node.children.splice(
							msg['start'], msg['amount']);

						CRM.updateCrm();
						_this.respondSuccess(spliced.map((splicedNode) => {
							return CRM.makeSafe(splicedNode);
						}), _this.getNodeFromId(node.id, true, true).children);
						return true;
					});
				});
			});
		}
	}

	class APIMessaging {
		static CRMMessage = class CRMMessage {
			static respond(message: CRMAPIMessage<'crm' | 'chrome', any>,
				type: 'success' | 'error' | 'chromeError', data: any | string, stackTrace?:
					string) {
				const msg: CRMAPIResponse<any> = {
					type: type,
					callbackId: message.onFinish,
					messageType: 'callback'
				} as any;
				msg.data = (type === 'error' || type === 'chromeError' ?
					{
						error: data,
						stackTrace: stackTrace,
						lineNumber: message.lineNumber
					} :
					data);
				try {
					globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id][message.tabIndex]
						.port.postMessage(msg);
				} catch (e) {
					if (e.message === 'Converting circular structure to JSON') {
						APIMessaging.CRMMessage.respond(message, 'error',
							'Converting circular structure to JSON, this API will not work');
					} else {
						throw e;
					}
				}
			}
		};
		static ChromeMessage = class ChromeMessage {
			static throwError(message: ChromeAPIMessage, error: string, stackTrace?: string) {
				console.warn('Error:', error);
				if (stackTrace) {
					const stacktraceSplit = stackTrace.split('\n');
					stacktraceSplit.forEach((line) => {
						console.warn(line);
					});
				}
				APIMessaging.CRMMessage.respond(message, 'chromeError', error,
					stackTrace);
			}
		};
		static createReturn(message: CRMAPIMessage<'crm' | 'chrome', any>,
			callbackIndex: number) {
			return (result: any) => {
				this.CRMMessage.respond(message, 'success', {
					callbackId: callbackIndex,
					params: [result]
				});
			};
		}
		static sendThroughComm(message: ChromeAPIMessage) {
			const instancesObj = globalObject.globals.crmValues.nodeInstances[message.id];
			const instancesArr: Array<{
				id: number;
				tabIndex: number;
				instance: {
					hasHandler: boolean;
				}
			}> = [];
			for (let tabInstance in instancesObj) {
				if (instancesObj.hasOwnProperty(tabInstance)) {
					instancesObj[tabInstance].forEach((tabIndexInstance, index) => {
						instancesArr.push({
							id: (tabInstance as any) as number,
							tabIndex: index,
							instance: instancesObj[tabInstance][index]
						});
					});
				}
			}

			let args: Array<{
				type: string;
			}> = [];
			const fns = [];
			for (let i = 0; i < message.args.length; i++) {
				if (message.args[i].type === 'fn') {
					fns.push(message.args[i]);
				} else if (message.args[i].type === 'arg') {
					if (args.length > 2 && typeof args[0] === 'string') {
						args = args.slice(1);
					}
					args.push(message.args[i]);
				}
			}

			if (fns.length > 0) {
				console.warn('Message responseCallbacks are not supported');
			}

			for (let i = 0; i < instancesArr.length; i++) {
				globalObject.globals.crmValues.tabData[instancesArr[i].id].nodes[message.id][instancesArr[i].tabIndex]
					.port.postMessage({
						messageType: 'instanceMessage',
						message: args[0]
					});
			}
		}
	}

	interface CRMFunctionDataBase {
		action: string;
		crmPath: Array<number>;
		[key: string]: any;
	}

	interface CRMFunctionMessage extends CRMAPIMessage<'crm', CRMFunctionDataBase> {
		action: string;
	}

	interface CRMParent<T> {
		children?: Array<T> | void;
	}

	type GetNodeFromIdCallback<T> = {
		run: (callback: (node: T) => void) => void;
	};

	type TypeCheckTypes = 'string' | 'function' | 'number' | 'object' | 'array' | 'boolean';

	interface TypeCheckConfig {
		val: string;
		type: TypeCheckTypes | Array<TypeCheckTypes>;
		optional?: boolean;
		forChildren?: Array<{
			val: string;
			type: TypeCheckTypes | Array<TypeCheckTypes>;
			optional?: boolean;
		}>;
		dependency?: string;
		min?: number;
		max?: number;
	}

	class CRMFunction {
		constructor(public message: CRMFunctionMessage, public action: string) {
			(CRMFunctions as any)[action](this);
		}

		respondSuccess(...args: Array<any>) {
			APIMessaging.CRMMessage.respond(this.message, 'success', args);
			return true;
		}

		respondError(error: string) {
			APIMessaging.CRMMessage.respond(this.message, 'error', error);
		}

		lookup<T>(path: Array<number>,
			data: Array<CRMParent<T>>): CRMParent<T> | boolean;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>, hold: boolean):
			Array<CRMParent<T>> | CRMParent<T> | boolean | void;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>,
			hold: boolean = false):
			Array<CRMParent<T>> | CRMParent<T> | boolean | void {
			if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
				this.respondError('Supplied path is not of type array');
				return true;
			}
			const length = path.length - 1;
			for (let i = 0; i < length; i++) {
				const next = data[path[i]];
				if (data && next && next.children) {
					data = next.children;
				} else {
					return false;
				}
			}
			return (hold ? data : data[path[length]]) || false;
		}
		checkType(toCheck: any, type: TypeCheckTypes,
			name?: string,
			optional: TypecheckOptional = TypecheckOptional.REQUIRED,
			ifndef?: () => void,
			isArray: boolean = false, ifdef?: () => void) {
			if (toCheck === undefined || toCheck === null) {
				if (optional) {
					if (ifndef) {
						ifndef();
					}
					return true;
				} else {
					if (isArray) {
						this.respondError(`Not all values for ${name} are defined`);
					} else {
						this.respondError(`Value for ${name} is not defined`);
					}
					return false;
				}
			} else {
				if (type === 'array') {
					if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
						if (isArray) {
							this.respondError(`Not all values for ${name} are of type ${type},` +
								` they are instead of type ${typeof toCheck}`);
						} else {
							this.respondError(`Value for ${name} is not of type ${type},` +
								` it is instead of type ${typeof toCheck}`);
						}
						return false;
					}
				}
				if (typeof toCheck !== type) {
					if (isArray) {
						this.respondError(`Not all values for ${name} are of type ${type},` +
							` they are instead of type ${typeof toCheck}`);
					} else {
						this.respondError(`Value for ${name} is not of type ${type},` +
							` it is instead of type ${typeof toCheck}`);
					}
					return false;
				}
			}
			if (ifdef) {
				ifdef();
			}
			return true;
		}

		private static MoveNode = class MoveNode {
			static before(isRoot: boolean, node: CRM.Node, removeOld: any | boolean, relativeNode: any,
				_this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
					if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
					) {
						removeOld.index++;
					}
				} else {
					const parentChildren = _this.lookup(relativeNode.path, globalObject.globals.crm
						.crmTree, true) as Array<CRM.Node>;
					Helpers.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
					if (removeOld && parentChildren === removeOld.children) {
						removeOld.index++;
					}
				}
			}
			static firstSibling(isRoot: boolean, node: CRM.Node, removeOld: any | boolean, relativeNode: any,
				_this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
					if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
					) {
						removeOld.index++;
					}
				} else {
					const parentChildren = _this.lookup((relativeNode as any).path, globalObject.globals.crm
						.crmTree, true) as Array<CRM.Node>;
					Helpers.pushIntoArray(node, 0, parentChildren);
					if (removeOld && parentChildren === removeOld.children) {
						removeOld.index++;
					}
				}
			}
			static after(isRoot: boolean, node: CRM.Node, relativeNode: any, _this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
						globalObject
							.globals.crm.crmTree);
				} else {
					const parentChildren = _this.lookup((relativeNode as any).path, globalObject.globals.crm
						.crmTree, true) as Array<CRM.Node>;
					if ((relativeNode as any).path.length > 0) {
						Helpers.pushIntoArray(node, (relativeNode as any)
							.path[(relativeNode as any).path.length - 1] +
							1, parentChildren);
					}
				}
			}
			static lastSibling(isRoot: boolean, node: CRM.Node, relativeNode: any, _this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
						globalObject
							.globals.crm.crmTree);
				} else {
					const parentChildren = _this.lookup((relativeNode as any).path, globalObject.globals.crm
						.crmTree, true) as Array<CRM.Node>;
					Helpers.pushIntoArray(node, parentChildren.length, parentChildren);
				}
			}
			static firstChild(isRoot: boolean, node: CRM.Node, removeOld: any | boolean, relativeNode: any,
				_this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
					if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
					) {
						removeOld.index++;
					}
				} else if ((relativeNode as CRM.Node).type === 'menu') {
					Helpers.pushIntoArray(node, 0, (relativeNode as CRM.MenuNode).children);
					if (removeOld && (relativeNode as CRM.MenuNode).children === removeOld.children) {
						removeOld.index++;
					}
				} else {
					_this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				return true;
			}
			static lastChild(isRoot: boolean, node: CRM.Node, relativeNode: any, _this: CRMFunction) {
				if (isRoot) {
					Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
						globalObject
							.globals.crm.crmTree);
				} else if ((relativeNode as CRM.MenuNode).type === 'menu') {
					Helpers.pushIntoArray(node, (relativeNode as CRM.MenuNode).children.length,
						(relativeNode as CRM.MenuNode).children);
				} else {
					_this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				return true;
			}
		}
		moveNode(node: CRM.Node, position: {
			node?: number;
			relation?: 'firstChild' | 'firstSibling' | 'lastChild' | 'lastSibling' | 'before' |
			'after';
		}, removeOld: any | boolean = false): boolean | CRM.Node {
			const crmFunction = this;

			//Capture old CRM tree
			const oldCrmTree = JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree));

			//Put the node in the tree
			let relativeNode: Array<CRM.Node> | CRM.Node;
			position = position || {};

			if (!this.checkType(position, 'object', 'position')) {
				return false;
			}

			if (!this.checkType(position.node, 'number', 'node', TypecheckOptional.OPTIONAL, null, false, () => {
				if (!(relativeNode = crmFunction.getNodeFromId(position.node, false, true))) {
					return;
				}
			})) {
				return false;
			}

			if (!this.checkType(position.relation, 'string', 'relation',
				TypecheckOptional.OPTIONAL)) {
				return false;
			}
			relativeNode = relativeNode || globalObject.globals.crm.crmTree;

			const isRoot = relativeNode === globalObject.globals.crm.crmTree;

			switch (position.relation) {
				case 'before':
					CRMFunction.MoveNode.before(isRoot, node, removeOld, relativeNode, this);
					break;
				case 'firstSibling':
					CRMFunction.MoveNode.firstSibling(isRoot, node, removeOld, relativeNode, this);
					break;
				case 'after':
					CRMFunction.MoveNode.after(isRoot, node, relativeNode, this);
					break;
				case 'lastSibling':
					CRMFunction.MoveNode.lastSibling(isRoot, node, relativeNode, this);
					break;
				case 'firstChild':
					if (!CRMFunction.MoveNode.firstChild(isRoot, node, removeOld, relativeNode, this)) {
						return false;
					}
					break;
				default:
				case 'lastChild':
					if (!CRMFunction.MoveNode.lastChild(isRoot, node, relativeNode, this)) {
						return false;
					}
					break;
			}

			if (removeOld) {
				removeOld.children.splice(removeOld.index, 1);
			}

			//Update settings
			Storages.applyChanges({
				type: 'optionsPage',
				settingsChanges: [
					{
						key: 'crm',
						oldValue: oldCrmTree,
						newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree))
					}
				]
			});

			return node;
		}

		getNodeFromId(id: number): GetNodeFromIdCallback<CRM.Node>;
		getNodeFromId(id: number,
			makeSafe: boolean): GetNodeFromIdCallback<CRM.Node | CRM.SafeNode>;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: boolean):
			GetNodeFromIdCallback<CRM.Node | CRM.SafeNode> | CRM.Node | CRM.SafeNode | boolean | any
		getNodeFromId(id: number, makeSafe: boolean = false,
			synchronous: boolean = false):
			GetNodeFromIdCallback<CRM.Node | CRM.SafeNode> | CRM.Node | CRM.SafeNode | boolean | any {
			const node = (makeSafe ?
				globalObject.globals.crm.crmByIdSafe :
				globalObject.globals.crm.crmById)[id];
			if (node) {
				if (synchronous) {
					return node;
				}
				return {
					run(callback: (node: CRM.SafeNode) => void) {
						callback(node);
					}
				};
			} else {
				this.respondError(`There is no node with the id you supplied (${id})`);
				if (synchronous) {
					return false;
				}
				return {
					run: () => { }
				};
			}
		};

		private static _getDotValue<T extends {
			[key: string]: T | U
		}, U>(source: T, index: string): U {
			const indexes = index.split('.');
			let currentValue: T | U = source;
			for (let i = 0; i < indexes.length; i++) {
				if (indexes[i] in currentValue) {
					currentValue = (currentValue as T)[indexes[i]];
				} else {
					return undefined;
				}
			}
			return currentValue as U;
		}

		private dependencyMet(data: TypeCheckConfig, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			if (data.dependency && !optionals[data.dependency]) {
				optionals[data.val] = false;
				return false;
			}
			return true;
		}

		private _isDefined(data: TypeCheckConfig, value: any, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean | 'continue' {
			//Check if it's defined
			if (value === undefined || value === null) {
				if (data.optional) {
					optionals[data.val] = false;
					return 'continue';
				} else {
					this.respondError(`Value for ${data.val} is not set`);
					return false;
				}
			}
			return true;
		}

		private _typesMatch(data: TypeCheckConfig, value: any): string {
			const types = Array.isArray(data.type) ? data.type : [data.type];
			for (let i = 0; i < types.length; i++) {
				const type = types[i];
				if (type === 'array') {
					if (typeof value === 'object' && Array.isArray(value)) {
						return type;
					}
				}
				if (typeof value === type) {
					return type;
				}
			}
			this.respondError(`Value for ${data.val} is not of type ${types.join(' or ')}`);
			return null;
		}

		private _checkNumberConstraints(data: TypeCheckConfig, value: number): boolean {
			if (data.min !== undefined) {
				if (data.min > value) {
					this.respondError(`Value for ${data.val} is smaller than ${data.min}`);
					return false;
				}
			}
			if (data.max !== undefined) {
				if (data.max < value) {
					this.respondError(`Value for ${data.val} is bigger than ${data.max}`);
					return false;
				}
			}
			return true;
		}

		private _checkArrayChildType(data: TypeCheckConfig, value: any, forChild: {
			val: string;
			type: TypeCheckTypes | Array<TypeCheckTypes>;
			optional?: boolean;
		}): boolean {
			const types = Array.isArray(forChild.type) ? forChild.type : [forChild.type]
			for (let i = 0; i < types.length; i++) {
				const type = types[i];
				if (type === 'array') {
					if (Array.isArray(value)) {
						return true;
					}
				} else if (typeof value === type) {
					return true;
				}
			}
			this.respondError(`For not all values in the array ${data.val} is the property ${
				forChild.val} of type ${types.join(' or ')}`);
			return false;
		}

		private _checkArrayChildrenConstraints<T extends {
			[key: string]: any;
		}>(data: TypeCheckConfig, value: Array<T>): boolean {
			for (let i = 0; i < value.length; i++) {
				for (let j = 0; j < data.forChildren.length; j++) {
					const forChild = data.forChildren[j];
					const childValue = value[i][forChild.val];

					//Check if it's defined
					if (childValue === undefined || childValue === null) {
						if (!forChild.optional) {
							this.respondError(`For not all values in the array ${data.val} is the property ${forChild.val} defined`);
							return false;
						}
					} else if (!this._checkArrayChildType(data, childValue, forChild)) {
						return false;
					}
				}
			}
			return true;
		}

		private _checkConstraints(data: TypeCheckConfig, value: any, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			if (typeof value === 'number') {
				return this._checkNumberConstraints(data, value);
			}
			if (Array.isArray(value) && data.forChildren) {
				return this._checkArrayChildrenConstraints(data, value);
			}
			return true;
		}

		typeCheck(toCheck: Array<TypeCheckConfig>, callback: (optionals?: {
			[key: string]: any;
		}) => void) {
			const optionals: {
				[key: string]: any;
				[key: number]: any;
			} = {};
			for (let i = 0; i < toCheck.length; i++) {
				const data = toCheck[i];

				//Skip if dependency not met
				if (!this.dependencyMet(data, optionals)) {
					continue;
				}

				const value = CRMFunction._getDotValue(this.message.data, data.val);
				//Check if it's defined
				const isDefined = this._isDefined(data, value, optionals);
				if (isDefined === true) {
					const matchedType = this._typesMatch(data, value);
					if (matchedType) {
						optionals[data.val] = true;
						this._checkConstraints(data, value, optionals);
						continue;
					}
				} else if (isDefined === 'continue') {
					continue;
				}
				return false;
			}
			callback(optionals);
			return true;
		};

		checkPermissions(toCheck: Array<CRM.Permission>,
			callback?: (optional: any) => void) {
			const optional: Array<any> = [];
			let permitted = true;
			let node: CRM.Node;
			if (!(node = globalObject.globals.crm.crmById[this.message.id])) {
				this
					.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
				return false;
			}

			if (node.isLocal) {
				if (callback) {
					callback(optional);
				}
			} else {
				let notPermitted: Array<CRM.Permission> = [];
				if (!node.permissions || Helpers.compareArray(node.permissions, [])) {
					if (toCheck.length > 0) {
						permitted = false;
						notPermitted = toCheck;
					}
				} else {
					for (let i = 0; i < toCheck.length; i++) {
						if (node.permissions.indexOf(toCheck[i]) === -1) {
							permitted = false;
							notPermitted.push(toCheck[i]);
						}
					}
				}

				if (!permitted) {
					this.respondError(`Permission${notPermitted.length === 1 ?
						` ${notPermitted[0]}` :
						`s ${notPermitted
							.join(', ')}`
						} are not available to this script.`);
				} else {
					let length = optional.length;
					for (let i = 0; i < length; i++) {
						if (node.permissions.indexOf(optional[i]) === -1) {
							optional.splice(i, 1);
							length--;
							i--;
						}
					}
					if (callback) {
						callback(optional);
					}
				}
			}
			return true;
		};
	}

	class ChromeHandler {
		static handle(message: ChromeAPIMessage) {
			if (!this._handleSpecialCalls(message)) {
				return false;
			}
			const apiPermission = message
				.requestType ||
				message.api.split('.')[0] as CRM.Permission;
			if (!this._hasPermission(message, apiPermission)) {
				return false;
			}
			if (globalObject.globals.constants.permissions.indexOf(apiPermission) === -1) {
				APIMessaging.ChromeMessage.throwError(message,
					`Permissions ${apiPermission} is not available for use or does not exist.`);
				return false;
			}
			if (globalObject.globals.availablePermissions.indexOf(apiPermission) === -1) {
				APIMessaging.ChromeMessage.throwError(message,
					`Permissions ${apiPermission} not available to the extension, visit options page`);
				chrome.storage.local.get('requestPermissions', (storageData) => {
					const perms = storageData['requestPermissions'] || [apiPermission];
					chrome.storage.local.set({
						requestPermissions: perms
					});
				});
				return false;
			}

			const params: Array<any> = [];
			const returnFunctions: Array<(result: any) => void> = [];
			for (let i = 0; i < message.args.length; i++) {
				switch (message.args[i].type) {
					case 'arg':
						params.push(Helpers.jsonFn.parse(message.args[i].val));
						break;
					case 'fn':
						params.push(this._createChromeFnCallbackHandler(message, message.args[i].val));
						break;
					case 'return':
						returnFunctions.push(APIMessaging.createReturn(message, message.args[i].val));
						break;
				}
			}

			try {
				const result = sandboxes.sandboxChrome(message.api, params);
				for (let i = 0; i < returnFunctions.length; i++) {
					returnFunctions[i](result);
				}
			} catch (e) {
				APIMessaging.ChromeMessage.throwError(message, e.message, e.stack);
				return false;
			}
			return true;
		}

		private static _hasPermission(message: ChromeAPIMessage, apiPermission: CRM.Permission) {
			const node = globalObject.globals.crm.crmById[message.id];
			if (!node.isLocal) {
				let apiFound: boolean;
				let chromeFound = (node.permissions.indexOf('chrome') !== -1);
				apiFound = (node.permissions.indexOf(apiPermission) !== -1);
				if (!chromeFound && !apiFound) {
					APIMessaging.ChromeMessage.throwError(message,
						`Both permissions chrome and ${apiPermission
						} not available to this script`);
					return false;
				} else if (!chromeFound) {
					APIMessaging.ChromeMessage.throwError(message,
						'Permission chrome not available to this script');
					return false;
				} else if (!apiFound) {
					APIMessaging.ChromeMessage.throwError(message,
						`Permission ${apiPermission} not avilable to this script`);
					return false;
				}
			}
			return true;
		}
		private static _handleSpecialCalls(message: ChromeAPIMessage) {
			if (!/[a-zA-Z0-9]*/.test(message.api)) {
				APIMessaging.ChromeMessage.throwError(message, `Passed API "${message
					.api}" is not alphanumeric.`);
				return false;
			} else if (this._checkForRuntimeMessages(message)) {
				return false;
			} else if (message.api === 'runtime.sendMessage') {
				console
					.warn('The chrome.runtime.sendMessage API is not meant to be used, use ' +
					'crmAPI.comm instead');
				APIMessaging.sendThroughComm(message);
				return false;
			}
			return true;
		}
		private static ChromeAPIs = class ChromeAPIs {
			private static _checkFirstRuntimeArg(message: ChromeAPIMessage, expectedType: string, name: string) {
				if (!message.args[0] || message.args[0].type !== expectedType) {
					APIMessaging.ChromeMessage.throwError(message, expectedType === 'fn' ?
						`First argument of ${name} should be a function` :
						`${name} should have a function to retunr to`);
					return true;
				}
				return false;
			}
			private static _respondSuccess(message: ChromeAPIMessage, params: Array<any>) {
				APIMessaging.CRMMessage.respond(message, 'success', {
					callbackId: message.args[0].val,
					params: params
				});
			}
			static getBackgroundPage(message: ChromeAPIMessage, api: string) {
				console.warn('The chrome.runtime.getBackgroundPage API should not be used');
				if (this._checkFirstRuntimeArg(message, 'fn', api)) {
					return true;
				}
				this._respondSuccess(message, [{}]);
				return true;
			}
			static openOptionsPage(message: ChromeAPIMessage, api: string) {
				if (this._checkFirstRuntimeArg(message, 'fn', api)) {
					return true;
				}
				chrome.runtime.openOptionsPage(() => {
					message.args[0] && this._respondSuccess(message, []);
				});
				return true;
			}
			static getManifest(message: ChromeAPIMessage, api: string) {
				if (this._checkFirstRuntimeArg(message, 'return', api)) {
					return true;
				}
				APIMessaging.createReturn(message, message.args[0].val)(
					chrome.runtime.getManifest());
				return true;
			}
			static getURL(message: ChromeAPIMessage, api: string) {
				const returns: Array<any> = [];
				const args: Array<any> = [];
				for (let i = 0; i < message.args.length; i++) {
					if (message.args[i].type === 'return') {
						returns.push(message.args[i].val);
					} else if (message.args[i].type === 'arg') {
						args.push(message.args[i].val);
					} else {
						APIMessaging.ChromeMessage.throwError(message,
							'getURL should not have a function as an argument');
						return true;
					}
				}
				if (returns.length === 0 || args.length === 0) {
					APIMessaging.ChromeMessage.throwError(message,
						'getURL should be a return function with at least one argument');
				}
				APIMessaging.createReturn(message, returns[0])(chrome.runtime
					.getURL(args[0]));
				return true;
			}
			static unaccessibleAPI(message: ChromeAPIMessage) {
				APIMessaging.ChromeMessage.throwError(message,
					'This API should not be accessed');
				return true;
			}
			static reload(message: ChromeAPIMessage, api: string) {
				chrome.runtime.reload();
				return true;
			}
			static restart(message: ChromeAPIMessage, api: string) {
				chrome.runtime.restart();
				return true;
			}
			static restartAfterDelay(message: ChromeAPIMessage, api: string) {
				const fns: Array<() => void> = [];
				const args: Array<any> = [];
				for (let i = 0; i < message.args.length; i++) {
					if (message.args[i].type === 'fn') {
						fns.push(message.args[i].val);
					} else if (message.args[i].type === 'arg') {
						args.push(message.args[i].val);
					} else {
						APIMessaging.ChromeMessage.throwError(message,
							'restartAfterDelay should not have a return as an argument');
						return true;
					}
				}
				chrome.runtime.restartAfterDelay(args[0], () => {
					APIMessaging.CRMMessage.respond(message, 'success', {
						callbackId: fns[0],
						params: []
					});
				});
				return true;
			}
			static getPlatformInfo(message: ChromeAPIMessage, api: string) {
				if (this._checkFirstRuntimeArg(message, 'fn', api)) {
					return true;
				}
				chrome.runtime.getPlatformInfo((platformInfo) => {
					message.args[0] && this._respondSuccess(message, [platformInfo]);
				});
				return true;
			}
			static getPackageDirectoryEntry(message: ChromeAPIMessage, api: string) {
				if (this._checkFirstRuntimeArg(message, 'fn', api)) {
					return true;
				}
				chrome.runtime.getPackageDirectoryEntry((directoryInfo) => {
					message.args[0] && this._respondSuccess(message, [directoryInfo]);
				});
				return true;
			}
			static parent() {
				return ChromeHandler;
			}
		}
		private static _handlePossibleChromeEvent(message: ChromeAPIMessage, api: string) {
			if (api.split('.').length > 1) {
				if (!message.args[0] || message.args[0].type !== 'fn') {
					APIMessaging.ChromeMessage.throwError(message,
						'First argument should be a function');
				}

				const allowedTargets = [
					'onStartup',
					'onInstalled',
					'onSuspend',
					'onSuspendCanceled',
					'onUpdateAvailable',
					'onRestartRequired'
				];
				const listenerTarget = api.split('.')[0];
				if (allowedTargets.indexOf(listenerTarget) > -1) {
					(chrome.runtime as any)[listenerTarget].addListener((...listenerArgs: Array<any>) => {
						const params = Array.prototype.slice.apply(listenerArgs);
						APIMessaging.CRMMessage.respond(message, 'success', {
							callbackId: message.args[0].val,
							params: params
						});
					});
					return true;
				} else if (listenerTarget === 'onMessage') {
					APIMessaging.ChromeMessage.throwError(message,
						'This method of listening to messages is not allowed,' +
						' use crmAPI.comm instead');
					return true;
				} else {
					APIMessaging.ChromeMessage.throwError(message,
						'You are not allowed to listen to given event');
					return true;
				}
			}
			return false;
		}
		private static _checkForRuntimeMessages(message: ChromeAPIMessage) {
			const api = message.api.split('.').slice(1).join('.');
			if (message.api.split('.')[0] !== 'runtime') {
				return false;
			}
			switch (api) {
				case 'getBackgroundPage':
					return this.ChromeAPIs.getBackgroundPage(message, api);
				case 'openOptionsPage':
					return this.ChromeAPIs.openOptionsPage(message, api);
				case 'getManifest':
					return this.ChromeAPIs.getManifest(message, api);
				case 'getURL':
					return this.ChromeAPIs.getURL(message, api);
				case 'connect':
				case 'connectNative':
				case 'setUninstallURL':
				case 'sendNativeMessage':
				case 'requestUpdateCheck':
					return this.ChromeAPIs.unaccessibleAPI(message);
				case 'reload':
					return this.ChromeAPIs.reload(message, api);
				case 'restart':
					return this.ChromeAPIs.restart(message, api);
				case 'restartAfterDelay':
					return this.ChromeAPIs.restartAfterDelay(message, api);
				case 'getPlatformInfo':
					return this.ChromeAPIs.getPlatformInfo(message, api);
				case 'getPackageDirectoryEntry':
					return this.ChromeAPIs.getPackageDirectoryEntry(message, api);
			}
			return this._handlePossibleChromeEvent(message, api);
		}
		private static _createChromeFnCallbackHandler(message: ChromeAPIMessage,
			callbackIndex: number) {
			return (...params: Array<any>) => {
				APIMessaging.CRMMessage.respond(message, 'success', {
					callbackId: callbackIndex,
					params: params
				});
			};
		}
	}

	class Resources {
		static handle(message: {
			type: string;
			name: string;
			url: string;
			scriptId: number;
		}, name: string) {
			switch (message.type) {
				case 'register':
					Resources._registerResource(name, message.url, message.scriptId);
					break;
				case 'remove':
					Resources._removeResource(name, message.scriptId);
					break;
			}
		}

		static Resource = class Resource {
			static handle(message: {
				type: string;
				name: string;
				url: string;
				scriptId: number;
			}) {
				Resources.handle(message, message.name);
			}
		};
		static Anonymous = class Anonymous {
			static handle(message: {
				type: string;
				name: string;
				url: string;
				scriptId: number;
			}) {
				Resources.handle(message, message.url);
			}
		};

		static checkIfResourcesAreUsed() {
			const resourceNames = [];
			for (let resourceForScript in globalObject.globals.storages.resources) {
				if (globalObject.globals.storages.resources
					.hasOwnProperty(resourceForScript) &&
					globalObject.globals.storages.resources[resourceForScript]) {
					let scriptResources = globalObject.globals.storages
						.resources[resourceForScript];
					for (let resourceName in scriptResources) {
						if (scriptResources.hasOwnProperty(resourceName) &&
							scriptResources[resourceName]) {
							resourceNames.push(scriptResources[resourceName].name);
						}
					}
				}
			}

			for (let id in globalObject.globals.crm.crmById) {
				let node: CRM.Node;
				if (globalObject.globals.crm.crmById.hasOwnProperty(id) &&
					(node = globalObject.globals.crm.crmById[id]) &&
					node.type === 'script' && node.value.script) {
					const resourceObj: {
						[url: string]: boolean;
					} = {};
					const metaTags = CRM.Script.MetaTags.getMetaTags((globalObject.globals
						.crm.crmById[id] as CRM.ScriptNode).value.script);
					const resources = metaTags['resource'];
					const libs = node.value.libraries;
					for (let i = 0; i < libs.length; i++) {
						if (!libs[i].name) {
							resourceObj[libs[i].url] = true;
						}
					}
					for (let i = 0; i < resources; i++) {
						resourceObj[resources[i]] = true;
					}
					for (let i = 0; i < resourceNames.length; i++) {
						if (!resourceObj[resourceNames[i]]) {
							this._removeResource(resourceNames[i], ~~id);
						}
					}
				}
			}
		}
		static updateResourceValues() {
			for (let i = 0;
				i < globalObject.globals.storages.resourceKeys.length;
				i++
			) {
				console.log('Updating resources...');
				setTimeout(this._generateUpdateCallback(globalObject.globals.storages.resourceKeys[i]), (i * 1000));
			}
		}

		private static _getUrlData(scriptId: number, url: string, callback: (dataURI: string,
			dataString: string) => void) {
			//First check if the data has already been fetched
			if (globalObject.globals.storages.urlDataPairs[url]) {
				if (globalObject.globals.storages.urlDataPairs[url].refs.indexOf(scriptId) === -1) {
					globalObject.globals.storages.urlDataPairs[url].refs.push(scriptId);
				}
				callback(globalObject.globals.storages.urlDataPairs[url].dataURI,
					globalObject.globals.storages.urlDataPairs[url].dataString);
			} else {
				Helpers.convertFileToDataURI(url, (dataURI, dataString) => {
					//Write the data away to the url-data-pairs object
					globalObject.globals.storages.urlDataPairs[url] = {
						dataURI: dataURI,
						dataString: dataString,
						refs: [scriptId]
					};
					callback(dataURI, dataString);
				});
			}
		}
		private static _getHashes(url: string): Array<{
			algorithm: string;
			hash: string;
		}> {
			const hashes: Array<{
				algorithm: string;
				hash: string;
			}> = [];
			const hashString = url.split('#')[1];
			if (!hashString) {
				return [];
			}

			const hashStrings = hashString.split(/[,|;]/g);
			hashStrings.forEach((hash) => {
				const split = hash.split('=');
				hashes.push({
					algorithm: split[0],
					hash: split[1]
				});
			});
			return hashes;
		}
		private static _doAlgorithm(name: string, data: any, lastMatchingHash: {
			algorithm: string;
			hash: string;
		}) {
			window.crypto.subtle.digest(name, data).then((hash) => {
				return String.fromCharCode.apply(null, hash) === lastMatchingHash.hash;
			});
		}
		private static _algorithmNameToFnName(name: string): string {
			let numIndex = 0;
			for (let i = 0; i < name.length; i++) {
				if (name.charCodeAt(i) >= 48 && name.charCodeAt(i) <= 57) {
					numIndex = i;
					break;
				}
			}

			return name.slice(0, numIndex).toUpperCase() + '-' + name.slice(numIndex);
		}
		private static _matchesHashes(hashes: Array<{
			algorithm: string;
			hash: string;
		}>, data: string) {
			if (hashes.length === 0) {
				return true;
			}

			let lastMatchingHash: {
				algorithm: string;
				hash: string;
			} = null;
			hashes = hashes.reverse();
			for (let i = 0; i < hashes.length; i++) {
				const lowerCase = hashes[i].algorithm.toLowerCase();
				if (globalObject.globals.constants.supportedHashes.indexOf(lowerCase) !==
					-1) {
					lastMatchingHash = {
						algorithm: lowerCase,
						hash: hashes[i].hash
					};
					break;
				}
			}

			if (lastMatchingHash === null) {
				return false;
			}

			const arrayBuffer = new window.TextEncoder('utf-8').encode(data);
			switch (lastMatchingHash.algorithm) {
				case 'md5':
					return window.md5(data) === lastMatchingHash.hash;
				case 'sha1':
				case 'sha384':
				case 'sha512':
					this._doAlgorithm(this._algorithmNameToFnName(lastMatchingHash.algorithm),
						arrayBuffer, lastMatchingHash);
					break;

			}
			return false;
		}
		private static _registerResource(name: string, url: string, scriptId: number) {
			const registerHashes = this._getHashes(url);
			if (window.navigator.onLine) {
				this._getUrlData(scriptId, url, (dataURI, dataString) => {
					const resources = globalObject.globals.storages.resources;
					resources[scriptId] = resources[scriptId] || {};
					resources[scriptId][name] = {
						name: name,
						sourceUrl: url,
						dataURI: dataURI,
						hashes: registerHashes,
						matchesHashes: this._matchesHashes(registerHashes, dataString),
						crmUrl: `chrome-extension://${chrome.runtime.id}/resource/${scriptId}/${name}`
					};
					chrome.storage.local.set({
						resources: resources,
						urlDataPairs: globalObject.globals.storages.urlDataPairs
					});
				});
			}

			const resourceKeys = globalObject.globals.storages.resourceKeys;
			for (let i = 0; i < resourceKeys.length; i++) {
				if (resourceKeys[i].name === name && resourceKeys[i].scriptId === scriptId) {
					return;
				}
			}
			resourceKeys.push({
				name: name,
				sourceUrl: url,
				hashes: registerHashes,
				scriptId: scriptId
			});
			chrome.storage.local.set({
				resourceKeys: resourceKeys
			});
		}
		private static _removeResource(name: string, scriptId: number) {
			for (let i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
				if (globalObject.globals.storages.resourceKeys[i].name === name &&
					globalObject.globals.storages.resourceKeys[i].scriptId === scriptId) {
					globalObject.globals.storages.resourceKeys.splice(i, 1);
					break;
				}
			}
			if (!globalObject.globals.storages.resources[scriptId] ||
				!globalObject.globals.storages.resources[scriptId][name] ||
				!globalObject.globals.storages.resources[scriptId][name].sourceUrl) {
				//It's already been removed, skip
				return;
			}
			const urlDataLink = globalObject.globals.storages.urlDataPairs[
				globalObject.globals.storages.resources[scriptId][name].sourceUrl
			];
			if (urlDataLink) {
				urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
				if (urlDataLink.refs.length === 0) {
					//No more refs, clear it
					delete globalObject.globals.storages.urlDataPairs[globalObject.globals
						.storages.resources[scriptId][name].sourceUrl];
				}
			}
			if (globalObject.globals.storages.resources &&
				globalObject.globals.storages.resources[scriptId] &&
				globalObject.globals.storages.resources[scriptId][name]) {
				delete globalObject.globals.storages.resources[scriptId][name];
			}

			chrome.storage.local.set({
				resourceKeys: globalObject.globals.storages.resourceKeys,
				resources: globalObject.globals.storages.resources,
				urlDataPairs: globalObject.globals.storages.urlDataPairs
			});
		}
		private static _compareResource(key: {
			name: string;
			sourceUrl: string;
			hashes: Array<{
				algorithm: string;
				hash: string;
			}>;
			scriptId: number;
		}) {
			const resources = globalObject.globals.storages.resources;
			Helpers.convertFileToDataURI(key.sourceUrl, (dataURI, dataString) => {
				if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) ||
					resources[key.scriptId][key.name].dataURI !== dataURI) {
						//Check if the hashes still match, if they don't, reject it
						const resourceData = resources[key.scriptId][key.name];
						if (this._matchesHashes(resourceData.hashes, dataString)) {
							//Data URIs do not match, just update the url ref
							globalObject.globals.storages.urlDataPairs[key.sourceUrl].dataURI = dataURI;
							globalObject.globals.storages.urlDataPairs[key.sourceUrl].dataString = dataString;

							chrome.storage.local.set({
								resources: resources,
								urlDataPairs: globalObject.globals.storages.urlDataPairs
							});
						}
					}
			});
		}
		private static _generateUpdateCallback(resourceKey: {
			name: string;
			sourceUrl: string;
			hashes: Array<{
				algorithm: string;
				hash: string;
			}>;
			scriptId: number;
		}) {
			return () => {
				this._compareResource(resourceKey);
			};
		}
	}

	class MessageHandling {
		static Instances = class Instances {
			static respond(message: {
				onFinish: any;
				id: number;
				tabIndex: number;
				tabId: number;
			}, status: string, data?: any) {
				const msg = {
					type: status,
					callbackId: message.onFinish,
					messageType: 'callback',
					data: data
				};
				try {
					globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id][message.tabIndex]
						.port.postMessage(msg);
				} catch (e) {
					if (e.message === 'Converting circular structure to JSON') {
						this.respond(message, 'error',
							'Converting circular structure to JSON, getting a response from this API will not work');
					} else {
						throw e;
					}
				}
			}
			static sendMessage(message: {
				id: number;
				type: string;
				tabId: number;
				tabIndex: number;
				onFinish: {
					maxCalls: number;
					fn: number;
				};
				data: {
					id: number;
					tabIndex: number;
					toTabIndex: number;
					toInstanceId: number;
					message: any;
					tabId: number;
				}
			}) {
				const data = message.data;
				const tabData = globalObject.globals.crmValues.tabData;
				if (globalObject.globals.crmValues.nodeInstances[data.id][data.toInstanceId] &&
					tabData[data.toInstanceId] &&
					tabData[data.toInstanceId].nodes[data.id]) {
					if (globalObject.globals.crmValues.nodeInstances[data.id][data.toInstanceId][data.toTabIndex].hasHandler) {
						tabData[data.toInstanceId].nodes[data.id][data.toTabIndex].port.postMessage({
							messageType: 'instanceMessage',
							message: data.message
						});
						this.respond(message, 'success');
					} else {
						this.respond(message, 'error', 'no listener exists');
					}
				} else {
					this.respond(message, 'error',
						'instance no longer exists');
				}
			}
			static changeStatus(message: CRMAPIMessage<string, {
				hasHandler: boolean;
			}>) {
				globalObject.globals.crmValues.nodeInstances[message.id][message.tabId][message.tabIndex]
					.hasHandler = message.data.hasHandler;
			}
		};
		static BackgroundPageMessage = class BackgroundPageMessage {
			static send(message: {
				id: number;
				tabId: number;
				tabIndex: number;
				response: number;
				message: any;
			}) {
				const msg = message.message;
				const cb = message.response;

				globalObject.globals.background.byId[message.id].post({
					type: 'comm',
					message: {
						type: 'backgroundMessage',
						message: msg,
						respond: cb,
						tabId: message.tabId
					}
				});
			}
		};
		static NotificationListener = class NotificationListener {
			static listen(message: CRMAPIMessage<string, {
				notificationId: number;
				onClick: number;
				tabIndex: number;
				onDone: number;
				id: number;
				tabId: number;
			}>) {
				const data = message.data;
				globalObject.globals.notificationListeners[data.notificationId] = {
					id: data.id,
					tabId: data.tabId,
					tabIndex: data.tabIndex,
					notificationId: data.notificationId,
					onDone: data.onDone,
					onClick: data.onClick
				};
			}
		};

		static handleRuntimeMessage(message: CRMAPIMessage<string, any>,
			messageSender?: chrome.runtime.MessageSender,
			respond?: (message: any) => void) {
			switch (message.type) {
				case 'executeCRMCode':
				case 'getCRMHints':
				case 'createLocalLogVariable':
					Logging.LogExecution.executeCRMCode(message.data,
						message.type as 'executeCRMCode' | 'getCRMHints' | 'createLocalLogVariable');
					break;
				case 'displayHints':
					Logging.LogExecution.displayHints(message as CRMAPIMessage<'displayHints', {
						hints: Array<string>;
						id: number;
						callbackIndex: number;
						tabId: number;
					}>);
					break;
				case 'logCrmAPIValue':
					Logging.logHandler(message.data);
					break;
				case 'resource':
					Resources.Resource.handle(message.data);
					break;
				case 'anonymousLibrary':
					Resources.Anonymous.handle(message.data);
					break;
				case 'updateStorage':
					Storages.applyChanges(message.data);
					break;
				case 'sendInstanceMessage':
					this.Instances.sendMessage(message);
					break;
				case 'sendBackgroundpageMessage':
					this.BackgroundPageMessage.send(message.data);
					break;
				case 'respondToBackgroundMessage':
					this.Instances.respond({
						onFinish: message.data.response,
						tabIndex: message.data.tabIndex,
						id: message.data.id,
						tabId: message.data.tabId
					}, 'success', message.data.message);
					break;
				case 'changeInstanceHandlerStatus':
					this.Instances.changeStatus(message);
					break;
				case 'addNotificationListener':
					this.NotificationListener.listen(message);
					break;
				case 'newTabCreated':
					if (messageSender && respond) {
						CRM.Script.Running.executeScriptsForTab(messageSender.tab.id, respond);
					}
					break;
				case 'styleInstall':
					CRM.Stylesheet.Installing.installStylesheet(message.data);
					break;
				case 'updateScripts':
					CRM.Script.Updating.updateScripts((updated) => {
						if (respond) {
							respond(updated);
						}
					});
					break;
				case 'installUserScript':
					CRM.Script.Updating.install(message.data);
					break;
				case 'applyLocalStorage':
					localStorage.setItem(message.data.key, message.data.value);
					break;
			}
		}
		static handleCrmAPIMessage(message: CRMFunctionMessage | ChromeAPIMessage) {
			switch (message.type) {
				case 'crm':
					new CRMFunction(message, message.action);
					break;
				case 'chrome':
					ChromeHandler.handle(message);
					break;
				default:
					this.handleRuntimeMessage(message);
					break;
			}
		}
		static signalNewCRM() {
			const storage = CRM.converToLegacy();

			const tabData = globalObject.globals.crmValues.tabData;
			for (let tabId in tabData) {
				for (let nodeId in tabData[tabId].nodes) {
					tabData[tabId].nodes[nodeId].forEach((tabInstance) => {
						if (tabInstance.usesLocalStorage &&
							globalObject.globals.crm.crmById[nodeId].isLocal) {
							try {
								tabInstance.port.postMessage({
									messageType: 'localStorageProxy',
									message: storage
								});
							} catch (e) {
								//Looks like it's closed
							}
						}
					});
				}
			}
		}
	}

	type ClickHandler = (clickData: chrome.contextMenus.OnClickData,
		tabInfo: chrome.tabs.Tab, isAutoActivate?: boolean) => void;

	class CRM {
		static Script = class Script {
			private static _generateMetaAccessFunction(metaData: {
				[key: string]: any;
			}): (key: string) => any {
				return (key: string) => {
					if (metaData[key]) {
						return metaData[key][0];
					}
					return undefined;
				};
			}
			private static _getResourcesArrayForScript(scriptId: number): Array<{
				name: string;
				sourceUrl: string;
				matchesHashes: boolean;
				dataURI: string;
				crmUrl: string;
			}> {
				const resourcesArray = [];
				const scriptResources = globalObject.globals.storages.resources[scriptId];
				if (!scriptResources) {
					return [];
				}
				for (let resourceName in scriptResources) {
					if (scriptResources.hasOwnProperty(resourceName)) {
						resourcesArray.push(scriptResources[resourceName]);
					}
				}
				return resourcesArray;
			}
			private static _executeScript(tabId: number, scripts: Array<{
				code?: string;
				file?: string;
				runAt: string;
			}>, i: number) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					return () => { };
				}
				return () => {
					if (scripts.length > i) {
						try {
							chrome.tabs.executeScript(tabId, scripts[i], this._executeScript(tabId,
								scripts, i + 1));
						} catch (e) {
							//The tab was closed during execution
						}
					}
				};
			}

			private static _executeScripts(tabId: number, scripts: Array<{
				code?: string;
				file?: string;
				runAt: string;
			}>, usesUnsafeWindow: boolean) {
				if (usesUnsafeWindow) {
					//Send it to the content script and run it there
					chrome.tabs.sendMessage(tabId, {
						type: 'runScript',
						data: {
							scripts: scripts
						}
					});
				} else {
					this._executeScript(tabId, scripts, 0)();
				}
			}

			static Running = class Running {
				private static _urlIsGlobalExcluded(url: string): boolean {
					if (globalObject.globals.storages.globalExcludes.indexOf('<all_urls>') >
						-1) {
						return true;
					}
					for (let i = 0;
						i < globalObject.globals.storages.globalExcludes.length;
						i++
					) {
						const pattern = globalObject.globals.storages
							.globalExcludes[i] as MatchPattern;
						if (pattern && URLParsing.urlMatchesPattern(pattern, url)) {
							return true;
						}
					}
					return false;
				}
				private static _executeNode(node: CRM.Node, tab: chrome.tabs.Tab) {
					if (node.type === 'script') {
						CRM.Script.Handler.createHandler(node as CRM.ScriptNode)({
							pageUrl: tab.url,
							menuItemId: 0,
							editable: false
						}, tab, true);
					} else if (node.type === 'stylesheet') {
						CRM.Stylesheet.createClickHandler(node)({
							pageUrl: tab.url,
							menuItemId: 0,
							editable: false
						}, tab);
					} else if (node.type === 'link') {
						CRM.Link.createHandler(node)({
							pageUrl: tab.url,
							menuItemId: 0,
							editable: false
						}, tab);
					}
				}

				static executeScriptsForTab(tabId: number, respond: (message: any) => void) {
					chrome.tabs.get(tabId, (tab) => {
						if (window.chrome.runtime.lastError) {
							return;
						}
						if (tab.url && tab.url.indexOf('chrome') !== 0) {
							globalObject.globals.crmValues.tabData[tab.id] = {
								libraries: {},
								nodes: {}
							};
							Logging.Listeners.updateTabAndIdLists();
							if (!this._urlIsGlobalExcluded(tab.url)) {
								const toExecute: Array<{
									node: CRM.Node;
									tab: chrome.tabs.Tab;
								}> = [];
								for (let nodeId in globalObject.globals.toExecuteNodes.onUrl) {
									if (globalObject.globals.toExecuteNodes.onUrl.hasOwnProperty(nodeId) &&
										globalObject.globals.toExecuteNodes.onUrl[nodeId]) {
										if (URLParsing.matchesUrlSchemes(globalObject.globals
											.toExecuteNodes.onUrl[nodeId], tab.url)) {
											toExecute.push({
												node: globalObject.globals.crm.crmById[nodeId],
												tab: tab
											});
										}
									}
								}

								for (let i = 0; i < globalObject.globals.toExecuteNodes.always.length; i++) {
									this._executeNode(globalObject.globals.toExecuteNodes.always[i], tab);
								}
								for (let i = 0; i < toExecute.length; i++) {
									this._executeNode(toExecute[i].node, toExecute[i].tab);
								}
								respond({
									matched: toExecute.length > 0
								});
							}
						}
					});
				}

			};
			static Updating = class Updating {
				private static _removeOldNode(id: number) {
					const children = globalObject.globals.crm.crmById[id].children;
					if (children) {
						for (let i = 0; i < children.length; i++) {
							this._removeOldNode(children[i].id);
						}
					}

					if (globalObject.globals.background.byId[id]) {
						globalObject.globals.background.byId[id].worker.terminate();
						delete globalObject.globals.background.byId[id];
					}

					delete globalObject.globals.crm.crmById[id];
					delete globalObject.globals.crm.crmByIdSafe[id];

					const contextMenuId = globalObject.globals.crmValues.contextMenuIds[id];
					if (contextMenuId !== undefined && contextMenuId !== null) {
						chrome.contextMenus.remove(contextMenuId, () => {
							Helpers.checkForChromeErrors(false);
						});
					}
				}
				private static _registerNode(node: CRM.Node, oldPath?: Array<number>) {
					//Update it in CRM tree
					if (oldPath !== undefined && oldPath !== null) {
						eval(`globalObject.globals.storages.settingsStorage.crm[${oldPath
							.join('][')}] = node`);
					} else {
						globalObject.globals.storages.settingsStorage.crm.push(node);
					}
				}
				private static _getURL(url: string): HTMLAnchorElement {
					const anchor = document.createElement('a');
					anchor.href = url;
					return anchor;
				}
				private static _updateCRMNode(node: CRM.Node, allowedPermissions: Array<CRM.Permission>, downloadURL: string,
					oldNodeId?: number): {
						node: any,
						path: Array<number>,
						oldNodeId: number;
					} | {
						node: any;
					} {
					let hasOldNode = false;
					if (oldNodeId !== undefined && oldNodeId !== null) {
						hasOldNode = true;
					}

					const templates = globalObject.globals.constants.templates;
					switch (node.type) {
						case 'script':
							node = templates.getDefaultScriptNode(node);
							break;
						case 'stylesheet':
							node = templates.getDefaultStylesheetNode(node);
							break;
						case 'menu':
							node = templates.getDefaultMenuNode(node);
							break;
						case 'divider':
							node = templates.getDefaultDividerNode(node);
							break;
						case 'link':
							node = templates.getDefaultLinkNode(node);
							break;
					}

					(node.nodeInfo.source as CRM.NodeInfoSource).downloadURL = downloadURL;
					node.nodeInfo.lastUpdatedAt = Date.now();
					node.permissions = allowedPermissions
					node.isLocal = false;

					if (hasOldNode) {
						const path = globalObject.globals.crm.crmById[oldNodeId].path;
						return {
							node: node,
							path: path,
							oldNodeId: oldNodeId
						};
					} else {
						return {
							node: node
						};
					}
				}
				private static _deduceLaunchmode(metaTags: {
					[key: string]: any;
				}, triggers: CRM.Triggers): number {
					//if it's explicitly set in a metatag, use that value
					if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode')) {
						return CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode');
					}

					if (triggers.length === 0) {
						//No triggers, probably only run on clicking
						return CRMLaunchModes.RUN_ON_CLICKING;
					}
					return CRMLaunchModes.RUN_ON_SPECIFIED;
				}
				private static _createUserscriptTriggers(metaTags: {
					[key: string]: any;
				}): {
						triggers: CRM.Triggers,
						launchMode: CRMLaunchModes
					} {
					let triggers: CRM.Triggers = [];
					const includes: Array<string> = (metaTags['includes'] || []).concat(metaTags['include']);
					if (includes) {
						triggers = triggers.concat(includes.map(include => ({
							url: include,
							not: false
						})).filter(include => (!!include.url)));
					}
					const matches: Array<string> = metaTags['match'];
					if (matches) {
						triggers = triggers.concat(matches.map(match => ({
							url: match,
							not: false
						})).filter(match => (!!match.url)));
					}
					const excludes: Array<string> = metaTags['exclude'];
					if (excludes) {
						triggers = triggers.concat(excludes.map(exclude => ({
							url: exclude,
							not: false
						})).filter(exclude => (!!exclude.url)));
					}

					//Filter out duplicates
					triggers = triggers.filter((trigger, index) => (triggers.indexOf(trigger) === index));
					return {
						triggers,
						launchMode: this._deduceLaunchmode(metaTags, triggers)
					}
				}
				private static _createUserscriptScriptData(metaTags: {
					[key: string]: any;
				}, code: string, node: Partial<CRM.Node>) {
					node.type = 'script';
					node = node as CRM.ScriptNode;

					//Libraries
					let libs: Array<{
						url: string;
						name: string;
					}> = [];
					if (metaTags['CRM_libraries']) {
						(metaTags['CRM_libraries'] as Array<string>).forEach(item => {
							try {
								libs.push(JSON.parse(item));
							} catch (e) {
							}
						});
					}
					metaTags['CRM_libraries'] = libs;

					const requires: Array<string> = metaTags['require'] || [];
					const anonymousLibs: Array<CRM.Library> = [];
					for (let i = 0; i < requires.length; i++) {
						let skip = false;
						for (let j = 0; j < libs.length; j++) {
							if (libs[j].url === requires[i]) {
								skip = true;
								break;
							}
						}
						if (skip) {
							continue;
						}
						anonymousLibs.push({
							url: requires[i],
							name: null
						});
					}

					(anonymousLibs as Array<{
						url: string;
						name: null;
					}>).forEach(anonymousLib => {
						Resources.Anonymous.handle({
							type: 'register',
							name: anonymousLib.url,
							url: anonymousLib.url,
							scriptId: node.id
						});
					});

					libs = libs.concat(anonymousLibs);

					node.value = globalObject.globals.constants.templates.getDefaultScriptValue({
						script: code,
						libraries: libs
					});
				}
				private static _createUserscriptStylesheetData(metaTags: {
					[key: string]: any;
				}, code: string, node: Partial<CRM.Node>) {
					node = node as CRM.StylesheetNode;
					node.type = 'stylesheet';
					node.value = {
						stylesheet: code,
						defaultOn: (metaTags['CRM_defaultOn'] =
							CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
							false),
						toggle: (metaTags['CRM_toggle'] = CRM.Script.MetaTags
							.getlastMetaTagValue(metaTags,
							'CRM_toggle') ||
							false),
						launchMode: CRMLaunchModes.ALWAYS_RUN,
						options: {},
						convertedStylesheet: null
					};
				}
				private static _createUserscriptTypeData(metaTags: {
					[key: string]: any;
				}, code: string, node: Partial<CRM.Node>) {
					if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
						'CRM_stylesheet')) {
						this._createUserscriptStylesheetData(metaTags, code, node);
					} else {
						this._createUserscriptScriptData(metaTags, code, node);
					}
				}
				static install(message: {
					script: string;
					downloadURL: string;
					allowedPermissions: Array<CRM.Permission>;
					metaTags: {
						[key: string]: any;
					};
				}) {
					const oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
						.settingsStorage.crm));
					const newScript = CRM.Script.Updating.installUserscript(message.metaTags, message.script,
						message.downloadURL, message.allowedPermissions);

					if (newScript.path) { //Has old node
						const nodePath = newScript.path as Array<number>;
						this._removeOldNode(newScript.oldNodeId);
						this._registerNode(newScript.node, nodePath);
					} else {
						this._registerNode(newScript.node);
					}

					Storages.uploadChanges('settings', [
						{
							key: 'crm',
							oldValue: oldTree,
							newValue: globalObject.globals.storages.settingsStorage.crm
						}
					]);
				}
				static installUserscript(metaTags: {
					[key: string]: any;
				}, code: string, downloadURL: string, allowedPermissions: Array<CRM.Permission>,
					oldNodeId?: number): {
						node: CRM.ScriptNode | CRM.StylesheetNode,
						path?: Array<number>,
						oldNodeId?: number,
					} {
					let node: Partial<CRM.ScriptNode | CRM.StylesheetNode> = {};
					let hasOldNode = false;
					if (oldNodeId !== undefined && oldNodeId !== null) {
						hasOldNode = true;
						node.id = oldNodeId;
					} else {
						node.id = Helpers.generateItemId();
					}

					node.name = CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name';
					this._createUserscriptTypeData(metaTags, code, node);
					const { launchMode, triggers } = this._createUserscriptTriggers(metaTags);
					node.triggers = triggers;
					node.value.launchMode = launchMode;
					const updateUrl = CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'updateURL') ||
						CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
						downloadURL;

					//Requested permissions
					let permissions = [];
					if (metaTags['grant']) {
						permissions = metaTags['grant'];
						permissions = permissions.splice(permissions.indexOf('none'), 1);
					}

					//NodeInfo
					node.nodeInfo = {
						version: CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'version') || null,
						source: {
							updateURL: updateUrl || downloadURL,
							url: updateUrl || CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
							downloadURL,
							author: CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'author') ||
							'Anonymous'
						},
						isRoot: true,
						permissions: permissions,
						lastUpdatedAt: Date.now(),
						installDate: new Date().toLocaleDateString()
					};

					if (hasOldNode) {
						node.nodeInfo.installDate = (globalObject.globals.crm
							.crmById[oldNodeId] &&
							globalObject.globals.crm.crmById[oldNodeId].nodeInfo &&
							globalObject.globals.crm.crmById[oldNodeId].nodeInfo.installDate) ||
							node.nodeInfo.installDate;
					}

					//Content types
					if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
						'CRM_contentTypes')) {
						try {
							node.onContentTypes = JSON.parse(CRM.Script.MetaTags
								.getlastMetaTagValue(metaTags,
								'CRM_contentTypes'));
						} catch (e) {
						}
					}
					if (!node.onContentTypes) {
						node.onContentTypes = [true, true, true, true, true, true];
					}
					//Allowed permissions
					node.permissions = allowedPermissions || [];

					//Resources
					if (metaTags['resource']) {
						//Register resources
						const resources: Array<string> = metaTags['resource'];
						resources.forEach(resource => {
							const resourceSplit = resource.split(/(\s*)/);
							const [resourceName, resourceUrl] = resourceSplit;
							Resources.Resource.handle({
								type: 'register',
								name: resourceName,
								url: resourceUrl,
								scriptId: node.id
							});
						});
					}

					chrome.storage.local.get('requestPermissions', keys => {
						chrome.permissions.getAll((allowed: {
							permissions: Array<string>;
						}) => {
							const requestPermissionsAllowed = allowed.permissions || [];
							let requestPermissions: Array<string> = keys['requestPermissions'] || [];
							requestPermissions = requestPermissions.concat(node.permissions
								.filter(nodePermission => (requestPermissionsAllowed.indexOf(nodePermission) === -1)));
							requestPermissions = requestPermissions.filter((nodePermission, index) => (requestPermissions.indexOf(nodePermission) === index));
							chrome.storage.local.set({
								requestPermissions: requestPermissions
							}, () => {
								if (requestPermissions.length > 0) {
									chrome.runtime.openOptionsPage();
								}
							});
						});
					});

					if (node.type === 'script') {
						node = globalObject.globals.constants.templates
							.getDefaultScriptNode(node);
					} else {
						node = globalObject.globals.constants.templates
							.getDefaultStylesheetNode(node);
					}

					if (hasOldNode) {
						const path = globalObject.globals.crm.crmById[oldNodeId].path;
						return {
							node: node as CRM.ScriptNode | CRM.StylesheetNode,
							path: path,
							oldNodeId: oldNodeId
						};
					} else {
						return {
							node: node as CRM.ScriptNode | CRM.StylesheetNode,
							path: null,
							oldNodeId: null
						};
					}

				}
				static updateScripts(callback?: (data: any) => void) {
					const checking = [];
					const updatedScripts: Array<{
						oldNodeId: number;
						node: CRM.Node;
						path: Array<number>;
					}> = [];
					const oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
						.settingsStorage.crm));

					const _this = this;
					function onDone() {
						const updatedData = updatedScripts.map((updatedScript) => {
							const oldNode = globalObject.globals.crm.crmById[updatedScript
								.oldNodeId];
							return {
								name: updatedScript.node.name,
								id: updatedScript.node.id,
								oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version
								) ||
								undefined,
								newVersion: updatedScript.node.nodeInfo.version
							};
						});

						updatedScripts.forEach((updatedScript) => {
							if (updatedScript.path) { //Has old node
								_this._removeOldNode(updatedScript.oldNodeId);
								_this._registerNode(updatedScript.node, updatedScript.path);
							} else {
								_this._registerNode(updatedScript.node);
							}
						});

						Storages.uploadChanges('settings', [
							{
								key: 'crm',
								oldValue: oldTree,
								newValue: globalObject.globals.storages.settingsStorage.crm
							}
						]);

						chrome.storage.local.get('updatedScripts', (storage) => {
							let localStorageUpdatedScripts = storage['updatedScripts'] || [];
							localStorageUpdatedScripts = localStorageUpdatedScripts.concat(updatedData);
							chrome.storage.local.set({
								updatedScripts: localStorageUpdatedScripts
							});
						});

						if (callback) {
							callback(updatedData);
						}
					}

					console.log('Looking for updated scripts...');
					for (let id in globalObject.globals.crm.crmById) {
						if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
							const node = globalObject.globals.crm.crmById[id];
							const isRoot = node.nodeInfo && node.nodeInfo.isRoot;
							const downloadURL = node.nodeInfo &&
								node.nodeInfo.source &&
								typeof node.nodeInfo.source !== 'string' &&
								(node.nodeInfo.source.downloadURL ||
									node.nodeInfo.source.updateURL ||
									node.nodeInfo.source.url);
							if (downloadURL && isRoot) {
								const checkingId: number = checking.length;
								checking[checkingId] = true;
								this._checkNodeForUpdate(node,
									checking,
									checkingId,
									downloadURL,
									onDone,
									updatedScripts);
							}
						}
					}
				}

				private static _checkNodeForUpdate(node: CRM.Node, checking: Array<boolean>,
					checkingId: number, downloadURL: string, onDone: () => void,
					updatedScripts: Array<{
						node: CRM.Node;
						path?: Array<number>;
						oldNodeId?: number;
					}>) {
					if (this._getURL(downloadURL).hostname === undefined &&
						(node.type === 'script' ||
							node.type === 'stylesheet' ||
							node.type === 'menu')) {
						try {
							Helpers.convertFileToDataURI(
								`example.com/isUpdated/${downloadURL.split('/').pop()
									.split('.user.js')[0]}/${node.nodeInfo.version}`,
								(dataURI, dataString) => {
									try {
										const resultParsed = JSON.parse(dataString);
										if (resultParsed.updated) {
											if (!Helpers.compareArray(node.nodeInfo.permissions, resultParsed
												.metaTags
												.grant) &&
												!(resultParsed.metaTags.grant.length === 0 &&
													resultParsed.metaTags.grant[0] === 'none')) {
												//New permissions were added, notify user
												chrome.storage.local.get('addedPermissions', (data) => {
													const addedPermissions = data['addedPermissions'] || [];
													addedPermissions.push({
														node: node.id,
														permissions: resultParsed.metaTags.grant
															.filter((newPermission: CRM.Permission) => {
																return node.nodeInfo.permissions
																	.indexOf(newPermission) === -1;
															})
													});
													chrome.storage.local.set({
														addedPermissions: addedPermissions
													});
													chrome.runtime.openOptionsPage();
												});
											}

											updatedScripts.push(this._updateCRMNode(resultParsed.node,
												node.nodeInfo.permissions as Array<CRM.Permission>,
												downloadURL, node.id));
										}
										checking[checkingId] = false;
										if (checking.filter((c) => { return c; }).length === 0) {
											onDone();
										}
									} catch (err) {
										console.log('Tried to update script ', node.id, ' ', node.name,
											' but could not reach download URL');
									}
								}, () => {
									checking[checkingId] = false;
									if (checking.filter((c) => { return c; }).length === 0) {
										onDone();
									}
								});
						} catch (e) {
							console.log('Tried to update script ', node.id, ' ', node.name,
								' but could not reach download URL');
						}
					} else {
						if (node.type === 'script' || node.type === 'stylesheet') {
							//Do a request to get that script from its download URL
							if (downloadURL && Helpers.endsWith(downloadURL, '.user.js')) {
								try {
									Helpers.convertFileToDataURI(downloadURL, (dataURI, dataString) => {
										//Get the meta tags
										try {
											const metaTags = CRM.Script.MetaTags
												.getMetaTags(dataString);
											if (Helpers.isNewer(metaTags['version'][0], node.nodeInfo
												.version)) {
												if (!Helpers.compareArray(node.nodeInfo.permissions,
													metaTags['grant']) &&
													!(metaTags['grant'].length === 0 &&
														metaTags['grant'][0] === 'none')) {
													//New permissions were added, notify user
													chrome.storage.local.get('addedPermissions', (data) => {
														const addedPermissions = data['addedPermissions'] || [];
														addedPermissions.push({
															node: node.id,
															permissions: metaTags['grant'].filter((newPermission: CRM.Permission) => {
																return node.nodeInfo.permissions.indexOf(newPermission) === -1;
															})
														});
														chrome.storage.local.set({
															addedPermissions: addedPermissions
														});
														chrome.runtime.openOptionsPage();
													});
												}

												updatedScripts.push(this.installUserscript(metaTags,
													dataString, downloadURL, node.permissions, node.id));
											}

											checking[checkingId] = false;
											if (checking.filter((c) => { return c; }).length === 0) {
												onDone();
											}
										} catch (err) {
											console.log('Tried to update script ', node.id, ' ', node.name,
												' but could not reach download URL');
										}
									}, () => {
										checking[checkingId] = false;
										if (checking.filter((c) => { return c; }).length === 0) {
											onDone();
										}
									});
								} catch (e) {
									console.log('Tried to update script ', node.id, ' ', node.name,
										' but could not reach download URL');
								}
							}
						}
					}
				}
			};
			static MetaTags = class MetaTags {
				static getMetaIndexes(script: string): {
					start: number;
					end: number;
				} {
					let metaStart = -1;
					let metaEnd = -1;
					const lines = script.split('\n');
					for (let i = 0; i < lines.length; i++) {
						if (metaStart !== -1) {
							if (lines[i].indexOf('==/UserScript==') > -1) {
								metaEnd = i;
								break;
							}
						} else if (lines[i].indexOf('==UserScript==') > -1) {
							metaStart = i;
						}
					}
					return {
						start: metaStart,
						end: metaEnd
					};
				}
				static getMetaLines(script: string): Array<string> {
					const metaIndexes = this.getMetaIndexes(script);
					const metaStart = metaIndexes.start;
					const metaEnd = metaIndexes.end;
					const startPlusOne = metaStart + 1;
					const lines = script.split('\n');
					return lines.splice(startPlusOne, (metaEnd - startPlusOne));
				}
				static getMetaTags(script: string): {
					[key: string]: any
				} {
					const metaLines = this.getMetaLines(script);

					const metaTags: {
						[key: string]: any;
					} = {};
					const regex = /@(\w+)(\s+)(.+)/;
					for (let i = 0; i < metaLines.length; i++) {
						const regexMatches = metaLines[i].match(regex);
						if (regexMatches) {
							metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
							metaTags[regexMatches[1]].push(regexMatches[3]);
						}
					}

					return metaTags;
				}
				static getlastMetaTagValue(metaTags: {
					[key: string]: any;
				}, key: string) {
					return metaTags[key] && metaTags[key][metaTags[key].length - 1];
				}
			};
			static Background = class Background {
				private static _loadBackgroundPageLibs(node: CRM.ScriptNode): {
					libraries: Array<string>;
					code: Array<string>;
				} {
					const libraries = [];
					const code = [];
					for (let i = 0; i < node.value.libraries.length; i++) {
						let lib: {
							name: string;
							url?: string;
							code?: string;
							location?: string;
						} | {
								code: string;
								location?: string;
							};
						if (globalObject.globals.storages.storageLocal.libraries) {
							for (let j = 0;
								j < globalObject.globals.storages.storageLocal.libraries.length;
								j++) {
								if (globalObject.globals.storages.storageLocal.libraries[j].name ===
									node.value
										.libraries[i].name) {
									lib = globalObject.globals.storages.storageLocal.libraries[j];
									break;
								} else {
									//Resource hasn't been registered with its name, try if it's an anonymous one
									if (node.value.libraries[i].name === null) {
										//Check if the value has been registered as a resource
										if (globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
											lib = {
												code: globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url].dataString
											};
										}
									}
								}
							}
						}
						if (lib) {
							if (lib.location) {
								libraries.push(`/js/defaultLibraries/${lib.location}`);
							} else {
								code.push(lib.code);
							}
						}
					}

					return {
						libraries: libraries,
						code: code
					};
				}
				private static _genCode(code: Array<string>, {
					key,
					node,
					script,
					safeNode,
					indentUnit,
					nodeStorage,
					greaseMonkeyData
				}: {
						key: Array<number>;
						node: CRM.ScriptNode;
						script: string;
						safeNode: CRM.SafeNode;
						indentUnit: string;
						nodeStorage: any;
						greaseMonkeyData: GreaseMonkeyData;
					}): string {
					const enableBackwardsCompatibility = node.value.script.indexOf('/*execute locally*/') > -1 &&
						node.isLocal;
					const catchErrs = globalObject.globals.storages.storageLocal.catchErrors;
					return [
						code.join('\n'), [
							`var crmAPI = new CrmAPIInit(${[
								safeNode, node.id, { id: 0 }, {}, key,
								nodeStorage,
								greaseMonkeyData, true, (node.value && node.value.options) || {},
								enableBackwardsCompatibility, 0, chrome.runtime.id
							]
								.map((param) => {
									if (param === void 0) {
										return JSON.stringify(null);
									}
									return JSON.stringify(param);
								}).join(', ')});`
						].join(', '),
						globalObject.globals.constants.templates.globalObjectWrapperCode('self', 'selfWrapper', void 0),
						`${catchErrs ? 'try {' : ''}`,
						'function main(crmAPI, self, menuitemid, parentmenuitemid, mediatype,' +
						`${indentUnit}linkurl, srcurl, pageurl, frameurl, frameid,` +
						`${indentUnit}selectiontext, editable, waschecked, checked) {`,
						script,
						'}',
						`main(crmAPI, selfWrapper);`,
						`${catchErrs ? [
							`} catch (error) {`,
							`${indentUnit}if (crmAPI.debugOnError) {`,
							`${indentUnit}${indentUnit}debugger;`,
							`${indentUnit}}`,
							`${indentUnit}throw error;`,
							`}`
						].join('\n') : ''}`
					].join('\n')
				}

				static createBackgroundPage(node: CRM.ScriptNode) {
					if (!node ||
						node.type !== 'script' ||
						!node.value.backgroundScript ||
						node.value.backgroundScript === '') {
						return;
					}

					let isRestart = false;
					if (globalObject.globals.background.byId[node.id]) {
						isRestart = true;

						Logging.backgroundPageLog(node.id, null,
							'Restarting background page...');
						globalObject.globals.background.byId[node.id].worker.terminate();
						Logging.backgroundPageLog(node.id, null,
							'Terminated background page...');
					}

					const result = this._loadBackgroundPageLibs(node);
					const backgroundPageCode = result.code;
					const libraries = result.libraries;

					let key: Array<number> = [];
					let err = false;
					try {
						key = Helpers.createSecretKey();
					} catch (e) {
						//There somehow was a stack overflow
						err = e;
					}
					if (!err) {
						const globalNodeStorage = globalObject.globals.storages.nodeStorage;
						const nodeStorage = globalNodeStorage[node.id];
						const editorSettings = globalObject.globals.storages.settingsStorage.editor

						globalNodeStorage[node.id] = globalNodeStorage[node.id] || {};

						Script.Handler.genTabData(0, key, node.id, node.value.backgroundScript);
						Logging.Listeners.updateTabAndIdLists();

						const metaData = CRM.Script.MetaTags.getMetaTags(node.value.script);
						const { excludes, includes } = Script.Handler.getInExcludes(node);

						const indentUnit = editorSettings.useTabs ?
							'	' : Helpers.leftPad(' ', editorSettings.tabSize || 2)

						const script = node.value.backgroundScript.split('\n').map((line) => {
							return indentUnit + line;
						}).join('\n');

						const greaseMonkeyData = Script.Handler.generateGreaseMonkeyData(metaData, node, includes, excludes, {
							incognito: false
						});

						const safeNode = CRM.makeSafe(node) as any;
						safeNode.permissions = node.permissions;
						const code = this._genCode(backgroundPageCode, {
							key,
							node,
							script,
							safeNode,
							indentUnit,
							nodeStorage,
							greaseMonkeyData
						})

						sandboxes.sandbox(node.id, code, libraries, key, () => {
							const instancesArr: Array<{
								id: string;
								tabIndex: number;
							}> = [];
							const nodeInstances = globalObject.globals.crmValues
								.nodeInstances[node.id];
							for (let instance in nodeInstances) {
								if (nodeInstances.hasOwnProperty(instance) &&
									nodeInstances[instance]) {

									try {
										globalObject.globals.crmValues.tabData[instance]
											.nodes[node.id].forEach((tabIndexInstance, index) => {
												tabIndexInstance.port.postMessage({
													messageType: 'dummy'
												});
												instancesArr.push({
													id: instance,
													tabIndex: index
												});
											});
									} catch (e) {
										delete nodeInstances[instance];
									}
								}
							}
							return instancesArr;
						},
							(worker: CRMSandboxWorker) => {
								globalObject.globals.background.workers.push(worker);
								globalObject.globals.background.byId[node.id] = worker;
								if (isRestart) {
									Logging.log(node.id, '*', `Background page [${node.id}]: `,
										'Restarted background page...');
								}
							});
					} else {
						console.log('An error occurred while setting up the script for node ',
							node.id, err);
						throw err;
					}
				}
				static createBackgroundPages() {
					//Iterate through every node
					for (let nodeId in globalObject.globals.crm.crmById) {
						if (globalObject.globals.crm.crmById.hasOwnProperty(nodeId)) {
							const node = globalObject.globals.crm.crmById[nodeId];
							if (node.type === 'script') {
								this.createBackgroundPage(node);
							}
						}
					}
				}

			};
			static Handler = class Handler {
				private static _genCode({
					tab,
					key,
					info,
					node,
					safeNode,
				}: {
						tab: chrome.tabs.Tab;
						key: Array<number>;
						info: chrome.contextMenus.OnClickData;
						node: CRM.ScriptNode;
						safeNode: CRM.SafeNode;
					}, [contextData, [nodeStorage, greaseMonkeyData, script, indentUnit, runAt, tabIndex]]: [ContextData,
						[any, GreaseMonkeyData, string, string, string, number]]): string {

					const enableBackwardsCompatibility = node.value.script.indexOf('/*execute locally*/') > -1 &&
						node.isLocal;
					const catchErrs = globalObject.globals.storages.storageLocal.catchErrors;
					return [
						[
							`var crmAPI = new CrmAPIInit(${
							[
								safeNode, node.id, tab, info, key, nodeStorage,
								contextData, greaseMonkeyData, false, (node.value && node.value.options) || {},
								enableBackwardsCompatibility, tabIndex, chrome.runtime.id
							]
								.map((param) => {
									if (param === void 0) {
										return JSON.stringify(null);
									}
									return JSON.stringify(param);
								}).join(', ')});` +
							'window.CrmAPIInit = null;'
						].join(', '),
						globalObject.globals.constants.templates.globalObjectWrapperCode('window', 'windowWrapper', node.isLocal ? 'chrome' : 'void 0'),
						`${catchErrs ? 'try {' : ''}`,
						'function main(crmAPI, window, chrome, menuitemid, parentmenuitemid, mediatype,' +
						'linkurl, srcurl, pageurl, frameurl, frameid,' +
						'selectiontext, editable, waschecked, checked) {',
						script,
						'}',
						`main.apply(this, [crmAPI, windowWrapper, ${node.isLocal ? 'chrome' : 'void 0'}].concat(${
						JSON.stringify([
							info.menuItemId, info.parentMenuItemId, info.mediaType,
							info.linkUrl, info.srcUrl, info.pageUrl, info.frameUrl,
							(info as any).frameId, info.selectionText,
							info.editable, info.wasChecked, info.checked
						])
						}))`,
						`${catchErrs ? [
							`} catch (error) {`,
							`${indentUnit}if (crmAPI.debugOnError) {`,
							`${indentUnit}${indentUnit}debugger;`,
							`${indentUnit}}`,
							`${indentUnit}throw error;`,
							`}`
						].join('\n') : ''}`
					].join('\n');
				}
				private static _getScriptsToRun(code: string, runAt: string, node: CRM.ScriptNode, usesUnsafeWindow: boolean): Array<{
					code?: string;
					file?: string;
					runAt: string;
				}> {
					const scripts = [];
					for (let i = 0; i < node.value.libraries.length; i++) {
						let lib: {
							name: string;
							url?: string;
							code?: string;
						} | {
								code: string;
							};
						const globalLibs = globalObject.globals.storages.storageLocal.libraries;
						if (globalLibs) {
							for (let j = 0; j < globalLibs.length; j++) {
								if (globalLibs[j].name === node.value.libraries[i].name) {
									lib = globalLibs[j];
									break;
								}
							}
						}
						if (!lib) {
							//Resource hasn't been registered with its name, try if it's an anonymous one
							if (!node.value.libraries[i].name) {
								//Check if the value has been registered as a resource
								if (globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
									lib = {
										code: globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url].dataString
									};
								}
							}
						}
						if (lib) {
							scripts.push({
								code: lib.code,
								runAt: runAt
							});
						}
					}
					if (!usesUnsafeWindow) {
						//Let the content script determine whether to run this
						scripts.push({
							file: '/js/crmapi.js',
							runAt: runAt
						});
					}
					scripts.push({
						code: code,
						runAt: runAt
					});
					return scripts;
				}

				static generateGreaseMonkeyData(metaData: {
					[key: string]: any;
				}, node: CRM.ScriptNode, includes: Array<string>, excludes: Array<string>, tab: {
					incognito: boolean
				}) {
					const metaString = (CRM.Script.MetaTags.getMetaLines(node.value
						.script) || []).join('\n');
					const metaVal = CRM.Script._generateMetaAccessFunction(metaData);
					return {
						info: {
							script: {
								author: metaVal('author') || '',
								copyright: metaVal('copyright'),
								description: metaVal('description'),
								excludes: metaData['excludes'],
								homepage: metaVal('homepage'),
								icon: metaVal('icon'),
								icon64: metaVal('icon64'),
								includes: (metaData['includes'] || []).concat(metaData['include']),
								lastUpdated: 0, //Never updated
								matches: metaData['matches'],
								isIncognito: tab.incognito,
								downloadMode: 'browser',
								name: node.name,
								namespace: metaVal('namespace'),
								options: {
									awareOfChrome: true,
									compat_arrayleft: false,
									compat_foreach: false,
									compat_forvarin: false,
									compat_metadata: false,
									compat_prototypes: false,
									compat_uW_gmonkey: false,
									noframes: metaVal('noframes'),
									override: {
										excludes: true,
										includes: true,
										orig_excludes: metaData['excludes'],
										orig_includes: (metaData['includes'] || []).concat(metaData['include']),
										use_excludes: excludes,
										use_includes: includes
									}
								},
								position: 1, // what does this mean?
								resources: CRM.Script._getResourcesArrayForScript(node.id),
								"run-at": metaData['run-at'] || 'document_end',
								system: false,
								unwrap: true,
								version: metaVal('version')
							},
							scriptMetaStr: metaString,
							scriptSource: node.value.script,
							scriptUpdateURL: metaVal('updateURL'),
							scriptWillUpdate: true,
							scriptHandler: 'Custom Right-Click Menu',
							version: chrome.runtime.getManifest().version
						},
						resources: globalObject.globals.storages.resources[node.id] || {}
					};
				}
				static getInExcludes(node: CRM.ScriptNode): { excludes: Array<string>, includes: Array<string> } {
					const excludes: Array<string> = [];
					const includes: Array<string> = [];
					if (node.triggers) {
						for (let i = 0; i < node.triggers.length; i++) {
							if (node.triggers[i].not) {
								excludes.push(node.triggers[i].url);
							} else {
								includes.push(node.triggers[i].url);
							}
						}
					}
					return {
						excludes,
						includes
					}
				}
				static genTabData(tabId: number, key: Array<number>, nodeId: number, script: string) {
					globalObject.globals.crmValues.tabData[tabId] =
						globalObject.globals.crmValues.tabData[tabId] || {
							libraries: {},
							nodes: {}
						};
					globalObject.globals.crmValues.tabData[tabId].nodes[nodeId] =
						globalObject.globals.crmValues.tabData[tabId].nodes[nodeId] || [];
					globalObject.globals.crmValues.tabData[tabId].nodes[nodeId].push({
						secretKey: key,
						usesLocalStorage: script.indexOf('localStorageProxy') > -1
					});
				}
				static createHandler(node: CRM.ScriptNode): ClickHandler {
					return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab, isAutoActivate: boolean = false) => {
						let key: Array<number> = [];
						let err = false;
						try {
							key = Helpers.createSecretKey();
						} catch (e) {
							//There somehow was a stack overflow
							err = e;
						}
						if (err) {
							chrome.tabs.executeScript(tab.id, {
								code:
								'alert("Something went wrong very badly, please go to your Custom Right-Click Menu options page and remove any sketchy scripts.")'
							}, () => {
								chrome.runtime.reload();
							});
						} else {
							Promiselike.all([new Promiselike<ContextData>((resolve) => {
								//If it was triggered by clicking, ask contentscript about some data
								if (isAutoActivate) {
									resolve(null);
								} else {
									chrome.tabs.sendMessage(tab.id, {
										type: 'getLastClickInfo'
									}, (response: ContextData) => {
										resolve(response);
									});
								}
							}), new Promiselike<[any, GreaseMonkeyData, string, string, string, number]>((resolve) => {
								const globalNodeStorage = globalObject.globals.storages.nodeStorage;
								const nodeStorage = globalNodeStorage[node.id];
								const editorSettings = globalObject.globals.storages.settingsStorage.editor
								this.genTabData(tab.id, key, node.id, node.value.script)

								globalNodeStorage[node.id] = globalNodeStorage[node.id] || {};
								const tabIndex = globalObject.globals.crmValues.tabData[tab.id].nodes[node.id].length - 1;
								Logging.Listeners.updateTabAndIdLists();

								const metaData: {
									[key: string]: any;
								} = CRM.Script.MetaTags.getMetaTags(node.value.script);
								const runAt: string = metaData['run-at'] || 'document_end';
								const { excludes, includes } = this.getInExcludes(node)

								const greaseMonkeyData = this.generateGreaseMonkeyData(metaData, node, includes, excludes, tab)

								const indentUnit = editorSettings.useTabs ?
									'	' : Helpers.leftPad(' ', editorSettings.tabSize || 2)

								const script = node.value.script.split('\n').map((line) => {
									return indentUnit + line;
								}).join('\n');

								resolve([nodeStorage, greaseMonkeyData, script, indentUnit, runAt, tabIndex]);
							})]).then((args: [ContextData,
								[any, GreaseMonkeyData, string, string, string, number]]) => {
								const safeNode = CRM.makeSafe(node);
								(safeNode as any).permissions = node.permissions;
								const code = this._genCode({
									node,
									safeNode,
									tab,
									info,
									key
								}, args);

								const usesUnsafeWindow = node.value.script.indexOf('unsafeWindow') > -1;
								const scripts = this._getScriptsToRun(code, args[1][4], node, usesUnsafeWindow);
								Script._executeScripts(tab.id, scripts, usesUnsafeWindow);
							});
						}
					};
				}
			}
		};
		static Link = class Link {
			private static _sanitizeUrl(url: string): string {
				if (url.indexOf('://') === -1) {
					url = `http://${url}`;
				}
				return url;
			}

			static createHandler(node: CRM.LinkNode): ClickHandler {
				return (clickData: chrome.contextMenus.OnClickData,
					tabInfo: chrome.tabs.Tab) => {
					let finalUrl: string;
					for (let i = 0; i < node.value.length; i++) {
						if (node.value[i].newTab) {
							chrome.tabs.create({
								windowId: tabInfo.windowId,
								url: this._sanitizeUrl(node.value[i].url),
								openerTabId: tabInfo.id
							});
						} else {
							finalUrl = node.value[i].url;
						}
					}
					if (finalUrl) {
						chrome.tabs.update(tabInfo.id, {
							url: this._sanitizeUrl(finalUrl)
						});
					}
				};
			}
		};
		static Stylesheet = class Stylesheet {
			static createToggleHandler(node: CRM.StylesheetNode): ClickHandler {
				return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
					let code: string;
					const className = node.id + '' + tab.id;
					if (info.wasChecked) {
						code = [
							`var nodes = Array.prototype.slice.apply(document.querySelectorAll(".styleNodes${className}")).forEach(function(node){`,
							'node.remove();',
							'});'
						].join('');
					} else {
						const css = this._Options.getConvertedStylesheet(node).replace(/[ |\n]/g, '');
						code = [
							'var CRMSSInsert=document.createElement("style");',
							`CRMSSInsert.className="styleNodes${className}";`,
							'CRMSSInsert.type="text/css";',
							`CRMSSInsert.appendChild(document.createTextNode(${JSON
								.stringify(css)}));`,
							'document.head.appendChild(CRMSSInsert);'
						].join('');
					}
					globalObject.globals.crmValues
						.stylesheetNodeStatusses[node.id][tab.id] = info.checked;
					chrome.tabs.executeScript(tab.id, {
						code: code,
						allFrames: true
					});
				};
			}
			static createClickHandler(node: CRM.StylesheetNode): ClickHandler {
				return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
					const className = node.id + '' + tab.id;
					const css = this._Options.getConvertedStylesheet(node).replace(/[ |\n]/g, '');
					const code = [
						'(function() {',
						`if (document.querySelector(".styleNodes${className}")) {`,
						'return false;',
						'}',
						'var CRMSSInsert=document.createElement("style");',
						`CRMSSInsert.classList.add("styleNodes${className}");`,
						'CRMSSInsert.type="text/css";',
						`CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(css)}));`,
						'document.head.appendChild(CRMSSInsert);',
						'}());'
					].join('');
					chrome.tabs.executeScript(tab.id, {
						code: code,
						allFrames: true
					});
					return node.value.stylesheet;
				};
			}
			static Installing = class Installing {
				private static _triggerify(url: string): string {
					const match =
						/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
							.exec(url);

					return [
						match[2] || '*',
						'://',
						(match[4] && match[6]) ? match[4] + match[6] : '*',
						match[7] || '/'
					].join('');
				}
				private static _extractStylesheetData(data: {
					domains: Array<string>;
					regexps: Array<string>;
					urlPrefixes: Array<string>;
					urls: Array<string>;
					code: string;
				}) {
					//Get the @document declaration
					if (data.domains.length === 0 &&
						data.regexps.length === 0 &&
						data.urlPrefixes.length &&
						data.urls.length === 0) {
						return {
							launchMode: 1,
							triggers: [],
							code: data.code
						};
					}

					const triggers: Array<string> = [];
					data.domains.forEach((domainRule) => {
						triggers.push(`*://${domainRule}/*`);
					});
					data.regexps.forEach((regexpRule) => {
						const match =
							/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
								.exec(regexpRule);
						triggers.push([
							(match[2] ?
								(match[2].indexOf('*') > -1 ?
									'*' :
									match[2]) :
								'*'),
							'://',
							((match[4] && match[6]) ?
								((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
									'*' :
									match[4] + match[6]) :
								'*'),
							(match[7] ?
								(match[7].indexOf('*') > -1 ?
									'*' :
									match[7]) :
								'*')
						].join(''));
					});
					data.urlPrefixes.forEach((urlPrefixRule) => {
						if (URLParsing.triggerMatchesScheme(urlPrefixRule)) {
							triggers.push(urlPrefixRule + '*');
						} else {
							triggers.push(this._triggerify(urlPrefixRule + '*'));
						}
					});
					data.urls.forEach((urlRule) => {
						if (URLParsing.triggerMatchesScheme(urlRule)) {
							triggers.push(urlRule);
						} else {
							triggers.push(this._triggerify(urlRule));
						}
					});

					return {
						launchMode: 2,
						triggers: triggers.map((trigger) => {
							return {
								url: trigger,
								not: false
							};
						}),
						code: data.code
					};
				}

				static installStylesheet(data: {
					code: string;
					author: string
				}) {
					const stylesheetData: {
						sections: Array<{
							domains: Array<string>;
							regexps: Array<string>;
							urlPrefixes: Array<string>;
							urls: Array<string>;
							code: string;
						}>;
						name: string;
						updateUrl: string;
						url: string;
					} = JSON.parse(data.code);

					stylesheetData.sections.forEach((section) => {
						const sectionData = this._extractStylesheetData(section);
						const node = globalObject.globals.constants.templates
							.getDefaultStylesheetNode({
								isLocal: false,
								name: stylesheetData.name,
								nodeInfo: {
									version: '1',
									source: {
										updateURL: stylesheetData.updateUrl,
										url: stylesheetData.url,
										author: data.author
									},
									permissions: [],
									installDate: new Date().toLocaleDateString()
								},
								triggers: sectionData.triggers,
								value: {
									launchMode: sectionData.launchMode,
									stylesheet: sectionData.code
								},
								id: Helpers.generateItemId()
							});

						const crmFn = new CRMFunction(null, 'null');
						crmFn.moveNode(node, {}, null);
					});
				}
			};
			private static _Options = class Options {
				private static _splitComments(stylesheet: string): Array<{
					isComment: boolean;
					line: string;
				}> {
					const lines: Array<{
						isComment: boolean;
						line: string;
					}> = [{
						isComment: false,
						line: ''
					}];
					let inComment: boolean = false;
					let lineIndex = 0;
					for (let i = 0; i < stylesheet.length; i++) {
						if (stylesheet[i] === '/' && stylesheet[i + 1] === '*') {
							inComment = true;
							lineIndex++;
							i += 1;
							lines[lineIndex] = {
								isComment: true,
								line: ''
							};
						} else if (stylesheet[i] === '*' && stylesheet[i + 1] === '/') {
							inComment = false;
							lineIndex++;
							i += 1;
							lines[lineIndex] = {
								isComment: false,
								line: ''
							};
						} else {
							lines[lineIndex].line += stylesheet[i];
						}
					}
					return lines;
				}
				private static _evalOperator(left: any, operator: string, right: any): boolean {
					switch (operator) {
						case '<=':
							return left <= right;
						case '>=':
							return left >= right;
						case '<':
							return left < right;
						case '>':
							return left > right;
						case '!==':
							return left !== right;
						case '!=':
							return left != right;
						case '===':
							return left === right;
						case '==':
							return left == right;
					}
					return false;
				}
				private static _getOptionValue(option: CRM.OptionsValue): any {
					switch (option.type) {
						case 'array':
							return option.items;
						case 'boolean':
						case 'number':
						case 'string':
							return option.value;
						case 'choice':
							return option.values[option.selected];
					}
				}
				private static _numRegex = /^(-)?(\d)+(\.(\d)+)?$/;
				private static _strRegex = /^("(.*)"|'(.*)'|`(.*)`)$/;
				private static _valueRegex = /^(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+(\.(\d)+)?|\w(\w|\d)*)(\n|\r|\s)*$/;
				private static _boolExprRegex = /^(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+(\.(\d)+)?|\w(\w|\d)*)(\n|\r|\s)*(<=|>=|<|>|!==|!=|===|==)(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+|\w(\w|\d)*)(\n|\r|\s)*$/;
				private static _getStringExprValue(expr: string, options: CRM.Options): any {
					if (expr === 'true') {
						return true;
					}
					if (expr === 'false') {
						return false;
					}
					if (this._numRegex.exec(expr)) {
						return parseFloat(expr);
					}
					if (this._strRegex.exec(expr)) {
						return expr.slice(1, -1);
					}
					//It must be a variable
					if (options[expr]) {
						return this._getOptionValue(options[expr]);
					}
				}
				private static _evaluateBoolExpr(expr: string, options: CRM.Options): boolean {
					if (expr.indexOf('||') > -1) {
						return this._evaluateBoolExpr(expr.slice(0, expr.indexOf('||')), options) ||
							this._evaluateBoolExpr(expr.slice(expr.indexOf('||') + 2), options);
					}
					if (expr.indexOf('&&') > -1) {
						return this._evaluateBoolExpr(expr.slice(0, expr.indexOf('&&')), options) &&
							this._evaluateBoolExpr(expr.slice(expr.indexOf('&&') + 2), options);
					}
					const regexEval = this._boolExprRegex.exec(expr);
					if (regexEval) {
						const leftExpr = regexEval[2];
						const operator = regexEval[12];
						const rightExpr = regexEval[14];
						return this._evalOperator(
							this._getStringExprValue(leftExpr, options),
							operator,
							this._getStringExprValue(rightExpr, options)
						);
					}
					const valueRegexEval = this._valueRegex.exec(expr);
					if (valueRegexEval) {
						return !!this._getStringExprValue(valueRegexEval[2], options);
					}
					return false;
				}
				private static _evaluateIfStatement(line: string, options: CRM.Options): boolean {
					const statement = this._ifRegex.exec(line)[2];
					return this._evaluateBoolExpr(statement, options);
				}
				private static _replaceVariableInstances(line: string, options: CRM.Options): string {
					const parts: Array<{
						isVariable: boolean;
						content: string;
					}> = [{
						isVariable: false,
						content: ''
					}];
					let inVar: boolean = false;
					for (let i = 0; i < line.length; i++) {
						if (line[i] === '{' && line[i + 1] === '{') {
							if (!inVar) {
								inVar = true;
								parts.push({
									isVariable: true,
									content: ''
								});
							} else {
								parts[parts.length - 1].content += '{{';
							}
							i += 1;
						} else if (line[i] === '}' && line[i + 1] === '}') {
							if (inVar) {
								inVar = false;
								parts.push({
									isVariable: false,
									content: ''
								});
							} else {
								parts[parts.length - 1].content += '}}';
							}
							i += 1;
						} else {
							parts[parts.length - 1].content += line[i];
						}
					}

					return parts.map((part) => {
						if (!part.isVariable) {
							return part.content;
						}
						return options[part.content] && this._getOptionValue(options[part.content]);
					}).join('');
				}
				private static _getLastIf(ifs: Array<{
					skip: boolean;
					isElse: boolean;
					ignore: boolean;
				}>): {
						skip: boolean;
						isElse: boolean;
						ignore: boolean;
					} {
					if (ifs.length > 0) {
						return ifs[ifs.length - 1];
					}
					return {
						skip: false,
						isElse: false,
						ignore: false
					}
				}
				private static _ifRegex = /^(\n|\r|\s)*if (.+) then(\n|\r|\s)*$/;
				private static _elseRegex = /^(\n|\r|\s)*else(\n|\r|\s)*$/;
				private static _endifRegex = /^(\n|\r|\s)*endif(\n|\r|\s)*$/;
				private static _variableRegex = /^(\n|\r|\s)*(\w|-)+:(\n|\r|\s)*(.*)\{\{\w(\w|\d)*\}\}(.*)((\n|\r|\s)*,(\n|\r|\s)*(.*)\{\{\w(\w|\d)*\}\}(.*))*$/;
				private static _convertStylesheet(stylesheet: string, options: CRM.Options): string {
					const splitComments = this._splitComments(stylesheet);
					const lines: Array<string> = [];

					const ifs: Array<{
						skip: boolean;
						isElse: boolean;
						ignore: boolean;
					}> = [];
					for (let i = 0; i < splitComments.length; i++) {
						if (this._ifRegex.exec(splitComments[i].line)) {
							ifs.push({
								skip: this._getLastIf(ifs).skip || !this._evaluateIfStatement(splitComments[i].line, options),
								isElse: false,
								ignore: this._getLastIf(ifs).skip
							});
						} else if (this._elseRegex.exec(splitComments[i].line)) {
							//Double else, don't flip anymore
							if (!this._getLastIf(ifs).isElse && !this._getLastIf(ifs).ignore) {
								this._getLastIf(ifs).skip = !this._getLastIf(ifs).skip;
							}
							this._getLastIf(ifs).isElse = true;
						} else if (this._endifRegex.exec(splitComments[i].line)) {
							ifs.pop();
						} else if (!this._getLastIf(ifs).skip) {
							//Don't skip this
							if (!splitComments[i].isComment) {
								//No comment, don't have to evaluate anything
								lines.push(splitComments[i].line);
							} else {
								if (this._variableRegex.exec(splitComments[i].line)) {
									lines.push(this._replaceVariableInstances(
										splitComments[i].line, options
									));
								} else {
									//Regular comment, just add it
									lines.push(splitComments[i].line);
								}
							}
						}
					}
					return lines.join('');
				}
				static getConvertedStylesheet(node: CRM.StylesheetNode): string {
					if (node.value.convertedStylesheet &&
						node.value.convertedStylesheet.options === JSON.stringify(node.value.options)) {
						return node.value.convertedStylesheet.stylesheet;
					}
					node.value.convertedStylesheet = {
						options: JSON.stringify(node.value.options),
						stylesheet: this._convertStylesheet(node.value.stylesheet, typeof node.value.options === 'string' ?
							{} : node.value.options)
					};
					return node.value.convertedStylesheet.stylesheet;
				}
			}
		};
		static NodeCreation = class NodeCreation {
			private static _getStylesheetReplacementTabs(node: CRM.Node): Array<{
				id: number;
			}> {
				const replaceOnTabs: Array<{
					id: number;
				}> = [];
				const crmNode = globalObject.globals.crm.crmById[node.id];
				if (globalObject.globals.crmValues.contextMenuIds[node.id] && //Node already exists
					crmNode.type === 'stylesheet' &&
					node.type === 'stylesheet' && //Node type stayed stylesheet
					crmNode.value.stylesheet !== node.value.stylesheet) { //Value changed

					//Update after creating a new node
					for (let key in globalObject.globals.crmValues
						.stylesheetNodeStatusses[node
							.id]) {
						if (globalObject.globals.crmValues.stylesheetNodeStatusses
							.hasOwnProperty(key) &&
							globalObject.globals.crmValues.stylesheetNodeStatusses[key]) {
							if (globalObject.globals.crmValues.stylesheetNodeStatusses[node
								.id][key] &&
								key !== 'defaultValue') {
								replaceOnTabs.push({
									id: (key as any) as number
								});
							}
						}
					}
				}
				return replaceOnTabs;
			}
			private static _pushToGlobalToExecute(node: CRM.Node, launchMode: CRMLaunchModes) {
				//On by default
				if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
					if (launchMode === CRMLaunchModes.ALWAYS_RUN ||
						launchMode === CRMLaunchModes.RUN_ON_CLICKING) {
						globalObject.globals.toExecuteNodes.always.push(node);
					} else if (launchMode === CRMLaunchModes.RUN_ON_SPECIFIED ||
						launchMode === CRMLaunchModes.SHOW_ON_SPECIFIED) {
						globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
					}
				}
			}
			private static _handleHideOnPages(node: CRM.Node, launchMode: CRMLaunchModes,
				rightClickItemOptions: chrome.contextMenus.CreateProperties) {
				if ((node['showOnSpecified'] && (node.type === 'link' || node.type === 'divider' ||
					node.type === 'menu')) ||
					launchMode === CRMLaunchModes.SHOW_ON_SPECIFIED) {
					rightClickItemOptions.documentUrlPatterns = [];
					globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
					for (let i = 0; i < node.triggers.length; i++) {
						const prepared = URLParsing.prepareTrigger(node.triggers[i].url);
						if (prepared) {
							if (node.triggers[i].not) {
								globalObject.globals.crmValues.hideNodesOnPagesData[node.id]
									.push({
										not: false,
										url: prepared
									});
							} else {
								rightClickItemOptions.documentUrlPatterns.push(prepared);
							}
						}
					}
				}
			}
			private static _generateClickHandler(node: CRM.Node,
				rightClickItemOptions: chrome.contextMenus.CreateProperties) {
				//It requires a click handler
				switch (node.type) {
					case 'divider':
						rightClickItemOptions.type = 'separator';
						break;
					case 'link':
						rightClickItemOptions.onclick = CRM.Link.createHandler(node);
						break;
					case 'script':
						rightClickItemOptions.onclick = CRM.Script.Handler.createHandler(node);
						break;
					case 'stylesheet':
						if (node.value.toggle) {
							rightClickItemOptions.type = 'checkbox';
							rightClickItemOptions.onclick = CRM.Stylesheet
								.createToggleHandler(node);
							rightClickItemOptions.checked = node.value.defaultOn;
						} else {
							rightClickItemOptions.onclick = CRM.Stylesheet
								.createClickHandler(node);
						}
						globalObject.globals.crmValues.stylesheetNodeStatusses[node.id] = {
							defaultValue: node.value.defaultOn
						};
						break;
				}
			}
			private static _generateContextMenuItem(rightClickItemOptions: chrome.contextMenus.CreateProperties,
				idHolder: {
					id: number;
				}) {
				idHolder.id = chrome.contextMenus.create(rightClickItemOptions, () => {
					if (chrome.runtime.lastError) {
						if (rightClickItemOptions.documentUrlPatterns) {
							console
								.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
							delete rightClickItemOptions.documentUrlPatterns;
							idHolder.id = chrome.contextMenus.create(rightClickItemOptions, () => {
								idHolder.id = chrome.contextMenus.create({
									title: 'ERROR',
									onclick: CRM._createOptionsPageHandler()
								});
								console.log('Another error occured with your context menu!',
									chrome.runtime.lastError);
							});
						} else {
							console.log('An error occured with your context menu!',
								chrome.runtime.lastError);
						}
					}
				});
			}
			private static _addRightClickItemClick(node: CRM.Node, launchMode: CRMLaunchModes,
				rightClickItemOptions: chrome.contextMenus.CreateProperties, idHolder: {
					id: number;
				}) {
				//On by default
				this._pushToGlobalToExecute(node, launchMode)
				this._handleHideOnPages(node, launchMode, rightClickItemOptions);
				this._generateClickHandler(node, rightClickItemOptions);
				this._generateContextMenuItem(rightClickItemOptions, idHolder)

				globalObject.globals.crmValues.contextMenuInfoById[idHolder.id] = {
					settings: rightClickItemOptions,
					path: node.path,
					enabled: false
				};
			}
			private static _setLaunchModeData(node: CRM.Node,
				rightClickItemOptions: chrome.contextMenus.CreateProperties, idHolder: {
					id: number;
				}) {
				const launchMode = ((node.type === 'script' || node.type === 'stylesheet') &&
					node.value.launchMode) || CRMLaunchModes.RUN_ON_CLICKING;
				if (launchMode === CRMLaunchModes.ALWAYS_RUN) {
					globalObject.globals.toExecuteNodes.always.push(node);
				} else if (launchMode === CRMLaunchModes.RUN_ON_SPECIFIED) {
					globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
				} else if (launchMode !== CRMLaunchModes.DISABLED) {
					this._addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
				}
			}

			static createNode(node: CRM.Node, parentId: number) {
				const replaceStylesheetTabs = this._getStylesheetReplacementTabs(node);
				const rightClickItemOptions = {
					title: node.name,
					contexts: CRM.getContexts(node.onContentTypes),
					parentId: parentId
				};

				const idHolder: {
					id: number;
				} = { id: null };
				this._setLaunchModeData(node, rightClickItemOptions, idHolder);
				const id = idHolder.id;

				if (replaceStylesheetTabs.length !== 0) {
					node = node as CRM.StylesheetNode;
					for (let i = 0; i < replaceStylesheetTabs.length; i++) {
						const className = node.id + '' + replaceStylesheetTabs[i].id;
						let code = `var nodes = document.querySelectorAll(".styleNodes${
							className
							}");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}`;
						const css = node.value.stylesheet.replace(/[ |\n]/g, '');
						code +=
							`var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes${className}";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(css)}));document.head.appendChild(CRMSSInsert);`;
						chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
							code: code,
							allFrames: true
						});
						globalObject.globals.crmValues.stylesheetNodeStatusses[node
							.id][replaceStylesheetTabs[i].id] = true;
					}
				}

				return id;
			}
		};

		static updateCrm(toUpdate?: Array<number>) {
			Storages.uploadChanges('settings', [
				{
					key: 'crm',
					newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree)),
					oldValue: {}
				}
			]);
			CRM.updateCRMValues();
			CRM.buildPageCRM();
			MessageHandling.signalNewCRM();

			if (toUpdate) {
				Storages.checkBackgroundPagesForChange([], toUpdate);
			}
		}
		static updateCRMValues() {
			const crmBefore = JSON.stringify(globalObject.globals.storages.settingsStorage.crm);
			Storages.crmForEach(globalObject.globals.storages
				.settingsStorage.crm, (node) => {
					if (!node.id && node.id !== 0) {
						node.id = Helpers.generateItemId();
					}
				});

			const match = crmBefore === JSON.stringify(globalObject.globals.storages.settingsStorage.crm);

			globalObject.globals.crm.crmTree = globalObject.globals.storages
				.settingsStorage.crm;
			globalObject.globals.crm.safeTree = this._buildSafeTree(globalObject.globals
				.storages.settingsStorage.crm);
			this._buildNodePaths(globalObject.globals.crm.crmTree, []);
			this._buildByIdObjects();

			if (!match) {
				Storages.uploadChanges('settings', [
					{
						key: 'crm',
						newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree)),
						oldValue: {}
					}
				]);
			}
		}
		static makeSafe(node: CRM.Node): CRM.SafeNode {
			let newNode: CRM.SafeNode = {} as any;
			if (node.children) {
				const menuNode = newNode as CRM.SafeMenuNode;
				menuNode.children = [];
				for (let i = 0; i < node.children.length; i++) {
					menuNode.children[i] = this.makeSafe(node.children[i]);
				}
				newNode = menuNode;
			}

			const copy = this._createCopyFunction(node, newNode);

			copy([
				'id', 'path', 'type', 'name', 'value', 'linkVal',
				'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
				'triggers', 'onContentTypes', 'showOnSpecified'
			]);
			return newNode as CRM.SafeNode;
		}
		static buildPageCRM() {
			const length = globalObject.globals.crm.crmTree.length;
			globalObject.globals.crmValues.stylesheetNodeStatusses = {};
			chrome.contextMenus.removeAll();
			globalObject.globals.crmValues.rootId = chrome.contextMenus.create({
				title: 'Custom Menu',
				contexts: ['all']
			});
			globalObject.globals.toExecuteNodes = {
				onUrl: {},
				always: []
			};
			for (let i = 0; i < length; i++) {
				const result = this._buildPageCRMTree(globalObject.globals.crm.crmTree[i],
					globalObject.globals.crmValues.rootId, [i], globalObject.globals.crmValues
						.contextMenuItemTree);
				if (result) {
					globalObject.globals.crmValues.contextMenuItemTree[i] = {
						index: i,
						id: result.id,
						enabled: true,
						node: globalObject.globals.crm.crmTree[i],
						parentId: globalObject.globals.crmValues.rootId,
						children: result.children,
						parentTree: globalObject.globals.crmValues.contextMenuItemTree
					};
				}
			}

			if (globalObject.globals.storages.storageLocal.showOptions) {
				chrome.contextMenus.create({
					type: 'separator',
					parentId: globalObject.globals.crmValues.rootId
				});
				chrome.contextMenus.create({
					title: 'Options',
					onclick: this._createOptionsPageHandler(),
					parentId: globalObject.globals.crmValues.rootId
				});
			}
		}
		static getContexts(contexts: CRM.ContentTypes): Array<string> {
			const newContexts = ['browser_action'];
			const textContexts = globalObject.globals.constants.contexts;
			for (let i = 0; i < 6; i++) {
				if (contexts[i]) {
					newContexts.push(textContexts[i]);
				}
			}
			if (contexts[0]) {
				newContexts.push('editable');
			}
			return newContexts;
		}
		static converToLegacy(): {
			[key: number]: string;
			[key: string]: string;
		} {
			const { arr } = this._walkCRM(globalObject.globals.crm.crmTree, {
				arr: []
			});

			const res: {
				[key: number]: string;
				[key: string]: string;
			} = {};

			for (let i = 0; i < arr.length; i++) {
				res[i] = this._convertNodeToLegacy(arr[i]);
			}

			res.customcolors = '0';
			res.firsttime = 'no';
			res.noBeatAnnouncement = 'true';
			res.numberofrows = arr.length + '';
			res.optionson = globalObject.globals.storages.storageLocal.showOptions.toString();
			res.scriptoptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
			res.waitforsearch = 'false';
			res.whatpage = 'false';

			res.indexIds = JSON.stringify(arr.map((node) => {
				return node.id;
			}));

			return res;
		}

		private static _convertNodeToLegacy(node: CRM.Node): string {
			switch (node.type) {
				case 'divider':
					return [node.name, 'Divider', ''].join('%123');
				case 'link':
					return [node.name, 'Link', node.value.map((val) => {
						return val.url;
					}).join(',')].join('%123');
				case 'menu':
					return [node.name, 'Menu', node.children.length].join('%123');
				case 'script':
					return [
						node.name,
						'Script',
						[
							node.value.launchMode,
							node.value.script
						].join('%124')
					].join('%123');
				case 'stylesheet':
					return [
						node.name,
						'Script',
						[
							node.value.launchMode,
							node.value.stylesheet
						].join('%124')
					].join('%123');
			}
		}
		private static _walkCRM(crm: CRM.Tree, state: {
			arr: Array<CRM.Node>;
		}) {
			for (let i = 0; i < crm.length; i++) {
				const node = crm[i];
				state.arr.push(node);
				if (node.type === 'menu' && node.children) {
					this._walkCRM(node.children, state);
				}
			}
			return state;
		}
		private static _createCopyFunction(obj: CRM.Node,
			target: CRM.SafeNode): (props: Array<string>) => void {
			return (props: Array<string>) => {
				props.forEach((prop) => {
					if (prop in obj) {
						if (typeof obj[prop as keyof CRM.Node] === 'object') {
							target[prop as keyof CRM.SafeNode] = JSON.parse(JSON.stringify(obj[prop as keyof CRM.Node]));
						} else {
							(target as any)[prop] = obj[prop as keyof CRM.Node];
						}
					}
				});
			};
		}
		private static _buildNodePaths(tree: Array<CRM.Node>, currentPath: Array<number>) {
			for (let i = 0; i < tree.length; i++) {
				const childPath = currentPath.concat([i]);
				const child = tree[i];
				child.path = childPath;
				if (child.children) {
					this._buildNodePaths(child.children, childPath);
				}
			}
		}
		private static _createOptionsPageHandler(): () => void {
			return () => {
				chrome.runtime.openOptionsPage();
			};
		}
		private static _buildPageCRMTree(node: CRM.Node, parentId: number,
			path: Array<number>,
			parentTree: Array<ContextMenuItemTreeItem>): {
				id: number;
				path: Array<number>;
				enabled: boolean;
				children: Array<ContextMenuItemTreeItem>;
				index?: number;
				parentId?: number;
				node?: CRM.Node;
				parentTree?: Array<ContextMenuItemTreeItem>;
			} {
			const id = this.NodeCreation.createNode(node, parentId);
			globalObject.globals.crmValues.contextMenuIds[node.id] = id;
			if (id !== null) {
				const children = [];
				if (node.children) {
					let visibleIndex = 0;
					for (let i = 0; i < node.children.length; i++) {
						const newPath = JSON.parse(JSON.stringify(path));
						newPath.push(visibleIndex);
						const result: any = this._buildPageCRMTree(node.children[i], id, newPath, children);
						if (result) {
							visibleIndex++;
							result.index = i;
							result.parentId = id;
							result.node = node.children[i];
							result.parentTree = parentTree;
							children.push(result);
						}
					}
				}
				globalObject.globals.crmValues.contextMenuInfoById[id].path = path;
				return {
					id: id,
					path: path,
					enabled: true,
					children: children
				};
			}

			return null;
		}

		private static _parseNode(node: CRM.Node, isSafe: boolean = false) {
			globalObject.globals.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (
				isSafe ? this.makeSafe(node) : node
			);
			if (node.children && node.children.length > 0) {
				for (let i = 0; i < node.children.length; i++) {
					this._parseNode(node.children[i], isSafe);
				}
			}
		}

		private static _buildByIdObjects() {
			globalObject.globals.crm.crmById = {};
			globalObject.globals.crm.crmByIdSafe = {};
			for (let i = 0; i < globalObject.globals.crm.crmTree.length; i++) {
				this._parseNode(globalObject.globals.crm.crmTree[i]);
				this._parseNode(globalObject.globals.crm.safeTree[i] as any, true);
			}
		}

		private static _safeTreeParse(node: CRM.Node): CRM.SafeNode {
			if (node.children) {
				const children = [];
				for (let i = 0; i < node.children.length; i++) {
					children.push(this._safeTreeParse(node.children[i]));
				}
				node.children = children as any;
			}
			return this.makeSafe(node);
		}

		private static _buildSafeTree(crm: Array<CRM.Node>): Array<CRM.SafeNode> {
			const treeCopy = JSON.parse(JSON.stringify(crm));
			const safeBranch = [];
			for (let i = 0; i < treeCopy.length; i++) {
				safeBranch.push(this._safeTreeParse(treeCopy[i]));
			}
			return safeBranch;
		}
	}

	class URLParsing {
		static triggerMatchesScheme(trigger: string): boolean {
			const reg =
				/(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
			return reg.test(trigger);
		}
		static prepareTrigger(trigger: string): string {
			if (trigger === '<all_urls>') {
				return trigger;
			}
			if (trigger.replace(/\s/g, '') === '') {
				return null;
			}
			let newTrigger: string;

			const triggerSplit = trigger.split('//');
			if (triggerSplit.length === 1) {
				newTrigger = `http://${trigger}`;
				triggerSplit[1] = triggerSplit[0];
			}
			if (triggerSplit[1].indexOf('/') === -1) {
				newTrigger = `${trigger}/`;
			} else {
				newTrigger = trigger;
			}
			return newTrigger;
		}
		static urlMatchesPattern(pattern: MatchPattern, url: string) {
			let urlPattern: MatchPattern | '<all_urls>';
			try {
				urlPattern = this._parsePattern(url);
			} catch (e) {
				return false;
			}

			if (urlPattern === '<all_urls>') {
				return true;
			}
			const matchPattern = urlPattern as MatchPattern;
			return (this._matchesScheme(pattern.scheme, matchPattern.scheme) &&
				this._matchesHost(pattern.host, matchPattern.host) &&
				this._matchesPath(pattern.path, matchPattern.path));
		}
		static validatePatternUrl(url: string): MatchPattern | void {
			if (!url || typeof url !== 'string') {
				return null;
			}
			url = url.trim();
			const pattern = this._parsePattern(url);
			if (pattern === '<all_urls>') {
				return {
					scheme: '*',
					host: '*',
					path: '*'
				};
			}
			const matchPattern = pattern as MatchPattern;
			if (matchPattern.invalid) {
				return null;
			}
			if (globalObject.globals.constants.validSchemes.indexOf(matchPattern
				.scheme) ===
				-1) {
				return null;
			}

			const wildcardIndex = matchPattern.host.indexOf('*');
			if (wildcardIndex > -1) {
				if (matchPattern.host.split('*').length > 2) {
					return null;
				}
				if (wildcardIndex === 0 && matchPattern.host[1] === '.') {
					if (matchPattern.host.slice(2).split('/').length > 1) {
						return null;
					}
				} else {
					return null;
				}
			}

			return matchPattern;
		}
		static matchesUrlSchemes(matchPatterns: Array<{
			not: boolean;
			url: string;
		}>, url: string) {
			let matches = false;
			for (let i = 0; i < matchPatterns.length; i++) {
				const not = matchPatterns[i].not;
				const matchPattern = matchPatterns[i].url;

				if (matchPattern.indexOf('/') === 0 &&
					Helpers.endsWith(matchPattern, '/')) {
					//It's regular expression
					if (new RegExp(matchPattern.slice(1, matchPattern.length - 1))
						.test(url)) {
						if (not) {
							return false;
						} else {
							matches = true;
						}
					}
				} else {
					if (new RegExp(`^${matchPattern.replace(/\*/g, '(.+)')}$`).test(url)) {
						if (not) {
							return false;
						} else {
							matches = true;
						}
					}
				}
			}
			return matches;
		}

		private static _parsePattern(url: string): MatchPattern | '<all_urls>' {
			if (url === '<all_urls>') {
				return '<all_urls>';
			}

			try {
				const [scheme, hostAndPath] = url.split('://');
				const [host, ...path] = hostAndPath.split('/');

				return {
					scheme: scheme,
					host: host,
					path: path.join('/')
				};
			} catch (e) {
				return {
					scheme: '*',
					host: '*',
					path: '*',
					invalid: true
				};
			}
		}
		private static _matchesScheme(scheme1: string, scheme2: string): boolean {
			if (scheme1 === '*') {
				return true;
			}
			return scheme1 === scheme2;
		}
		private static _matchesHost(host1: string, host2: string): boolean {
			if (host1 === '*') {
				return true;
			}

			if (host1[0] === '*') {
				const host1Split = host1.slice(2);
				const index = host2.indexOf(host1Split);
				return index === host2.length - host1Split.length;
			}

			return (host1 === host2);
		}
		private static _matchesPath(path1: string, path2: string): boolean {
			const path1Split = path1.split('*');
			const path1Length = path1Split.length;
			const wildcards = path1Length - 1;

			if (wildcards === 0) {
				return path1 === path2;
			}

			if (path2.indexOf(path1Split[0]) !== 0) {
				return false;
			}

			path2 = path2.slice(path1Split[0].length);
			for (let i = 1; i < path1Length; i++) {
				if (path2.indexOf(path1Split[i]) === -1) {
					return false;
				}
				path2 = path2.slice(path1Split[i].length);
			}
			return true;
		}
	}

	type FirstTimeCallback = (resolve: (result: any) => void) => void;

	interface PersistentData {
		lineSeperators: Array<{
			start: number;
			end: number;
		}>;
		script: string;
		lines: Array<string>;
	}

	interface ChromePersistentData {
		persistent: {
			passes: number;
			diagnostic: boolean;
			lineSeperators: Array<{
				start: number;
				end: number;
			}>;
			script: string;
			lines: Array<string>;
		};
		parentExpressions: Array<Tern.Expression>;
		functionCall: Array<string>;
		isReturn: boolean;
		isValidReturn: boolean;
		returnExpr: Tern.Expression;
		returnName: string;
		expression: Tern.Expression;
	}

	type UpgradeErrorHandler = (oldScriptErrors: Array<CursorPosition>,
		newScriptErrors: Array<CursorPosition>, parseError: boolean) => void;

	type TransferOnErrorError = {
		from: {
			line: number;
		}
		to: {
			line: number;
		}
	};

	type TransferOnErrorHandler = (position: TransferOnErrorError,
		passes: number) => void;

	class Storages {
		static SetupHandling = class SetupHandling {
			static TransferFromOld = class TransferFromOld {
				static legacyScriptReplace = class LegacyScriptReplace {
					private static localStorageReplace = class LogalStorageReplace {
						private static findLocalStorageExpression(expression: Tern.Expression, data: PersistentData): boolean {
							switch (expression.type) {
								case 'Identifier':
									if (expression.name === 'localStorage') {
										data.script =
											data.script.slice(0, expression.start) +
											'localStorageProxy' +
											data.script.slice(expression.end);
										data.lines = data.script.split('\n');
										return true;
									}
									break;
								case 'VariableDeclaration':
									for (let i = 0; i < expression.declarations.length; i++) {
										//Check if it's an actual chrome assignment
										const declaration = expression.declarations[i];
										if (declaration.init) {
											if (this.findLocalStorageExpression(declaration.init, data)) {
												return true;
											}
										}
									}
									break;
								case 'MemberExpression':
									if (this.findLocalStorageExpression(expression.object, data)) {
										return true;
									}
									return this.findLocalStorageExpression(expression.property as Tern.Identifier, data);
								case 'CallExpression':
									if (expression.arguments && expression.arguments.length > 0) {
										for (let i = 0; i < expression.arguments.length; i++) {
											if (this.findLocalStorageExpression(expression.arguments[i], data)) {
												return true;
											}
										}
									}
									if (expression.callee) {
										return this.findLocalStorageExpression(expression.callee, data);
									}
									break;
								case 'AssignmentExpression':
									return this.findLocalStorageExpression(expression.right, data);
								case 'FunctionExpression':
								case 'FunctionDeclaration':
									for (let i = 0; i < expression.body.body.length; i++) {
										if (this.findLocalStorageExpression(expression.body.body[i], data)) {
											return true;
										}
									}
									break;
								case 'ExpressionStatement':
									return this.findLocalStorageExpression(expression.expression, data);
								case 'SequenceExpression':
									for (let i = 0; i < expression.expressions.length; i++) {
										if (this.findLocalStorageExpression(expression.expressions[i], data)) {
											return true;
										}
									}
									break;
								case 'UnaryExpression':
								case 'ConditionalExpression':
									if (this.findLocalStorageExpression(expression.consequent, data)) {
										return true;
									}
									return this.findLocalStorageExpression(expression.alternate, data);
								case 'IfStatement': ;
									if (this.findLocalStorageExpression(expression.consequent, data)) {
										return true;
									}
									if (expression.alternate) {
										return this.findLocalStorageExpression(expression.alternate, data);
									}
									break;
								case 'LogicalExpression':
								case 'BinaryExpression':
									if (this.findLocalStorageExpression(expression.left, data)) {
										return true;
									}
									return this.findLocalStorageExpression(expression.right, data);
								case 'BlockStatement':
									for (let i = 0; i < expression.body.length; i++) {
										if (this.findLocalStorageExpression(expression.body[i], data)) {
											return true;
										}
									}
									break;
								case 'ReturnStatement':
									return this.findLocalStorageExpression(expression.argument, data);
								case 'ObjectExpressions':
									for (let i = 0; i < expression.properties.length; i++) {
										if (this.findLocalStorageExpression(expression.properties[i].value, data)) {
											return true;
										}
									}
									break;
							}
							return false;
						}
						private static getLineSeperators(lines: Array<string>): Array<{
							start: number;
							end: number;
						}> {
							let index = 0;
							const lineSeperators = [];
							for (let i = 0; i < lines.length; i++) {
								lineSeperators.push({
									start: index,
									end: index += lines[i].length + 1
								});
							}
							return lineSeperators;
						}
						static replaceCalls(lines: Array<string>): string {
							//Analyze the file
							const file = new window.TernFile('[doc]');
							file.text = lines.join('\n');
							const srv = new window.CodeMirror.TernServer({
								defs: [window.ecma5, window.ecma6, window.browserDefs]
							});
							window.tern.withContext(srv.cx, () => {
								file.ast = window.tern.parse(file.text, srv.passes, {
									directSourceFile: file,
									allowReturnOutsideFunction: true,
									allowImportExportEverywhere: true,
									ecmaVersion: srv.ecmaVersion
								});
							});

							const scriptExpressions = file.ast.body;

							let script = file.text;

							//Check all expressions for chrome calls
							const persistentData: PersistentData = {
								lines: lines,
								lineSeperators: this.getLineSeperators(lines),
								script: script
							};

							for (let i = 0; i < scriptExpressions.length; i++) {
								const expression = scriptExpressions[i];
								if (this.findLocalStorageExpression(expression, persistentData)) {
									//Margins may have changed, redo tern stuff
									return this.replaceCalls(persistentData.lines);
								}
							}

							return persistentData.script;
						}
					}
					static chromeCallsReplace = class ChromeCallsReplace {
						private static isProperty(toCheck: string, prop: string): boolean {
							if (toCheck === prop) {
								return true;
							}
							return toCheck.replace(/['|"|`]/g, '') === prop;
						}
						private static getCallLines(lineSeperators: Array<{
							start: number;
							end: number;
						}>, start: number, end: number): {
								from: {
									index: number;
									line: number;
								};
								to: {
									index: number;
									line: number;
								}
							} {
							const line: {
								from: {
									index: number,
									line: number;
								},
								to: {
									index: number,
									line: number;
								};
							} = {} as any;
							for (let i = 0; i < lineSeperators.length; i++) {
								const sep = lineSeperators[i];
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
						}
						private static getFunctionCallExpressions(data: ChromePersistentData): Tern.Expression {
							//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
							let index = data.parentExpressions.length - 1;
							let expr = data.parentExpressions[index];
							while (expr && expr.type !== 'CallExpression') {
								expr = data.parentExpressions[--index];
							}
							return data.parentExpressions[index];
						}
						private static getChromeAPI(expr: Tern.Expression, data: ChromePersistentData): {
							call: string;
							args: string;
						} {
							data.functionCall = data.functionCall.map((prop) => {
								return prop.replace(/['|"|`]/g, '');
							});
							let functionCall = data.functionCall;
							functionCall = functionCall.reverse();
							if (functionCall[0] === 'chrome') {
								functionCall.splice(0, 1);
							}

							const argsStart = expr.callee.end;
							const argsEnd = expr.end;
							const args = data.persistent.script.slice(argsStart, argsEnd);

							return {
								call: functionCall.join('.'),
								args: args
							};
						}
						private static getLineIndexFromTotalIndex(lines: Array<string>, line: number, index:
							number): number {
							for (let i = 0; i < line; i++) {
								index -= lines[i].length + 1;
							}
							return index;
						}
						private static replaceChromeFunction(data: ChromePersistentData, expr: Tern.Expression, callLine:
							{
								from: {
									line: number;
								}
								to: {
									line: number;
								}
							}) {
							if (data.isReturn && !data.isValidReturn) {
								return;
							}

							var lines = data.persistent.lines;

							//Get chrome API
							let i;
							var chromeAPI = this.getChromeAPI(expr, data);
							var firstLine = data.persistent.lines[callLine.from.line];
							var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines,
								callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
									expr.callee.start));
							var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines,
								callLine.from.line, expr.callee.end);

							var newLine = firstLine.slice(0, lineExprStart) +
								`window.crmAPI.chrome('${chromeAPI.call}')`;

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
								newLine += `.return(function(${data.returnName}) {` + lineRest;
								var usesTabs = true;
								var spacesAmount = 0;
								//Find out if the writer uses tabs or spaces
								for (let i = 0; i < data.persistent.lines.length; i++) {
									if (data.persistent.lines[i].indexOf('	') === 0) {
										usesTabs = true;
										break;
									} else if (data.persistent.lines[i].indexOf('  ') === 0) {
										var split = data.persistent.lines[i].split(' ');
										for (var j = 0; j < split.length; j++) {
											if (split[j] === ' ') {
												spacesAmount++;
											} else {
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
								} else {
									indent = [];
									indent[spacesAmount] = ' ';
									indent = indent.join(' ');
								}

								//Only do this for the current scope
								var scopeLength = null;
								var idx = null;
								for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
									if (data.parentExpressions[i].type === 'BlockStatement' ||
										(data.parentExpressions[i].type === 'FunctionExpression' &&
											(data.parentExpressions[i].body as Tern.BlockStatement).type === 'BlockStatement')) {
										scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
										idx = 0;

										//Get the lowest possible scopeLength as to stay on the last line of the scope
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

								//Push in one extra line at the end of the expression
								var prevLine;
								var indentArr = [];
								indentArr[indents] = '';
								var prevLine2 = indentArr.join(indent) + '}).send();';
								var max = data.persistent.lines.length + 1;
								for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
									lines[i] = indent + lines[i];
								}

								//If it's going to add a new line, indent the last line as well
								// if (idx === (lines.length - callLines.from.line) + 1) {
								// 	lines[i] = indent + lines[i];
								// }
								for (i = callLine.from.line + (idx - 1); i < max; i++) {
									prevLine = lines[i];
									lines[i] = prevLine2;
									prevLine2 = prevLine;
								}

							} else {
								lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
								if (i === 1) {
									newLine += '.send();';
								}
							}
							lines[callLine.from.line] = newLine;
							return;
						}
						private static callsChromeFunction(callee: Tern.FunctionCallExpression, data: ChromePersistentData, onError:
							TransferOnErrorHandler): boolean {
							data.parentExpressions.push(callee);

							//Check if the function has any arguments and check those first
							if (callee.arguments && callee.arguments.length > 0) {
								for (let i = 0; i < callee.arguments.length; i++) {
									if (this.findChromeExpression(callee.arguments[i], this
										.removeObjLink(data), onError)) {
										return true;
									}
								}
							}

							if (callee.type !== 'MemberExpression') {
								//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
								return this.findChromeExpression(callee, this.removeObjLink(data),
									onError);
							}

							//Continue checking the call itself
							if (callee.property) {
								data.functionCall = data.functionCall || [];
								data.functionCall.push(callee.property.name || (callee.property as any).raw);
							}
							if (callee.object && callee.object.name) {
								//First object
								const isWindowCall = (this.isProperty(callee.object.name, 'window') &&
									this.isProperty(callee.property.name || (callee.property as any).raw, 'chrome'));
								if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
									data.expression = callee;
									const expr = this.getFunctionCallExpressions(data);
									const callLines = this.getCallLines(data
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
							} else if (callee.object) {
								return this.callsChromeFunction(callee.object as any, data, onError);
							}
							return false;
						}
						private static removeObjLink(data: ChromePersistentData): ChromePersistentData {
							const parentExpressions = data.parentExpressions || [];
							const newObj: ChromePersistentData = {} as any;
							for (let key in data) {
								if (data.hasOwnProperty(key) &&
									key !== 'parentExpressions' &&
									key !== 'persistent') {
									(newObj as any)[key] = (data as any)[key];
								}
							}

							const newParentExpressions = [];
							for (let i = 0; i < parentExpressions.length; i++) {
								newParentExpressions.push(parentExpressions[i]);
							}
							newObj.persistent = data.persistent;
							newObj.parentExpressions = newParentExpressions;
							return newObj;
						}
						private static findChromeExpression(expression: Tern.Expression, data: ChromePersistentData,
							onError: TransferOnErrorHandler): boolean {
							data.parentExpressions = data.parentExpressions || [];
							data.parentExpressions.push(expression);

							switch (expression.type) {
								case 'VariableDeclaration':
									data.isValidReturn = expression.declarations.length === 1;
									for (let i = 0; i < expression.declarations.length; i++) {
										//Check if it's an actual chrome assignment
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
									const argsTocheck: Array<Tern.Expression> = [];
									if (expression.arguments && expression.arguments.length > 0) {
										for (let i = 0; i < expression.arguments.length; i++) {
											if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
												//It's not a direct call to chrome, just handle this later after the function has been checked
												argsTocheck.push(expression.arguments[i]);
											} else {
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
									for (let i = 0; i < argsTocheck.length; i++) {
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
									for (let i = 0; i < expression.body.body.length; i++) {
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
									for (let i = 0; i < expression.expressions.length; i++) {
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
											.removeObjLink(data),
											onError)) {
										return true;
									}
									break;
								case 'LogicalExpression':
								case 'BinaryExpression':
									data.isReturn = true;
									data.isValidReturn = false;
									if (this.findChromeExpression(expression.left, this.removeObjLink(data),
										onError)) {
										return true;
									}
									if (this.findChromeExpression(expression.right, this
										.removeObjLink(data),
										onError)) {
										return true;
									}
									break;
								case 'BlockStatement':
									data.isReturn = false;
									for (let i = 0; i < expression.body.length; i++) {
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
									for (let i = 0; i < expression.properties.length; i++) {
										if (this.findChromeExpression(expression.properties[i].value, this
											.removeObjLink(data), onError)) {
											return true;
										}
									}
									break;
							}
							return false;
						}
						private static generateOnError(container: Array<Array<TransferOnErrorError>>): (
							position: TransferOnErrorError, passes: number
						) => void {
							return (position: TransferOnErrorError, passes: number) => {
								if (!container[passes]) {
									container[passes] = [position];
								} else {
									container[passes].push(position);
								}
							};
						}
						private static replaceChromeCalls(lines: Array<string>, passes: number,
							onError: TransferOnErrorHandler): string {
							//Analyze the file
							var file = new window.TernFile('[doc]');
							file.text = lines.join('\n');
							var srv = new window.CodeMirror.TernServer({
								defs: [window.ecma5, window.ecma6, window.browserDefs]
							});
							window.tern.withContext(srv.cx, () => {
								file.ast = window.tern.parse(file.text, srv.passes, {
									directSourceFile: file,
									allowReturnOutsideFunction: true,
									allowImportExportEverywhere: true,
									ecmaVersion: srv.ecmaVersion
								});
							});

							const scriptExpressions = file.ast.body;

							let index = 0;
							const lineSeperators = [];
							for (let i = 0; i < lines.length; i++) {
								lineSeperators.push({
									start: index,
									end: index += lines[i].length + 1
								});
							}

							let script = file.text;

							//Check all expressions for chrome calls
							const persistentData: {
								lines: Array<any>,
								lineSeperators: Array<any>,
								script: string,
								passes: number,
								diagnostic?: boolean;
							} = {
									lines: lines,
									lineSeperators: lineSeperators,
									script: script,
									passes: passes
								};

							let expression;
							if (passes === 0) {
								//Do one check, not replacing anything, to find any possible errors already
								persistentData.diagnostic = true;
								for (let i = 0; i < scriptExpressions.length; i++) {
									expression = scriptExpressions[i];
									this.findChromeExpression(expression, {
										persistent: persistentData
									} as ChromePersistentData, onError);
								}
								persistentData.diagnostic = false;
							}

							for (let i = 0; i < scriptExpressions.length; i++) {
								expression = scriptExpressions[i];
								if (this.findChromeExpression(expression, {
									persistent: persistentData
								} as ChromePersistentData, onError)) {
									script = this.replaceChromeCalls(persistentData.lines.join('\n')
										.split('\n'), passes + 1, onError);
									break;
								}
							}

							return script;
						}
						private static removePositionDuplicates(arr: Array<TransferOnErrorError>):
							Array<TransferOnErrorError> {
							var jsonArr: Array<string> = [];
							arr.forEach((item, index) => {
								jsonArr[index] = JSON.stringify(item);
							});
							jsonArr = jsonArr.filter((item, pos) => {
								return jsonArr.indexOf(item) === pos;
							});
							return jsonArr.map((item) => {
								return JSON.parse(item);
							});
						}
						static replace(script: string, onError: (
							oldScriptErrors: Array<TransferOnErrorError>,
							newScriptErrors: Array<TransferOnErrorError>,
							parseError?: boolean
						) => void): string {
							//Remove execute locally
							const lineIndex = script.indexOf('/*execute locally*/');
							if (lineIndex !== -1) {
								script = script.replace('/*execute locally*/\n', '');
								if (lineIndex === script.indexOf('/*execute locally*/')) {
									script = script.replace('/*execute locally*/', '');
								}
							}

							const errors: Array<Array<TransferOnErrorError>> = [];
							try {
								script = this.replaceChromeCalls(script.split('\n'), 0,
									this.generateOnError(errors));
							} catch (e) {
								onError(null, null, true);
								return script;
							}

							const firstPassErrors = errors[0];
							const finalPassErrors = errors[errors.length - 1];
							if (finalPassErrors) {
								onError(this.removePositionDuplicates(firstPassErrors),
									this.removePositionDuplicates(finalPassErrors));
							}

							return script;
						}
					}
					static generateScriptUpgradeErrorHandler(id: number): UpgradeErrorHandler {
						return function (oldScriptErrors, newScriptErrors, parseError) {
							chrome.storage.local.get(function (keys: CRM.StorageLocal) {
								if (!keys.upgradeErrors) {
									var val: {
										[key: number]: {
											oldScript: Array<CursorPosition>;
											newScript: Array<CursorPosition>;
											generalError: boolean;
										}
									} = {};
									val[id] = {
										oldScript: oldScriptErrors,
										newScript: newScriptErrors,
										generalError: parseError
									};

									keys.upgradeErrors = val;
									globalObject.globals.storages.storageLocal.upgradeErrors = val;
								}
								keys.upgradeErrors[id] = globalObject.globals.storages.storageLocal.upgradeErrors[id] = {
									oldScript: oldScriptErrors,
									newScript: newScriptErrors,
									generalError: parseError
								};
								chrome.storage.local.set({ upgradeErrors: keys.upgradeErrors });
							});
						};
					};
					static convertScriptFromLegacy(script: string, id: number, method: SCRIPT_CONVERSION_TYPE): string {
						//Remove execute locally
						let usedExecuteLocally = false;
						const lineIndex = script.indexOf('/*execute locally*/');
						if (lineIndex !== -1) {
							script = script.replace('/*execute locally*/\n', '');
							if (lineIndex === script.indexOf('/*execute locally*/')) {
								script = script.replace('/*execute locally*/', '');
							}
							usedExecuteLocally = true;
						}

						try {
							switch (method) {
								case SCRIPT_CONVERSION_TYPE.CHROME:
									script = this.chromeCallsReplace.replace(script,
										this.generateScriptUpgradeErrorHandler(id));
									break;
								case SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE:
									script = usedExecuteLocally ?
										this.localStorageReplace.replaceCalls(script.split('\n')) : script;
									break;
								case SCRIPT_CONVERSION_TYPE.BOTH:
									const localStorageConverted = usedExecuteLocally ?
										this.localStorageReplace.replaceCalls(script.split('\n')) : script;
									script = this.chromeCallsReplace.replace(localStorageConverted,
										this.generateScriptUpgradeErrorHandler(id)
									);
									break;
							}
						} catch (e) {
							return script;
						}

						return script;
					}
				};


				private static _backupLocalStorage() {
					if (typeof localStorage === 'undefined' ||
						(typeof window.indexedDB === 'undefined' && typeof (window as any).webkitIndexedDB === 'undefined')) {
						return;
					}

					const data = JSON.stringify(localStorage);
					const idb: IDBFactory = window.indexedDB || (window as any).webkitIndexedDB;
					const req = idb.open('localStorageBackup', 1);
					req.onerror = () => { console.log('Error backing up localStorage data'); };
					req.onupgradeneeded = (event) => {
						const db: IDBDatabase = (event.target as any).result;
						const objectStore = db.createObjectStore('data', {
							keyPath: 'id'
						});
						objectStore.add({
							id: 0,
							data: data
						});
					}
				}

				static transferCRMFromOld(openInNewTab: boolean, storageSource: {
					getItem(index: string | number): any;
				} = localStorage, method: SCRIPT_CONVERSION_TYPE = SCRIPT_CONVERSION_TYPE.BOTH): CRM.Tree {
					this._backupLocalStorage();

					const amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

					const nodes: CRM.Tree = [];
					for (let i = 1; i < amount; i++) {
						nodes.push(this._parseOldCRMNode(storageSource.getItem(String(i)),
							openInNewTab, method));
					}

					//Structure nodes with children etc
					const crm: Array<CRM.Node> = [];
					this._assignParents(crm, nodes, {
						index: 0
					}, nodes.length);
					return crm;
				}

				private static _parseOldCRMNode(string: string,
					openInNewTab: boolean, method: SCRIPT_CONVERSION_TYPE): CRM.Node {
					let node: CRM.Node;
					const [name, type, nodeData] = string.split('%123');
					switch (type.toLowerCase()) {
						//Stylesheets don't exist yet so don't implement those
						case 'link':
							let split;
							if (nodeData.indexOf(', ') > -1) {
								split = nodeData.split(', ');
							} else {
								split = nodeData.split(',');
							}
							node = globalObject.globals.constants.templates.getDefaultLinkNode({
								name: name,
								id: Helpers.generateItemId(),
								value: split.map(function (url) {
									return {
										newTab: openInNewTab,
										url: url
									};
								})
							});
							break;
						case 'divider':
							node = globalObject.globals.constants.templates.getDefaultDividerNode({
								name: name,
								id: Helpers.generateItemId(),
								isLocal: true
							});
							break;
						case 'menu':
							node = globalObject.globals.constants.templates.getDefaultMenuNode({
								name: name,
								id: Helpers.generateItemId(),
								children: (nodeData as any) as CRM.Tree,
								isLocal: true
							});
							break;
						case 'script':
							let [scriptLaunchMode, scriptData] = nodeData.split('%124');
							let triggers;
							const launchModeString = scriptLaunchMode + '';
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
							const id = Helpers.generateItemId();
							node = globalObject.globals.constants.templates.getDefaultScriptNode({
								name: name,
								id: id,
								value: {
									launchMode: parseInt(scriptLaunchMode, 10),
									updateNotice: true,
									oldScript: scriptData,
									script: Storages.SetupHandling.TransferFromOld.legacyScriptReplace
										.convertScriptFromLegacy(scriptData, id, method)
								} as CRM.ScriptVal,
								isLocal: true
							});
							if (triggers) {
								node.triggers = triggers;
							}
							break;
					}

					return node;
				}
				private static _assignParents(parent: CRM.Tree,
					nodes: Array<CRM.Node>, index: {
						index: number;
					}, amount: number) {
					for (; amount !== 0 && nodes[index.index]; index.index++ , amount--) {
						const currentNode = nodes[index.index];
						if (currentNode.type === 'menu') {
							const childrenAmount = ~~currentNode.children;
							currentNode.children = [];
							index.index++;
							this._assignParents(currentNode.children, nodes, index, childrenAmount);
							index.index--;
						}
						parent.push(currentNode);
					}
				}
			};

			//Local storage
			static _getDefaultStorages(callback: (result: [CRM.StorageLocal, CRM.SettingsStorage]) => void) {
				const syncStorage = this._getDefaultSyncStorage();
				const syncHash = window.md5(JSON.stringify(syncStorage));

				Helpers.isTamperMonkeyEnabled((useAsUserscriptManager) => {
					callback([{
						requestPermissions: [],
						editing: null,
						selectedCrmType: 0,
						jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
						globalExcludes: [''],
						useStorageSync: true,
						notFirstTime: true,
						lastUpdatedAt: chrome.runtime.getManifest().version,
						authorName: 'anonymous',
						showOptions: true,
						recoverUnsavedData: false,
						CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
							.split('.')[0] > 34,
						catchErrors: true,
						editCRMInRM: false,
						useAsUserscriptInstaller: useAsUserscriptManager,
						hideToolsRibbon: false,
						shrinkTitleRibbon: false,
						libraries: [],
						settingsVersionData: {
							current: {
								hash: syncHash,
								date: new Date().getTime()
							},
							latest: {
								hash: syncHash,
								date: new Date().getTime()
							},
							wasUpdated: false
						}
					}, syncStorage]);
				});
			}
			//Sync storage
			static _getDefaultSyncStorage(): CRM.SettingsStorage {
				return {
					editor: {
						keyBindings: {
							autocomplete: 'Ctrl-Space',
							showType: 'Ctrl-I',
							showDocs: 'Ctrl-O',
							goToDef: 'Alt-.',
							rename: 'Ctrl-Q',
							jumpBack: 'Alt-,',
							selectName: 'Ctrl-.'
						},
						tabSize: 4,
						theme: 'dark',
						useTabs: true,
						zoom: '100'
					},
					crm: [
						globalObject.globals.constants.templates.getDefaultLinkNode({
							id: Helpers.generateItemId(),
							isLocal: true
						})
					],
					settingsLastUpdatedAt: new Date().getTime(),
					latestId: globalObject.globals.latestId
				};
			}

			static handleFirstRun(crm?: Array<CRM.Node>): {
				done: boolean;
				onDone?: (result: {
					settingsStorage: CRM.SettingsStorage;
					storageLocalCopy: CRM.StorageLocal;
					chromeStorageLocal: CRM.StorageLocal;
				}) => void;
				value?: {
					settingsStorage: CRM.SettingsStorage;
					storageLocalCopy: CRM.StorageLocal;
					chromeStorageLocal: CRM.StorageLocal;
				}
			} {
				window.localStorage.setItem('transferToVersion2', 'true');

				const returnObj: {
					done: boolean;
					onDone?: (result: {
						settingsStorage: CRM.SettingsStorage;
						storageLocalCopy: CRM.StorageLocal;
						chromeStorageLocal: CRM.StorageLocal;
					}) => void;
					value?: {
						settingsStorage: CRM.SettingsStorage;
						storageLocalCopy: CRM.StorageLocal;
						chromeStorageLocal: CRM.StorageLocal;
					}
				} = {
					done: false,
					onDone: null
				}

				this._getDefaultStorages(([defaultLocalStorage, defaultSyncStorage]) => {

					//Save local storage
					chrome.storage.local.set(defaultLocalStorage);

					//Save sync storage
					this._uploadStorageSyncData(defaultSyncStorage);

					if (crm) {
						defaultSyncStorage.crm = crm;
					}

					const storageLocal = defaultLocalStorage;
					const storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));

					const result = {
						settingsStorage: defaultSyncStorage,
						storageLocalCopy: storageLocalCopy,
						chromeStorageLocal: storageLocal
					};

					returnObj.value = result;
					if (returnObj.onDone) {
						returnObj.onDone(result);
						returnObj.done = true;
					} else {
						returnObj.done = true;
					}
				});

				return returnObj;
			}
			static handleTransfer(): (resolve: (data: {
				settingsStorage: CRM.SettingsStorage;
				storageLocalCopy: CRM.StorageLocal;
				chromeStorageLocal: CRM.StorageLocal;
			}) => void) => void {
				window.localStorage.setItem('transferToVersion2', 'true');

				chrome.storage.local.set({
					isTransfer: true
				});

				return ((resolve) => {
					if (!window.CodeMirror.TernServer) {
						//Wait until TernServer is loaded
						window.setTimeout(() => {
							this.handleTransfer()((data) => {
								resolve(data);
							});
						}, 200);
					} else {
						const result = this.handleFirstRun(
							this.TransferFromOld.transferCRMFromOld(window.localStorage.getItem('whatpage') === 'true'));

						if (result.done) {
							resolve(result.value);
						} else {
							result.onDone = resolve;
						}
					}
				});
			}

			private static _uploadStorageSyncData(data: CRM.SettingsStorage) {
				const settingsJson = JSON.stringify(data);

				//Using chrome.storage.sync
				if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
					chrome.storage.local.set({
						useStorageSync: false
					}, () => {
						this._uploadStorageSyncData(data);
					});
				} else {
					//Cut up all data into smaller JSON
					const obj = Storages.cutData(settingsJson);
					chrome.storage.sync.set(obj, () => {
						if (chrome.runtime.lastError) {
							//Switch to local storage
							console.log('Error on uploading to chrome.storage.sync ',
								chrome.runtime.lastError);
							chrome.storage.local.set({
								useStorageSync: false
							}, () => {
								this._uploadStorageSyncData(data);
							});
						} else {
							chrome.storage.local.set({
								settings: null
							});
						}
					});
				}
			}
		};

		static checkBackgroundPagesForChange(changes: Array<{
			key: string;
			newValue: any;
			oldValue: any;
		}>, toUpdate: Array<number> = []) {
			toUpdate.forEach((id) => {
				CRM.Script.Background.createBackgroundPage(globalObject.globals.crm.crmById[id] as CRM.ScriptNode);
			});

			//Check if any background page updates occurred
			for (let i = 0; i < changes.length; i++) {
				if (changes[i].key === 'crm') {
					const ordered: {
						[nodeId: number]: string;
					} = {};
					this._orderBackgroundPagesById(changes[i].newValue, ordered);
					for (let id in ordered) {
						if (ordered.hasOwnProperty(id)) {
							const node = globalObject.globals.crm.crmById[id];
							if (node.type === 'script' && (!node || node.value.script !== ordered[id])) {
								CRM.Script.Background.createBackgroundPage(node as CRM.ScriptNode);
							}
						}
					}
				}
			}
		}
		static uploadChanges(type: 'local' | 'settings' | 'libraries', changes:
			Array<StorageChange>,
			useStorageSync: boolean = null) {
			switch (type) {
				case 'local':
					chrome.storage.local.set(globalObject.globals.storages.storageLocal);
					for (let i = 0; i < changes.length; i++) {
						if (changes[i].key === 'useStorageSync') {
							this.uploadChanges('settings', [], changes[i].newValue);
						}
					}
					break;
				case 'settings':
					if (type === 'settings') {
						globalObject.globals.storages.settingsStorage.settingsLastUpdatedAt = new Date().getTime();
					}
					if (useStorageSync !== null) {
						globalObject.globals.storages.storageLocal
							.useStorageSync = useStorageSync;
					}

					const settingsJson = JSON.stringify(globalObject.globals.storages
						.settingsStorage);
					chrome.storage.local.set({
						settingsVersionData: {
							current: {
								hash: window.md5(settingsJson),
								date: new Date().getTime()
							},
							latest: globalObject.globals.storages.storageLocal.settingsVersionData.latest,
							wasUpdated: globalObject.globals.storages.storageLocal.settingsVersionData.wasUpdated
						}
					});
					if (!globalObject.globals.storages.storageLocal.useStorageSync) {
						chrome.storage.local.set({
							settings: globalObject.globals.storages.settingsStorage
						}, () => {
							if (chrome.runtime.lastError) {
								console.log('Error on uploading to chrome.storage.local ',
									chrome.runtime.lastError);
							} else {
								this._changeCRMValuesIfSettingsChanged(changes);
							}
						});
						chrome.storage.sync.set({
							indexes: null
						});
					} else {
						//Using chrome.storage.sync
						if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
							chrome.storage.local.set({
								useStorageSync: false
							}, () => {
								this.uploadChanges('settings', changes);
							});
						} else {
							//Cut up all data into smaller JSON
							const obj = this.cutData(settingsJson);
							chrome.storage.sync.set(obj, () => {
								if (chrome.runtime.lastError) {
									//Switch to local storage
									console.log('Error on uploading to chrome.storage.sync ',
										chrome.runtime.lastError);
									chrome.storage.local.set({
										useStorageSync: false
									}, () => {
										this.uploadChanges('settings', changes);
									});
								} else {
									this._changeCRMValuesIfSettingsChanged(changes);
									chrome.storage.local.set({
										settings: null
									});
								}
							});
						}
					}
					break;
				case 'libraries':
					chrome.storage.local.set({
						libraries: changes
					});
					break;
			}
		}
		static applyChanges(data: {
			type: 'optionsPage' | 'libraries' | 'nodeStorage';
			localChanges?: Array<StorageChange>;
			settingsChanges?: Array<StorageChange>;
			libraries?: Array<{
				name: string;
				code: string;
				url: string;
			}>;
			nodeStorageChanges?: Array<StorageChange>;
			id?: number;
			tabId?: number;
		}) {
			switch (data.type) {
				case 'optionsPage':
					if (data.localChanges) {
						this._applyChangeForStorageType(globalObject.globals.storages.storageLocal,
							data
								.localChanges);
						this.uploadChanges('local', data.localChanges);
					}
					if (data.settingsChanges) {
						this._applyChangeForStorageType(globalObject.globals.storages.settingsStorage,
							data.settingsChanges);
						this.uploadChanges('settings', data.settingsChanges);
					}
					break;
				case 'libraries':
					this._applyChangeForStorageType(globalObject.globals.storages.storageLocal, [
						{
							key: 'libraries',
							newValue: data.libraries,
							oldValue: globalObject.globals.storages.storageLocal.libraries
						}
					]);
					break;
				case 'nodeStorage':
					globalObject.globals.storages.nodeStorage[data
						.id] = globalObject.globals.storages.nodeStorage[data.id] || {};
					this._applyChangeForStorageType(globalObject.globals.storages.nodeStorage[data
						.id], data.nodeStorageChanges);
					this._notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
					break;
			}
		}
		static setStorages(storageLocalCopy: CRM.StorageLocal, settingsStorage: CRM.SettingsStorage,
			chromeStorageLocal: CRM.StorageLocal, callback?: () => void) {
			globalObject.globals.storages.storageLocal = storageLocalCopy;
			globalObject.globals.storages.settingsStorage = settingsStorage;

			globalObject.globals.storages
				.globalExcludes = this._setIfNotSet(chromeStorageLocal,
					'globalExcludes', [] as Array<string>).map(URLParsing.validatePatternUrl)
					.filter((pattern) => {
						return pattern !== null;
					}) as Array<MatchPattern>;
			globalObject.globals.storages.resources = this._setIfNotSet(chromeStorageLocal,
				'resources', []);
			globalObject.globals.storages.nodeStorage = this._setIfNotSet(chromeStorageLocal,
				'nodeStorage', {} as {
					[nodeId: number]: any;
				});
			globalObject.globals.storages.resourceKeys = this._setIfNotSet(chromeStorageLocal,
				'resourceKeys', []);
			globalObject.globals.storages.urlDataPairs = this._setIfNotSet(chromeStorageLocal,
				'urlDataPairs', {} as {
					[key: string]: {
						dataString: string;
						refs: Array<number>;
						dataURI: string;
					}
				});

			CRM.updateCRMValues();

			if (callback) {
				callback();
			}
		}
		static cutData(data: any): {
			indexes: Array<number>;
			[key: number]: string;
		} {
			const obj = {} as any;
			const indexes: Array<string> = [];
			const splitJson = data.match(/[\s\S]{1,5000}/g);
			splitJson.forEach((section: String) => {
				const arrLength = indexes.length;
				const sectionKey = `section${arrLength}`;
				obj[sectionKey] = section;
				indexes[arrLength] = sectionKey;
			});
			obj.indexes = indexes;
			return obj;
		}
		static loadStorages(callback: () => void) {
			chrome.storage.sync.get((chromeStorageSync: {
				[key: string]: string
			} & {
					indexes: Array<string>;
				}) => {
				chrome.storage.local.get((chromeStorageLocal: CRM.StorageLocal & {
					settings?: CRM.SettingsStorage;
				}) => {
					const result = this._isFirstTime(chromeStorageLocal);
					if (result.type === 'firstTimeCallback') {
						result.fn((data) => {
							this.setStorages(data.storageLocalCopy, data.settingsStorage,
								data.chromeStorageLocal, callback);
						});
					} else {
						const storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
						delete storageLocalCopy.resources;
						delete storageLocalCopy.nodeStorage;
						delete storageLocalCopy.urlDataPairs;
						delete storageLocalCopy.resourceKeys;
						delete storageLocalCopy.globalExcludes;

						let settingsStorage;
						if (chromeStorageLocal['useStorageSync']) {
							//Parse the data before sending it to the callback
							const indexes = chromeStorageSync['indexes'];
							if (!indexes) {
								chrome.storage.local.set({
									useStorageSync: false
								});
								settingsStorage = chromeStorageLocal.settings;
							} else {
								const settingsJsonArray: Array<string> = [];
								indexes.forEach((index) => {
									settingsJsonArray.push(chromeStorageSync[index]);
								});
								const jsonString = settingsJsonArray.join('');
								settingsStorage = JSON.parse(jsonString);
							}
						} else {
							//Send the "settings" object on the storage.local to the callback
							if (!chromeStorageLocal['settings']) {
								chrome.storage.local.set({
									useStorageSync: true
								});
								const indexes = chromeStorageSync['indexes'];
								const settingsJsonArray: Array<string> = [];
								indexes.forEach((index) => {
									settingsJsonArray.push(chromeStorageSync[index]);
								});
								const jsonString = settingsJsonArray.join('');
								settingsStorage = JSON.parse(jsonString);
							} else {
								delete storageLocalCopy.settings;
								settingsStorage = chromeStorageLocal['settings'];
							}
						}

						this._checkForStorageSyncUpdates(settingsStorage, chromeStorageLocal);

						this.setStorages(storageLocalCopy, settingsStorage,
							chromeStorageLocal,
							callback);

						if (result.type === 'upgradeVersion') {
							result.fn();
						}
					}
				});
			});
		}

		private static _changeCRMValuesIfSettingsChanged(changes: Array<StorageChange>) {
			for (let i = 0; i < changes.length; i++) {
				if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
					CRM.updateCRMValues();
					Storages.checkBackgroundPagesForChange(changes);
					CRM.buildPageCRM();
					MessageHandling.signalNewCRM();
				} else if (changes[i].key === 'latestId') {
					globalObject.globals.latestId = changes[i].newValue;
					chrome.runtime.sendMessage({
						type: 'idUpdate',
						latestId: changes[i].newValue
					});
				}
			}
		}
		private static _setIfNotSet<T>(obj: any, key: string, defaultValue: T): T {
			if (obj[key]) {
				return obj[key];
			}
			chrome.storage.local.set({
				key: defaultValue
			});
			return defaultValue;
		}
		private static _applyChangeForStorageType(storageObj: {
			[key: string]: any;
			[key: number]: any;
		}, changes: Array<StorageChange>) {
			for (let i = 0; i < changes.length; i++) {
				storageObj[changes[i].key] = changes[i].newValue;
			}
		}
		private static _notifyNodeStorageChanges(id: number, tabId: number,
			changes: Array<StorageChange>) {
			//Update in storage
			globalObject.globals.crm.crmById[id].storage = globalObject.globals.storages
				.nodeStorage[id];
			chrome.storage.local.set({
				nodeStorage: globalObject.globals.storages.nodeStorage
			});

			//Notify all pages running that node
			const tabData = globalObject.globals.crmValues.tabData;
			for (let tab in tabData) {
				if (tabData.hasOwnProperty(tab) && tabData[tab]) {
					if (~~tab !== tabId) {
						const nodes = tabData[tab].nodes;
						if (nodes[id]) {
							nodes[id].forEach((tabIndexInstance) => {
								tabIndexInstance.port.postMessage({
									changes: changes,
									messageType: 'storageUpdate'
								});
							});
						}
					}
				}
			}
		}
		private static _orderBackgroundPagesById(tree: Array<CRM.Node>, obj: {
			[nodeId: number]: string;
		}) {
			for (let i = 0; i < tree.length; i++) {
				const child = tree[i];
				if (child.type === 'script') {
					obj[child.id] = child.value.backgroundScript;
				} else if (child.type === 'menu' && child.children) {
					this._orderBackgroundPagesById(child.children, obj);
				}
			}
		}
		static crmForEach(crm: CRM.Tree, fn: (node: CRM.Node) => void) {
			for (let i = 0; i < crm.length; i++) {
				const node = crm[i];
				fn(node);
				if (node.type === 'menu' && node.children) {
					this.crmForEach(node.children, fn);
				}
			}
		}
		private static _upgradeVersion(oldVersion: string, newVersion: string): {
			before: Array<() => void>;
			after: Array<() => void>;
		} {
			const fns: {
				before: Array<() => void>;
				after: Array<() => void>;
			} = {
					before: [],
					after: []
				}

			if (oldVersion === '2.0.3') {
				fns.after.push(() => {
					this.crmForEach(globalObject.globals.crm.crmTree, (node) => {
						if (node.type === 'script') {
							node.value.oldScript = node.value.script;
							node.value.script = this.SetupHandling.TransferFromOld
								.legacyScriptReplace
								.chromeCallsReplace
								.replace(node.value.script, this.SetupHandling.TransferFromOld
									.legacyScriptReplace.generateScriptUpgradeErrorHandler(node.id));
						}
						if (node.isLocal) {
							node.nodeInfo.installDate = new Date().toLocaleDateString();
							node.nodeInfo.lastUpdatedAt = Date.now();
							node.nodeInfo.version = '1.0';
							node.nodeInfo.isRoot = false;
							node.nodeInfo.source = 'local';

							if (node.onContentTypes[0] && node.onContentTypes[1] && node.onContentTypes[2] &&
								!node.onContentTypes[3] && !node.onContentTypes[4] && !node.onContentTypes[5]) {
								node.onContentTypes = [true, true, true, true, true, true];
							}
						}
					});
					CRM.updateCrm();
				});
			}
			if (newVersion === '2.0.11') {
				Helpers.isTamperMonkeyEnabled((isEnabled) => {
					globalObject.globals.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
					chrome.storage.local.set({
						useAsUserscriptInstaller: !isEnabled
					});
				});
			}

			chrome.storage.local.set({
				lastUpdatedAt: newVersion
			});

			return fns;
		}
		private static _isFirstTime(storageLocal: CRM.StorageLocal): {
			type: 'firstTimeCallback';
			fn: FirstTimeCallback;
		} | {
				type: 'upgradeVersion';
				fn: () => void;
			} | {
				type: 'noChanges';
			} {
			const currentVersion = chrome.runtime.getManifest().version;
			if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt === currentVersion) {
				return {
					type: 'noChanges'
				}
			} else {
				if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt) {
					const fns = this._upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
					fns.before.forEach((fn) => {
						fn();
					});
					return {
						type: 'upgradeVersion',
						fn: () => {
							fns.after.forEach((fn) => {
								fn();
							});
						}
					}
				}
				//Determine if it's a transfer from CRM version 1.*
				if (!window.localStorage.getItem('transferToVersion2') &&
					window.localStorage.getItem('numberofrows') !== undefined &&
					window.localStorage.getItem('numberofrows') !== null) {
					return {
						type: 'firstTimeCallback',
						fn: this.SetupHandling.handleTransfer()
					}
				} else {
					const firstRunPromise = this.SetupHandling.handleFirstRun();
					return {
						type: 'firstTimeCallback',
						fn: (resolve) => {
							if (firstRunPromise.done) {
								resolve(firstRunPromise.value);
							} else {
								firstRunPromise.onDone = resolve;
							}
						}
					}
				}
			}
		}
		private static _checkForStorageSyncUpdates(storageSync: CRM.SettingsStorage, storageLocal: CRM.StorageLocal) {
			const syncString = JSON.stringify(storageSync);
			const hash = window.md5(syncString);

			if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.current.hash !== hash) {
				//Data changed, show a message and update current hash
				chrome.storage.local.set({
					settingsVersionData: {
						current: {
							hash: hash,
							date: storageSync.settingsLastUpdatedAt
						},
						latest: {
							hash: hash,
							date: storageSync.settingsLastUpdatedAt
						},
						wasUpdated: true
					}
				});
			}
		}
	}

	(() => {
		Storages.loadStorages(() => {
			try {
				globalObject.globals.latestId = globalObject.globals.storages.settingsStorage.latestId;
				GlobalDeclarations.refreshPermissions();
				GlobalDeclarations.setHandlerFunction();
				chrome.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				chrome.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessage);
				CRM.buildPageCRM();
				CRM.Script.Background.createBackgroundPages();
				GlobalDeclarations.init();

				//Checks if all values are still correct
				Resources.checkIfResourcesAreUsed();
				Resources.updateResourceValues();
				CRM.Script.Updating.updateScripts();
				window.setInterval(() => {
					CRM.Script.Updating.updateScripts();
				}, 6 * 60 * 60 * 1000);

				GlobalDeclarations.initGlobalFunctions();

				if (location.href.indexOf('test') > -1) {
					globalObject.Storages = Storages;
				}
				if (typeof module !== 'undefined') {
					globalObject.TransferFromOld =
						Storages.SetupHandling.TransferFromOld;
				}
			} catch (e) {
				console.log(e);
				throw e;
			}
		});
	})();
})(
	//Gets the extension's URL through a blocking instead of a callback function
	typeof module !== 'undefined' || window.isDev ? window : {},
	((sandboxes: {
		sandbox: (id: number, script: string, libraries: Array<string>,
			secretKey: Array<number>, getInstances: () => Array<{
				id: string;
				tabIndex: number;
			}>,
			callback: (worker: any) => void) => void;
		sandboxChrome?: any;
	}) => {
		function sandboxChromeFunction(window: void, sandboxes: void, chrome: void, fn: Function, context: any, args: Array<any>) {
			return fn.apply(context, args);
		}

		sandboxes.sandboxChrome = (api: string, args: Array<any>) => {
			let context = {};
			let fn = window.chrome;
			const apiSplit = api.split('.');
			for (let i = 0; i < apiSplit.length; i++) {
				context = fn;
				fn = (fn as any)[apiSplit[i]];
			}
			return sandboxChromeFunction(null, null, null, (fn as any) as Function, context, args);
		};

		return sandboxes as {
			sandbox: (id: number, script: string, libraries: Array<string>,
				secretKey: Array<number>, getInstances: () => Array<{
					id: string;
					tabIndex: number;
				}>,
				callback: (worker: any) => void) => void;
			sandboxChrome: (api: string, args: Array<any>) => any;
		};
	})((() => {
		const sandboxes: {
			sandbox: (id: number, script: string, libraries: Array<string>,
				secretKey: Array<number>, getInstances: () => Array<{
					id: string;
					tabIndex: number;
				}>,
				callback: (worker: SandboxWorker) => void) => void;
			sandboxChrome?: any;
		} = {} as any;

		class SandboxWorker {
			worker: Worker;
			_callbacks: Array<Function> = [];
			_verified: boolean = false;

			constructor(public id: number, public script: string, libraries: Array<string>,
				public secretKey: Array<number>, getInstances: () => Array<{
					id: string;
					tabIndex: number;
				}>) {

				this.worker = new Worker('/js/sandbox.js');

				const handler = window.createHandlerFunction({
					postMessage: this._postMessage.bind(this)
				});

				this.worker.addEventListener('message', (e) => {
					const data = e.data;
					switch (data.type) {
						case 'handshake':
						case 'crmapi':
							if (!this._verified) {
								window.backgroundPageLog(id, null,
									'Ininitialized background page');

								this.worker.postMessage({
									type: 'verify',
									instances: getInstances()
								});
								this._verified = true;
							}
							this._verifyKey(data, handler);
							break;
						case 'log':
							window.backgroundPageLog.apply(window,
								[id, [data.lineNo, data.logId]].concat(JSON
									.parse(data.data)));
							break;
					}
					if (this._callbacks) {
						this._callbacks.forEach(callback => {
							callback(data);
						});
						this._callbacks = [];
					}
				}, false);

				this.worker.postMessage({
					type: 'init',
					id: id,
					script: script,
					libraries: libraries
				});
			}

			post(message: any) {
				this.worker.postMessage(message);
			};

			listen(callback: Function) {
				this._callbacks.push(callback);
			};

			_postMessage(message: any) {
				this.worker.postMessage({
					type: 'message',
					message: JSON.stringify(message),
					key: this.secretKey.join('') + this.id + 'verified'
				});
			};

			_verifyKey(message: {
				key: Array<string>;
				data: string;
			}, callback: (data: any, port?: any) => void) {
				if (message.key.join('') === this.secretKey.join('')) {
					callback(JSON.parse(message.data));
				} else {
					window.backgroundPageLog(this.id, null,
						'Tried to send an unauthenticated message');
				}
			}
		}

		sandboxes.sandbox = (id: number, script: string, libraries: Array<string>,
			secretKey: Array<number>, getInstances: () => Array<{
				id: string;
				tabIndex: number;
			}>,
			callback: (worker: SandboxWorker) => void) => {
			callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
		};

		return sandboxes;
	})())
	);

if (typeof module === 'undefined') {
	console.log('If you\'re here to check out your background script,' +
		' get its ID (you can type getID("name") to find the ID),' +
		' and type filter(id, [optional tabId]) to show only those messages.' +
		' You can also visit the logging page for even better logging over at ',
		chrome.runtime.getURL('html/logging.html'));
}