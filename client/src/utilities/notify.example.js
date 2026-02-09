/**
 * Example usage of the notify utility functions
 * This file demonstrates how to use the notification system
 */

import { 
    addNotify, 
    notify, 
    notifyHelpers, 
    addCustomNotify, 
    addActionNotify,
    toastPositions,
    toastThemes 
} from './notify';

// Example usage of basic notifications
export const basicNotificationExamples = () => {
    // Basic notifications
    addNotify('Hello World!', 'success');
    addNotify('Something went wrong!', 'error');
    addNotify('Please be careful!', 'warning');
    addNotify('Here is some information', 'info');
    
    // Using the notify object
    notify.success('Operation completed!');
    notify.error('Operation failed!');
    notify.warning('Please check your input');
    notify.info('New message received');
    
    // Loading notification
    const loadingToast = notify.loading('Processing...');
    
    // Dismiss after 3 seconds
    setTimeout(() => {
        notify.dismiss(loadingToast);
        notify.success('Processing completed!');
    }, 3000);
};

// Example usage of helper notifications
export const helperNotificationExamples = () => {
    // API responses
    notifyHelpers.apiSuccess('Data fetched successfully');
    notifyHelpers.apiError('Failed to fetch data');
    
    // Form submissions
    notifyHelpers.formSuccess('Profile updated successfully');
    notifyHelpers.formError('Please fill all required fields');
    
    // Authentication
    notifyHelpers.loginSuccess();
    notifyHelpers.loginError('Invalid credentials');
    notifyHelpers.logoutSuccess();
    
    // File operations
    notifyHelpers.fileUploadSuccess('document.pdf');
    notifyHelpers.fileUploadError('File size too large');
    
    // Data operations
    notifyHelpers.dataSaved();
    notifyHelpers.dataDeleted();
    notifyHelpers.dataUpdated();
    
    // Network issues
    notifyHelpers.networkError();
    notifyHelpers.serverError();
    
    // Validation
    notifyHelpers.validationError('email field');
    notifyHelpers.requiredField('Username');
    
    // Permissions
    notifyHelpers.accessDenied();
    notifyHelpers.sessionExpired();
};

// Example usage of custom notifications
export const customNotificationExamples = () => {
    // Custom styled notification
    addCustomNotify('Custom styled message', {
        position: toastPositions.BOTTOM_RIGHT,
        theme: toastThemes.DARK,
        style: {
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '12px',
        }
    });
    
    // Notification with different positions
    addNotify('Top left message', 'info', { position: toastPositions.TOP_LEFT });
    addNotify('Bottom center message', 'success', { position: toastPositions.BOTTOM_CENTER });
    
    // Notification with custom duration
    addNotify('This will close in 10 seconds', 'warning', { autoClose: 10000 });
    
    // Notification that won't auto close
    addNotify('Click to close', 'info', { autoClose: false });
};

// Example usage of action notifications
export const actionNotificationExamples = () => {
    // Notification with action buttons
    addActionNotify(
        'Do you want to save your changes?',
        [
            {
                label: 'Save',
                color: '#28a745',
                onClick: () => {
                    console.log('Saving...');
                    notify.success('Changes saved!');
                }
            },
            {
                label: 'Cancel',
                color: '#dc3545',
                onClick: () => {
                    console.log('Cancelled');
                    notify.info('Changes discarded');
                }
            }
        ],
        {
            position: toastPositions.TOP_CENTER,
            autoClose: false
        }
    );
};

// Example usage of promise notifications
export const promiseNotificationExamples = () => {
    // Promise-based notification
    const saveData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    resolve('Data saved successfully');
                } else {
                    reject('Failed to save data');
                }
            }, 2000);
        });
    };
    
    notify.promise(
        saveData(),
        {
            pending: 'Saving data...',
            success: 'Data saved successfully!',
            error: 'Failed to save data. Please try again.'
        }
    );
};

// Example usage in React components
export const componentNotificationExamples = {
    // In a form component
    handleSubmit: async (formData) => {
        try {
            notify.loading('Submitting form...');
            await submitForm(formData);
            notify.success('Form submitted successfully!');
        } catch (error) {
            notify.error('Failed to submit form');
        }
    },
    
    // In an API call
    fetchData: async () => {
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                notifyHelpers.apiSuccess('Data loaded successfully');
            } else {
                notifyHelpers.apiError('Failed to load data');
            }
        } catch (error) {
            notifyHelpers.networkError();
        }
    },
    
    // In a file upload component
    handleFileUpload: (file) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            notifyHelpers.fileUploadError('File size must be less than 5MB');
            return;
        }
        
        notify.loading('Uploading file...');
        // Simulate upload
        setTimeout(() => {
            notifyHelpers.fileUploadSuccess(file.name);
        }, 2000);
    }
};

// Example configuration for different environments
export const notificationConfigs = {
    development: {
        position: toastPositions.TOP_RIGHT,
        autoClose: 3000,
        theme: toastThemes.LIGHT,
    },
    
    production: {
        position: toastPositions.TOP_RIGHT,
        autoClose: 5000,
        theme: toastThemes.LIGHT,
        hideProgressBar: false,
    },
    
    testing: {
        position: toastPositions.BOTTOM_RIGHT,
        autoClose: 2000,
        theme: toastThemes.DARK,
    }
};

export default {
    basicNotificationExamples,
    helperNotificationExamples,
    customNotificationExamples,
    actionNotificationExamples,
    promiseNotificationExamples,
    componentNotificationExamples,
    notificationConfigs
};
