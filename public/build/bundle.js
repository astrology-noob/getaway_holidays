
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\TopMenu.svelte generated by Svelte v3.48.0 */

    const file$a = "src\\TopMenu.svelte";

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let button;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Getaway Holidays";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Заказать обратный звонок";
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$a, 1, 4, 28);
    			attr_dev(button, "class", "form_button svelte-piluxh");
    			add_location(button, file$a, 2, 4, 74);
    			attr_dev(div1, "class", "top_menu svelte-piluxh");
    			add_location(div1, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopMenu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TopMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopMenu",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Banner.svelte generated by Svelte v3.48.0 */

    const file$9 = "src\\Banner.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Getaway Holidays";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Навстречу новым впечатлениям!";
    			attr_dev(p0, "class", "svelte-19a2zih");
    			add_location(p0, file$9, 2, 8, 38);
    			attr_dev(p1, "class", "svelte-19a2zih");
    			add_location(p1, file$9, 3, 8, 71);
    			attr_dev(div0, "class", "svelte-19a2zih");
    			add_location(div0, file$9, 1, 4, 23);
    			attr_dev(div1, "id", "banner");
    			attr_dev(div1, "class", "svelte-19a2zih");
    			add_location(div1, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Banner', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\Services.svelte generated by Svelte v3.48.0 */

    const file$8 = "src\\Services.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "slider");
    			add_location(div0, file$8, 2, 4, 73);
    			attr_dev(div1, "id", "services");
    			attr_dev(div1, "class", "svelte-1wi1vto");
    			add_location(div1, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\Suites.svelte generated by Svelte v3.48.0 */

    const file$7 = "src\\Suites.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "slider");
    			add_location(div0, file$7, 1, 4, 23);
    			attr_dev(div1, "id", "suites");
    			attr_dev(div1, "class", "svelte-x3hpiq");
    			add_location(div1, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Suites', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Suites> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Suites extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Suites",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\IndSuite.svelte generated by Svelte v3.48.0 */

    const file$6 = "src\\IndSuite.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let strong;
    	let t8;
    	let button;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Праздничный пакет услуг";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("В праздничный пакет услуг Вы можете добавить такие услуги, как:");
    			br0 = element("br");
    			t3 = text("- Групповые занятия");
    			br1 = element("br");
    			t4 = text("- Занятия на апре-ски");
    			br2 = element("br");
    			t5 = text("- Услуги яслей");
    			br3 = element("br");
    			t6 = text("Для организации индивидуального пакета услуг, необходимо ");
    			strong = element("strong");
    			strong.textContent = "подать заявку на консультацию!";
    			t8 = space();
    			button = element("button");
    			button.textContent = "Заказать обратный звонок";
    			attr_dev(p0, "class", "svelte-19nxvy2");
    			add_location(p0, file$6, 2, 8, 41);
    			add_location(br0, file$6, 3, 74, 147);
    			add_location(br1, file$6, 3, 97, 170);
    			add_location(br2, file$6, 3, 122, 195);
    			add_location(br3, file$6, 3, 140, 213);
    			add_location(strong, file$6, 3, 201, 274);
    			attr_dev(p1, "class", "svelte-19nxvy2");
    			add_location(p1, file$6, 3, 8, 81);
    			attr_dev(div0, "class", "svelte-19nxvy2");
    			add_location(div0, file$6, 1, 4, 26);
    			attr_dev(button, "class", "form_button svelte-19nxvy2");
    			add_location(button, file$6, 5, 4, 343);
    			attr_dev(div1, "id", "ind_suite");
    			attr_dev(div1, "class", "svelte-19nxvy2");
    			add_location(div1, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(p1, br0);
    			append_dev(p1, t3);
    			append_dev(p1, br1);
    			append_dev(p1, t4);
    			append_dev(p1, br2);
    			append_dev(p1, t5);
    			append_dev(p1, br3);
    			append_dev(p1, t6);
    			append_dev(p1, strong);
    			append_dev(div1, t8);
    			append_dev(div1, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IndSuite', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IndSuite> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IndSuite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IndSuite",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\Footer.svelte";

    function create_fragment$6(ctx) {
    	let footer;
    	let div0;
    	let t1;
    	let div5;
    	let p;
    	let t3;
    	let a0;
    	let div1;
    	let t4;
    	let a1;
    	let div2;
    	let t5;
    	let a2;
    	let div3;
    	let t6;
    	let a3;
    	let div4;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "Getaway Holidays";
    			t1 = space();
    			div5 = element("div");
    			p = element("p");
    			p.textContent = "Контакты:";
    			t3 = space();
    			a0 = element("a");
    			div1 = element("div");
    			t4 = space();
    			a1 = element("a");
    			div2 = element("div");
    			t5 = space();
    			a2 = element("a");
    			div3 = element("div");
    			t6 = space();
    			a3 = element("a");
    			div4 = element("div");
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$5, 1, 4, 14);
    			attr_dev(p, "class", "svelte-1kj7xse");
    			add_location(p, file$5, 3, 8, 95);
    			attr_dev(div1, "class", "vk svelte-1kj7xse");
    			add_location(div1, file$5, 4, 50, 163);
    			attr_dev(a0, "href", "https://vk.com/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1kj7xse");
    			add_location(a0, file$5, 4, 8, 121);
    			attr_dev(div2, "class", "tg svelte-1kj7xse");
    			add_location(div2, file$5, 5, 62, 253);
    			attr_dev(a1, "href", "https://t.me/astrology_noob");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1kj7xse");
    			add_location(a1, file$5, 5, 8, 199);
    			attr_dev(div3, "class", "yt svelte-1kj7xse");
    			add_location(div3, file$5, 6, 63, 344);
    			attr_dev(a2, "href", "https://youtu.be/dQw4w9WgXcQ");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-1kj7xse");
    			add_location(a2, file$5, 6, 8, 289);
    			attr_dev(div4, "class", "wa svelte-1kj7xse");
    			add_location(div4, file$5, 7, 60, 432);
    			attr_dev(a3, "href", "https://wa.me/79258850827");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-1kj7xse");
    			add_location(a3, file$5, 7, 8, 380);
    			attr_dev(div5, "class", "social_nets svelte-1kj7xse");
    			add_location(div5, file$5, 2, 4, 60);
    			attr_dev(footer, "class", "svelte-1kj7xse");
    			add_location(footer, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(footer, t1);
    			append_dev(footer, div5);
    			append_dev(div5, p);
    			append_dev(div5, t3);
    			append_dev(div5, a0);
    			append_dev(a0, div1);
    			append_dev(div5, t4);
    			append_dev(div5, a1);
    			append_dev(a1, div2);
    			append_dev(div5, t5);
    			append_dev(div5, a2);
    			append_dev(a2, div3);
    			append_dev(div5, t6);
    			append_dev(div5, a3);
    			append_dev(a3, div4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\ServicePopUp.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\ServicePopUp.svelte";

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t1;
    	let div1;
    	let p1;
    	let t3;
    	let p2;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "name";
    			t1 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Описание услуги";
    			t3 = space();
    			p2 = element("p");
    			t4 = space();
    			button = element("button");
    			attr_dev(p0, "class", "svelte-382kf4");
    			set_style(p0, "font-size", `60px`, false);
    			set_style(p0, "color", `white`, false);
    			set_style(p0, "fontweight", `700`, false);
    			add_location(p0, file$4, 10, 8, 266);
    			attr_dev(div0, "class", "svelte-382kf4");
    			add_location(div0, file$4, 9, 4, 251);
    			attr_dev(p1, "class", "svelte-382kf4");
    			set_style(p1, "font-size", `40px`, false);
    			add_location(p1, file$4, 13, 8, 389);
    			attr_dev(p2, "class", "svelte-382kf4");
    			set_style(p2, "font-size", `30px`, false);
    			add_location(p2, file$4, 14, 8, 444);
    			attr_dev(div1, "class", "desc svelte-382kf4");
    			add_location(div1, file$4, 12, 4, 361);
    			attr_dev(button, "class", "svelte-382kf4");
    			add_location(button, file$4, 16, 4, 492);
    			attr_dev(div2, "class", "service_popup svelte-382kf4");
    			set_style(div2, "visibility", `hidden`, false);
    			add_location(div2, file$4, 8, 0, 192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t3);
    			append_dev(div1, p2);
    			append_dev(div2, t4);
    			append_dev(div2, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", closeServicePopUp, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function closeServicePopUp() {
    	document.querySelector(".service_popup").style.visibility = "hidden";
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ServicePopUp', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ServicePopUp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ closeServicePopUp });
    	return [];
    }

    class ServicePopUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ServicePopUp",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\FormPopUp.svelte generated by Svelte v3.48.0 */

    const file$3 = "src\\FormPopUp.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let p;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Заказать обратный звонок";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Имя";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Телефон";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			button = element("button");
    			attr_dev(p, "class", "svelte-ar9tx4");
    			add_location(p, file$3, 14, 12, 441);
    			attr_dev(label0, "for", "name");
    			attr_dev(label0, "class", "svelte-ar9tx4");
    			add_location(label0, file$3, 17, 20, 627);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-ar9tx4");
    			add_location(input0, file$3, 18, 20, 678);
    			attr_dev(div0, "class", "form_group svelte-ar9tx4");
    			add_location(div0, file$3, 16, 16, 581);
    			attr_dev(label1, "for", "phone");
    			attr_dev(label1, "class", "svelte-ar9tx4");
    			add_location(label1, file$3, 21, 20, 807);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "phone");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-ar9tx4");
    			add_location(input1, file$3, 22, 20, 863);
    			attr_dev(div1, "class", "form_group svelte-ar9tx4");
    			add_location(div1, file$3, 20, 16, 761);
    			attr_dev(input2, "type", "submit");
    			input2.value = "Заказать";
    			attr_dev(input2, "class", "svelte-ar9tx4");
    			add_location(input2, file$3, 24, 16, 947);
    			attr_dev(form, "action", "api/call");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "class", "svelte-ar9tx4");
    			add_location(form, file$3, 15, 12, 486);
    			attr_dev(div2, "class", "form_wrapper svelte-ar9tx4");
    			add_location(div2, file$3, 13, 8, 401);
    			attr_dev(button, "class", "svelte-ar9tx4");
    			add_location(button, file$3, 27, 8, 1033);
    			attr_dev(div3, "class", "svelte-ar9tx4");
    			add_location(div3, file$3, 12, 4, 386);
    			attr_dev(div4, "class", "form_popup svelte-ar9tx4");
    			set_style(div4, "visibility", `hidden`, false);
    			add_location(div4, file$3, 11, 0, 330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(div2, t1);
    			append_dev(div2, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			append_dev(form, t7);
    			append_dev(form, input2);
    			append_dev(div3, t8);
    			append_dev(div3, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(form, "submit", prevent_default(changePopUp), false, true, false),
    					listen_dev(button, "click", closeFormPopUp, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function closeFormPopUp() {
    	document.querySelector(".form_popup").style.visibility = "hidden";
    }

    function changePopUp() {
    	document.querySelector(".form_popup").style.visibility = "hidden";
    	document.querySelector(".sub_popup").style.visibility = "visible";
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormPopUp', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FormPopUp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ closeFormPopUp, changePopUp });
    	return [];
    }

    class FormPopUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormPopUp",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\SubmittedFormPopUp.svelte generated by Svelte v3.48.0 */

    const file$2 = "src\\SubmittedFormPopUp.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Мы перезвоним вам в течение часа!";
    			t1 = space();
    			button = element("button");
    			attr_dev(p, "class", "svelte-1ft69b3");
    			add_location(p, file$2, 7, 4, 192);
    			attr_dev(button, "class", "svelte-1ft69b3");
    			add_location(button, file$2, 8, 4, 238);
    			attr_dev(div, "class", "sub_popup svelte-1ft69b3");
    			set_style(div, "visibility", `hidden`, false);
    			add_location(div, file$2, 6, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", closeSubPopUp, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function closeSubPopUp() {
    	document.querySelector(".sub_popup").style.visibility = "hidden";
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SubmittedFormPopUp', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SubmittedFormPopUp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ closeSubPopUp });
    	return [];
    }

    class SubmittedFormPopUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubmittedFormPopUp",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\MainPage.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\MainPage.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let header;
    	let topmenu;
    	let t0;
    	let main;
    	let banner;
    	let t1;
    	let suites;
    	let t2;
    	let indsuite;
    	let t3;
    	let services;
    	let t4;
    	let footer;
    	let t5;
    	let servicepopup;
    	let t6;
    	let formpopup;
    	let t7;
    	let subformpopup;
    	let current;
    	topmenu = new TopMenu({ $$inline: true });
    	banner = new Banner({ $$inline: true });
    	suites = new Suites({ $$inline: true });
    	indsuite = new IndSuite({ $$inline: true });
    	services = new Services({ $$inline: true });
    	footer = new Footer({ $$inline: true });
    	servicepopup = new ServicePopUp({ $$inline: true });
    	formpopup = new FormPopUp({ $$inline: true });
    	subformpopup = new SubmittedFormPopUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			header = element("header");
    			create_component(topmenu.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(suites.$$.fragment);
    			t2 = space();
    			create_component(indsuite.$$.fragment);
    			t3 = space();
    			create_component(services.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			t5 = space();
    			create_component(servicepopup.$$.fragment);
    			t6 = space();
    			create_component(formpopup.$$.fragment);
    			t7 = space();
    			create_component(subformpopup.$$.fragment);
    			add_location(header, file$1, 13, 1, 453);
    			add_location(main, file$1, 16, 1, 490);
    			attr_dev(div, "class", "wrapper");
    			add_location(div, file$1, 12, 0, 429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header);
    			mount_component(topmenu, header, null);
    			append_dev(div, t0);
    			append_dev(div, main);
    			mount_component(banner, main, null);
    			append_dev(main, t1);
    			mount_component(suites, main, null);
    			append_dev(main, t2);
    			mount_component(indsuite, main, null);
    			append_dev(main, t3);
    			mount_component(services, main, null);
    			append_dev(div, t4);
    			mount_component(footer, div, null);
    			append_dev(div, t5);
    			mount_component(servicepopup, div, null);
    			append_dev(div, t6);
    			mount_component(formpopup, div, null);
    			append_dev(div, t7);
    			mount_component(subformpopup, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topmenu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(suites.$$.fragment, local);
    			transition_in(indsuite.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(servicepopup.$$.fragment, local);
    			transition_in(formpopup.$$.fragment, local);
    			transition_in(subformpopup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topmenu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(suites.$$.fragment, local);
    			transition_out(indsuite.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(servicepopup.$$.fragment, local);
    			transition_out(formpopup.$$.fragment, local);
    			transition_out(subformpopup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(topmenu);
    			destroy_component(banner);
    			destroy_component(suites);
    			destroy_component(indsuite);
    			destroy_component(services);
    			destroy_component(footer);
    			destroy_component(servicepopup);
    			destroy_component(formpopup);
    			destroy_component(subformpopup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainPage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TopMenu,
    		Banner,
    		Services,
    		Suites,
    		IndSuite,
    		Footer,
    		ServicePopUp,
    		FormPopUp,
    		SubFormPopUp: SubmittedFormPopUp
    	});

    	return [];
    }

    class MainPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainPage",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\SuiteSliderElem.svelte generated by Svelte v3.48.0 */

    const file = "src\\SuiteSliderElem.svelte";

    function create_fragment$1(ctx) {
    	let div11;
    	let div10;
    	let div0;
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;
    	let div9;
    	let div2;
    	let div1;
    	let t4;
    	let p2;
    	let t5;
    	let t6;
    	let div4;
    	let div3;
    	let t7;
    	let p3;
    	let t8;
    	let t9;
    	let div6;
    	let div5;
    	let t10;
    	let p4;
    	let t11;
    	let t12;
    	let div8;
    	let div7;
    	let t13;
    	let p5;
    	let t14;
    	let t15;
    	let button;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div10 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(/*price*/ ctx[1]);
    			t3 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t4 = space();
    			p2 = element("p");
    			t5 = text(/*morn_text*/ ctx[2]);
    			t6 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t7 = space();
    			p3 = element("p");
    			t8 = text(/*sup_text*/ ctx[3]);
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t10 = space();
    			p4 = element("p");
    			t11 = text(/*spa_text*/ ctx[4]);
    			t12 = space();
    			div8 = element("div");
    			div7 = element("div");
    			t13 = space();
    			p5 = element("p");
    			t14 = text(/*ski_text*/ ctx[5]);
    			t15 = space();
    			button = element("button");
    			button.textContent = "Заказать обратный звонок";
    			attr_dev(p0, "class", "svelte-14ba3qw");
    			add_location(p0, file, 7, 12, 197);
    			attr_dev(p1, "class", "svelte-14ba3qw");
    			add_location(p1, file, 8, 12, 224);
    			attr_dev(div0, "class", "elem_head svelte-14ba3qw");
    			add_location(div0, file, 6, 8, 160);
    			attr_dev(div1, "class", "icon morn svelte-14ba3qw");
    			add_location(div1, file, 12, 16, 327);
    			attr_dev(p2, "class", "svelte-14ba3qw");
    			add_location(p2, file, 13, 16, 374);
    			attr_dev(div2, "class", "svelte-14ba3qw");
    			add_location(div2, file, 11, 12, 304);
    			attr_dev(div3, "class", "icon sup svelte-14ba3qw");
    			add_location(div3, file, 16, 16, 449);
    			attr_dev(p3, "class", "svelte-14ba3qw");
    			add_location(p3, file, 17, 16, 495);
    			attr_dev(div4, "class", "svelte-14ba3qw");
    			add_location(div4, file, 15, 12, 426);
    			attr_dev(div5, "class", "icon spa svelte-14ba3qw");
    			add_location(div5, file, 20, 16, 569);
    			attr_dev(p4, "class", "svelte-14ba3qw");
    			add_location(p4, file, 21, 16, 615);
    			attr_dev(div6, "class", "svelte-14ba3qw");
    			add_location(div6, file, 19, 12, 546);
    			attr_dev(div7, "class", "icon ski svelte-14ba3qw");
    			add_location(div7, file, 24, 16, 689);
    			attr_dev(p5, "class", "svelte-14ba3qw");
    			add_location(p5, file, 25, 16, 735);
    			attr_dev(div8, "class", "svelte-14ba3qw");
    			add_location(div8, file, 23, 12, 666);
    			attr_dev(div9, "class", "elem_content svelte-14ba3qw");
    			add_location(div9, file, 10, 8, 264);
    			attr_dev(button, "class", "form_button svelte-14ba3qw");
    			add_location(button, file, 28, 8, 798);
    			attr_dev(div10, "class", "elem_wrapper svelte-14ba3qw");
    			add_location(div10, file, 5, 4, 124);
    			attr_dev(div11, "class", "slider-elem");
    			add_location(div11, file, 4, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			append_dev(div10, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div10, t3);
    			append_dev(div10, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t4);
    			append_dev(div2, p2);
    			append_dev(p2, t5);
    			append_dev(div9, t6);
    			append_dev(div9, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t7);
    			append_dev(div4, p3);
    			append_dev(p3, t8);
    			append_dev(div9, t9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div6, t10);
    			append_dev(div6, p4);
    			append_dev(p4, t11);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div8, t13);
    			append_dev(div8, p5);
    			append_dev(p5, t14);
    			append_dev(div10, t15);
    			append_dev(div10, button);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*price*/ 2) set_data_dev(t2, /*price*/ ctx[1]);
    			if (dirty & /*morn_text*/ 4) set_data_dev(t5, /*morn_text*/ ctx[2]);
    			if (dirty & /*sup_text*/ 8) set_data_dev(t8, /*sup_text*/ ctx[3]);
    			if (dirty & /*spa_text*/ 16) set_data_dev(t11, /*spa_text*/ ctx[4]);
    			if (dirty & /*ski_text*/ 32) set_data_dev(t14, /*ski_text*/ ctx[5]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SuiteSliderElem', slots, []);
    	let { name, price, morn_text, sup_text, spa_text, ski_text } = $$props;
    	const writable_props = ['name', 'price', 'morn_text', 'sup_text', 'spa_text', 'ski_text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SuiteSliderElem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('morn_text' in $$props) $$invalidate(2, morn_text = $$props.morn_text);
    		if ('sup_text' in $$props) $$invalidate(3, sup_text = $$props.sup_text);
    		if ('spa_text' in $$props) $$invalidate(4, spa_text = $$props.spa_text);
    		if ('ski_text' in $$props) $$invalidate(5, ski_text = $$props.ski_text);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		price,
    		morn_text,
    		sup_text,
    		spa_text,
    		ski_text
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('morn_text' in $$props) $$invalidate(2, morn_text = $$props.morn_text);
    		if ('sup_text' in $$props) $$invalidate(3, sup_text = $$props.sup_text);
    		if ('spa_text' in $$props) $$invalidate(4, spa_text = $$props.spa_text);
    		if ('ski_text' in $$props) $$invalidate(5, ski_text = $$props.ski_text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, price, morn_text, sup_text, spa_text, ski_text];
    }

    class SuiteSliderElem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			name: 0,
    			price: 1,
    			morn_text: 2,
    			sup_text: 3,
    			spa_text: 4,
    			ski_text: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SuiteSliderElem",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'name'");
    		}

    		if (/*price*/ ctx[1] === undefined && !('price' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'price'");
    		}

    		if (/*morn_text*/ ctx[2] === undefined && !('morn_text' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'morn_text'");
    		}

    		if (/*sup_text*/ ctx[3] === undefined && !('sup_text' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'sup_text'");
    		}

    		if (/*spa_text*/ ctx[4] === undefined && !('spa_text' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'spa_text'");
    		}

    		if (/*ski_text*/ ctx[5] === undefined && !('ski_text' in props)) {
    			console.warn("<SuiteSliderElem> was created without expected prop 'ski_text'");
    		}
    	}

    	get name() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get morn_text() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set morn_text(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sup_text() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sup_text(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spa_text() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spa_text(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ski_text() {
    		throw new Error("<SuiteSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ski_text(value) {
    		throw new Error("<SuiteSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ServiceSliderElem.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file_1 = "src\\ServiceSliderElem.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Подробнее";
    			attr_dev(div0, "class", "serv-name svelte-1sa4twv");
    			add_location(div0, file_1, 20, 4, 1006);
    			attr_dev(button, "class", "svelte-1sa4twv");
    			add_location(button, file_1, 21, 4, 1047);
    			attr_dev(div1, "class", "slider-elem serv-elem svelte-1sa4twv");
    			set_style(div1, "background", "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(build/photos/" + /*file*/ ctx[1] + ") center top");
    			add_location(div1, file_1, 19, 0, 852);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*openServicePopUp*/ ctx[3](/*id*/ ctx[2]))) /*openServicePopUp*/ ctx[3](/*id*/ ctx[2]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*file*/ 2) {
    				set_style(div1, "background", "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(build/photos/" + /*file*/ ctx[1] + ") center top");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ServiceSliderElem', slots, []);
    	let { name, file, id } = $$props;

    	function openServicePopUp(id) {
    		fetch(`api/service/${id}`).then(res => res.json()).then(json => {
    			let servicePopUp = document.querySelector(".service_popup");
    			servicePopUp.firstChild.firstChild.innerHTML = json.service.name;
    			servicePopUp.children[1].lastChild.innerHTML = json.service.description;
    			servicePopUp.firstChild.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(build/photos/${file}) center top`;
    			servicePopUp.firstChild.style.backgroundSize = "cover";
    			servicePopUp.firstChild.style.backgroundRepeat = "no-repeat";
    			servicePopUp.style.visibility = "visible";
    		}).catch(error => console.log(error));
    	}

    	const writable_props = ['name', 'file', 'id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ServiceSliderElem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ name, file, id, openServicePopUp });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, file, id, openServicePopUp];
    }

    class ServiceSliderElem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0, file: 1, id: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ServiceSliderElem",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console_1.warn("<ServiceSliderElem> was created without expected prop 'name'");
    		}

    		if (/*file*/ ctx[1] === undefined && !('file' in props)) {
    			console_1.warn("<ServiceSliderElem> was created without expected prop 'file'");
    		}

    		if (/*id*/ ctx[2] === undefined && !('id' in props)) {
    			console_1.warn("<ServiceSliderElem> was created without expected prop 'id'");
    		}
    	}

    	get name() {
    		throw new Error("<ServiceSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ServiceSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get file() {
    		throw new Error("<ServiceSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<ServiceSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ServiceSliderElem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ServiceSliderElem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // let db = require("../public/database");

    new MainPage({
    	target: document.body
    });

    new SuiteSliderElem({
    	target: document.querySelector("#suites>.slider"),
    	props: {
    		name: "Базовый пакет",
    		price: "4000 р/день",
    		morn_text: "1 утренний перекус (горячий напиток и закуска)",
    		sup_text: "1 ужин, который подается в ресторане на территории отеля",
    		spa_text: "1 х 1 час санаторно-курортных процедур",
    		ski_text: "Бесплатный пропуск на подъёмник на 1 день"
    	}
    });

    new SuiteSliderElem({
    	target: document.querySelector("#suites>.slider"),
    	props: {
    		name: "Стандартный пакет",
    		price: "5000 р/день",
    		morn_text: "3 утренних перекуса (горячие напитки и закуски) ",
    		sup_text: "3 ужина, которые подаются в ресторане на территории отеля",
    		spa_text: "3 спа-процедуры по 1 часу",
    		ski_text: "Бесплатный пропуск на подъёмник на 3 дня"
    	}
    });

    new SuiteSliderElem({
    	target: document.querySelector("#suites>.slider"),
    	props: {
    		name: "Пакет Люкс",
    		price: "6500 р/день",
    		morn_text: "Ежедневные утренние перекусы (горячие напитки и закуски) ",
    		sup_text: "5 ужинов, которые подаются в ресторане на территории отеля",
    		spa_text: "5 спа-процедур по 1 часу",
    		ski_text: "Бесплатный абонемент на подъёмник на 1 неделю"
    	}
    });

    fetch("api/services")
    .then(res => res.json())
    .then(json => {
    	for (let i = 0; i < Object.keys(json).length; i++) {
    		new ServiceSliderElem({
    			target: document.querySelector("#services>.slider"),
    			props: {
    				id: i,
    				name: json[i].name,
    				file: json[i].file
    			}
    		});
    	}
    	
    	$(document).ready(function(){
    		$('.slider').slick({
    			infinite: true,
    			slidesToShow: 1,
    			slidesToScroll: 1,
    			// dots: true
    		});
    	});
    });

})();
//# sourceMappingURL=bundle.js.map
