/**
 * Component Library for DARE
 * Centralizes UI creation and secure rendering logic.
 */

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
     * Creates an input group with a label.
     * @param {string} labelText 
     * @param {string} value 
     * @param {Function} onInput 
     * @param {Object} options 
     */
    inputGroup(labelText, value, onInput, options = {}) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const input = document.createElement(options.multiline ? 'textarea' : 'input');
        if (!options.multiline) input.type = options.type || 'text';
        input.value = value || '';
        input.placeholder = options.placeholder || '';
        
        input.oninput = (e) => onInput(e.target.value);
        
        group.appendChild(input);
        return group;
    },

    /**
     * Creates a select group with a label.
     * @param {string} labelText 
     * @param {string} value 
     * @param {Array} options [{value, label}]
     * @param {Function} onChange 
     */
    selectGroup(labelText, value, options, onChange) {
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
        select.value = value;
        
        select.onchange = (e) => onChange(e.target.value);
        
        group.appendChild(select);
        return group;
    },

    /**
     * Creates a standard button.
     * @param {string} text 
     * @param {Function} onClick 
     * @param {string} type 'primary' or 'secondary' 
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
     * @param {string} type 'square', 'long', 'extended'
     * @param {string} title
     * @returns {HTMLElement}
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
    }
};
