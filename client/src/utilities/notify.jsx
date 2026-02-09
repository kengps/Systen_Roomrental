import { toast } from 'react-toastify';

/**
 * Notification utility function using react-toastify
 * Supports multiple notification types with customizable options
 */

// Default toast configuration
const defaultConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
};

/**
 * Add notification with different types
 * @param {string} message - The notification message
 * @param {string} type - Type of notification (success, error, warning, info, default)
 * @param {object} options - Additional toast options
 */
export const addNotify = (message, type = 'default', options = {}) => {
    // Merge default config with custom options
    const config = { ...defaultConfig, ...options };

    switch (type.toLowerCase()) {
        case 'success':
            return toast.success(message, config);
        
        case 'error':
            return toast.error(message, config);
        
        case 'warning':
            return toast.warning(message, config);
        
        case 'info':
            return toast.info(message, config);
        
        case 'loading':
            return toast.loading(message, {
                ...config,
                autoClose: false,
                closeOnClick: false,
                draggable: false,
            });
        
        case 'promise':
            // For promise-based notifications
            return toast.promise;
        
        case 'custom':
            return toast(message, {
                ...config,
                className: options.className || 'custom-toast',
                bodyClassName: options.bodyClassName,
                progressClassName: options.progressClassName,
            });
        
        default:
            return toast(message, config);
    }
};

/**
 * Predefined notification functions for common use cases
 */
export const notify = {
    // Success notifications
    success: (message, options = {}) => addNotify(message, 'success', options),
    
    // Error notifications
    error: (message, options = {}) => addNotify(message, 'error', options),
    
    // Warning notifications
    warning: (message, options = {}) => addNotify(message, 'warning', options),
    
    // Info notifications
    info: (message, options = {}) => addNotify(message, 'info', options),
    
    // Loading notifications
    loading: (message, options = {}) => addNotify(message, 'loading', options),
    
    // Custom notifications
    custom: (message, options = {}) => addNotify(message, 'custom', options),
    
    // Promise-based notifications
    promise: (promise, messages, options = {}) => {
        return toast.promise(promise, messages, {
            ...defaultConfig,
            ...options
        });
    },
    
    // Dismiss notifications
    dismiss: (toastId) => toast.dismiss(toastId),
    
    // Dismiss all notifications
    dismissAll: () => toast.dismiss(),
    
    // Update existing notification
    update: (toastId, message, type = 'default', options = {}) => {
        toast.update(toastId, {
            render: message,
            type: type,
            ...options
        });
    }
};

/**
 * Specialized notification functions for common scenarios
 */
export const notifyHelpers = {
    // API response notifications
    apiSuccess: (message = 'Operation completed successfully') => 
        notify.success(message, { autoClose: 3000 }),
    
    apiError: (message = 'An error occurred') => 
        notify.error(message, { autoClose: 5000 }),
    
    // Form notifications
    formSuccess: (message = 'Form submitted successfully') => 
        notify.success(message, { autoClose: 3000 }),
    
    formError: (message = 'Please check your input') => 
        notify.error(message, { autoClose: 4000 }),
    
    // Authentication notifications
    loginSuccess: () => 
        notify.success('Login successful!', { autoClose: 2000 }),
    
    loginError: (message = 'Login failed') => 
        notify.error(message, { autoClose: 4000 }),
    
    logoutSuccess: () => 
        notify.info('Logged out successfully', { autoClose: 2000 }),
    
    // File operations
    fileUploadSuccess: (filename) => 
        notify.success(`File "${filename}" uploaded successfully`),
    
    fileUploadError: (message = 'File upload failed') => 
        notify.error(message),
    
    // Data operations
    dataSaved: () => 
        notify.success('Data saved successfully', { autoClose: 2000 }),
    
    dataDeleted: () => 
        notify.success('Data deleted successfully', { autoClose: 2000 }),
    
    dataUpdated: () => 
        notify.success('Data updated successfully', { autoClose: 2000 }),
    
    // Network notifications
    networkError: () => 
        notify.error('Network error. Please check your connection.', { autoClose: 6000 }),
    
    serverError: () => 
        notify.error('Server error. Please try again later.', { autoClose: 5000 }),
    
    // Validation notifications
    validationError: (field) => 
        notify.warning(`Please check ${field}`, { autoClose: 4000 }),
    
    requiredField: (field) => 
        notify.warning(`${field} is required`, { autoClose: 3000 }),
    
    // Permission notifications
    accessDenied: () => 
        notify.error('Access denied. Insufficient permissions.', { autoClose: 4000 }),
    
    sessionExpired: () => 
        notify.warning('Session expired. Please login again.', { autoClose: 5000 }),
};

/**
 * Toast position presets
 */
export const toastPositions = {
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
    TOP_CENTER: "top-center",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
    BOTTOM_CENTER: "bottom-center",
};

/**
 * Toast themes
 */
export const toastThemes = {
    LIGHT: "light",
    DARK: "dark",
    COLORED: "colored",
};

/**
 * Advanced notification with custom styling
 */
export const addCustomNotify = (message, options = {}) => {
    const customOptions = {
        position: toastPositions.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: toastThemes.LIGHT,
        style: {
            background: '#fff',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        ...options
    };
    
    return toast(message, customOptions);
};

/**
 * Notification with action buttons
 */
export const addActionNotify = (message, actions = [], options = {}) => {
    const actionButtons = actions.map((action, index) => (
        `<button 
            onclick="${action.onClick}" 
            style="
                background: ${action.color || '#007bff'}; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                margin: 0 4px; 
                border-radius: 4px; 
                cursor: pointer;
            "
        >
            ${action.label}
        </button>`
    )).join('');

    return toast(
        <div>
            <div>{message}</div>
            <div style={{ marginTop: '8px' }}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        style={{
                            background: action.color || '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            margin: '0 4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>,
        {
            ...defaultConfig,
            autoClose: false,
            closeOnClick: false,
            ...options
        }
    );
};

export default {
    addNotify,
    notify,
    notifyHelpers,
    addCustomNotify,
    addActionNotify,
    toastPositions,
    toastThemes,
};
