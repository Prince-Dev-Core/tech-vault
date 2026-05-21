/**
 * AppSettings Unit Tests
 * Tests for theme selection, notification preferences, display density, and language selection
 * Requirement 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

const AppSettings = require('./appSettings');

describe('AppSettings', () => {
    let appSettings;
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage with proper jest.fn() setup
        mockLocalStorage = {};
        
        const localStorageMock = {
            getItem: jest.fn((key) => mockLocalStorage[key] || null),
            setItem: jest.fn((key, value) => {
                mockLocalStorage[key] = value;
            }),
            removeItem: jest.fn((key) => {
                delete mockLocalStorage[key];
            }),
            clear: jest.fn(() => {
                mockLocalStorage = {};
            })
        };
        
        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock document methods
        document.documentElement.style.setProperty = jest.fn();
        document.documentElement.lang = '';
        document.body.classList.add = jest.fn();
        document.body.classList.remove = jest.fn();
        document.body.setAttribute = jest.fn();

        // Create new instance
        appSettings = new AppSettings();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize with default settings', () => {
            const settings = appSettings.getSettings();
            expect(settings.theme).toBe('dark');
            expect(settings.displayDensity).toBe('comfortable');
            expect(settings.language).toBe('en');
            expect(settings.notifications.email).toBe(true);
            expect(settings.notifications.push).toBe(true);
            expect(settings.notifications.marketing).toBe(false);
        });

        test('should load settings from localStorage if available', () => {
            const savedSettings = {
                theme: 'light',
                displayDensity: 'compact',
                language: 'es',
                notifications: {
                    email: false,
                    push: true,
                    marketing: true
                }
            };
            mockLocalStorage['appSettings'] = JSON.stringify(savedSettings);

            const newInstance = new AppSettings();
            const settings = newInstance.getSettings();

            expect(settings.theme).toBe('light');
            expect(settings.displayDensity).toBe('compact');
            expect(settings.language).toBe('es');
            expect(settings.notifications.email).toBe(false);
        });

        test('should merge loaded settings with defaults', () => {
            const partialSettings = {
                theme: 'light'
            };
            mockLocalStorage['appSettings'] = JSON.stringify(partialSettings);

            const newInstance = new AppSettings();
            const settings = newInstance.getSettings();

            expect(settings.theme).toBe('light');
            expect(settings.displayDensity).toBe('comfortable');
            expect(settings.language).toBe('en');
        });
    });

    describe('Theme Management', () => {
        test('should set theme to light', () => {
            const result = appSettings.setTheme('light');
            expect(result).toBe(true);
            expect(appSettings.getTheme()).toBe('light');
        });

        test('should set theme to dark', () => {
            const result = appSettings.setTheme('dark');
            expect(result).toBe(true);
            expect(appSettings.getTheme()).toBe('dark');
        });

        test('should reject unsupported theme', () => {
            const result = appSettings.setTheme('neon');
            expect(result).toBe(false);
            expect(appSettings.getTheme()).toBe('dark');
        });

        test('should apply light theme CSS variables', () => {
            appSettings.setTheme('light');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--bg-dark', '#f8f9fa');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--text-primary', '#0f172a');
        });

        test('should apply dark theme CSS variables', () => {
            appSettings.setTheme('dark');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--bg-dark', '#0a0a0f');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--text-primary', '#f1f5f9');
        });

        test('should add theme class to body', () => {
            appSettings.setTheme('light');
            expect(document.body.classList.add).toHaveBeenCalledWith('theme-light');
            expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark');
        });

        test('should save theme to localStorage', () => {
            appSettings.setTheme('light');
            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'appSettings',
                expect.stringContaining('"theme":"light"')
            );
        });

        test('should emit themeChanged event', (done) => {
            appSettings.addEventListener('themeChanged', (data) => {
                expect(data.theme).toBe('light');
                done();
            });
            appSettings.setTheme('light');
        });
    });

    describe('Notification Preferences', () => {
        test('should set email notification preference', () => {
            const result = appSettings.setNotificationPreference('email', false);
            expect(result).toBe(true);
            expect(appSettings.getNotificationPreferences().email).toBe(false);
        });

        test('should set push notification preference', () => {
            const result = appSettings.setNotificationPreference('push', false);
            expect(result).toBe(true);
            expect(appSettings.getNotificationPreferences().push).toBe(false);
        });

        test('should set marketing notification preference', () => {
            const result = appSettings.setNotificationPreference('marketing', true);
            expect(result).toBe(true);
            expect(appSettings.getNotificationPreferences().marketing).toBe(true);
        });

        test('should reject unknown notification type', () => {
            const result = appSettings.setNotificationPreference('unknown', true);
            expect(result).toBe(false);
        });

        test('should save notification preferences to localStorage', () => {
            appSettings.setNotificationPreference('email', false);
            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'appSettings',
                expect.stringContaining('"email":false')
            );
        });

        test('should emit notificationPreferenceChanged event', (done) => {
            appSettings.addEventListener('notificationPreferenceChanged', (data) => {
                expect(data.type).toBe('email');
                expect(data.enabled).toBe(false);
                done();
            });
            appSettings.setNotificationPreference('email', false);
        });

        test('should get all notification preferences', () => {
            appSettings.setNotificationPreference('email', false);
            appSettings.setNotificationPreference('marketing', true);
            const prefs = appSettings.getNotificationPreferences();
            expect(prefs.email).toBe(false);
            expect(prefs.push).toBe(true);
            expect(prefs.marketing).toBe(true);
        });
    });

    describe('Display Density', () => {
        test('should set display density to compact', () => {
            const result = appSettings.setDisplayDensity('compact');
            expect(result).toBe(true);
            expect(appSettings.getDisplayDensity()).toBe('compact');
        });

        test('should set display density to comfortable', () => {
            const result = appSettings.setDisplayDensity('comfortable');
            expect(result).toBe(true);
            expect(appSettings.getDisplayDensity()).toBe('comfortable');
        });

        test('should reject unsupported display density', () => {
            const result = appSettings.setDisplayDensity('spacious');
            expect(result).toBe(false);
            expect(appSettings.getDisplayDensity()).toBe('comfortable');
        });

        test('should apply compact density CSS variables', () => {
            appSettings.setDisplayDensity('compact');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--spacing-unit', '0.5rem');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--item-gap', '0.75rem');
        });

        test('should apply comfortable density CSS variables', () => {
            appSettings.setDisplayDensity('comfortable');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--spacing-unit', '1rem');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--item-gap', '1.5rem');
        });

        test('should add density class to body', () => {
            appSettings.setDisplayDensity('compact');
            expect(document.body.classList.add).toHaveBeenCalledWith('density-compact');
            expect(document.body.classList.remove).toHaveBeenCalledWith('density-comfortable');
        });

        test('should save display density to localStorage', () => {
            appSettings.setDisplayDensity('compact');
            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'appSettings',
                expect.stringContaining('"displayDensity":"compact"')
            );
        });

        test('should emit displayDensityChanged event', (done) => {
            appSettings.addEventListener('displayDensityChanged', (data) => {
                expect(data.density).toBe('compact');
                done();
            });
            appSettings.setDisplayDensity('compact');
        });
    });

    describe('Language Selection', () => {
        test('should set language to English', () => {
            const result = appSettings.setLanguage('en');
            expect(result).toBe(true);
            expect(appSettings.getLanguage()).toBe('en');
        });

        test('should set language to Spanish', () => {
            const result = appSettings.setLanguage('es');
            expect(result).toBe(true);
            expect(appSettings.getLanguage()).toBe('es');
        });

        test('should set language to French', () => {
            const result = appSettings.setLanguage('fr');
            expect(result).toBe(true);
            expect(appSettings.getLanguage()).toBe('fr');
        });

        test('should set language to German', () => {
            const result = appSettings.setLanguage('de');
            expect(result).toBe(true);
            expect(appSettings.getLanguage()).toBe('de');
        });

        test('should set language to Japanese', () => {
            const result = appSettings.setLanguage('ja');
            expect(result).toBe(true);
            expect(appSettings.getLanguage()).toBe('ja');
        });

        test('should reject unsupported language', () => {
            const result = appSettings.setLanguage('xx');
            expect(result).toBe(false);
            expect(appSettings.getLanguage()).toBe('en');
        });

        test('should set document language attribute', () => {
            appSettings.setLanguage('es');
            expect(document.documentElement.lang).toBe('es');
        });

        test('should set data-language attribute on body', () => {
            appSettings.setLanguage('fr');
            expect(document.body.setAttribute).toHaveBeenCalledWith('data-language', 'fr');
        });

        test('should save language to localStorage', () => {
            appSettings.setLanguage('de');
            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'appSettings',
                expect.stringContaining('"language":"de"')
            );
        });

        test('should emit languageChanged event', (done) => {
            appSettings.addEventListener('languageChanged', (data) => {
                expect(data.language).toBe('ja');
                done();
            });
            appSettings.setLanguage('ja');
        });

        test('should get supported languages', () => {
            const languages = appSettings.getSupportedLanguages();
            expect(languages.length).toBe(5);
            expect(languages.map(l => l.code)).toContain('en');
            expect(languages.map(l => l.code)).toContain('es');
            expect(languages.map(l => l.code)).toContain('fr');
            expect(languages.map(l => l.code)).toContain('de');
            expect(languages.map(l => l.code)).toContain('ja');
        });
    });

    describe('Settings Persistence', () => {
        test('should save all settings to localStorage', () => {
            appSettings.setTheme('light');
            appSettings.setDisplayDensity('compact');
            appSettings.setLanguage('es');
            appSettings.setNotificationPreference('email', false);

            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'appSettings',
                expect.stringContaining('"theme":"light"')
            );
        });

        test('should emit settingsSaved event', (done) => {
            appSettings.addEventListener('settingsSaved', (data) => {
                expect(data.theme).toBe('light');
                done();
            });
            appSettings.setTheme('light');
        });

        test('should handle localStorage errors gracefully', () => {
            global.localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            appSettings.setTheme('light');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Reset to Defaults', () => {
        test('should reset all settings to defaults', () => {
            appSettings.setTheme('light');
            appSettings.setDisplayDensity('compact');
            appSettings.setLanguage('es');
            appSettings.setNotificationPreference('email', false);

            appSettings.resetToDefaults();

            const settings = appSettings.getSettings();
            expect(settings.theme).toBe('dark');
            expect(settings.displayDensity).toBe('comfortable');
            expect(settings.language).toBe('en');
            expect(settings.notifications.email).toBe(true);
        });

        test('should emit settingsReset event', (done) => {
            appSettings.addEventListener('settingsReset', (data) => {
                expect(data.theme).toBe('dark');
                done();
            });
            appSettings.resetToDefaults();
        });

        test('should apply default theme when resetting', () => {
            appSettings.setTheme('light');
            appSettings.resetToDefaults();
            expect(appSettings.getTheme()).toBe('dark');
        });
    });

    describe('Get Setting', () => {
        test('should get top-level setting', () => {
            appSettings.setTheme('light');
            expect(appSettings.getSetting('theme')).toBe('light');
        });

        test('should get nested setting', () => {
            appSettings.setNotificationPreference('email', false);
            expect(appSettings.getSetting('notifications.email')).toBe(false);
        });

        test('should return undefined for non-existent setting', () => {
            expect(appSettings.getSetting('nonexistent')).toBeUndefined();
        });
    });

    describe('Export and Import', () => {
        test('should export settings as JSON string', () => {
            appSettings.setTheme('light');
            appSettings.setLanguage('es');

            const exported = appSettings.exportSettings();
            const parsed = JSON.parse(exported);

            expect(parsed.theme).toBe('light');
            expect(parsed.language).toBe('es');
        });

        test('should import settings from JSON string', () => {
            const settingsJson = JSON.stringify({
                theme: 'light',
                displayDensity: 'compact',
                language: 'fr',
                notifications: {
                    email: false,
                    push: true,
                    marketing: true
                }
            });

            const result = appSettings.importSettings(settingsJson);
            expect(result).toBe(true);

            const settings = appSettings.getSettings();
            expect(settings.theme).toBe('light');
            expect(settings.displayDensity).toBe('compact');
            expect(settings.language).toBe('fr');
            expect(settings.notifications.email).toBe(false);
        });

        test('should emit settingsImported event', (done) => {
            const settingsJson = JSON.stringify({
                theme: 'light'
            });

            appSettings.addEventListener('settingsImported', (data) => {
                expect(data.theme).toBe('light');
                done();
            });

            appSettings.importSettings(settingsJson);
        });

        test('should handle invalid JSON on import', () => {
            const result = appSettings.importSettings('invalid json');
            expect(result).toBe(false);
        });
    });

    describe('Event Listeners', () => {
        test('should add event listener', () => {
            const callback = jest.fn();
            appSettings.addEventListener('themeChanged', callback);
            appSettings.setTheme('light');
            expect(callback).toHaveBeenCalled();
        });

        test('should remove event listener', () => {
            const callback = jest.fn();
            appSettings.addEventListener('themeChanged', callback);
            appSettings.removeEventListener('themeChanged', callback);
            appSettings.setTheme('light');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should handle multiple event listeners', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            appSettings.addEventListener('themeChanged', callback1);
            appSettings.addEventListener('themeChanged', callback2);
            appSettings.setTheme('light');
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        test('should handle errors in event listeners gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Callback error');
            });
            const normalCallback = jest.fn();

            appSettings.addEventListener('themeChanged', errorCallback);
            appSettings.addEventListener('themeChanged', normalCallback);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            appSettings.setTheme('light');

            expect(consoleSpy).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Immediate Application', () => {
        test('should apply theme immediately without page refresh', () => {
            appSettings.setTheme('light');
            expect(document.documentElement.style.setProperty).toHaveBeenCalled();
            expect(document.body.classList.add).toHaveBeenCalledWith('theme-light');
        });

        test('should apply display density immediately without page refresh', () => {
            appSettings.setDisplayDensity('compact');
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--spacing-unit', '0.5rem');
            expect(document.body.classList.add).toHaveBeenCalledWith('density-compact');
        });

        test('should apply language immediately without page refresh', () => {
            appSettings.setLanguage('es');
            expect(document.documentElement.lang).toBe('es');
            expect(document.body.setAttribute).toHaveBeenCalledWith('data-language', 'es');
        });
    });

    describe('Cleanup', () => {
        test('should destroy instance and clean up', () => {
            const callback = jest.fn();
            appSettings.addEventListener('themeChanged', callback);
            appSettings.destroy();
            appSettings.setTheme('light');
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
