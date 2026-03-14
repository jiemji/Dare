import { Store } from './data.js';

export const Sanitize = {
    /**
     * Escapes a string for safe HTML insertion.
     * @param {string} str 
     * @returns {string}
     */
    escape(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

export const UI = {
    /**
     * Internal helper to handle data binding.
     */
    _bind(el, options, eventName, prop) {
        if (options.bind) {
            const { obj, key } = options.bind;
            el[prop] = obj[key] || '';
            el.addEventListener(eventName, (e) => {
                obj[key] = e.target.value;
                Store.save();
            });
        }
    },

    /**
     * Creates an input group with a label.
     */
    inputGroup(labelText, value, onInput, options = {}) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const input = document.createElement(options.multiline ? 'textarea' : 'input');
        if (!options.multiline) input.type = options.type || 'text';
        
        if (options.bind) {
            this._bind(input, options, 'input', 'value');
        } else {
            input.value = value || '';
            input.oninput = (e) => onInput(e.target.value);
        }
        
        input.placeholder = options.placeholder || '';
        group.appendChild(input);
        return group;
    },

    /**
     * Creates a select group with a label.
     */
    selectGroup(labelText, value, options, onChange, extraOptions = {}) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const select = document.createElement('select');
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            select.appendChild(o);
        });

        if (extraOptions.bind) {
            this._bind(select, extraOptions, 'change', 'value');
        } else {
            select.value = value;
            select.onchange = (e) => onChange(e.target.value);
        }
        
        group.appendChild(select);
        return group;
    },

    /**
     * Creates a standard button.
     */
    button(text, onClick, type = 'secondary') {
        const btn = document.createElement('button');
        btn.className = `btn ${type}`;
        btn.textContent = text;
        btn.onclick = onClick;
        return btn;
    },

    /**
     * Creates a card container.
     */
    card(type, title = '') {
        const card = document.createElement('div');
        card.className = `card-${type}`;
        
        if (title) {
            const h4 = document.createElement('h4');
            h4.textContent = title;
            h4.style.marginBottom = '15px';
            h4.style.borderBottom = '1px solid var(--c-border)';
            h4.style.paddingBottom = '5px';
            card.appendChild(h4);
        }
        
        return card;
    },

    /**
     * Creates a data card for objects like Processus, Sources, etc.
     */
    dataCard(style, title, fields, onDelete) {
        const card = UI.card(style, title);
        
        fields.forEach(f => {
            if (f.type === 'select') {
                card.appendChild(UI.selectGroup(f.label, null, f.options, f.onchange, { bind: f.bind }));
            } else {
                card.appendChild(UI.inputGroup(f.label, null, f.onchange, { multiline: f.multiline, bind: f.bind }));
            }
        });

        if (onDelete) {
            card.appendChild(UI.button('Supprimer', onDelete, 'secondary'));
        }

        return card;
    },

    /**
     * Creates a folding card for risk scenarios and other complex objects.
     */
    foldingCard(title, options = {}) {
        const card = document.createElement('div');
        card.className = 'folding-card';
        if (options.isExpanded) card.classList.add('is-expanded');

        const header = document.createElement('div');
        header.className = 'folding-header';
        
        if (typeof title === 'string') {
            const h3 = document.createElement('h3');
            h3.textContent = title;
            header.appendChild(h3);
        } else if (title instanceof HTMLElement) {
            header.appendChild(title);
        }

        const controls = document.createElement('div');
        controls.className = 'header-controls';
        
        // Helper to stop propagation on interactive elements in header
        const stopProp = (el) => {
            el.addEventListener('click', e => e.stopPropagation());
            return el;
        };

        if (options.headerElements) {
            options.headerElements.forEach(el => controls.appendChild(stopProp(el)));
        }

        if (options.likelihood) {
            const selectGroup = this.selectGroup('Vraisemblance', options.likelihood.value, options.likelihood.options, options.likelihood.onChange);
            selectGroup.style.marginBottom = '0';
            const label = selectGroup.querySelector('label');
            label.style.display = 'inline-block';
            label.style.marginRight = '10px';
            const select = selectGroup.querySelector('select');
            select.style.width = 'auto';
            select.style.marginBottom = '0';
            controls.appendChild(stopProp(selectGroup));
            card._likelihoodSelect = select;
        }

        if (options.onDelete) {
            const btnDel = this.button('Supprimer', (e) => {
                e.stopPropagation();
                options.onDelete();
            }, 'secondary');
            controls.appendChild(stopProp(btnDel));
        }

        const toggle = document.createElement('span');
        toggle.className = 'toggle-icon';
        toggle.innerHTML = '▼';
        controls.appendChild(toggle);

        header.appendChild(controls);
        header.onclick = () => {
            card.classList.toggle('is-expanded');
            if (options.onToggle) options.onToggle(card.classList.contains('is-expanded'));
        };

        card.appendChild(header);

        const content = document.createElement('div');
        content.className = 'folding-content';
        if (options.columns) {
            if (options.columns === 2) content.classList.add('two-columns');
            else content.classList.add('three-columns');
        }

        if (options.content) {
            if (options.content instanceof DocumentFragment) {
                content.appendChild(options.content);
            } else {
                content.appendChild(options.content);
            }
        } else {
            // Legacy/Dual column support (Atelier 4)
            const left = document.createElement('div');
            left.className = 'content-left';
            if (options.contentLeft) left.appendChild(options.contentLeft);

            const right = document.createElement('div');
            right.className = 'content-right';
            if (options.contentRight) right.appendChild(options.contentRight);

            content.appendChild(left);
            content.appendChild(right);
        }

        card.appendChild(content);
        return card;
    }
};
