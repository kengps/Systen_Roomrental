/**
 * Utility functions for input validation
 */

/**
 * Prevents non-numeric input for InputNumber components
 * @param {Event} e - Keyboard event
 */
export const preventNonNumericInput = (e) => {
    // อนุญาตเฉพาะตัวเลข, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
    const isNumber = /[0-9]/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    
    if (!isNumber && !isAllowedKey) {
        e.preventDefault();
    }
};

/**
 * Prevents non-numeric input including negative numbers
 * @param {Event} e - Keyboard event
 */
export const preventNonNumericInputWithNegative = (e) => {
    // อนุญาตเฉพาะตัวเลข, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
    const isNumber = /[0-9]/.test(e.key);
    const isMinus = e.key === '-';
    const isAllowedKey = allowedKeys.includes(e.key);
    
    if (!isNumber && !isMinus && !isAllowedKey) {
        e.preventDefault();
    }
};

/**
 * Prevents pasting non-numeric content
 * @param {Event} e - Paste event
 * @param {boolean} allowNegative - Whether to allow negative numbers
 */
export const preventNonNumericPaste = (e, allowNegative = false) => {
    const paste = e.clipboardData.getData('text');
    const regex = allowNegative ? /^[0-9-]*$/ : /^[0-9]*$/;
    
    if (!regex.test(paste)) {
        e.preventDefault();
    }
};

/**
 * Common props for InputNumber with numeric validation
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowNegative - Whether to allow negative numbers
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @returns {Object} Props object for InputNumber
 */
export const getNumericInputProps = (options = {}) => {
    const { allowNegative = false, min, max } = options;
    
    return {
        min,
        max,
        onKeyPress: allowNegative ? preventNonNumericInputWithNegative : preventNonNumericInput,
        onPaste: (e) => preventNonNumericPaste(e, allowNegative)
    };
};
