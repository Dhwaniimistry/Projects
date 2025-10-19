class CountdownTimer {
    constructor() {
        this.timer = null;
        this.targetTime = null;
        this.isRunning = false;
        
        this.initElements();
        this.bindEvents();
        this.loadFromStorage();
    }
    
    initElements() {
        this.form = document.getElementById('countdown-form');
        this.targetDateInput = document.getElementById('target-date');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.newCountdownBtn = document.getElementById('new-countdown-btn');
        
        this.timerDisplay = document.getElementById('timer-display');
        this.finishedMessage = document.getElementById('finished-message');
        
        this.daysElement = document.getElementById('days');
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        
        this.timeUnits = document.querySelectorAll('.time-unit');
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleStart(e));
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.newCountdownBtn.addEventListener('click', () => this.resetTimer());
        
        // Set minimum date to current date and time
        this.setMinimumDate();
    }
    
    setMinimumDate() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        this.targetDateInput.min = localDateTime;
    }
    
    handleStart(e) {
        e.preventDefault();
        
        const targetDateValue = this.targetDateInput.value;
        if (!targetDateValue) {
            this.showMessage('Please select a date and time!', 'error');
            return;
        }
        
        this.targetTime = new Date(targetDateValue).getTime();
        const currentTime = new Date().getTime();
        
        if (this.targetTime <= currentTime) {
            this.showMessage('Please select a future date and time!', 'error');
            return;
        }
        
        this.startCountdown();
        this.saveToStorage();
    }
    
    startCountdown() {
        this.isRunning = true;
        this.showTimerDisplay();
        
        // Update immediately
        this.updateTimer();
        
        // Update every second
        this.timer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const currentTime = new Date().getTime();
        const timeDifference = this.targetTime - currentTime;
        
        if (timeDifference <= 0) {
            this.finishCountdown();
            return;
        }
        
        const timeUnits = this.calculateTimeUnits(timeDifference);
        this.displayTime(timeUnits);
        this.checkUrgentState(timeUnits);
    }
    
    calculateTimeUnits(timeDifference) {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    }
    
    displayTime({ days, hours, minutes, seconds }) {
        this.daysElement.textContent = this.formatTime(days);
        this.hoursElement.textContent = this.formatTime(hours);
        this.minutesElement.textContent = this.formatTime(minutes);
        this.secondsElement.textContent = this.formatTime(seconds);
    }
    
    formatTime(time) {
        return time.toString().padStart(2, '0');
    }
    
    checkUrgentState({ days, hours, minutes, seconds }) {
        const totalMinutesLeft = days * 24 * 60 + hours * 60 + minutes + seconds / 60;
        
        this.timeUnits.forEach(unit => {
            if (totalMinutesLeft <= 60) { // Last hour
                unit.classList.add('urgent');
            } else {
                unit.classList.remove('urgent');
            }
        });
    }
    
    finishCountdown() {
        this.stopTimer();
        this.showFinishedMessage();
        this.playNotificationSound();
        this.clearStorage();
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
    }
    
    resetTimer() {
        this.stopTimer();
        this.targetTime = null;
        this.targetDateInput.value = '';
        
        this.showInputSection();
        this.clearUrgentState();
        this.clearStorage();
    }
    
    showInputSection() {
        this.form.parentElement.style.display = 'block';
        this.timerDisplay.style.display = 'none';
        this.finishedMessage.style.display = 'none';
    }
    
    showTimerDisplay() {
        this.form.parentElement.style.display = 'none';
        this.timerDisplay.style.display = 'block';
        this.finishedMessage.style.display = 'none';
    }
    
    showFinishedMessage() {
        this.form.parentElement.style.display = 'none';
        this.timerDisplay.style.display = 'none';
        this.finishedMessage.style.display = 'block';
    }
    
    clearUrgentState() {
        this.timeUnits.forEach(unit => {
            unit.classList.remove('urgent');
        });
    }
    
    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }
    
    showMessage(message, type = 'info') {
        // Create and show a temporary message
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4CAF50'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }
    
    // Local Storage methods (Note: These won't work in Claude artifacts but are included for completeness)
    saveToStorage() {
        if (typeof(Storage) !== "undefined") {
            const data = {
                targetTime: this.targetTime,
                targetDateValue: this.targetDateInput.value
            };
            localStorage.setItem('countdownTimer', JSON.stringify(data));
        }
    }
    
    loadFromStorage() {
        if (typeof(Storage) !== "undefined") {
            const stored = localStorage.getItem('countdownTimer');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    const currentTime = new Date().getTime();
                    
                    if (data.targetTime && data.targetTime > currentTime) {
                        this.targetTime = data.targetTime;
                        this.targetDateInput.value = data.targetDateValue;
                        this.startCountdown();
                    } else {
                        this.clearStorage();
                    }
                } catch (error) {
                    console.log('Could not load stored countdown:', error);
                    this.clearStorage();
                }
            }
        }
    }
    
    clearStorage() {
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem('countdownTimer');
        }
    }
}

// Add CSS for message animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the countdown timer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
});