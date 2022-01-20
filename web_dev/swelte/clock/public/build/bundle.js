
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    class Clock {

        constructor(hour, minute){
            if (hour < 0 || 23 < hour) {
                throw Error("The hour argument must be between 0 and 23");
            } else {
                this._hour = hour;
            }
            if (minute < 0 || minute > 60) {
                throw Error("Error: minute value must be >= 0 and < 60")
            } else {
                this._minute = minute;
            }
        }
        
        tick(){
            this._minute++;
            if (this._minute == 60) {
                this._minute = 0;
                this._hour = (this._hour + 1) % 24; 
            }   
        }
        
        set alarm(alarm) {
            this._alarmIsActive = true;
            this._alarm = alarm;
        }

        get alarm(){
            return this._alarm;
        }
        deactivateAlarm() {
            this._alarmIsActive = false;
        }
        activateAlarm() {
            this._alarmIsActive = true;
        }
        get isTriggered() {
            if(this._alarmIsActive){
                return (this.time.hour.toString().padStart(2, '0') + ':' + this.time.minute.toString().padStart(2, '0')) >= this._alarm
            }
        }
        
        get time() {
            return { hour: this._hour, minute: this._minute }
        }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (259:1) {#if clock.isTriggered}
    function create_if_block_12(ctx) {
    	let div1;
    	let div0;
    	let h2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Wake up!!";
    			attr_dev(h2, "class", "alarmclock svelte-1w0qx03");
    			add_location(h2, file, 261, 5, 4929);
    			attr_dev(div0, "class", "alarmWakeUp svelte-1w0qx03");
    			add_location(div0, file, 260, 4, 4897);
    			set_style(div1, "height", "200px");
    			add_location(div1, file, 259, 3, 4862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(259:1) {#if clock.isTriggered}",
    		ctx
    	});

    	return block;
    }

    // (270:7) {#key clock.time.hour}
    function create_key_block_1(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.hour.toString().padStart(2, "0") + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "position", "absolute");
    			set_style(span, "margin", "0");
    			set_style(span, "top", "0px");
    			set_style(span, "left", "0");
    			attr_dev(span, "class", "time svelte-1w0qx03");
    			add_location(span, file, 270, 8, 5172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.hour.toString().padStart(2, "0") + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -25 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(270:7) {#key clock.time.hour}",
    		ctx
    	});

    	return block;
    }

    // (274:7) {#key clock.time.minute}
    function create_key_block(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.minute.toString().padStart(2, "0") + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "position", "absolute");
    			set_style(span, "margin", "0");
    			set_style(span, "top", "0");
    			set_style(span, "right", "5px");
    			attr_dev(span, "class", "time svelte-1w0qx03");
    			add_location(span, file, 274, 8, 5518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.minute.toString().padStart(2, "0") + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -25 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(274:7) {#key clock.time.minute}",
    		ctx
    	});

    	return block;
    }

    // (283:38) 
    function create_if_block_11(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Set Alarm";
    			attr_dev(button, "class", "setAlarm svelte-1w0qx03");
    			add_location(button, file, 283, 7, 6008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*activateAlarm*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(283:38) ",
    		ctx
    	});

    	return block;
    }

    // (281:6) {#if clock._alarmIsActive}
    function create_if_block_10(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Disable";
    			attr_dev(button, "class", "disableAlarm svelte-1w0qx03");
    			add_location(button, file, 281, 7, 5858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(281:6) {#if clock._alarmIsActive}",
    		ctx
    	});

    	return block;
    }

    // (289:56) 
    function create_if_block_9(ctx) {
    	let p;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Set alarm to a valid time";
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 289, 7, 6272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(289:56) ",
    		ctx
    	});

    	return block;
    }

    // (287:6) {#if clock._alarmIsActive && !clock.isTriggered}
    function create_if_block_8(ctx) {
    	let p;
    	let t0;
    	let b;
    	let t1_value = /*clock*/ ctx[0].alarm + "";
    	let t1;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Alarm set to: ");
    			b = element("b");
    			t1 = text(t1_value);
    			attr_dev(b, "class", "svelte-1w0qx03");
    			add_location(b, file, 287, 32, 6181);
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 287, 7, 6156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, b);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t1_value !== (t1_value = /*clock*/ ctx[0].alarm + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(287:6) {#if clock._alarmIsActive && !clock.isTriggered}",
    		ctx
    	});

    	return block;
    }

    // (307:7) {#each [1, 2, 3, 4] as offset}
    function create_each_block_1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "minor svelte-1w0qx03");
    			attr_dev(line, "y1", "42");
    			attr_dev(line, "y2", "45");
    			attr_dev(line, "transform", "rotate(" + 6 * (/*minute*/ ctx[13] + /*offset*/ ctx[16]) + ")");
    			add_location(line, file, 307, 8, 6862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(307:7) {#each [1, 2, 3, 4] as offset}",
    		ctx
    	});

    	return block;
    }

    // (300:6) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
    function create_each_block(ctx) {
    	let line;
    	let each_1_anchor;
    	let each_value_1 = [1, 2, 3, 4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < 4; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			line = svg_element("line");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(line, "class", "major svelte-1w0qx03");
    			attr_dev(line, "y1", "35");
    			attr_dev(line, "y2", "45");
    			attr_dev(line, "transform", "rotate(" + 30 * /*minute*/ ctx[13] + ")");
    			add_location(line, file, 300, 7, 6697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(300:6) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}",
    		ctx
    	});

    	return block;
    }

    // (337:37) 
    function create_if_block_7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Set Alarm";
    			attr_dev(button, "class", "setAlarm svelte-1w0qx03");
    			add_location(button, file, 337, 6, 7632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*activateAlarm*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(337:37) ",
    		ctx
    	});

    	return block;
    }

    // (335:5) {#if clock._alarmIsActive}
    function create_if_block_6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Disable";
    			attr_dev(button, "class", "disableAlarm svelte-1w0qx03");
    			add_location(button, file, 335, 6, 7484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(335:5) {#if clock._alarmIsActive}",
    		ctx
    	});

    	return block;
    }

    // (343:55) 
    function create_if_block_5(ctx) {
    	let p;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Set alarm to a valid time";
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 343, 6, 7889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(343:55) ",
    		ctx
    	});

    	return block;
    }

    // (341:4) {#if clock._alarmIsActive && !clock.isTriggered}
    function create_if_block_4(ctx) {
    	let p;
    	let t0;
    	let b;
    	let t1_value = /*clock*/ ctx[0].alarm + "";
    	let t1;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Alarm set to: ");
    			b = element("b");
    			t1 = text(t1_value);
    			attr_dev(b, "class", "svelte-1w0qx03");
    			add_location(b, file, 341, 30, 7800);
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 341, 5, 7775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, b);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t1_value !== (t1_value = /*clock*/ ctx[0].alarm + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(341:4) {#if clock._alarmIsActive && !clock.isTriggered}",
    		ctx
    	});

    	return block;
    }

    // (366:35) 
    function create_if_block_3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Set Alarm";
    			attr_dev(button, "class", "setAlarm svelte-1w0qx03");
    			add_location(button, file, 366, 4, 9290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*activateAlarm*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(366:35) ",
    		ctx
    	});

    	return block;
    }

    // (364:3) {#if clock._alarmIsActive}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Disable";
    			attr_dev(button, "class", "disableAlarm svelte-1w0qx03");
    			add_location(button, file, 364, 4, 9146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(364:3) {#if clock._alarmIsActive}",
    		ctx
    	});

    	return block;
    }

    // (372:53) 
    function create_if_block_1(ctx) {
    	let p;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Set alarm to a valid time";
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 372, 4, 9539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(372:53) ",
    		ctx
    	});

    	return block;
    }

    // (370:3) {#if clock._alarmIsActive && !clock.isTriggered}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let b;
    	let t1_value = /*clock*/ ctx[0].alarm + "";
    	let t1;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Alarm set to: ");
    			b = element("b");
    			t1 = text(t1_value);
    			attr_dev(b, "class", "svelte-1w0qx03");
    			add_location(b, file, 370, 29, 9454);
    			attr_dev(p, "class", "svelte-1w0qx03");
    			add_location(p, file, 370, 4, 9429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, b);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t1_value !== (t1_value = /*clock*/ ctx[0].alarm + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(370:3) {#if clock._alarmIsActive && !clock.isTriggered}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let main;
    	let h1;
    	let t4;
    	let t5;
    	let div12;
    	let div3;
    	let div1;
    	let div0;
    	let previous_key = /*clock*/ ctx[0].time.hour;
    	let t6;
    	let span;
    	let t8;
    	let previous_key_1 = /*clock*/ ctx[0].time.minute;
    	let t9;
    	let div2;
    	let input0;
    	let t10;
    	let t11;
    	let t12;
    	let div6;
    	let div4;
    	let svg0;
    	let circle;
    	let line0;
    	let line0_transform_value;
    	let line1;
    	let line1_transform_value;
    	let t13;
    	let div5;
    	let input1;
    	let t14;
    	let t15;
    	let t16;
    	let div11;
    	let div9;
    	let div7;
    	let svg1;
    	let rect0;
    	let rect0_y_value;
    	let text0;
    	let t17_value = /*clock*/ ctx[0].time.hour.toString().padStart(2, "0") + "";
    	let t17;
    	let t18;
    	let div8;
    	let svg2;
    	let rect1;
    	let rect1_y_value;
    	let text1;
    	let t19_value = /*clock*/ ctx[0].time.minute.toString().padStart(2, "0") + "";
    	let t19;
    	let t20;
    	let div10;
    	let input2;
    	let t21;
    	let t22;
    	let mounted;
    	let dispose;
    	let if_block0 = /*clock*/ ctx[0].isTriggered && create_if_block_12(ctx);
    	let key_block0 = create_key_block_1(ctx);
    	let key_block1 = create_key_block(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive) return create_if_block_10;
    		if (!/*clock*/ ctx[0]._alarmIsActive) return create_if_block_11;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive && !/*clock*/ ctx[0].isTriggered) return create_if_block_8;
    		if (/*alarmNotDefined*/ ctx[2] && !/*clock*/ ctx[0].isTriggered) return create_if_block_9;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);
    	let each_value = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 12; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type_2(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive) return create_if_block_6;
    		if (!/*clock*/ ctx[0]._alarmIsActive) return create_if_block_7;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block3 = current_block_type_2 && current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive && !/*clock*/ ctx[0].isTriggered) return create_if_block_4;
    		if (/*alarmNotDefined*/ ctx[2] && !/*clock*/ ctx[0].isTriggered) return create_if_block_5;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block4 = current_block_type_3 && current_block_type_3(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive) return create_if_block_2;
    		if (!/*clock*/ ctx[0]._alarmIsActive) return create_if_block_3;
    	}

    	let current_block_type_4 = select_block_type_4(ctx);
    	let if_block5 = current_block_type_4 && current_block_type_4(ctx);

    	function select_block_type_5(ctx, dirty) {
    		if (/*clock*/ ctx[0]._alarmIsActive && !/*clock*/ ctx[0].isTriggered) return create_if_block;
    		if (/*alarmNotDefined*/ ctx[2] && !/*clock*/ ctx[0].isTriggered) return create_if_block_1;
    	}

    	let current_block_type_5 = select_block_type_5(ctx);
    	let if_block6 = current_block_type_5 && current_block_type_5(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Clock Viewer";
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			div12 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			key_block0.c();
    			t6 = space();
    			span = element("span");
    			span.textContent = ":";
    			t8 = space();
    			key_block1.c();
    			t9 = space();
    			div2 = element("div");
    			input0 = element("input");
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();
    			div6 = element("div");
    			div4 = element("div");
    			svg0 = svg_element("svg");
    			circle = svg_element("circle");

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].c();
    			}

    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			t13 = space();
    			div5 = element("div");
    			input1 = element("input");
    			t14 = space();
    			if (if_block3) if_block3.c();
    			t15 = space();
    			if (if_block4) if_block4.c();
    			t16 = space();
    			div11 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			svg1 = svg_element("svg");
    			rect0 = svg_element("rect");
    			text0 = svg_element("text");
    			t17 = text(t17_value);
    			t18 = space();
    			div8 = element("div");
    			svg2 = svg_element("svg");
    			rect1 = svg_element("rect");
    			text1 = svg_element("text");
    			t19 = text(t19_value);
    			t20 = space();
    			div10 = element("div");
    			input2 = element("input");
    			t21 = space();
    			if (if_block5) if_block5.c();
    			t22 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file, 0, 0, 0);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file, 1, 0, 61);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@1,300&family=Roboto+Mono:wght@400;700&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file, 2, 0, 131);
    			add_location(h1, file, 257, 1, 4810);
    			set_style(span, "font-size", "3em");
    			set_style(span, "position", "absolute");
    			set_style(span, "margin", "0");
    			set_style(span, "top", "-6px");
    			set_style(span, "left", "80px");
    			set_style(span, "display", "inline-block");
    			set_style(span, "height", "5px");
    			add_location(span, file, 272, 8, 5348);
    			attr_dev(div0, "id", "digitalClock");
    			attr_dev(div0, "class", "svelte-1w0qx03");
    			add_location(div0, file, 268, 6, 5108);
    			set_style(div1, "position", "relative");
    			set_style(div1, "height", "200px");
    			add_location(div1, file, 267, 5, 5053);
    			attr_dev(input0, "type", "time");
    			attr_dev(input0, "class", "svelte-1w0qx03");
    			add_location(input0, file, 279, 6, 5774);
    			attr_dev(div2, "class", "item");
    			set_style(div2, "margin-top", "25px");
    			add_location(div2, file, 278, 5, 5722);
    			attr_dev(div3, "class", "clock svelte-1w0qx03");
    			add_location(div3, file, 266, 2, 5027);
    			attr_dev(circle, "class", "clock-face svelte-1w0qx03");
    			attr_dev(circle, "r", "48");
    			add_location(circle, file, 297, 6, 6557);
    			attr_dev(line0, "class", "hour svelte-1w0qx03");
    			attr_dev(line0, "y1", "2");
    			attr_dev(line0, "y2", "-20");
    			attr_dev(line0, "transform", line0_transform_value = "rotate(" + 0.5 * /*$minuteClock*/ ctx[3] + ")");
    			add_location(line0, file, 316, 6, 7058);
    			attr_dev(line1, "class", "minute svelte-1w0qx03");
    			attr_dev(line1, "y1", "4");
    			attr_dev(line1, "y2", "-30");
    			attr_dev(line1, "transform", line1_transform_value = "rotate(" + 6 * /*$minuteClock*/ ctx[3] + ")");
    			add_location(line1, file, 324, 6, 7218);
    			attr_dev(svg0, "viewBox", "-50 -50 100 100");
    			set_style(svg0, "width", "70%");
    			set_style(svg0, "height", "100%");
    			attr_dev(svg0, "class", "svelte-1w0qx03");
    			add_location(svg0, file, 296, 5, 6486);
    			attr_dev(div4, "class", "item");
    			set_style(div4, "height", "200px");
    			add_location(div4, file, 295, 4, 6438);
    			attr_dev(input1, "type", "time");
    			attr_dev(input1, "class", "svelte-1w0qx03");
    			add_location(input1, file, 333, 5, 7405);
    			set_style(div5, "margin-top", "25px");
    			add_location(div5, file, 332, 4, 7367);
    			attr_dev(div6, "class", "clock svelte-1w0qx03");
    			add_location(div6, file, 293, 2, 6353);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", rect0_y_value = 198 - /*clock*/ ctx[0].time.hour * 8.53);
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "200");
    			set_style(rect0, "fill", "rgb(0,0,255)");
    			set_style(rect0, "stroke", "rgb(0,0,0)");
    			add_location(rect0, file, 351, 6, 8290);
    			attr_dev(text0, "class", "tttt svelte-1w0qx03");
    			attr_dev(text0, "x", "50%");
    			attr_dev(text0, "y", "50%");
    			attr_dev(text0, "dominant-baseline", "middle");
    			attr_dev(text0, "text-anchor", "middle");
    			add_location(text0, file, 352, 6, 8419);
    			attr_dev(svg1, "width", "80");
    			attr_dev(svg1, "height", "200");
    			set_style(svg1, "width", "80%");
    			set_style(svg1, "border", "3px solid green");
    			attr_dev(svg1, "class", "svelte-1w0qx03");
    			add_location(svg1, file, 350, 5, 8208);
    			attr_dev(div7, "class", "hourMeter");
    			set_style(div7, "width", "50%");
    			set_style(div7, "height", "100%");
    			add_location(div7, file, 349, 4, 8145);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", rect1_y_value = 198 - /*clock*/ ctx[0].time.minute * 3.33);
    			attr_dev(rect1, "width", "100%");
    			attr_dev(rect1, "height", "200");
    			set_style(rect1, "fill", "rgb(0,0,255)");
    			set_style(rect1, "stroke", "rgb(0,0,0)");
    			add_location(rect1, file, 357, 6, 8733);
    			attr_dev(text1, "class", "tttt svelte-1w0qx03");
    			attr_dev(text1, "x", "50%");
    			attr_dev(text1, "y", "50%");
    			attr_dev(text1, "dominant-baseline", "middle");
    			attr_dev(text1, "text-anchor", "middle");
    			add_location(text1, file, 358, 6, 8863);
    			attr_dev(svg2, "width", "80");
    			attr_dev(svg2, "height", "200");
    			set_style(svg2, "width", "80%");
    			set_style(svg2, "border", "3px solid green");
    			attr_dev(svg2, "class", "svelte-1w0qx03");
    			add_location(svg2, file, 356, 5, 8651);
    			attr_dev(div8, "class", "minuteMeter");
    			set_style(div8, "width", "50%");
    			set_style(div8, "height", "100%");
    			add_location(div8, file, 355, 4, 8586);
    			set_style(div9, "height", "auto");
    			set_style(div9, "display", "flex");
    			set_style(div9, "justify-content", "space-around");
    			set_style(div9, "text-align", "center");
    			set_style(div9, "margin-top", "10px");
    			set_style(div9, "margin-left", "10px");
    			set_style(div9, "margin-right", "10px");
    			add_location(div9, file, 348, 3, 7990);
    			attr_dev(input2, "type", "time");
    			attr_dev(input2, "class", "svelte-1w0qx03");
    			add_location(input2, file, 362, 4, 9071);
    			set_style(div10, "margin-top", "5px");
    			add_location(div10, file, 361, 3, 9035);
    			attr_dev(div11, "class", "clock svelte-1w0qx03");
    			add_location(div11, file, 347, 2, 7966);
    			attr_dev(div12, "class", "container svelte-1w0qx03");
    			add_location(div12, file, 265, 1, 5000);
    			attr_dev(main, "class", "svelte-1w0qx03");
    			add_location(main, file, 256, 0, 4801);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, link2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t4);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t5);
    			append_dev(main, div12);
    			append_dev(div12, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			key_block0.m(div0, null);
    			append_dev(div0, t6);
    			append_dev(div0, span);
    			append_dev(div0, t8);
    			key_block1.m(div0, null);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, input0);
    			set_input_value(input0, /*alarm*/ ctx[1]);
    			append_dev(div2, t10);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t11);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div12, t12);
    			append_dev(div12, div6);
    			append_dev(div6, div4);
    			append_dev(div4, svg0);
    			append_dev(svg0, circle);

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].m(svg0, null);
    			}

    			append_dev(svg0, line0);
    			append_dev(svg0, line1);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, input1);
    			set_input_value(input1, /*alarm*/ ctx[1]);
    			append_dev(div5, t14);
    			if (if_block3) if_block3.m(div5, null);
    			append_dev(div5, t15);
    			if (if_block4) if_block4.m(div5, null);
    			append_dev(div12, t16);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div7, svg1);
    			append_dev(svg1, rect0);
    			append_dev(svg1, text0);
    			append_dev(text0, t17);
    			append_dev(div9, t18);
    			append_dev(div9, div8);
    			append_dev(div8, svg2);
    			append_dev(svg2, rect1);
    			append_dev(svg2, text1);
    			append_dev(text1, t19);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			append_dev(div10, input2);
    			set_input_value(input2, /*alarm*/ ctx[1]);
    			append_dev(div10, t21);
    			if (if_block5) if_block5.m(div10, null);
    			append_dev(div10, t22);
    			if (if_block6) if_block6.m(div10, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*clock*/ ctx[0].isTriggered) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					if_block0.m(main, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key, previous_key = /*clock*/ ctx[0].time.hour)) {
    				group_outros();
    				transition_out(key_block0, 1, 1, noop);
    				check_outros();
    				key_block0 = create_key_block_1(ctx);
    				key_block0.c();
    				transition_in(key_block0);
    				key_block0.m(div0, t6);
    			} else {
    				key_block0.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_1, previous_key_1 = /*clock*/ ctx[0].time.minute)) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block(ctx);
    				key_block1.c();
    				transition_in(key_block1);
    				key_block1.m(div0, null);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (dirty & /*alarm*/ 2) {
    				set_input_value(input0, /*alarm*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t11);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, null);
    				}
    			}

    			if (dirty & /*$minuteClock*/ 8 && line0_transform_value !== (line0_transform_value = "rotate(" + 0.5 * /*$minuteClock*/ ctx[3] + ")")) {
    				attr_dev(line0, "transform", line0_transform_value);
    			}

    			if (dirty & /*$minuteClock*/ 8 && line1_transform_value !== (line1_transform_value = "rotate(" + 6 * /*$minuteClock*/ ctx[3] + ")")) {
    				attr_dev(line1, "transform", line1_transform_value);
    			}

    			if (dirty & /*alarm*/ 2) {
    				set_input_value(input1, /*alarm*/ ctx[1]);
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if (if_block3) if_block3.d(1);
    				if_block3 = current_block_type_2 && current_block_type_2(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div5, t15);
    				}
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_3(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if (if_block4) if_block4.d(1);
    				if_block4 = current_block_type_3 && current_block_type_3(ctx);

    				if (if_block4) {
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div5, null);
    				}
    			}

    			if (dirty & /*clock*/ 1 && rect0_y_value !== (rect0_y_value = 198 - /*clock*/ ctx[0].time.hour * 8.53)) {
    				attr_dev(rect0, "y", rect0_y_value);
    			}

    			if (dirty & /*clock*/ 1 && t17_value !== (t17_value = /*clock*/ ctx[0].time.hour.toString().padStart(2, "0") + "")) set_data_dev(t17, t17_value);

    			if (dirty & /*clock*/ 1 && rect1_y_value !== (rect1_y_value = 198 - /*clock*/ ctx[0].time.minute * 3.33)) {
    				attr_dev(rect1, "y", rect1_y_value);
    			}

    			if (dirty & /*clock*/ 1 && t19_value !== (t19_value = /*clock*/ ctx[0].time.minute.toString().padStart(2, "0") + "")) set_data_dev(t19, t19_value);

    			if (dirty & /*alarm*/ 2) {
    				set_input_value(input2, /*alarm*/ ctx[1]);
    			}

    			if (current_block_type_4 === (current_block_type_4 = select_block_type_4(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if (if_block5) if_block5.d(1);
    				if_block5 = current_block_type_4 && current_block_type_4(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div10, t22);
    				}
    			}

    			if (current_block_type_5 === (current_block_type_5 = select_block_type_5(ctx)) && if_block6) {
    				if_block6.p(ctx, dirty);
    			} else {
    				if (if_block6) if_block6.d(1);
    				if_block6 = current_block_type_5 && current_block_type_5(ctx);

    				if (if_block6) {
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div10, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(key_block0);
    			transition_in(key_block1);
    			transition_in(if_block2);
    			transition_in(if_block4);
    			transition_in(if_block6);
    		},
    		o: function outro(local) {
    			transition_out(key_block0);
    			transition_out(key_block1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(link2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			key_block0.d(detaching);
    			key_block1.d(detaching);

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) {
    				if_block2.d();
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block3) {
    				if_block3.d();
    			}

    			if (if_block4) {
    				if_block4.d();
    			}

    			if (if_block5) {
    				if_block5.d();
    			}

    			if (if_block6) {
    				if_block6.d();
    			}

    			mounted = false;
    			run_all(dispose);
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
    	let $minuteClock;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let clock = new Clock(23, 37);
    	let alarm;
    	let alarmNotDefined = false;
    	let minuteClock = spring(parseInt(clock.time.hour) * 60 + parseInt(clock.time.minute));
    	validate_store(minuteClock, 'minuteClock');
    	component_subscribe($$self, minuteClock, value => $$invalidate(3, $minuteClock = value));

    	function tick() {
    		clock.tick();
    		minuteClock.set(parseInt(clock.time.hour) * 60 + parseInt(clock.time.minute));
    		$$invalidate(0, clock);
    	}

    	setInterval(tick, 1000);

    	function activateAlarm() {
    		if (alarm) {
    			$$invalidate(0, clock.alarm = alarm, clock);
    			$$invalidate(2, alarmNotDefined = false);
    		} else {
    			$$invalidate(2, alarmNotDefined = true);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		alarm = this.value;
    		$$invalidate(1, alarm);
    	}

    	const click_handler = () => {
    		clock.deactivateAlarm();
    		$$invalidate(1, alarm = "");
    	};

    	function input1_input_handler() {
    		alarm = this.value;
    		$$invalidate(1, alarm);
    	}

    	const click_handler_1 = () => {
    		clock.deactivateAlarm();
    		$$invalidate(1, alarm = "");
    	};

    	function input2_input_handler() {
    		alarm = this.value;
    		$$invalidate(1, alarm);
    	}

    	const click_handler_2 = () => {
    		clock.deactivateAlarm();
    		$$invalidate(1, alarm = "");
    	};

    	$$self.$capture_state = () => ({
    		Clock,
    		fly,
    		fade,
    		spring,
    		clock,
    		alarm,
    		alarmNotDefined,
    		minuteClock,
    		tick,
    		activateAlarm,
    		$minuteClock
    	});

    	$$self.$inject_state = $$props => {
    		if ('clock' in $$props) $$invalidate(0, clock = $$props.clock);
    		if ('alarm' in $$props) $$invalidate(1, alarm = $$props.alarm);
    		if ('alarmNotDefined' in $$props) $$invalidate(2, alarmNotDefined = $$props.alarmNotDefined);
    		if ('minuteClock' in $$props) $$invalidate(4, minuteClock = $$props.minuteClock);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		clock,
    		alarm,
    		alarmNotDefined,
    		$minuteClock,
    		minuteClock,
    		activateAlarm,
    		input0_input_handler,
    		click_handler,
    		input1_input_handler,
    		click_handler_1,
    		input2_input_handler,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
