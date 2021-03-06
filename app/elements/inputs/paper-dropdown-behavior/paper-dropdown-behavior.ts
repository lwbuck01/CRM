﻿/// <reference path="../../elements.d.ts" />

const paperDropdownBehaviorProperties: {
	selected: number|Array<number>;
	raised: boolean;
} = {
	/**
	 * The selected item
	 */
	selected: {
		type: Number,
		value: 0,
		notify: true,
		reflectToAttribute: true
	},
	raised: {
		type: Boolean,
		value: false
	}
} as any;

type PaperDropdownListener = (prevState: number, newState: number) => void;

class PDB {
	static properties = paperDropdownBehaviorProperties;

	/**
	 * The start time for the current animation
	 */
	static _startTime: number = null;

	/**
     * The paper dropdown menu element
     */
	static _paperDropdownEl: PaperDropdownMenu = null;

	/**
     * The paper menu element
     */
	static _paperMenu: HTMLPaperMenuElement = null;

	/**
     * The dropdown selected container
     */
	static _dropdownSelectedCont: HTMLElement = null;

	/**
	 * The listeners for this element
	 */
	static _listeners: Array<{
		listener: PaperDropdownListener;
		id: string;
		thisArg: any;
	}> = [];

	/**
	 * Whether the menu is expanded
	 */
	static _expanded: boolean = false;

	/**
	 * Whether the menu should have an indent from the left part of the screen
	 */
	static indent: boolean = true;

	/**
	 * Whether the menu is disabled
	 */
	static disabled: boolean = false;

	/**
	 * A function that is called whenever the dialog opens
	 */
	static onopen: () => void;

	static overflowing: boolean;

	/**
	 * Adds a listener that fires when a new value is selected
	 */
	static _addListener(this: PaperDropdownInstance, listener: PaperDropdownListener,
			id: string, thisArg: any) {
		let found = false;
		for (let i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].listener === listener && this._listeners[i].id === id) {
				found = true;
			}
		}
		if (!found) {
			this._listeners.push({
				id: id,
				listener: listener,
				thisArg: thisArg
			});
		}
	};

	/**
	 * Fires all added listeners, triggers when a new value is selected
	 */
	static _fireListeners(this: PaperDropdownInstance) {
		const prevState = this.selected;
		this.selected = this._paperMenu.selected;
		this._listeners.forEach((listener) => {
			if (listener.id === this.id) {
				listener.listener.apply(listener.thisArg, [prevState, this._paperMenu.selected]);
			}
		});
		if (this.onchange) {
			(this.onchange as any)(prevState, this._paperMenu.selected);
		}
	};

	static refreshListeners(this: PaperDropdownInstance) {
		const _this = this;
		$(this).find('paper-item').off('click').on('click', function () {
			setTimeout(function () {
				_this._fireListeners();
				if ((_this as any)._dropdownSelectChange) {
					(_this as any)._dropdownSelectChange(_this);
				}
			}, 50);
		});
	};

	static ready(this: PaperDropdownMenu) {
		const _this = this;
		this.refreshListeners();
		this._paperDropdownEl = this;
		this._paperMenu = $(this).find('paper-menu')[0] as HTMLPaperMenuElement;
		setTimeout(function () {
			$(_this.$.dropdownSelectedCont).insertBefore($(_this).find('.content'));
		}, 200);
		this._dropdownSelectedCont = $(this).find('#dropdownSelectedCont')[0];
		if (this.getAttribute('indent') === 'false') {
			this.indent = false;
		}
		if (this.raised) {
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
		}
	};

	/**
	 * Animates the box-shadow in on clicking the main blue text
	 */
	static _animateBoxShadowIn(timestamp: number, _this: PaperDropdownInstance) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			const scale = ((timestamp - _this._startTime) / 100);
			let doubleScale = scale * 2;
			_this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = '15px';
			}
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
		}
	};

	/**
	 * Animates the box-shadow out on clicking the main blue text again
	 */
	static _animateBoxShadowOut(timestamp: number, _this: PaperDropdownInstance) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			const scale = 1 - (((timestamp - _this._startTime) / 100));
			let doubleScale = scale * 2;
			_this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function (time) {
				_this._animateBoxShadowOut(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = '0';
			}
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
			_this._paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
		}
	};

	/**
	 * Open the dropdown menu
	*/
	static open(this: PaperDropdownInstance) {
		if (this.onopen) {
			this.onopen();
		}

		const _this = this;
		if (!this._expanded) {
			this._expanded = true;
			if (!this.raised) {
				window.requestAnimationFrame(function(time) {
					_this._animateBoxShadowIn(time, _this);
				});
			}
			setTimeout(function() {
				const content = $(_this._paperMenu).find('.content');
				content.css('display', 'block');
				const animation: {
					[key: string]: any
				} = {
					height: content[0].scrollHeight
				};
				if (_this.overflowing !== undefined) {
					animation['marginBottom'] = -(content[0].scrollHeight + 14);
				}
				content.stop().animate(animation, {
					easing: 'easeOutCubic',
					duration: 300,
					complete() {
						_this.$.dropdownArrow.style.transform = 'rotate(270deg)';
					}
				});
			}, 100);
		}
	};

	/**
	 * Close the dropdown menu
	 */
	static close(this: PaperDropdownInstance) {
		const _this = this;
		if (this._expanded) {
			this._expanded = false;
			const animation: {
				[key: string]: any;
			} = {
				height: 0
			};
			if (this.overflowing !== undefined) {
				animation['marginBottom'] = -15;
			}
			$(this).find('paper-menu').find('.content').stop().animate(animation, {
				easing: 'easeInCubic',
				duration: 300,
				complete(this: HTMLElement) {
					this.style.display = 'none';
					if (!_this.raised) {
						window.requestAnimationFrame(function(time) {
							_this._animateBoxShadowOut(time, _this);
						});
					}
				}
			});
		}
	};

	/**
	 * Toggles the dropdown menu, tirggers on clicking the main blue text
	 */
	static _toggleDropdown(this: PaperDropdownInstance) {
		if (!this.disabled) {
			(this._expanded ? this.close() : this.open());
		}
	};

	/**
	 * Gets the currently selected item(s)
	 * @returns {Array} The currently selected item(s) in array form
	 */
	static getSelected(this: PaperDropdownInstance): Array<number> {
		if ($(this).find('.iron-selected.addLibrary')[0]) {
			(this.selected as Array<number>).pop();
		}
		if (typeof this.selected === 'number') {
			return [this.selected];
		}
		return this.selected;
	};

	static disable(this: PaperDropdownInstance) {
		this.disabled = true;
		this._expanded && this.close && this.close();
		this.$.dropdownSelected.style.color = 'rgb(176, 220, 255)';
	};

	static enable(this: PaperDropdownInstance) {
		this.disabled = false;
		this.$.dropdownSelected.style.color = 'rgb(38, 153, 244)';
	}
}

type PaperDropdownBehaviorBase = Polymer.El<'behavior',
	typeof PDB & typeof paperDropdownBehaviorProperties
>;

Polymer.PaperDropdownBehavior = PDB as PaperDropdownBehaviorBase;