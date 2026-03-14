/**
 * Utility functions for DARE
 */

/**
 * Generates the next ID for a list of objects with an ID prefix.
 * Example: generateNextId([{id: 'VM01'}], 'VM') -> 'VM02'
 * @param {Array} list 
 * @param {string} prefix 
 * @returns {string}
 */
export function generateNextId(list, prefix) {
    let max = 0;
    list.forEach(item => {
        const num = parseInt(item.id.replace(prefix, ''), 10);
        if (!isNaN(num) && num > max) max = num;
    });
    return `${prefix}${(max + 1).toString().padStart(2, '0')}`;
}

/**
 * Wrapper for window.confirm to standardize confirmation dialogs.
 * @param {string} message 
 * @param {Function} onConfirm 
 */
export function confirmAction(message, onConfirm) {
    if (window.confirm(message)) {
        onConfirm();
    }
}
/**
 * Utility to tap into a value and return it.
 * @param {*} val 
 * @param {Function} fn 
 * @returns {*}
 */
export function tap(val, fn) {
    fn(val);
    return val;
}

/**
 * Utility to set data-id and return the element.
 * @param {HTMLElement} el 
 * @param {string} id 
 * @returns {HTMLElement}
 */
export function withId(el, id) {
    el.setAttribute('data-id', id);
    return el;
}
