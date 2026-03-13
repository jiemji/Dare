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
    },

    /**
     * Creates a folding card for risk scenarios.
     */
    foldingCard(title, options = {}) {
        const card = document.createElement('div');
        card.className = 'folding-card';
        if (options.isExpanded) card.classList.add('is-expanded');

        // Header
        const header = document.createElement('div');
        header.className = 'folding-header';
        
        const h3 = document.createElement('h3');
        h3.textContent = title;
        header.appendChild(h3);

        const controls = document.createElement('div');
        controls.className = 'header-controls';
        
        // Likelihood selector (Vraisemblance)
        if (options.likelihood) {
            const select = this.selectGroup('Vraisemblance', options.likelihood.value, options.likelihood.options, options.likelihood.onChange);
            select.style.marginBottom = '0'; // Flat in header
            select.querySelector('label').style.display = 'inline-block';
            select.querySelector('label').style.marginRight = '10px';
            select.querySelector('select').style.width = 'auto';
            select.querySelector('select').style.marginBottom = '0';
            controls.appendChild(select);
            card._likelihoodSelect = select.querySelector('select');
        }

        // Delete button
        if (options.onDelete) {
            const btnDel = this.button('Supprimer ce scénario', (e) => {
                e.stopPropagation();
                options.onDelete();
            }, 'secondary');
            controls.appendChild(btnDel);
        }

        // Toggle Expand
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

        // Content
        const content = document.createElement('div');
        content.className = 'folding-content';

        const left = document.createElement('div');
        left.className = 'content-left';
        if (options.contentLeft) left.appendChild(options.contentLeft);

        const right = document.createElement('div');
        right.className = 'content-right';
        if (options.contentRight) right.appendChild(options.contentRight);

        content.appendChild(left);
        content.appendChild(right);
        card.appendChild(content);

        return card;
    }
};
