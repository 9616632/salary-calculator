/**
 * ========================================
 * ПАНЕЛЬ НАСТРОЕК ИНТЕРФЕЙСА
 * ========================================
 * Позволяет пользователям настраивать цвета и внешний вид калькулятора
 */

// Загрузка сохранённых настроек при старте
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeSettingsPanel();
});

/**
 * Инициализация панели настроек
 * Создаёт всплывающее окно с настройками
 */
function initializeSettingsPanel() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    
    // Открытие панели
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            settingsPanel.style.display = 'block';
        });
    }
    
    // Закрытие панели
    if (closeSettings) {
        closeSettings.addEventListener('click', function() {
            settingsPanel.style.display = 'none';
        });
    }
    
    // Закрытие при клике вне панели
    window.addEventListener('click', function(e) {
        if (e.target === settingsPanel) {
            settingsPanel.style.display = 'none';
        }
    });
    
    // Обработчики изменения настроек
    document.getElementById('primaryColor')?.addEventListener('input', updatePrimaryColor);
    document.getElementById('successColor')?.addEventListener('input', updateSuccessColor);
    document.getElementById('weekendColor')?.addEventListener('input', updateWeekendColor);
    document.getElementById('holidayColor')?.addEventListener('input', updateHolidayColor);
    document.getElementById('overtimeColor')?.addEventListener('input', updateOvertimeColor);
    document.getElementById('themeMode')?.addEventListener('change', updateThemeMode);
    document.getElementById('fontSize')?.addEventListener('input', updateFontSize);
    
    // Кнопка сброса
    document.getElementById('resetSettings')?.addEventListener('click', resetSettings);
}

/**
 * Обновление основного цвета (Primary Color)
 * Используется для кнопок, ссылок, активных элементов
 */
function updatePrimaryColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--primary', color);
    saveSettings();
}

/**
 * Обновление цвета успеха (Success Color)
 * Используется для отработанных дней, итоговых сумм
 */
function updateSuccessColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--success', color);
    saveSettings();
}

/**
 * Обновление цвета выходных (Weekend Color)
 * Фон для субботы и воскресенья
 */
function updateWeekendColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--weekend', color);
    saveSettings();
}

/**
 * Обновление цвета праздников (Holiday Color)
 * Фон для праздничных дней
 */
function updateHolidayColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--holiday', color);
    saveSettings();
}

/**
 * Обновление цвета переработок (Overtime Color)
 * Фон для дней с переработкой
 */
function updateOvertimeColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--overtime', color);
    saveSettings();
}

/**
 * Переключение темы (светлая/тёмная)
 * TODO: Добавить полноценную тёмную тему
 */
function updateThemeMode(e) {
    const mode = e.target.value;
    document.body.setAttribute('data-theme', mode);
    saveSettings();
}

/**
 * Обновление размера шрифта
 * Применяется ко всему приложению
 */
function updateFontSize(e) {
    const size = e.target.value;
    document.documentElement.style.fontSize = size + 'px';
    document.getElementById('fontSizeValue').textContent = size + 'px';
    saveSettings();
}

/**
 * Сохранение настроек в localStorage
 * Настройки сохраняются локально в браузере
 */
function saveSettings() {
    const settings = {
        primaryColor: document.getElementById('primaryColor')?.value,
        successColor: document.getElementById('successColor')?.value,
        weekendColor: document.getElementById('weekendColor')?.value,
        holidayColor: document.getElementById('holidayColor')?.value,
        overtimeColor: document.getElementById('overtimeColor')?.value,
        themeMode: document.getElementById('themeMode')?.value,
        fontSize: document.getElementById('fontSize')?.value
    };
    
    localStorage.setItem('salaryCalcSettings', JSON.stringify(settings));
}

/**
 * Загрузка настроек из localStorage
 * Применяет сохранённые настройки при запуске
 */
function loadSettings() {
    const savedSettings = localStorage.getItem('salaryCalcSettings');
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Применяем цвета
            if (settings.primaryColor) {
                document.documentElement.style.setProperty('--primary', settings.primaryColor);
                if (document.getElementById('primaryColor')) {
                    document.getElementById('primaryColor').value = settings.primaryColor;
                }
            }
            
            if (settings.successColor) {
                document.documentElement.style.setProperty('--success', settings.successColor);
                if (document.getElementById('successColor')) {
                    document.getElementById('successColor').value = settings.successColor;
                }
            }
            
            if (settings.weekendColor) {
                document.documentElement.style.setProperty('--weekend', settings.weekendColor);
                if (document.getElementById('weekendColor')) {
                    document.getElementById('weekendColor').value = settings.weekendColor;
                }
            }
            
            if (settings.holidayColor) {
                document.documentElement.style.setProperty('--holiday', settings.holidayColor);
                if (document.getElementById('holidayColor')) {
                    document.getElementById('holidayColor').value = settings.holidayColor;
                }
            }
            
            if (settings.overtimeColor) {
                document.documentElement.style.setProperty('--overtime', settings.overtimeColor);
                if (document.getElementById('overtimeColor')) {
                    document.getElementById('overtimeColor').value = settings.overtimeColor;
                }
            }
            
            if (settings.fontSize) {
                document.documentElement.style.fontSize = settings.fontSize + 'px';
                if (document.getElementById('fontSize')) {
                    document.getElementById('fontSize').value = settings.fontSize;
                    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
                }
            }
            
            if (settings.themeMode) {
                document.body.setAttribute('data-theme', settings.themeMode);
                if (document.getElementById('themeMode')) {
                    document.getElementById('themeMode').value = settings.themeMode;
                }
            }
            
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e);
        }
    }
}

/**
 * Сброс настроек к значениям по умолчанию
 * Возвращает стандартную цветовую схему
 */
function resetSettings() {
    // Значения по умолчанию
    const defaults = {
        primaryColor: '#4F46E5',
        successColor: '#10B981',
        weekendColor: '#FEE2E2',
        holidayColor: '#FEF3C7',
        overtimeColor: '#DBEAFE',
        themeMode: 'light',
        fontSize: 16
    };
    
    // Применяем значения по умолчанию
    document.documentElement.style.setProperty('--primary', defaults.primaryColor);
    document.documentElement.style.setProperty('--success', defaults.successColor);
    document.documentElement.style.setProperty('--weekend', defaults.weekendColor);
    document.documentElement.style.setProperty('--holiday', defaults.holidayColor);
    document.documentElement.style.setProperty('--overtime', defaults.overtimeColor);
    document.documentElement.style.fontSize = defaults.fontSize + 'px';
    document.body.setAttribute('data-theme', defaults.themeMode);
    
    // Обновляем значения в полях
    if (document.getElementById('primaryColor')) document.getElementById('primaryColor').value = defaults.primaryColor;
    if (document.getElementById('successColor')) document.getElementById('successColor').value = defaults.successColor;
    if (document.getElementById('weekendColor')) document.getElementById('weekendColor').value = defaults.weekendColor;
    if (document.getElementById('holidayColor')) document.getElementById('holidayColor').value = defaults.holidayColor;
    if (document.getElementById('overtimeColor')) document.getElementById('overtimeColor').value = defaults.overtimeColor;
    if (document.getElementById('fontSize')) document.getElementById('fontSize').value = defaults.fontSize;
    if (document.getElementById('fontSizeValue')) document.getElementById('fontSizeValue').textContent = defaults.fontSize + 'px';
    if (document.getElementById('themeMode')) document.getElementById('themeMode').value = defaults.themeMode;
    
    // Сохраняем
    saveSettings();
    
    alert('✅ Настройки сброшены к значениям по умолчанию!');
}
