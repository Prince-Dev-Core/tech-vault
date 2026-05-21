/**
 * AppSettings Class
 * Manages user application preferences including theme, notifications, display density, and language
 * Requirement 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

class AppSettings {
    constructor(options = {}) {
        this.storageKey = 'appSettings';
        this.defaultSettings = {
            theme: 'dark',
            notifications: {
                email: true,
                push: true,
                marketing: false
            },
            displayDensity: 'comfortable',
            language: 'en'
        };
        
        this.supportedLanguages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'de', name: 'Deutsch' },
            { code: 'ja', name: '日本語' }
        ];
        
        this.supportedThemes = ['light', 'dark'];
        this.supportedDensities = ['compact', 'comfortable'];
        
        this.settings = this.loadSettings();
        this.eventListeners = {};
        
        // Apply initial settings
        this.applyTheme(this.settings.theme);
        this.applyDisplayDensity(this.settings.displayDensity);
        this.applyLanguage(this.settings.language);
    }

    /**
     * Load settings from persistent storage
     * Requirement 11.5
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all properties exist
                return {
                    ...this.defaultSettings,
                    ...parsed,
                    notifications: {
                        ...this.defaultSettings.notifications,
                        ...(parsed.notifications || {})
                    }
                };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return {
            ...this.defaultSettings,
            notifications: { ...this.defaultSettings.notifications }
        };
    }

    /**
     * Save settings to persistent storage
     * Requirement 11.5
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            this.emitEvent('settingsSaved', this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.emitEvent('settingsSaveError', { error });
        }
    }

    /**
     * Get all current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Get a specific setting value
     */
    getSetting(key) {
        const keys = key.split('.');
        let value = this.settings;
        for (const k of keys) {
            value = value?.[k];
        }
        return value;
    }

    /**
     * Update theme setting and apply immediately
     * Requirement 11.1, 11.6
     */
    setTheme(theme) {
        if (!this.supportedThemes.includes(theme)) {
            console.warn(`Unsupported theme: ${theme}`);
            return false;
        }
        
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
        this.emitEvent('themeChanged', { theme });
        return true;
    }

    /**
     * Apply theme to the document
     * Requirement 11.1, 11.6
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--bg-dark', '#f8f9fa');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-elevated', '#f1f5f9');
            root.style.setProperty('--text-primary', '#0f172a');
            root.style.setProperty('--text-secondary', '#475569');
            root.style.setProperty('--text-muted', '#94a3b8');
            root.style.setProperty('--border', '#e2e8f0');
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        } else {
            // Dark theme (default)
            root.style.setProperty('--bg-dark', '#0a0a0f');
            root.style.setProperty('--bg-card', '#12121a');
            root.style.setProperty('--bg-elevated', '#1a1a2e');
            root.style.setProperty('--text-primary', '#f1f5f9');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--text-muted', '#64748b');
            root.style.setProperty('--border', '#1e293b');
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        }
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.settings.theme;
    }

    /**
     * Update notification preferences
     * Requirement 11.2, 11.6
     */
    setNotificationPreference(type, enabled) {
        if (!this.settings.notifications.hasOwnProperty(type)) {
            console.warn(`Unknown notification type: ${type}`);
            return false;
        }
        
        this.settings.notifications[type] = enabled;
        this.saveSettings();
        this.emitEvent('notificationPreferenceChanged', { type, enabled });
        return true;
    }

    /**
     * Get notification preferences
     */
    getNotificationPreferences() {
        return { ...this.settings.notifications };
    }

    /**
     * Update display density and apply immediately
     * Requirement 11.3, 11.6
     */
    setDisplayDensity(density) {
        if (!this.supportedDensities.includes(density)) {
            console.warn(`Unsupported display density: ${density}`);
            return false;
        }
        
        this.settings.displayDensity = density;
        this.applyDisplayDensity(density);
        this.saveSettings();
        this.emitEvent('displayDensityChanged', { density });
        return true;
    }

    /**
     * Apply display density to the document
     * Requirement 11.3, 11.6
     */
    applyDisplayDensity(density) {
        const root = document.documentElement;
        
        if (density === 'compact') {
            root.style.setProperty('--spacing-unit', '0.5rem');
            root.style.setProperty('--item-gap', '0.75rem');
            root.style.setProperty('--padding-base', '0.5rem');
            document.body.classList.remove('density-comfortable');
            document.body.classList.add('density-compact');
        } else {
            // Comfortable density (default)
            root.style.setProperty('--spacing-unit', '1rem');
            root.style.setProperty('--item-gap', '1.5rem');
            root.style.setProperty('--padding-base', '1rem');
            document.body.classList.remove('density-compact');
            document.body.classList.add('density-comfortable');
        }
    }

    /**
     * Get current display density
     */
    getDisplayDensity() {
        return this.settings.displayDensity;
    }

    /**
     * Update language setting and apply immediately
     * Requirement 11.4, 11.6
     */
    setLanguage(languageCode) {
        const supported = this.supportedLanguages.map(l => l.code);
        if (!supported.includes(languageCode)) {
            console.warn(`Unsupported language: ${languageCode}`);
            return false;
        }
        
        this.settings.language = languageCode;
        this.applyLanguage(languageCode);
        this.saveSettings();
        this.emitEvent('languageChanged', { language: languageCode });
        return true;
    }

    /**
     * Apply language to the document
     * Requirement 11.4, 11.6
     */
    applyLanguage(languageCode) {
        document.documentElement.lang = languageCode;
        document.body.setAttribute('data-language', languageCode);
        this.emitEvent('languageApplied', { language: languageCode });
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.settings.language;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Reset all settings to defaults
     */
    resetToDefaults() {
        this.settings = {
            ...this.defaultSettings,
            notifications: { ...this.defaultSettings.notifications }
        };
        this.applyTheme(this.settings.theme);
        this.applyDisplayDensity(this.settings.displayDensity);
        this.applyLanguage(this.settings.language);
        this.saveSettings();
        this.emitEvent('settingsReset', this.settings);
    }

    /**
     * Event listener management
     */
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emitEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Export settings as JSON
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from JSON
     */
    importSettings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = {
                ...this.defaultSettings,
                ...imported,
                notifications: {
                    ...this.defaultSettings.notifications,
                    ...(imported.notifications || {})
                }
            };
            this.applyTheme(this.settings.theme);
            this.applyDisplayDensity(this.settings.displayDensity);
            this.applyLanguage(this.settings.language);
            this.saveSettings();
            this.emitEvent('settingsImported', this.settings);
            return true;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    /**
     * Destroy the instance and clean up
     */
    destroy() {
        this.eventListeners = {};
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppSettings;
}
