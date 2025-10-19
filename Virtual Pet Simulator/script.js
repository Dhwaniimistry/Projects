class VirtualPet {
    constructor() {
        this.hunger = 50;      // 0 = not hungry, 100 = very hungry
        this.happiness = 80;   // 0 = sad, 100 = very happy
        this.energy = 70;      // 0 = tired, 100 = energetic
        this.petEmojis = ['🐶', '🐱', '🐰', '🦊', '🐼'];
        this.currentPetIndex = 0;
        
        this.updateDisplay();
        this.startAutoUpdate();
    }
    
    feed() {
        this.hunger = Math.max(0, this.hunger - 25);
        this.happiness = Math.min(100, this.happiness + 15);
        this.showFloatingEmoji('🍖');
        this.updateDisplay();
        this.checkPetStatus();
    }
    
    play() {
        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.min(100, this.hunger + 10);
        this.showFloatingEmoji('🎾');
        this.updateDisplay();
        this.checkPetStatus();
    }
    
    sleep() {
        this.energy = Math.min(100, this.energy + 30);
        this.hunger = Math.min(100, this.hunger + 5);
        this.showFloatingEmoji('😴');
        this.updateDisplay();
        this.checkPetStatus();
    }
    
    updateDisplay() {
        // Update hunger bar
        const hungerBar = document.getElementById('hungerBar');
        const hungerText = document.getElementById('hungerText');
        const hungerPercent = 100 - this.hunger; // Invert for display (full bar = not hungry)
        hungerBar.style.width = hungerPercent + '%';
        hungerText.textContent = Math.round(hungerPercent) + '%';
        
        // Update happiness bar
        const happinessBar = document.getElementById('happinessBar');
        const happinessText = document.getElementById('happinessText');
        happinessBar.style.width = this.happiness + '%';
        happinessText.textContent = Math.round(this.happiness) + '%';
        
        // Update energy bar
        const energyBar = document.getElementById('energyBar');
        const energyText = document.getElementById('energyText');
        energyBar.style.width = this.energy + '%';
        energyText.textContent = Math.round(this.energy) + '%';
        
        // Add warning classes for low stats
        this.toggleLowStatWarning(hungerBar, hungerPercent < 30);
        this.toggleLowStatWarning(happinessBar, this.happiness < 30);
        this.toggleLowStatWarning(energyBar, this.energy < 30);
    }
    
    toggleLowStatWarning(element, isLow) {
        if (isLow) {
            element.classList.add('low-stat');
        } else {
            element.classList.remove('low-stat');
        }
    }
    
    checkPetStatus() {
        const statusElement = document.getElementById('petStatus');
        const petElement = document.getElementById('pet');
        
        if (this.hunger > 80) {
            statusElement.textContent = "Your pet is very hungry! 😰";
            statusElement.style.color = '#ef4444';
        } else if (this.happiness < 20) {
            statusElement.textContent = "Your pet is sad... 😢";
            statusElement.style.color = '#ef4444';
        } else if (this.energy < 20) {
            statusElement.textContent = "Your pet is exhausted! 😴";
            statusElement.style.color = '#ef4444';
        } else if (this.happiness > 80 && this.energy > 60 && this.hunger < 30) {
            statusElement.textContent = "Your pet is thriving! ✨";
            statusElement.style.color = '#22c55e';
        } else if (this.happiness > 60) {
            statusElement.textContent = "Your pet is happy! 😊";
            statusElement.style.color = '#374151';
        } else {
            statusElement.textContent = "Your pet is okay 🙂";
            statusElement.style.color = '#374151';
        }
        
        // Change pet emoji based on status
        this.updatePetEmoji();
    }
    
    updatePetEmoji() {
        const petElement = document.getElementById('pet');
        
        if (this.hunger > 80) {
            petElement.textContent = '😵';
        } else if (this.happiness < 20) {
            petElement.textContent = '😭';
        } else if (this.energy < 20) {
            petElement.textContent = '😴';
        } else if (this.happiness > 80) {
            petElement.textContent = '🐶';
        } else {
            petElement.textContent = this.petEmojis[this.currentPetIndex];
        }
    }
    
    showFloatingEmoji(emoji) {
        const petContainer = document.querySelector('.pet-container');
        const floatingEmoji = document.createElement('div');
        floatingEmoji.className = 'floating-emoji';
        floatingEmoji.textContent = emoji;
        
        // Random position around the pet
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 50;
        floatingEmoji.style.left = `calc(50% + ${randomX}px)`;
        floatingEmoji.style.top = `calc(50% + ${randomY}px)`;
        
        petContainer.appendChild(floatingEmoji);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingEmoji.parentNode) {
                floatingEmoji.parentNode.removeChild(floatingEmoji);
            }
        }, 2000);
    }
    
    startAutoUpdate() {
        setInterval(() => {
            // Gradual stat changes over time
            this.hunger = Math.min(100, this.hunger + 2);
            this.happiness = Math.max(0, this.happiness - 1);
            this.energy = Math.max(0, this.energy - 1);
            
            this.updateDisplay();
            this.checkPetStatus();
        }, 5000); // Update every 5 seconds
    }
    
    changePet() {
        this.currentPetIndex = (this.currentPetIndex + 1) % this.petEmojis.length;
        this.updatePetEmoji();
    }
}

// Initialize the pet
const virtualPet = new VirtualPet();

// Global functions for button clicks
function feedPet() {
    virtualPet.feed();
}

function playWithPet() {
    virtualPet.play();
}

function petSleep() {
    virtualPet.sleep();
}

// Click pet to change type
document.getElementById('pet').addEventListener('click', () => {
    virtualPet.changePet();
});

// Add some visual feedback when buttons are clicked
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.style.transform = 'translateY(-1px) scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});
