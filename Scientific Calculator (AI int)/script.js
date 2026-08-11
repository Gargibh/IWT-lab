/**
 * NovaCalc Pro - AI-Powered Scientific Calculator
 * Architecture: ES6 Class-Based Modular Structure
 */

// ==========================================================================
// 1. CalculatorEngine & ScientificEngine
// ==========================================================================
class ScientificEngine {
    static factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (!Number.isInteger(n)) {
            // Gamma function approximation (Lanczos) for non-integer factorials
            return ScientificEngine.gamma(n + 1);
        }
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    static gamma(z) {
        const p = [
            676.5203681218851, -1259.1392167224028,
            771.32342877765313, -176.61502916214059,
            12.507343278686905, -0.13857109526572012,
            9.9843695780195716e-6, 1.5056327351493116e-7
        ];
        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * ScientificEngine.gamma(1 - z));
        z -= 1;
        let x = 0.99999999999980993;
        for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
        const t = z + p.length - 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }

    static gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    static lcm(a, b) {
        if (a === 0 || b === 0) return 0;
        return Math.abs((a * b) / ScientificEngine.gcd(a, b));
    }

    static isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    }

    static primeFactors(n) {
        n = Math.floor(Math.abs(n));
        const factors = [];
        let divisor = 2;
        while (n >= 2) {
            if (n % divisor === 0) {
                factors.push(divisor);
                n = n / divisor;
            } else {
                divisor++;
                if (divisor * divisor > n) {
                    if (n > 1) factors.push(n);
                    break;
                }
            }
        }
        return factors;
    }

    static nPr(n, r) {
        if (r < 0 || r > n) return 0;
        return ScientificEngine.factorial(n) / ScientificEngine.factorial(n - r);
    }

    static nCr(n, r) {
        if (r < 0 || r > n) return 0;
        return ScientificEngine.factorial(n) / (ScientificEngine.factorial(r) * ScientificEngine.factorial(n - r));
    }

    static mean(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    static variance(arr) {
        if (arr.length <= 1) return 0;
        const avg = ScientificEngine.mean(arr);
        return arr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / arr.length;
    }

    static stddev(arr) {
        return Math.sqrt(ScientificEngine.variance(arr));
    }
}

// ==========================================================================
// 2. ExpressionParser & Syntax Validator
// ==========================================================================
class ExpressionParser {
    constructor(angleMode = 'DEG') {
        this.angleMode = angleMode;
    }

    setAngleMode(mode) {
        this.angleMode = mode;
    }

    preprocess(expr) {
        let clean = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/\be\b/g, 'Math.E')
            .replace(/Ans/g, window.lastAnswer || 0);

        // Implicit multiplication: e.g., 2π -> 2*Math.PI, 5(3+2) -> 5*(3+2), 2sin(x) -> 2*sin(x)
        clean = clean.replace(/(\d)(\()|(\))(\d)|(\d)(Math\.PI|Math\.E|[a-zA-Z]+)/g, '$1$3$5*$2$4$6');

        // Handle factorials (e.g., 5! -> ScientificEngine.factorial(5))
        clean = clean.replace(/(\d+|\([^)]+\))!/g, 'ScientificEngine.factorial($1)');

        return clean;
    }

    validateSyntax(expr) {
        let parenBalance = 0;
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') parenBalance++;
            if (expr[i] === ')') parenBalance--;
            if (parenBalance < 0) return `Unmatched closing parenthesis at position ${i + 1}`;
        }
        if (parenBalance > 0) return `Missing ${parenBalance} closing parenthesis ')`;

        if (/[+\-*\/^]{2,}/.test(expr.replace(/\*\*/g, '^'))) {
            return 'Syntax Error: Consecutive operators detected';
        }

        return null; // Valid
    }

    parse(expr) {
        const syntaxErr = this.validateSyntax(expr);
        if (syntaxErr) throw new Error(syntaxErr);

        let sanitized = this.preprocess(expr);

        // Exponentiation operator substitution
        sanitized = sanitized.replace(/\^/g, '**');

        // Contextual scope construction for standard Math & Scientific APIs
        const isDeg = this.angleMode === 'DEG';
        const toRad = (x) => isDeg ? (x * Math.PI) / 180 : x;
        const fromRad = (x) => isDeg ? (x * 180) / Math.PI : x;

        const scope = {
            sin: (x) => Math.sin(toRad(x)),
            cos: (x) => Math.cos(toRad(x)),
            tan: (x) => Math.tan(toRad(x)),
            asin: (x) => fromRad(Math.asin(x)),
            acos: (x) => fromRad(Math.acos(x)),
            atan: (x) => fromRad(Math.atan(x)),
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            log: Math.log10,
            ln: Math.log,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            ScientificEngine: ScientificEngine,
            mean: (...args) => ScientificEngine.mean(args),
            variance: (...args) => ScientificEngine.variance(args),
            stddev: (...args) => ScientificEngine.stddev(args),
            gcd: (a, b) => ScientificEngine.gcd(a, b),
            lcm: (a, b) => ScientificEngine.lcm(a, b),
            nPr: (n, r) => ScientificEngine.nPr(n, r),
            nCr: (n, r) => ScientificEngine.nCr(n, r),
            factors: (n) => ScientificEngine.primeFactors(n).join(', '),
            min: Math.min,
            max: Math.max
        };

        const argNames = Object.keys(scope);
        const argValues = Object.values(scope);

        try {
            const func = new Function(...argNames, `return ${sanitized};`);
            const val = func(...argValues);

            if (typeof val === 'number') {
                if (Number.isNaN(val)) throw new Error('Result is Undefined / NaN');
                if (!Number.isFinite(val)) throw new Error('Division by Zero / Infinity');
            }
            return val;
        } catch (err) {
            throw new Error(err.message || 'Invalid Expression');
        }
    }
}

// ==========================================================================
// 3. HistoryManager & StorageManager
// ==========================================================================
class StorageManager {
    static get(key, fallback) {
        try {
            const item = localStorage.getItem(`novacalc_${key}`);
            return item ? JSON.parse(item) : fallback;
        } catch {
            return fallback;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(`novacalc_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('LocalStorage write failed:', e);
        }
    }
}

class HistoryManager {
    constructor() {
        this.records = StorageManager.get('history', []);
    }

    add(expression, result) {
        const item = {
            id: Date.now(),
            expression,
            result: String(result),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.records.unshift(item);
        if (this.records.length > 100) this.records.pop(); // Cap at 100 entries
        StorageManager.set('history', this.records);
        return item;
    }

    clear() {
        this.records = [];
        StorageManager.set('history', []);
    }

    getAll() {
        return this.records;
    }

    search(query) {
        query = query.toLowerCase();
        return this.records.filter(r => r.expression.toLowerCase().includes(query) || r.result.toLowerCase().includes(query));
    }
}

// ==========================================================================
// 4. MemoryManager
// ==========================================================================
class MemoryManager {
    constructor() {
        this.memory = StorageManager.get('memory', 0);
    }

    clear() {
        this.memory = 0;
        StorageManager.set('memory', 0);
    }

    recall() {
        return this.memory;
    }

    store(val) {
        this.memory = Number(val) || 0;
        StorageManager.set('memory', this.memory);
    }

    add(val) {
        this.memory += Number(val) || 0;
        StorageManager.set('memory', this.memory);
    }

    subtract(val) {
        this.memory -= Number(val) || 0;
        StorageManager.set('memory', this.memory);
    }

    hasValue() {
        return this.memory !== 0;
    }
}

// ==========================================================================
// 5. AIHelper & Math Suite (Offline Engine)
// ==========================================================================
class AIHelper {
    static explain(expression, result) {
        if (!expression) return 'Please enter an expression to analyze.';
        
        let steps = [`Input Calculation: ${expression}`];
        
        if (expression.includes('+')) steps.push('• Operator (+): Performs addition between terms.');
        if (expression.includes('-')) steps.push('• Operator (-): Subtracts subtrahend from minuend.');
        if (expression.includes('×') || expression.includes('*')) steps.push('• Operator (×): Multiplies values together.');
        if (expression.includes('÷') || expression.includes('/')) steps.push('• Operator (÷): Divides numerator by denominator.');
        if (expression.includes('^')) steps.push('• Power (^): Raises base to specified exponent.');
        if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) {
            steps.push('• Trigonometry: Evaluates circular angle function per configured DEG/RAD mode.');
        }

        steps.push(`\nFinal Evaluation: ${result}`);
        return steps.join('\n');
    }

    static convertUnits(query) {
        query = query.trim().toLowerCase();
        
        const lengthMatch = query.match(/^([\d.]+)\s*(km|miles|m|inches|ft|cm)\s*to\s*(km|miles|m|inches|ft|cm)$/);
        if (lengthMatch) {
            const val = parseFloat(lengthMatch[1]);
            const from = lengthMatch[2];
            const to = lengthMatch[3];
            
            // Convert to meters baseline
            const toMeters = { km: 1000, miles: 1609.34, m: 1, inches: 0.0254, ft: 0.3048, cm: 0.01 };
            const fromMeters = { km: 0.001, miles: 0.000621371, m: 1, inches: 39.3701, ft: 3.28084, cm: 100 };
            
            const meters = val * toMeters[from];
            const converted = meters * fromMeters[to];
            return `${val} ${from} = ${converted.toFixed(4)} ${to}`;
        }

        const tempMatch = query.match(/^([\d.]+)\s*(celsius|fahrenheit|c|f)\s*to\s*(celsius|fahrenheit|c|f)$/);
        if (tempMatch) {
            const val = parseFloat(tempMatch[1]);
            const from = tempMatch[2][0];
            const to = tempMatch[3][0];
            let res = val;
            if (from === 'c' && to === 'f') res = (val * 9/5) + 32;
            if (from === 'f' && to === 'c') res = (val - 32) * 5/9;
            return `${val}°${from.toUpperCase()} = ${res.toFixed(2)}°${to.toUpperCase()}`;
        }

        return 'Could not parse conversion. Try: "10 km to miles" or "100 c to f"';
    }

    static solveEquation(eq) {
        eq = eq.replace(/\s+/g, '');
        // Linear: ax + b = c
        const linearMatch = eq.match(/^([+-]?\d*)x([+-]\d+)?=([+-]?\d+)$/);
        if (linearMatch) {
            const a = linearMatch[1] === '' || linearMatch[1] === '+' ? 1 : (linearMatch[1] === '-' ? -1 : parseFloat(linearMatch[1]));
            const b = linearMatch[2] ? parseFloat(linearMatch[2]) : 0;
            const c = parseFloat(linearMatch[3]);
            const x = (c - b) / a;
            return `Linear Equation Detected:\nx = ${x}`;
        }

        // Quadratic: ax^2 + bx + c = 0
        const quadMatch = eq.match(/^([+-]?\d*)x\^2([+-]\d+)?x([+-]\d+)?=0$/);
        if (quadMatch) {
            const a = quadMatch[1] === '' || quadMatch[1] === '+' ? 1 : (quadMatch[1] === '-' ? -1 : parseFloat(quadMatch[1]));
            const b = quadMatch[2] ? parseFloat(quadMatch[2]) : 0;
            const c = quadMatch[3] ? parseFloat(quadMatch[3]) : 0;
            
            const disc = b*b - 4*a*c;
            if (disc < 0) return `Quadratic Equation Solutions:\nComplex Roots (Discriminant < 0)`;
            const x1 = (-b + Math.sqrt(disc)) / (2*a);
            const x2 = (-b - Math.sqrt(disc)) / (2*a);
            return `Quadratic Roots:\nx1 = ${x1}\nx2 = ${x2}`;
        }

        return 'Unsupported equation syntax. Supported formats:\n• Linear: 2x + 5 = 15\n• Quadratic: x^2 + 3x + 2 = 0';
    }

    static simplifyExpression(expr) {
        // Basic linear combination simplifier for terms like 2x + 3x - 4 + x
        expr = expr.replace(/\s+/g, '');
        const terms = expr.match(/[+-]?[^+-]+/g) || [];
        let xCoef = 0;
        let constant = 0;

        terms.forEach(term => {
            if (term.includes('x')) {
                const coefStr = term.replace('x', '');
                if (coefStr === '' || coefStr === '+') xCoef += 1;
                else if (coefStr === '-') xCoef -= 1;
                else xCoef += parseFloat(coefStr);
            } else {
                constant += parseFloat(term);
            }
        });

        let result = '';
        if (xCoef !== 0) result += `${xCoef}x`;
        if (constant !== 0) result += (constant > 0 && xCoef !== 0 ? ` + ${constant}` : ` ${constant}`);
        return `Simplified Form:\n${result || '0'}`;
    }

    static getFormulas() {
        return [
            { title: 'Area of Circle', formula: 'A = π × r²', desc: 'Calculates enclosed area given radius r.' },
            { title: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', desc: 'Finds roots of ax² + bx + c = 0.' },
            { title: 'Pythagorean Theorem', formula: 'c = √(a² + b²)', desc: 'Hypotenuse length of right triangle.' },
            { title: 'Simple Interest', formula: 'I = P × r × t', desc: 'Principal, annual rate, time in years.' },
            { title: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt)', desc: 'Compounded growth over time.' },
            { title: 'Distance Formula', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)', desc: 'Euclidean distance between points.' }
        ];
    }

    static getDictionary() {
        return [
            { term: 'Factorial (!)', def: 'Product of all positive integers less than or equal to n.' },
            { term: 'GCD / HCF', def: 'Greatest Common Divisor shared by integers.' },
            { term: 'LCM', def: 'Least Common Multiple of two or more integers.' },
            { term: 'Variance', def: 'Expectation of the squared deviation of a random variable from its mean.' },
            { term: 'Standard Deviation', def: 'Square root of variance; measure of statistical dispersion.' }
        ];
    }
}

// ==========================================================================
// 6. UIController & App Orchestrator
// ==========================================================================
class UIController {
    constructor() {
        this.parser = new ExpressionParser('DEG');
        this.history = new HistoryManager();
        this.memory = new MemoryManager();

        this.settings = StorageManager.get('settings', {
            theme: 'dark',
            precision: 6,
            separators: true,
            sciThreshold: true,
            sound: false,
            autocopy: false
        });

        this.initDOM();
        this.applySettings();
        this.bindEvents();
        this.renderHistory();
        this.renderFormulas();
        this.renderDictionary();
    }

    initDOM() {
        this.exprInput = document.getElementById('expression-input');
        this.resultDisplay = document.getElementById('result-display');
        this.evalPreview = document.getElementById('eval-preview');
        this.suggestionsRibbon = document.getElementById('smart-suggestions');

        this.historyPanel = document.getElementById('history-panel');
        this.aiPanel = document.getElementById('ai-panel');
        this.settingsModal = document.getElementById('settings-modal');

        this.angleBadge = document.getElementById('angle-mode-indicator');
        this.memoryBadge = document.getElementById('memory-indicator');
        this.baseBadge = document.getElementById('base-mode-indicator');

        this.updateMemoryBadge();
    }

    applySettings() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('setting-theme').value = this.settings.theme;
        document.getElementById('setting-precision').value = this.settings.precision;
        document.getElementById('setting-separators').checked = this.settings.separators;
        document.getElementById('setting-sci-threshold').checked = this.settings.sciThreshold;
        document.getElementById('setting-sound').checked = this.settings.sound;
        document.getElementById('setting-autocopy').checked = this.settings.autocopy;
    }

    bindEvents() {
        // Keypad click handler using Event Delegation
        document.querySelector('.keypad-container').addEventListener('click', (e) => {
            const btn = e.target.closest('.key-btn');
            if (!btn) return;

            this.createRipple(e, btn);
            this.playClickAudio();

            const action = btn.dataset.action;
            const insert = btn.dataset.insert;
            const val = btn.dataset.val;

            if (insert) this.insertText(insert);
            if (action) this.handleAction(action, val);
        });

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Display Live Preview on Typing
        this.exprInput.addEventListener('input', () => {
            this.updateLivePreview();
            this.updateSmartSuggestions();
        });

        // Mode Switching Tabs
        document.querySelectorAll('.mode-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tab = btn.dataset.tab;
                document.getElementById('panel-scientific').classList.toggle('hidden', tab !== 'scientific' && tab !== 'standard');
                document.getElementById('panel-stats').classList.toggle('hidden', tab !== 'stats');
                document.getElementById('panel-programmer').classList.toggle('hidden', tab !== 'programmer');
            });
        });

        // Panels Toggle Buttons
        document.getElementById('btn-toggle-history').addEventListener('click', () => this.historyPanel.classList.toggle('open'));
        document.getElementById('btn-close-history').addEventListener('click', () => this.historyPanel.classList.remove('open'));
        document.getElementById('btn-toggle-ai').addEventListener('click', () => this.aiPanel.classList.toggle('open'));
        document.getElementById('btn-close-ai').addEventListener('click', () => this.aiPanel.classList.remove('open'));

        // Settings Modal Controls
        document.getElementById('btn-toggle-settings').addEventListener('click', () => this.settingsModal.classList.remove('hidden'));
        document.getElementById('btn-close-settings').addEventListener('click', () => this.settingsModal.classList.add('hidden'));

        // Settings Input Listeners
        document.getElementById('setting-theme').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            StorageManager.set('settings', this.settings);
            this.applySettings();
        });

        // AI Assistant Tabs
        document.querySelectorAll('.ai-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ai-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(`aitab-${btn.dataset.aitab}`).classList.add('active');
            });
        });

        // AI Action Buttons
        document.getElementById('btn-ai-explain').addEventListener('click', () => {
            const expr = this.exprInput.value;
            const res = this.resultDisplay.textContent;
            document.getElementById('ai-explanation-output').textContent = AIHelper.explain(expr, res);
        });

        document.getElementById('btn-solve-eq').addEventListener('click', () => {
            const input = document.getElementById('solver-input').value;
            document.getElementById('ai-solver-output').textContent = AIHelper.solveEquation(input);
        });

        document.getElementById('btn-simplify-eq').addEventListener('click', () => {
            const input = document.getElementById('solver-input').value;
            document.getElementById('ai-solver-output').textContent = AIHelper.simplifyExpression(input);
        });

        document.getElementById('btn-convert').addEventListener('click', () => {
            const input = document.getElementById('converter-input').value;
            document.getElementById('ai-converter-output').textContent = AIHelper.convertUnits(input);
        });

        // Speech Recognition API Integration
        document.getElementById('btn-voice-convert').addEventListener('click', () => {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.onstart = () => { document.getElementById('converter-input').placeholder = 'Listening...'; };
                recognition.onresult = (e) => {
                    const transcript = e.results[0][0].transcript;
                    document.getElementById('converter-input').value = transcript;
                    document.getElementById('ai-converter-output').textContent = AIHelper.convertUnits(transcript);
                };
                recognition.start();
            } else {
                alert('Speech Recognition is not supported in this browser.');
            }
        });

        // History Actions
        document.getElementById('btn-clear-history').addEventListener('click', () => {
            this.history.clear();
            this.renderHistory();
        });

        document.getElementById('history-search').addEventListener('input', (e) => {
            this.renderHistory(e.target.value);
        });
    }

    insertText(text) {
        const start = this.exprInput.selectionStart;
        const end = this.exprInput.selectionEnd;
        const val = this.exprInput.value;

        this.exprInput.value = val.substring(0, start) + text + val.substring(end);
        this.exprInput.focus();
        this.exprInput.selectionStart = this.exprInput.selectionEnd = start + text.length;

        this.updateLivePreview();
        this.updateSmartSuggestions();
    }

    handleAction(action, val) {
        switch (action) {
            case 'clear':
                this.exprInput.value = '';
                this.resultDisplay.textContent = '0';
                this.evalPreview.textContent = '';
                this.suggestionsRibbon.innerHTML = '';
                break;

            case 'backspace':
                const start = this.exprInput.selectionStart;
                const valStr = this.exprInput.value;
                if (start > 0) {
                    this.exprInput.value = valStr.substring(0, start - 1) + valStr.substring(start);
                    this.exprInput.selectionStart = this.exprInput.selectionEnd = start - 1;
                }
                this.updateLivePreview();
                break;

            case 'calculate':
                this.evaluateMain();
                break;

            case 'toggle-angle':
                const current = this.parser.angleMode;
                const next = current === 'DEG' ? 'RAD' : 'DEG';
                this.parser.setAngleMode(next);
                this.angleBadge.textContent = next;
                document.getElementById('btn-deg-rad').textContent = next;
                this.updateLivePreview();
                break;

            case 'toggle-sign':
                if (this.exprInput.value.startsWith('-')) {
                    this.exprInput.value = this.exprInput.value.substring(1);
                } else {
                    this.exprInput.value = '-' + this.exprInput.value;
                }
                this.updateLivePreview();
                break;

            // Memory Actions
            case 'mc': this.memory.clear(); this.updateMemoryBadge(); break;
            case 'mr': this.insertText(String(this.memory.recall())); break;
            case 'ms': this.memory.store(this.resultDisplay.textContent); this.updateMemoryBadge(); break;
            case 'm-plus': this.memory.add(this.resultDisplay.textContent); this.updateMemoryBadge(); break;
            case 'm-minus': this.memory.subtract(this.resultDisplay.textContent); this.updateMemoryBadge(); break;

            // Programmer Base Conversion
            case 'base':
                const num = parseFloat(this.resultDisplay.textContent) || 0;
                this.baseBadge.textContent = val;
                if (val === 'HEX') this.resultDisplay.textContent = Math.floor(num).toString(16).toUpperCase();
                if (val === 'BIN') this.resultDisplay.textContent = Math.floor(num).toString(2);
                if (val === 'OCT') this.resultDisplay.textContent = Math.floor(num).toString(8);
                if (val === 'DEC') this.resultDisplay.textContent = String(Math.floor(num));
                break;
            case 'prime-check':
                const n = parseFloat(this.resultDisplay.textContent);
                this.resultDisplay.textContent = ScientificEngine.isPrime(n) ? 'Prime Number' : 'Not Prime';
                break;
        }
    }

    evaluateMain() {
        const expr = this.exprInput.value.trim();
        if (!expr) return;

        try {
            const rawRes = this.parser.parse(expr);
            let formatted = rawRes;

            if (typeof rawRes === 'number') {
                const prec = parseInt(this.settings.precision, 10);
                formatted = Number(rawRes.toFixed(prec));

                if (this.settings.sciThreshold && (Math.abs(formatted) >= 1e9 || (Math.abs(formatted) < 1e-6 && formatted !== 0))) {
                    formatted = rawRes.toExponential(4);
                } else if (this.settings.separators) {
                    formatted = formatted.toLocaleString('en-US', { maximumFractionDigits: prec });
                }
            }

            this.resultDisplay.textContent = formatted;
            this.resultDisplay.classList.add('fade-in');
            setTimeout(() => this.resultDisplay.classList.remove('fade-in'), 200);

            window.lastAnswer = rawRes;
            this.history.add(expr, formatted);
            this.renderHistory();

            if (this.settings.autocopy) {
                navigator.clipboard.writeText(String(formatted));
            }

        } catch (err) {
            this.resultDisplay.textContent = 'Error';
            this.evalPreview.textContent = err.message;
        }
    }

    updateLivePreview() {
        const expr = this.exprInput.value.trim();
        if (!expr) {
            this.evalPreview.textContent = '';
            return;
        }
        try {
            const val = this.parser.parse(expr);
            this.evalPreview.textContent = `= ${val}`;
        } catch {
            this.evalPreview.textContent = '';
        }
    }

    updateSmartSuggestions() {
        const expr = this.exprInput.value.trim();
        this.suggestionsRibbon.innerHTML = '';
        if (!expr) return;

        const num = parseFloat(expr);
        if (!isNaN(num)) {
            const suggestions = [
                { label: `√${num}`, insert: `sqrt(${num})` },
                { label: `${num}!`, insert: `${num}!` },
                { label: `BIN`, action: () => { this.resultDisplay.textContent = Math.floor(num).toString(2); } },
                { label: `HEX`, action: () => { this.resultDisplay.textContent = Math.floor(num).toString(16).toUpperCase(); } }
            ];

            suggestions.forEach(s => {
                const chip = document.createElement('span');
                chip.className = 'suggestion-chip';
                chip.textContent = s.label;
                chip.onclick = () => {
                    if (s.insert) {
                        this.exprInput.value = s.insert;
                        this.evaluateMain();
                    } else if (s.action) s.action();
                };
                this.suggestionsRibbon.appendChild(chip);
            });
        }
    }

    updateMemoryBadge() {
        this.memoryBadge.classList.toggle('hidden', !this.memory.hasValue());
    }

    renderHistory(query = '') {
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        const records = query ? this.history.search(query) : this.history.getAll();

        if (records.length === 0) {
            list.innerHTML = '<span class="placeholder-text">No history records found.</span>';
            return;
        }

        records.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="history-expr">${item.expression}</div>
                <div class="history-res">${item.result}</div>
            `;
            card.onclick = () => {
                this.exprInput.value = item.expression;
                this.resultDisplay.textContent = item.result;
            };
            list.appendChild(card);
        });
    }

    renderFormulas() {
        const container = document.getElementById('formula-list');
        const formulas = AIHelper.getFormulas();
        container.innerHTML = formulas.map(f => `
            <div class="formula-item">
                <div class="formula-title">${f.title}</div>
                <div class="formula-body">
                    <strong>${f.formula}</strong><br>
                    <span>${f.desc}</span>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.formula-item').forEach(el => {
            el.onclick = () => el.classList.toggle('open');
        });
    }

    renderDictionary() {
        const container = document.getElementById('dict-output');
        const dict = AIHelper.getDictionary();
        container.innerHTML = dict.map(d => `
            <div class="dict-item">
                <div class="dict-title">${d.term}</div>
                <div class="dict-body">${d.def}</div>
            </div>
        `).join('');

        container.querySelectorAll('.dict-item').forEach(el => {
            el.onclick = () => el.classList.toggle('open');
        });
    }

    handleKeyboard(e) {
        if (document.activeElement.tagName === 'INPUT' && document.activeElement.id !== 'expression-input') return;

        if (e.key >= '0' && e.key <= '9') this.insertText(e.key);
        else if (['+', '-', '*', '/', '(', ')', '.', '^', '%', '!'].includes(e.key)) this.insertText(e.key);
        else if (e.key === 'Enter') { e.preventDefault(); this.evaluateMain(); }
        else if (e.key === 'Backspace') { e.preventDefault(); this.handleAction('backspace'); }
        else if (e.key === 'Escape') this.handleAction('clear');
        else if (e.ctrlKey && e.key === 'h') { e.preventDefault(); this.historyPanel.classList.toggle('open'); }
        else if (e.ctrlKey && e.key === '/') { e.preventDefault(); this.aiPanel.classList.toggle('open'); }
    }

    createRipple(e, btn) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 400);
    }

    playClickAudio() {
        if (!this.settings.sound) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {
            // Audio Context blocked or unsupported
        }
    }
}

// Instantiate Application on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UIController();
});