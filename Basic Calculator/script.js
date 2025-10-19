class CuteCalculator {
    constructor() {
        this.currentInput = '0';
        this.expression = '';
        this.shouldResetDisplay = false;
        this.history = [];
        this.isHistoryVisible = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initializeTheme();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Button events
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputNumber(e.target.dataset.number);
                this.addRippleEffect(e.target);
            });
        });
        
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleOperator(action);
                this.addRippleEffect(e.target);
            });
        });
        
        document.querySelector('.btn-equals').addEventListener('click', (e) => {
            this.calculate();
            this.addRippleEffect(e.target);
        });
        
        document.querySelector('.btn-clear').addEventListener('click', (e) => {
            this.clear();
            this.addRippleEffect(e.target);
        });
        
        // Theme selector events
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeTheme(e.target.dataset.theme);
            });
        });
        
        // History events
        document.getElementById('historyToggle').addEventListener('click', () => {
            this.toggleHistory();
        });
        
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    addRippleEffect(element) {
        const ripple = element.querySelector('::before');
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = null;
        
        // Add a subtle bounce effect
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
    }
    
    inputNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentInput = '';
            this.shouldResetDisplay = false;
        }
        
        if (num === '.') {
            if (this.currentInput.includes('.')) return;
            if (this.currentInput === '') this.currentInput = '0';
        }
        
        if (this.currentInput === '0' && num !== '.') {
            this.currentInput = num;
        } else {
            this.currentInput += num;
        }
        
        this.updateDisplay();
    }
    
    handleOperator(action) {
        switch (action) {
            case 'backspace':
                this.backspace();
                break;
            case '±':
                this.toggleSign();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.inputOperator(action);
                break;
        }
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    toggleSign() {
        if (this.currentInput !== '0') {
            if (this.currentInput.startsWith('-')) {
                this.currentInput = this.currentInput.slice(1);
            } else {
                this.currentInput = '-' + this.currentInput;
            }
            this.updateDisplay();
        }
    }
    
    inputOperator(operator) {
        if (this.expression && !this.shouldResetDisplay) {
            this.calculate();
        }
        
        this.expression = this.currentInput + ' ' + this.getOperatorSymbol(operator) + ' ';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }
    
    getOperatorSymbol(operator) {
        switch (operator) {
            case '*': return '×';
            case '/': return '÷';
            default: return operator;
        }
    }
    
    calculate() {
        if (!this.expression) return;
        
        const fullExpression = this.expression + this.currentInput;
        const cleanExpression = fullExpression.replace(/×/g, '*').replace(/÷/g, '/');
        
        try {
            const result = Function('"use strict"; return (' + cleanExpression + ')')();
            
            if (!isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            
            // Add to history
            this.addToHistory(fullExpression, result);
            
            this.currentInput = this.formatResult(result);
            this.expression = '';
            this.shouldResetDisplay = true;
            
            // Add success animation
            this.animateResult();
            
        } catch (error) {
            this.showError();
        }
        
        this.updateDisplay();
    }
    
    formatResult(result) {
        // Handle very large or very small numbers
        if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return result.toExponential(6);
        }
        
        // Round to avoid floating point errors
        const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
        return rounded.toString();
    }
    
    animateResult() {
        const resultDisplay = document.getElementById('resultDisplay');
        resultDisplay.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            resultDisplay.style.animation = '';
        }, 300);
    }
    
    showError() {
        const resultDisplay = document.getElementById('resultDisplay');
        this.currentInput = 'Error';
        this.expression = '';
        this.shouldResetDisplay = true;
        
        resultDisplay.classList.add('error');
        setTimeout(() => {
            resultDisplay.classList.remove('error');
            this.clear();
        }, 2000);
    }
    
    clear() {
        this.currentInput = '0';
        this.expression = '';
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('expressionDisplay').textContent = this.expression || '0';
        document.getElementById('resultDisplay').textContent = this.currentInput;
    }
    
    // History Management
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: this.formatResult(result),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 20 calculations
        if (this.history.length > 20) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyContent = document.getElementById('historyContent');
        
        if (this.history.length === 0) {
            historyContent.innerHTML = '<div class="empty-history">No calculations yet! 🌸</div>';
            return;
        }
        
        historyContent.innerHTML = this.history.map(item => `
            <div class="history-item" data-result="${item.result}">
                <div class="expression">${item.expression}</div>
                <div class="result">= ${item.result}</div>
            </div>
        `).join('');
        
        // Add click events to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentInput = item.dataset.result;
                this.expression = '';
                this.shouldResetDisplay = false;
                this.updateDisplay();
                this.toggleHistory(); // Hide history after selection
            });
        });
    }
    
    toggleHistory() {
        const historyPanel = document.getElementById('historyPanel');
        const historyToggle = document.getElementById('historyToggle');
        
        this.isHistoryVisible = !this.isHistoryVisible;
        
        if (this.isHistoryVisible) {
            historyPanel.classList.add('show');
            historyToggle.classList.add('active');
        } else {
            historyPanel.classList.remove('show');
            historyToggle.classList.remove('active');
        }
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        
        // Add cute animation feedback
        const clearBtn = document.getElementById('clearHistory');
        clearBtn.textContent = 'Cleared! ✨';
        setTimeout(() => {
            clearBtn.textContent = 'Clear All';
        }, 1500);
    }
    
    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme') || 'pink';
        this.changeTheme(savedTheme);
    }
    
    changeTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        // Save theme preference
        localStorage.setItem('calculatorTheme', theme);
        
        // Add theme change animation
        document.body.style.animation = 'fadeIn 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    // Keyboard Support
    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        if (/[0-9.]/.test(key)) {
            this.inputNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.inputOperator(key);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === 'h' || key === 'H') {
            this.toggleHistory();
        }
    }
}



// Additional animations and effects
const addFloatingHearts = () => {
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'floating-hearts';
    document.body.appendChild(heartsContainer);
    
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = ['💕', '💖', '💝', '🌸', '✨'][Math.floor(Math.random() * 5)];
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
            heartsContainer.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }
    }, 1000);
};

// CSS for floating hearts (to be added to styles.css)
const floatingHeartsCSS = `
.floating-hearts {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.floating-heart {
    position: absolute;
    top: 100%;
    font-size: 1.5rem;
    opacity: 0.7;
    animation: floatUp linear forwards;
}

@keyframes floatUp {
    to {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;

// Add the floating hearts CSS to the page
const style = document.createElement('style');
style.textContent = floatingHeartsCSS;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CuteCalculator();
    addFloatingHearts();
    
    // Add welcome animation
    setTimeout(() => {
        const calculatorCard = document.querySelector('.calculator-card');
        calculatorCard.style.animation = 'bounce 0.6s ease-out';
        setTimeout(() => {
            calculatorCard.style.animation = '';
        }, 600);
    }, 500);
});

// Add bounce animation CSS
const bounceCSS = `
@keyframes bounce {
    0%, 20%, 60%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    80% {
        transform: translateY(-5px);
    }
}
`;

const bounceStyle = document.createElement('style');
bounceStyle.textContent = bounceCSS;
document.head.appendChild(bounceStyle);

// Easter egg: Double-click on title for surprise
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.calculator-title');
    let clickCount = 0;
    
    title.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 2) {
            // Create confetti effect
            createConfetti();
            clickCount = 0;
        }
        setTimeout(() => clickCount = 0, 1000);
    });
});

const createConfetti = () => {
    const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff91a4'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: 0;
            left: ${Math.random() * 100}%;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 1000;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
};

// Add confetti animation CSS
const confettiCSS = `
@keyframes confettiFall {
    to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

const confettiStyle = document.createElement('style');
confettiStyle.textContent = confettiCSS;
document.head.appendChild(confettiStyle);