// Глобальные переменные
let currentYear, currentMonth;
let baseSalary, workingDays;
let shiftStart, shiftEnd;
let bonus = 0;
let workedDays = {};

// Ручные переопределения для выходных и праздников
// Хранит кастомные настройки для конкретных дней
let manualOverrides = {
    weekends: {},    // {"2026-02-15": true/false} - принудительно выходной/рабочий
    holidays: {}     // {"2026-02-15": true/false} - принудительно праздник/обычный
};

// Загрузка переопределений из localStorage
function loadManualOverrides() {
    const saved = localStorage.getItem('salaryCalcOverrides');
    if (saved) {
        try {
            manualOverrides = JSON.parse(saved);
        } catch (e) {
            console.error('Ошибка загрузки переопределений:', e);
        }
    }
}

// Сохранение переопределений в localStorage
function saveManualOverrides() {
    localStorage.setItem('salaryCalcOverrides', JSON.stringify(manualOverrides));
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем переопределения
    loadManualOverrides();
    
    // Установка текущего года и месяца
    const today = new Date();
    document.getElementById('year').value = today.getFullYear();
    document.getElementById('month').value = today.getMonth() + 1;
    
    // Обработчики событий
    document.getElementById('year').addEventListener('change', updateCalendar);
    document.getElementById('month').addEventListener('change', updateCalendar);
    document.getElementById('baseSalary').addEventListener('input', calculate);
    document.getElementById('workingDays').addEventListener('input', calculate);
    document.getElementById('shiftStart').addEventListener('change', calculate);
    document.getElementById('shiftEnd').addEventListener('change', calculate);
    document.getElementById('bonus').addEventListener('input', calculate);
    
    // Закрытие контекстного меню при клике вне его
    document.addEventListener('click', function(e) {
        const contextMenu = document.getElementById('dayContextMenu');
        if (contextMenu && !e.target.closest('.day-context-menu')) {
            contextMenu.remove();
        }
    });
    
    // Загрузка календаря при старте
    updateCalendar();
});

// Обновление календаря
async function updateCalendar() {
    currentYear = parseInt(document.getElementById('year').value);
    currentMonth = parseInt(document.getElementById('month').value);
    
    if (!currentYear || !currentMonth) return;
    
    // Получаем праздники
    const holidays = await fetchHolidays(currentYear);
    
    // Генерируем календарь
    generateCalendar(currentYear, currentMonth, holidays);
}

// Получение праздников (российские праздники)
function fetchHolidays(year) {
    // Российские праздничные дни
    const holidays = [
        `${year}-01-01`, `${year}-01-02`, `${year}-01-03`, `${year}-01-04`, 
        `${year}-01-05`, `${year}-01-06`, `${year}-01-07`, `${year}-01-08`, // Новый год
        `${year}-02-23`, // День защитника Отечества
        `${year}-03-08`, // Международный женский день
        `${year}-05-01`, // Праздник Весны и Труда
        `${year}-05-09`, // День Победы
        `${year}-06-12`, // День России
        `${year}-11-04`, // День народного единства
    ];
    
    return Promise.resolve(holidays);
}

// Генерация календаря
function generateCalendar(year, month, holidays) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Заголовки дней недели
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Первый день месяца
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    // Сдвиг для первого дня (понедельник = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;
    
    // Пустые ячейки в начале
    for (let i = 0; i < startDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = formatDate(date);
        const dayOfWeek = date.getDay();
        
        const dayElement = createDayElement(day, dateStr, dayOfWeek, holidays);
        calendar.appendChild(dayElement);
    }
}

// Создание элемента дня
function createDayElement(day, dateStr, dayOfWeek, holidays) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.dataset.date = dateStr;
    
    // Проверка на выходной (с учётом ручных переопределений)
    let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Применяем ручное переопределение для выходных
    if (manualOverrides.weekends[dateStr] !== undefined) {
        isWeekend = manualOverrides.weekends[dateStr];
    }
    
    // Проверка на праздник (с учётом ручных переопределений)
    let isHoliday = holidays.includes(dateStr);
    
    // Применяем ручное переопределение для праздников
    if (manualOverrides.holidays[dateStr] !== undefined) {
        isHoliday = manualOverrides.holidays[dateStr];
    }
    
    if (isWeekend) div.classList.add('weekend');
    if (isHoliday) div.classList.add('holiday');
    
    // Добавляем индикатор ручного изменения
    if (manualOverrides.weekends[dateStr] !== undefined || manualOverrides.holidays[dateStr] !== undefined) {
        div.classList.add('manual-override');
    }
    
    // Номер дня
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    
    // Добавляем иконку если день переопределён вручную
    if (manualOverrides.weekends[dateStr] !== undefined || manualOverrides.holidays[dateStr] !== undefined) {
        const overrideIcon = document.createElement('span');
        overrideIcon.className = 'override-icon';
        overrideIcon.textContent = '✏️';
        overrideIcon.title = 'Изменено вручную';
        dayNumber.appendChild(overrideIcon);
    }
    
    div.appendChild(dayNumber);
    
    // Контролы
    const controls = document.createElement('div');
    controls.className = 'day-controls';
    
    // Поля ввода времени
    const timeInputs = document.createElement('div');
    timeInputs.className = 'time-inputs';
    timeInputs.innerHTML = `
        <label style="font-size: 11px; display: block; margin-bottom: 4px;">Начало:</label>
        <input type="time" class="time-input" data-date="${dateStr}" data-type="start" 
               style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 6px; font-size: 12px;">
        
        <label style="font-size: 11px; display: block; margin-bottom: 4px;">Конец:</label>
        <input type="time" class="time-input" data-date="${dateStr}" data-type="end" 
               style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 6px; font-size: 12px;">
    `;
    controls.appendChild(timeInputs);
    
    // Добавляем обработчики на поля времени
    setTimeout(() => {
        const inputs = div.querySelectorAll('.time-input');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                updateDayFromTimeInputs(dateStr);
            });
        });
    }, 0);
    
    // Коэффициент (только для выходных)
    if (isWeekend || isHoliday) {
        const coefficientDiv = document.createElement('div');
        coefficientDiv.innerHTML = `
            <label style="font-size: 11px; display: block; margin-bottom: 4px;">Коэффициент:</label>
            <select class="day-coefficient" data-date="${dateStr}" 
                    style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
                <option value="1.0">x1.0 - Обычный</option>
                <option value="1.5" selected>x1.5 - Выходной</option>
            </select>
        `;
        controls.appendChild(coefficientDiv);
        
        // Обработчик изменения коэффициента
        setTimeout(() => {
            const select = div.querySelector('.day-coefficient');
            if (select) {
                select.addEventListener('change', function() {
                    updateDayFromTimeInputs(dateStr);
                });
            }
        }, 0);
    }
    
    // Информация о часах
    const hours = document.createElement('div');
    hours.className = 'day-hours';
    hours.id = `hours-${dateStr}`;
    hours.style.marginTop = '8px';
    controls.appendChild(hours);
    
    div.appendChild(controls);
    
    // Добавляем обработчик правого клика для контекстного меню
    div.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showDayContextMenu(e, dateStr, isWeekend, isHoliday);
    });
    
    return div;
}

// Обновление данных дня на основе введённого времени
function updateDayFromTimeInputs(date) {
    const dayElement = document.querySelector(`[data-date="${date}"]`);
    if (!dayElement) return;
    
    const startInput = dayElement.querySelector('.time-input[data-type="start"]');
    const endInput = dayElement.querySelector('.time-input[data-type="end"]');
    
    const startTime = startInput?.value;
    const endTime = endInput?.value;
    
    // Если оба времени не заполнены - удаляем день
    if (!startTime || !endTime) {
        delete workedDays[date];
        dayElement.classList.remove('worked', 'overtime');
        updateDayHours(date);
        calculate();
        return;
    }
    
    // Получаем стандартное время смены
    shiftStart = document.getElementById('shiftStart').value;
    shiftEnd = document.getElementById('shiftEnd').value;
    
    if (!shiftStart || !shiftEnd) {
        alert('Сначала укажите стандартное время смены!');
        return;
    }
    
    // Рассчитываем часы и определяем коэффициенты
    const result = calculateHoursAndCoefficients(startTime, endTime, shiftStart, shiftEnd, date);
    
    // Сохраняем данные
    workedDays[date] = result;
    
    // Визуальное оформление
    dayElement.classList.add('worked');
    if (result.overtimeHours > 0) {
        dayElement.classList.add('overtime');
    } else {
        dayElement.classList.remove('overtime');
    }
    
    updateDayHours(date);
    calculate();
}

// Расчёт часов с учётом переработки
function calculateHoursAndCoefficients(actualStart, actualEnd, standardStart, standardEnd, date) {
    const actualStartTime = parseTime(actualStart);
    const actualEndTime = parseTime(actualEnd);
    const standardStartTime = parseTime(standardStart);
    const standardEndTime = parseTime(standardEnd);
    
    // Расчёт фактической продолжительности
    let actualDuration = actualEndTime - actualStartTime;
    if (actualDuration < 0) actualDuration += 24;
    
    // Вычитаем час обеда ТОЛЬКО если рабочий день 7 часов и более
    if (actualDuration >= 7) {
        actualDuration -= 1;
    }
    actualDuration = Math.max(0, actualDuration);
    
    // Расчёт стандартной продолжительности
    let standardDuration = standardEndTime - standardStartTime;
    if (standardDuration < 0) standardDuration += 24;
    if (standardDuration >= 7) {
        standardDuration -= 1;
    }
    standardDuration = Math.max(0, standardDuration);
    
    // Проверяем, выходной ли это день
    const dayElement = document.querySelector(`[data-date="${date}"]`);
    const isWeekend = dayElement?.classList.contains('weekend') || dayElement?.classList.contains('holiday');
    
    let normalHours = 0;
    let overtimeHours = 0;
    let weekendCoefficient = 1.0;
    
    if (isWeekend) {
        // Для выходных проверяем выбранный коэффициент
        const coeffSelect = dayElement?.querySelector('.day-coefficient');
        weekendCoefficient = coeffSelect ? parseFloat(coeffSelect.value) : 1.5;
        
        // Все часы идут по коэффициенту выходного
        return {
            normalHours: 0,
            overtimeHours: 0,
            weekendHours: actualDuration,
            totalHours: actualDuration,
            weekendCoefficient: weekendCoefficient
        };
    }
    
    // Для будних дней
    if (actualDuration <= standardDuration) {
        // Нет переработки
        normalHours = actualDuration;
        overtimeHours = 0;
    } else {
        // Есть переработка
        normalHours = standardDuration;
        overtimeHours = actualDuration - standardDuration;
    }
    
    return {
        normalHours: normalHours,
        overtimeHours: overtimeHours,
        weekendHours: 0,
        totalHours: actualDuration,
        weekendCoefficient: 1.0
    };
}

// Расчёт часов для дня
function calculateDayHours() {
    shiftStart = document.getElementById('shiftStart').value;
    shiftEnd = document.getElementById('shiftEnd').value;
    
    if (!shiftStart || !shiftEnd) return 0;
    
    const start = parseTime(shiftStart);
    const end = parseTime(shiftEnd);
    
    let hours = end - start;
    if (hours < 0) hours += 24;
    
    // Вычитаем час обеда
    hours -= 1;
    
    return Math.max(0, hours);
}

// Парсинг времени
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

// Обновление отображения часов для дня
function updateDayHours(date) {
    const hoursElement = document.getElementById(`hours-${date}`);
    if (!hoursElement) return;
    
    if (workedDays[date]) {
        const data = workedDays[date];
        let text = '';
        
        if (data.weekendHours > 0) {
            // Выходной день
            text = `${data.weekendHours.toFixed(1)} ч × ${data.weekendCoefficient}`;
        } else {
            // Будний день
            if (data.normalHours > 0) {
                text += `${data.normalHours.toFixed(1)} ч × 1.0`;
            }
            if (data.overtimeHours > 0) {
                if (text) text += '<br>';
                text += `${data.overtimeHours.toFixed(1)} ч × 1.3 (переработка)`;
            }
        }
        
        hoursElement.innerHTML = text;
        hoursElement.style.color = data.overtimeHours > 0 ? '#2563EB' : '#059669';
        hoursElement.style.fontWeight = '600';
    } else {
        hoursElement.innerHTML = '';
    }
}

// Основной расчёт
function calculate() {
    baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
    workingDays = parseInt(document.getElementById('workingDays').value) || 0;
    bonus = parseFloat(document.getElementById('bonus').value) || 0;
    
    if (baseSalary === 0 || workingDays === 0) {
        document.getElementById('results').style.display = 'none';
        return;
    }
    
    // Расчёт стоимости одного часа (базируется на стандартной смене)
    shiftStart = document.getElementById('shiftStart').value;
    shiftEnd = document.getElementById('shiftEnd').value;
    
    if (!shiftStart || !shiftEnd) {
        document.getElementById('results').style.display = 'none';
        return;
    }
    
    const standardHoursPerDay = calculateDayHours();
    const hourlyRate = baseSalary / (workingDays * standardHoursPerDay);
    
    // Сортируем дни по дате для корректной компенсации
    const sortedDates = Object.keys(workedDays).sort();
    
    // Система компенсации: недоработка/переработка переносится на следующие дни
    let compensationBalance = 0; // Накопленный баланс часов (+ переработка, - недоработка)
    
    // Расчёт по отработанным дням
    let totalAmount = 0;
    let totalHours = 0;
    let normalHours = 0;
    let overtimeHours = 0;
    let weekendHours = 0;
    let underworkHours = 0; // Для статистики
    
    const detailRows = [];
    
    for (const date of sortedDates) {
        const data = workedDays[date];
        let dayAmount = 0;
        
        // Для выходных - простой расчёт без компенсации
        if (data.weekendHours > 0) {
            dayAmount = hourlyRate * data.weekendHours * data.weekendCoefficient;
            weekendHours += data.weekendHours;
            totalAmount += dayAmount;
            totalHours += data.totalHours;
            
            detailRows.push({
                date: formatDateRu(date),
                hours: `${data.weekendHours.toFixed(1)} ч`,
                coefficient: `×${data.weekendCoefficient}`,
                amount: dayAmount.toFixed(2),
                note: 'Выходной'
            });
            continue;
        }
        
        // Для будних дней - с системой компенсации
        const standardHours = standardHoursPerDay;
        const actualHours = data.totalHours;
        const difference = actualHours - standardHours;
        
        // Применяем предыдущий баланс к текущему дню
        let effectiveDifference = difference + compensationBalance;
        
        let normalForDay = 0;
        let overtimeForDay = 0;
        let note = '';
        
        if (effectiveDifference <= 0) {
            // Недоработка (даже с учётом баланса)
            normalForDay = actualHours;
            overtimeForDay = 0;
            compensationBalance = effectiveDifference; // Переносим долг на следующий день
            
            if (difference < 0) {
                note = `Недоработка ${Math.abs(difference).toFixed(1)} ч`;
                underworkHours += Math.abs(difference);
            }
            if (compensationBalance < 0) {
                note += compensationBalance < difference ? ` (компенсация ${Math.abs(compensationBalance - difference).toFixed(1)} ч)` : '';
            }
        } else {
            // Есть переработка (с учётом баланса)
            normalForDay = standardHours;
            overtimeForDay = effectiveDifference;
            compensationBalance = 0; // Баланс использован
            
            if (compensationBalance !== 0 && difference > 0) {
                note = `Переработка ${difference.toFixed(1)} ч`;
                if (Math.abs(compensationBalance) > 0.01) {
                    note += ` (компенсация ${Math.abs(compensationBalance).toFixed(1)} ч от предыдущих дней)`;
                }
            } else if (difference > 0) {
                note = `Переработка ${difference.toFixed(1)} ч`;
            }
        }
        
        // Расчёт суммы
        dayAmount += hourlyRate * normalForDay * 1.0;
        dayAmount += hourlyRate * overtimeForDay * 1.3;
        
        normalHours += normalForDay;
        overtimeHours += overtimeForDay;
        totalAmount += dayAmount;
        totalHours += actualHours;
        
        // Формируем строку для таблицы
        let hoursStr = '';
        let coeffStr = '';
        
        if (overtimeForDay > 0) {
            hoursStr = `${normalForDay.toFixed(1)} ч (×1.0) + ${overtimeForDay.toFixed(1)} ч (×1.3)`;
            coeffStr = 'смешанный';
        } else {
            hoursStr = `${normalForDay.toFixed(1)} ч`;
            coeffStr = '×1.0';
        }
        
        detailRows.push({
            date: formatDateRu(date),
            hours: hoursStr,
            coefficient: coeffStr,
            amount: dayAmount.toFixed(2),
            note: note || 'Норма'
        });
    }
    
    // Добавляем премию
    const finalAmount = totalAmount + bonus;
    
    // Обновление отображения
    displayResults(detailRows, {
        totalHours,
        normalHours,
        overtimeHours,
        weekendHours,
        underworkHours,
        totalAmount,
        bonus,
        finalAmount,
        hourlyRate,
        compensationBalance
    });
    
    document.getElementById('results').style.display = 'block';
}

// Отображение результатов
function displayResults(detailRows, summary) {
    // Сводка
    document.getElementById('totalHours').textContent = summary.totalHours.toFixed(1);
    document.getElementById('normalHours').textContent = summary.normalHours.toFixed(1);
    document.getElementById('overtimeHours').textContent = summary.overtimeHours.toFixed(1);
    document.getElementById('weekendHours').textContent = summary.weekendHours.toFixed(1);
    document.getElementById('hourlyRate').textContent = summary.hourlyRate.toFixed(2);
    document.getElementById('totalAmount').textContent = formatMoney(summary.finalAmount);
    
    // Таблица детализации
    const tbody = document.getElementById('detailTableBody');
    tbody.innerHTML = '';
    
    detailRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.hours} ч</td>
            <td>×${row.coefficient}</td>
            <td>${formatMoney(parseFloat(row.amount))} ₽</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Итоговые строки
    if (summary.bonus > 0) {
        tbody.innerHTML += `
            <tr style="border-top: 2px solid var(--gray-300); font-weight: 600;">
                <td colspan="3">Базовая сумма</td>
                <td>${formatMoney(summary.totalAmount)} ₽</td>
            </tr>
            <tr>
                <td colspan="3">Премия</td>
                <td>${formatMoney(summary.bonus)} ₽</td>
            </tr>
            <tr style="background: var(--success); color: white; font-weight: 700; font-size: 16px;">
                <td colspan="3">ИТОГО К ВЫПЛАТЕ</td>
                <td>${formatMoney(summary.finalAmount)} ₽</td>
            </tr>
        `;
    } else {
        tbody.innerHTML += `
            <tr style="background: var(--success); color: white; font-weight: 700; font-size: 16px;">
                <td colspan="3">ИТОГО К ВЫПЛАТЕ</td>
                <td>${formatMoney(summary.finalAmount)} ₽</td>
            </tr>
        `;
    }
}

// Печать результатов
function printResults() {
    window.print();
}

// Печать только сводки
function printSummaryOnly() {
    // Скрываем детализацию
    const detailSection = document.querySelector('.detail-section');
    if (detailSection) {
        detailSection.style.display = 'none';
    }
    
    window.print();
    
    // Возвращаем обратно
    if (detailSection) {
        detailSection.style.display = 'block';
    }
}

// Печать только детализации
function printDetailOnly() {
    // Скрываем сводку
    const summarySection = document.querySelector('.summary-section');
    if (summarySection) {
        summarySection.style.display = 'none';
    }
    
    window.print();
    
    // Возвращаем обратно
    if (summarySection) {
        summarySection.style.display = 'block';
    }
}

/**
 * Показать контекстное меню для дня
 * Позволяет пометить день как выходной/рабочий или праздник
 */
function showDayContextMenu(event, dateStr, isCurrentlyWeekend, isCurrentlyHoliday) {
    // Удаляем старое меню если есть
    const oldMenu = document.getElementById('dayContextMenu');
    if (oldMenu) oldMenu.remove();
    
    // Создаём новое меню
    const menu = document.createElement('div');
    menu.id = 'dayContextMenu';
    menu.className = 'day-context-menu';
    
    // Проверяем есть ли ручные переопределения
    const hasWeekendOverride = manualOverrides.weekends[dateStr] !== undefined;
    const hasHolidayOverride = manualOverrides.holidays[dateStr] !== undefined;
    
    // Форматируем дату для отображения
    const displayDate = formatDateRu(dateStr);
    
    menu.innerHTML = `
        <div class="context-menu-header">${displayDate}</div>
        <div class="context-menu-item" onclick="toggleWeekend('${dateStr}', ${!isCurrentlyWeekend})">
            ${isCurrentlyWeekend ? '✓' : '　'} ${isCurrentlyWeekend ? 'Сделать рабочим' : 'Сделать выходным'}
            ${hasWeekendOverride ? '<span class="override-badge">✏️</span>' : ''}
        </div>
        <div class="context-menu-item" onclick="toggleHoliday('${dateStr}', ${!isCurrentlyHoliday})">
            ${isCurrentlyHoliday ? '✓' : '　'} ${isCurrentlyHoliday ? 'Убрать праздник' : 'Сделать праздником'}
            ${hasHolidayOverride ? '<span class="override-badge">✏️</span>' : ''}
        </div>
        ${(hasWeekendOverride || hasHolidayOverride) ? `
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" onclick="resetDayOverrides('${dateStr}')">
                🔄 Сбросить изменения
            </div>
        ` : ''}
    `;
    
    // Позиционируем меню
    menu.style.position = 'fixed';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    document.body.appendChild(menu);
    
    // Корректируем позицию если меню выходит за границы экрана
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = (event.clientX - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = (event.clientY - rect.height) + 'px';
    }
}

/**
 * Переключить статус выходного дня
 */
function toggleWeekend(dateStr, makeWeekend) {
    manualOverrides.weekends[dateStr] = makeWeekend;
    saveManualOverrides();
    updateCalendar();
    
    // Закрываем меню
    const menu = document.getElementById('dayContextMenu');
    if (menu) menu.remove();
}

/**
 * Переключить статус праздника
 */
function toggleHoliday(dateStr, makeHoliday) {
    manualOverrides.holidays[dateStr] = makeHoliday;
    saveManualOverrides();
    updateCalendar();
    
    // Закрываем меню
    const menu = document.getElementById('dayContextMenu');
    if (menu) menu.remove();
}

/**
 * Сбросить ручные изменения для дня
 */
function resetDayOverrides(dateStr) {
    delete manualOverrides.weekends[dateStr];
    delete manualOverrides.holidays[dateStr];
    saveManualOverrides();
    updateCalendar();
    
    // Закрываем меню
    const menu = document.getElementById('dayContextMenu');
    if (menu) menu.remove();
}

/**
 * Сбросить все ручные переопределения
 */
function resetAllOverrides() {
    if (confirm('Сбросить все ручные изменения выходных и праздников?')) {
        manualOverrides = {
            weekends: {},
            holidays: {}
        };
        saveManualOverrides();
        updateCalendar();
        alert('✅ Все ручные изменения сброшены!');
    }
}

// Вспомогательные функции
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateRu(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
