// Импорт модулей
// const calculator = require('./calculator');
// const logger = require('./logger');
// Импорт парсера
// const parser = require('./parser');

// Глобальные переменные
let currentExpression = ""; // Глобальное выражение для ввода
let hasResult = false;
let currentNumber = "0"; // Переменная для хранения текущего числа
let currentOperation = "";
let currentRegularBrackets = "";
let Pi = 3.1415926535;
let e_const = 2.718281828459; // Переименовано из exp, чтобы избежать конфликта с функцией exp
let countP = 0;
let errorMessage = "error";
let tempExpression = "";
let register1 = "";
let register2 = "";
let registerFlag1 = 0;
let registerFlag2 = 0;
let zapFlag = 0;
let tempRegister = "";
let lgFlag = 0;
let lnFlag = 0;
let sinFlag = 0;
let cosFlag = 0;
let tgFlag = 0;
let arcFlag = 0;
let expFlag = 0;
let vpFlag = false;
let inverseFlag = 0;
let yDegreeFlag = 0;
let quadricSumFlag = 0;
let forZap = "";
let callMemFlag = 0;

let openBrackets = 0;
let closeBrackets = 0;

// История нажатий кнопок для отладки
let buttonHistory = [];
const MAX_HISTORY_LENGTH = 50; // Максимальное количество записей в истории

// Объявляем переменную screenText
let screenText;

// Инициализация логгера
try {
    // logger.initLogger({ level: 'INFO', clearOnInit: false });
    console.log('Логгер инициализирован');
} catch (e) {
    console.error('Ошибка инициализации логгера:', e);
}

/**
 * Логирование нажатия кнопки
 * @param {string} buttonValue - Значение нажатой кнопки
 */
function logButtonPress(buttonValue) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        button: buttonValue,
        currentExpression,
        currentNumber
    };
    
    buttonHistory.push(logEntry);
    
    // Ограничиваем размер истории
    if (buttonHistory.length > MAX_HISTORY_LENGTH) {
        buttonHistory.shift(); // Удаляем самую старую запись
    }
    
    console.log(`[КНОПКА]: ${buttonValue} | Выражение: ${currentExpression} | Число: ${currentNumber}`);
}

/**
 * Вывод истории нажатий кнопок в консоль
 */
function printButtonHistory() {
    console.log('=== ИСТОРИЯ НАЖАТИЙ КНОПОК ===');
    buttonHistory.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.timestamp}] Кнопка: ${entry.button} | Выражение: ${entry.currentExpression} | Число: ${entry.currentNumber}`);
    });
    console.log('==============================');
}

/**
 * Форматирование числа для отображения на экране
 * @param {number|string} number - Число для форматирования
 * @returns {string} - Отформатированное число
 */
function formatNumberAuto(number) {
    if (isNaN(number)) return errorMessage;

    // Преобразуем строку в число (если не уже)
    num = Number(number);
    // Условие для выбора формата
    if(vpFlag&&hasResult){
        num=math.string(math.format(num,{notation:'exponential'}));
        vpFlag=false;
        return num.replace(/[eE]/, " ");
    }else{
        if ((Math.abs(num) >= 1e-9 && Math.abs(num) < 1e9) || Math.abs(num) == 0) {
        return num
            .toFixed(6)
            .replace(/(\.\d*?)0+$/, "$1")
            .replace(/\.$/, ".");
        } else {
        console.log("Exponential conversion has occurred.");

        return num.toExponential(9).replace(/[eE]/, " "); // Экспоненциальный формат с 6 знаками в мантиссе
        }
    }
}

/**
 * Обновление экрана калькулятора
 */
function updateScreen() {
    if (!screenText) {
        console.warn('Элемент экрана не найден');
        return;
    }
    
    const currentReg = currentNumber;
    // Форматируем число в зависимости от значения
    const displayValue = formatNumberAuto(currentReg || "0");
    screenText.textContent = displayValue;
    forZap = displayValue;
    
    // Логирование состояния
    try {
        // logger.logMemoryState({
        //     currentExpression,
        //     currentNumber,
        //     register1,
        //     register2
        // });
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
}

/**
 * Очистка калькулятора
 */
function clearAll() {
    currentExpression = "";
    currentNumber = "";
    currentOperation = "";
    currentRegularBrackets = "";
    lgFlag = lnFlag = sinFlag = cosFlag = tgFlag = arcFlag = expFlag = inverseFlag = yDegreeFlag = 0;
    
    try {
        // logger.logUserAction('clear', 'Очистка калькулятора');
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
    
    updateScreen();
}

/**
 * Обработка ввода пользователя
 * @param {string} value - Введенное значение
 */
function handleInput(value) {
    // Логируем нажатие кнопки
    logButtonPress(value);
    
    try {
        // logger.logUserAction('input', value);
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
    
    switch (true) {
        // Ввод цифр и точки
        case /[0-9.]/.test(value):
            if (zapFlag == 1 && value ==="1"){
                if(forZap.endsWith('.')){
                    forZap=forZap.slice(0,-1);
                }
                register1 = forZap;
                zapFlag = 0;
                break;
            }
            if (zapFlag == 1 && value === "2"){
                if(forZap[-1].endsWith('.')){
                    forZap=forZap.slice(0,-1);
                }
                register2 = forZap;
                zapFlag = 0;
                break;
            }
            if (callMemFlag == 1 && value ==="1"){
                currentNumber = register1;
                callMemFlag = 0;
                break;
            }
            if (callMemFlag == 1 && value === "2"){
                currentNumber = register2;
                callMemFlag = 0;
                break;
            }
            if(hasResult){
                hasResult =false;
                currentNumber="";
                updateScreen();
            }
            if (currentNumber ==="0"){
                if(value==="."){
                    currentNumber+=value;
                }else{
                    currentNumber = value.toString();
                }
            }else{
                currentNumber += value
            }
            
            break;

        // Базовые арифметические операции
        case /[\-+*/]/.test(value):
            if (isOperation(currentOperation)) {
                bracketFlagCheck(currentOperation);
                if(quadricSumFlag == 1){
                    currentExpression=currentExpression+currentNumber+"^2)";
                    quadricSumFlag = 0;
                    currentNumber ="";
                }else{
                    currentOperation = value;
                    currentExpression += value;
                    currentNumber = "";
                }
                break;
            } else {
                currentOperation = value;
                if (currentExpression != currentNumber)
                    currentExpression += currentNumber + value;
                else currentExpression += value;
                currentNumber = "";
                break;
            }
            
        // Скобки
        case /[(]/.test(value):
            currentRegularBrackets += value;
            currentExpression += value;
            break;
            
        case /[)]/.test(value):
            openBrackets = (currentRegularBrackets.match(/\(/g) || []).length;
            closeBrackets = (currentRegularBrackets.match(/\)/g) || []).length;
            if (openBrackets > closeBrackets) {
                currentExpression += currentNumber + value;
            } else if (openBrackets === closeBrackets || openBrackets == 0) {
                currentExpression = "(" + currentExpression+currentNumber + value;
            }
            currentOperation = "";
            currentNumber = "";
            break;

        // Очистка последнего числа (CX)
        case /cx$/.test(value):
            currentNumber = "0";
            break;
            
        // Полная очистка (C)
        case /c$/.test(value):
            clearAll();
            currentNumber = "0";
            break;

        // Константа pi
        case /pi$/.test(value):
            // Если текущее число не пустое, добавляем его в выражение перед π
            if (currentNumber !== "") {
                currentExpression += currentNumber;
                currentNumber = "";
                // Добавляем оператор умножения, если нет другого оператора
                if (!/[\+\-\*\/\(]$/.test(currentExpression)) {
                    currentExpression += "*";
                }
            }
            // Добавляем π в выражение с пробелами для разделения
            // currentExpression += " " + formatNumberAuto(Pi) + " ";
            // Устанавливаем текущее число как π для отображения на экране
            currentNumber = Pi;
            break;
            
        // Функция P (корень из суммы квадратов)
        case /p$/.test(value):
            currentOperation = value;
            const lastIndex = currentExpression.lastIndexOf(currentNumber);
            currentExpression = currentExpression.substring(0,lastIndex)+"sqrt("+currentNumber+"^2+";
            tempExpression = "sqrt(" + currentNumber + "^2+";
            quadricSumFlag = 1;
            currentNumber = "";
            break;
            
        // Инвертирование знака
        case /scienseForm$/.test(value):
            vpFlag=true;
            break;
        case /negate$/.test(value):
            if (currentNumber) {
                currentNumber = (parseFloat(currentNumber) * -1).toString();
                //currentExpression += "(-1)";
            }
            break;
            
        // Логарифм по основанию 10
        case /lg$/.test(value):
            currentOperation = value;
            if (currentExpression.endsWith(")")) {
                temp=extractLastExpression();
                currentExpression = temp.beforeBrackets+"log10" + "("+temp.brackets+")";
            } else {
                console.log("LG CHECK NO BRACKETS )");
                if (currentExpression != currentNumber) {
                    lgFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Натуральный логарифм
        case /ln$/.test(value):
            currentOperation = value;
            if (currentExpression.endsWith(")")) {
                temp=extractLastExpression();
                currentExpression = temp.beforeBrackets+"log" + "("+temp.brackets+")";
            } else {
                console.log("Ln CHECK NO BRACKETS )");
                if (currentExpression != currentNumber) {
                    lnFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Синус
        case /sin$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арксинус
                if (currentExpression.endsWith(")")) {
                    temp = extractLastExpression();
                    currentExpression = temp.beforeBrackets + "asin" + "("+temp.brackets+")";
                } else {
                    sinFlag = 1;
                    bracketFlagCheck("arcsin");
                }
                arcFlag = 0;
            } else {
                // Обычный синус
                if (currentExpression.endsWith(")")) {
                    temp = extractLastExpression();
                    currentExpression = temp.beforeBrackets + "sin" + "("+temp.brackets+")";
                } else {
                    sinFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Косинус
        case /cos$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арккосинус
                if (currentExpression.endsWith(")")) {
                    //extractBrackets(currentExpression);
                    temp =extractLastExpression();
                    //normalizeBrackets();
                    currentExpression = temp.beforeBrackets+ "acos" + "("+temp.brackets+")";
                } else {
                    cosFlag = 1;
                    bracketFlagCheck("arccos");
                }
                arcFlag = 0;
            } else {
                //tmp = extractLastExpression();
                // Обычный косинус
                if (currentExpression.endsWith(")")) {
                    temp =extractLastExpression();
                    currentExpression = temp.beforeBrackets+"cos" + "("+temp.brackets+")";
                } else {
                    cosFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Тангенс
        case /tg$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арктангенс
                if (currentExpression.endsWith(")")) {
                    temp =extractLastExpression();;
                    currentExpression = temp.beforeBrackets + "atan" + "("+temp.brackets+")";
                } else {
                    tgFlag = 1;
                    bracketFlagCheck("arctg");
                }
                arcFlag = 0;
            } else {
                // Обычный тангенс
                if (currentExpression.endsWith(")")) {
                    temp = extractLastExpression();
                    currentExpression = temp.beforeBrackets + "tan" + "("+temp.brackets+")";
                } else {

                    tgFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Режим арк-функций
        case /ark$/.test(value):
            console.log("arc");
            arcFlag = 1;
            console.log(currentExpression);
            break;
            
        // Экспонента (e^x)
        case /exp_degree$/.test(value):
            currentOperation = value;
        
            if (currentExpression.endsWith(")")) {
                temp = extractLastExpression();
                currentExpression =temp.beforeBrackets+ `(${e_const})^` +"("+temp.brackets+")";
            } else {
                expFlag = 1;
                bracketFlagCheck(value);
            }
            currentNumber = "";
            break;
            
        // Обратное число (1/x)
        case /reverse$/.test(value):
            if (currentNumber && currentNumber !== "0") {
                inverseFlag = 1;
                bracketFlagCheck(value);
                currentNumber = "";
            } else if (currentExpression.endsWith(")")) {
                temp = extractLastExpression();
                currentExpression = temp.beforeBrackets + "1/" + "("+temp.brackets+")";
                currentNumber = "";
            }
            break;
            
        // Квадратный корень
        case /sqrt$/.test(value):
            if (currentExpression.endsWith(")")) {
                temp = extractLastExpression;
                currentExpression = temp.beforeBrackets + "sqrt" +"("+temp.brackets+")";
            } else {
                currentExpression += "sqrt(" + currentNumber + ")";
                currentNumber = "";
            }
            break;
            
        // Возведение в степень y
        case /y_degree$/.test(value):
            if (currentNumber) {
                yDegreeFlag = 1;
                tempRegister = currentNumber;
                currentNumber = "";
            }
            break;
            
        // Запись в память (ЗП)
        case /memSave$/.test(value):
            zapFlag = 1;
            try {
                // logger.logMemoryState({ action: 'save', register: 'register1', value: register1 });
            } catch (e) {
                console.error('Ошибка логирования:', e);
            }
            
            break;
            
        // Вызов из памяти (ВП)
        case /callMem$/.test(value):
            callMemFlag = 1;
            try {
                // logger.logMemoryState({ action: 'recall', register: 'register1', value: register1 });
            } catch (e) {
                console.error('Ошибка логирования:', e);
            }
            break;
            
        // Вычисление результата
        case /=$/.test(value):
            if (!currentExpression.endsWith(currentNumber)) {
                if (!currentExpression.endsWith(currentNumber + ")")) {
                    console.log(
                        "= currentExpression не оканчивается на currentNumber\ncurrentNumber:" +
                            currentNumber +
                            "\ncurrentExpression: " +
                            currentExpression
                    );
                    if(quadricSumFlag == 1){
                        currentExpression +=currentNumber+"^2)"
                    }else{
                        currentExpression += currentNumber;
                    }
                }
            }
            checkBrack = bracketCheck(currentExpression);

            while (!(checkBrack == "=")){
                if (checkBrack == ">"){
                    currentExpression += ")";
                } else if (checkBrack == "<"){
                    currentExpression = "(" + currentExpression; // я пока хз работает ли
                }
                checkBrack = bracketCheck(currentExpression);    
            }
            console.log(
            "\nВыражение:",
            currentExpression,
            "\nТекущее число:",
            currentNumber,
            "\nТекущая операция:",
            currentOperation
        );
            calculateResult();
            break;

        default:
            console.warn("Неизвестный ввод: " + value);
            break;
    }
    if (!hasResult){
    updateScreen();
    }
}

function normalizeBrackets() {
    checkBrack = bracketCheck(currentExpression);
    while (!(checkBrack == "=")){
        if (checkBrack == ">"){
            currentExpression += ")";
        } else if (checkBrack == "<"){
            currentExpression = "(" + currentExpression; // я пока хз работает ли
        }    
    }
}

/**
 * Проверка баланса скобок
 * @param {string} brackets - Выражение для проверки
 * @returns {string} - Результат проверки: ">", "=", "<"
 */
function bracketCheck(brackets) {
    openBrackets = (brackets.match(/\(/g) || []).length;
    closeBrackets = (brackets.match(/\)/g) || []).length;
    if (openBrackets > closeBrackets) {
        return ">";
    } else if (openBrackets === closeBrackets) {
        return "=";
    } else if (openBrackets < closeBrackets) {
        return "<";
    }
}

/**
 * Извлечение последней пары скобок из выражения
 * @param {string} expression - Выражение
 * @returns {Object} - Обновленное выражение и последние скобки
 */
function extractBrackets(expression) {
    let updatedExpression = "";
    let lastBrackets = "";
    let stack = [];
    for (let i = expression.length - 1; i > 0; i--) {
        if (expression[i] == "(") {
            stack.push(i);
        }
        if (expression[i] == ")") {
            if (stack.length != 0) {
                stack.pop();
            }
            if (stack.length == 0) {
                updatedExpression = expression.slice(0, i);
                lastBrackets = expression.slice(i, expression.length);
                return { updatedExpression, lastBrackets };
            }
        }
    }
}

/**
 * Обработка флагов для различных операций
 * @param {string} value - Тип операции
 */
function bracketFlagCheck(value) {
    switch (true) {
        case lgFlag == 1:
            currentExpression += "log10(" + currentNumber + ")";
            lgFlag = 0;
            break;
        case lnFlag == 1:
            currentExpression += "log(" + currentNumber + ")";
            lnFlag = 0;
            break;
        case sinFlag == 1:
            if (value === "arcsin") {
                currentExpression += "asin(" + currentNumber + ")";
            } else {
                currentExpression += "sin(" + currentNumber + ")";
            }
            sinFlag = 0;
            break;
        case cosFlag == 1:
            if (value === "arccos") {
                currentExpression += "acos(" + currentNumber + ")";
            } else {
                currentExpression += "cos(" + currentNumber + ")";
            }
            cosFlag = 0;
            break;
        case tgFlag == 1:
            if (value === "arctg") {
                currentExpression += "atan(" + currentNumber + ")";
            } else {
                currentExpression += "tan(" + currentNumber + ")";
            }
            tgFlag = 0;
            break;
        case expFlag == 1:
            currentExpression += `(${e_const})^(` + currentNumber + ")";
            expFlag = 0;
            break;
        case inverseFlag == 1:
            currentExpression += "1/(" + currentNumber + ")";
            inverseFlag = 0;
            break;
        case yDegreeFlag == 1:
            currentExpression += tempRegister + "^(" + currentNumber + ")";
            yDegreeFlag = 0;
            tempRegister = "";
            break;
        default:
            console.warn("Неизвестный ввод (bracketFlagCheck): " + value);
            break;
    }
}

/**
 * Проверка, является ли операция специальной
 * @param {string} operation - Операция для проверки
 * @returns {number} - 1, если операция специальная, иначе 0
 */
function isOperation(operation) {
    if (operation == "p") return 1;
    else return 0;
}

function extractLastExpression(expression=currentExpression) {
    functionList = ['sin', 'cos', 'acos', 'log10', 'ln', 'tan', 'atan', 'sqrt', 'asin',`(${e_const})^`];
    let trimmed = expression.trimEnd();
    let n = trimmed.length;
    
    if (n === 0 || trimmed[n - 1] !== ')') {
        return null;
    }

    let countBrackets = 0;
    let startIndex = -1;

    for (let i = n - 1; i >= 0; i--) {
        if (trimmed[i] === ')') {
            countBrackets++;
        } else if (trimmed[i] === '(') {
            countBrackets--;
        }

        if (countBrackets === 0) {
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1 || countBrackets !== 0) {
        return null;
    }

    let pos = startIndex - 1;
    while (pos >= 0) {
        const char = trimmed[pos];
        if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
            pos--;
        } else {
            break;
        }
    }

    const funcStart = pos + 1;
    const funcName = trimmed.substring(funcStart, startIndex);

    if (funcName && functionList.includes(funcName)) {
        let brackets=trimmed.substring(funcStart);
        let beforeBrackets="";
        return {brackets, beforeBrackets};
    }
    let brackets=trimmed.substring(startIndex);
    let beforeBrackets=trimmed.substring(0,startIndex)
    return {brackets, beforeBrackets};
}

/**
 * Вычисление результата выражения
 */
function calculateResult() {
    try {
        if (currentExpression != "") {
            console.log("Try evaluation:\n" + currentExpression);
            
            // Выводим историю нажатий кнопок перед вычислением
            printButtonHistory();
            
            let result;
            
            // Используем парсер для вычисления выражения
            if (typeof window.parser !== 'undefined' && window.parser) {
                // Преобразуем выражение в токены
                const tokens = window.parser.parseExpression(currentExpression);
                console.log("Parsed tokens:", tokens);
                
                // Вычисляем результат
                result = window.parser.rez(tokens);
            } else if (typeof math !== 'undefined' && math) {
                // Запасной вариант с math.js
                if(currentExpression.includes("cos(acos(")){
                    currentExpression.replaceAll("cos(acos(","((");
                }
                if(currentExpression.includes("acos(cos(")){
                    currentExpression.replaceAll("acos(cos(","((");
                }
                if(currentExpression.includes("sin(asin(")){
                    currentExpression.replaceAll("sin(asin(","((");
                }
                if(currentExpression.includes("asin(sin(")){
                    currentExpression.replaceAll("asin(sin(","((");
                }
                //currentExpression.replace("cos(acos(","((")
                //if (currentExpression.includes("cos(acos(")){
                    //result = math.round(math.evaluate(currentExpression),15);
                //}else{
                    result = math.evaluate(currentExpression);
                //}
            } else {
                throw new Error("Не найдены библиотеки для вычислений");
            }
            
            if (result !== undefined && !isNaN(result)) {
                currentNumber = result;
                currentExpression = "";
                
                try {
                    // logger.logOperation('calculate', [currentExpression], result);
                } catch (e) {
                    console.error('Ошибка логирования:', e);
                }
            } else {
                throw new Error("Результат вычисления некорректен");
            } 
        }
        
        
        try {
            // logger.logError('calculate', error, { expression: currentExpression });
        } catch (e) {
            console.error('Ошибка логирования:', e);
        }
    }catch (error) {
        currentNumber = errorMessage; // Отображение ошибки на экране
        console.error(
            "Ошибка вычисления:",
            error,
            "\nВыражение:",
            currentExpression,
            "\nТекущее число:",
            currentNumber,
            "\nТекущая операция:",
            currentOperation
        );
    }
    console.log("calculation currentNumber: " + currentNumber);
    hasResult=true;
    updateScreen();
    hasResult=true;
}

// Добавляем проверку на существование элементов перед добавлением обработчиков событий
function addEventListenerIfExists(id, eventType, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(eventType, handler);
    }
}

// Инициализация кнопок после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM полностью загружен, инициализация кнопок...');
    
    // Инициализация элемента экрана
    screenText = document.querySelector(".screen_text");
    if (!screenText) {
        console.error('Элемент экрана не найден в DOM');
    }
    
    // Привязываем обработчики событий к кнопкам
    addEventListenerIfExists("btn_0", "click", () => handleInput("0"));
    addEventListenerIfExists("btn_1", "click", () => handleInput("1"));
    addEventListenerIfExists("btn_2", "click", () => handleInput("2"));
    addEventListenerIfExists("btn_3", "click", () => handleInput("3"));
    addEventListenerIfExists("btn_4", "click", () => handleInput("4"));
    addEventListenerIfExists("btn_5", "click", () => handleInput("5"));
    addEventListenerIfExists("btn_6", "click", () => handleInput("6"));
    addEventListenerIfExists("btn_7", "click", () => handleInput("7"));
    addEventListenerIfExists("btn_8", "click", () => handleInput("8"));
    addEventListenerIfExists("btn_9", "click", () => handleInput("9"));
    addEventListenerIfExists("btn_clear", "click", () => handleInput("c"));
    addEventListenerIfExists("btn_dot", "click", () => handleInput("."));
    addEventListenerIfExists("btn_plus", "click", () => handleInput("+"));
    addEventListenerIfExists("btn_minus", "click", () => handleInput("-"));
    addEventListenerIfExists("btn_multiply", "click", () => handleInput("*"));
    addEventListenerIfExists("btn_division", "click", () => handleInput("/"));
    addEventListenerIfExists("btn_left_bracket", "click", () => handleInput("("));
    addEventListenerIfExists("btn_right_bracket", "click", () => handleInput(")"));
    addEventListenerIfExists("btn_equal", "click", () => handleInput("="));
    addEventListenerIfExists("btn_sqrt", "click", () => handleInput("sqrt"));
    addEventListenerIfExists("btn_exp_degree", "click", () => handleInput("exp_degree"));
    addEventListenerIfExists("btn_reverse", "click", () => handleInput("reverse"));
    addEventListenerIfExists("btn_negate", "click", () => handleInput("negate"));
    addEventListenerIfExists("btn_p", "click", () => handleInput("p"));
    addEventListenerIfExists("btn_lg", "click", () => handleInput("lg"));
    addEventListenerIfExists("btn_ln", "click", () => handleInput("ln"));
    addEventListenerIfExists("btn_pi", "click", () => handleInput("pi"));
    addEventListenerIfExists("btn_zap", "click", () => handleInput("memSave"));
    addEventListenerIfExists("btn_vp", "click", () => handleInput("scienseForm"));
    addEventListenerIfExists("btn_sch", "click", () => handleInput("callMem"));
    addEventListenerIfExists("btn_cx", "click", () => handleInput("cx"));
    addEventListenerIfExists("btn_sin", "click", () => handleInput("sin"));
    addEventListenerIfExists("btn_cos", "click", () => handleInput("cos"));
    addEventListenerIfExists("btn_tg", "click", () => handleInput("tg"));
    addEventListenerIfExists("btn_arc", "click", () => handleInput("ark"));
    addEventListenerIfExists("btn_y_degree", "click", () => handleInput("y_degree"));
    
    // Инициализация экрана
    updateScreen();
    
    // Добавляем тестовую функцию для отладки выражений с отрицательными числами
    window.testNegativeExpression = function() {
        clearAll();
        console.log("=== ТЕСТ ВЫРАЖЕНИЯ С ОТРИЦАТЕЛЬНЫМИ ЧИСЛАМИ ===");
        
        // Тест 1: (-1)-896523*3
        currentExpression = "(-1)-896523*3";
        console.log("Тестовое выражение 1:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 2: -1-896523*3
        clearAll();
        currentExpression = "-1-896523*3";
        console.log("Тестовое выражение 2:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 3: (-1)-(896523*3)
        clearAll();
        currentExpression = "(-1)-(896523*3)";
        console.log("Тестовое выражение 3:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 4: -1-(896523*3)
        clearAll();
        currentExpression = "-1-(896523*3)";
        console.log("Тестовое выражение 4:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        console.log("=== КОНЕЦ ТЕСТА ===");
    };
    
    /**
     * Функция для симуляции последовательности нажатий кнопок
     * @param {string} sequence - Последовательность кнопок, разделенная пробелами
     */
    window.simulateKeyPresses = function(sequence) {
        clearAll();
        console.log("=== СИМУЛЯЦИЯ ПОСЛЕДОВАТЕЛЬНОСТИ НАЖАТИЙ КНОПОК ===");
        console.log("Последовательность:", sequence);
        
        // Разбиваем последовательность на отдельные кнопки
        const keys = sequence.split(' ');
        
        // Симулируем нажатие каждой кнопки
        for (const key of keys) {
            console.log(`\nНажатие кнопки: ${key}`);
            console.log(`Состояние до нажатия: currentExpression="${currentExpression}", currentNumber="${currentNumber}"`);
            
            handleInput(key);
            
            console.log(`Состояние после нажатия: currentExpression="${currentExpression}", currentNumber="${currentNumber}"`);
        }
        
        console.log("\n=== РЕЗУЛЬТАТ СИМУЛЯЦИИ ===");
        console.log(`Итоговое выражение: ${currentExpression}`);
        console.log(`Итоговое число на экране: ${currentNumber}`);
        console.log("=== КОНЕЦ СИМУЛЯЦИИ ===");
        
        return {
            expression: currentExpression,
            number: currentNumber
        };
    };
    
    /**
     * Функция для тестирования выражения с отрицательными числами через симуляцию нажатий кнопок
     */
    window.testNegativeExpressionWithKeyPresses = function() {
        console.log("=== ТЕСТ ВЫРАЖЕНИЯ С ОТРИЦАТЕЛЬНЫМИ ЧИСЛАМИ ЧЕРЕЗ СИМУЛЯЦИЮ НАЖАТИЙ ===");
        
        // Тест 1: (-1)-896523*3
        console.log("\nТест 1: (-1)-896523*3");
        window.simulateKeyPresses("( - 1 ) - 8 9 6 5 2 3 * 3 =");
        
        // Тест 2: -1-896523*3
        console.log("\nТест 2: -1-896523*3");
        window.simulateKeyPresses("- 1 - 8 9 6 5 2 3 * 3 =");
        
        // Тест 3: (-1)-(896523*3)
        console.log("\nТест 3: (-1)-(896523*3)");
        window.simulateKeyPresses("( - 1 ) - ( 8 9 6 5 2 3 * 3 ) =");
        
        // Тест 4: -1-(896523*3)
        console.log("\nТест 4: -1-(896523*3)");
        window.simulateKeyPresses("- 1 - ( 8 9 6 5 2 3 * 3 ) =");
        
        console.log("=== КОНЕЦ ТЕСТА ===");
    };
});

// Удаляем тестовую последовательность, которая может мешать работе кнопок
// (() => {
//     currentExpression = "3+4*(7*log10(sqrt(7^2+9^2)*(6-2))+6)";
//     handleInput("=");
//     console.log("Result must be: " + currentExpression + "\n\n");
//     clearAll();
//     handleInput("3");
//     handleInput("+");
//     handleInput("4");
//     handleInput("*");
//     handleInput("(");
//     handleInput("7");
//     handleInput("*");
//     handleInput("(");
//     handleInput("7");
//     handleInput("p");
//     handleInput("9");
//     handleInput("*");
//     handleInput("(");
//     handleInput("6");
//     handleInput("-");
//     handleInput("2");
//     handleInput(")");
//     handleInput(")");
//     handleInput("lg");
//     handleInput("+");
//     handleInput("6");
//     handleInput("=");
//     console.log("result is: " + currentExpression);
//     handleInput("+");
//     handleInput("9");
//     handleInput("=");
//     console.log("aftermath: " + currentExpression);
//     handleInput("+");
//     handleInput("140");
//     handleInput("=");
//     console.log("aftermath 2: " + currentExpression);
//     handleInput("c");
//     handleInput("5");
//     handleInput("4");
//     handleInput("0");
//     handleInput("lg");
//     handleInput("=");
//     console.log("aftermath log10(540): " + currentExpression);
//     handleInput("c");
//     handleInput("1");
//     handleInput("1");
//     handleInput("ln");
//     handleInput("=");
//     console.log("aftermath log(11): " + currentExpression);
//     handleInput("1");
//     handleInput("1");
//     handleInput("*");
//     handleInput("2");
//     handleInput("1");
//     handleInput("=");
// })();
