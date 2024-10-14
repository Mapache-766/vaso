const onlineStartScreen = document.getElementById('online-start-screen');
const onlineGameScreen = document.getElementById('online-game-screen');
const onlineGameOverScreen = document.getElementById('online-game-over-screen');
const onlineStartButton = document.getElementById('online-start-button');
const onlineRestartButton = document.getElementById('online-restart-button');
const muteButton = document.getElementById('mute-button');
const onlineGameArea = document.getElementById('online-game-area');
const onlineInput = document.getElementById('online-input');
const onlineScoreElement = document.getElementById('online-score');
const onlineFinalScoreElement = document.getElementById('online-final-score');
const timeLeftElement = document.getElementById('time-left');
const leaderboardList = document.getElementById('leaderboard-list');
const playerNameInput = document.getElementById('player-name');

const shootSound = new Audio('/shoot.mp3');
const gameOverSound = new Audio('/game-over.mp3');

let onlineWords = [];
let onlineScore = 0;
let isMuted = false;
let onlineGameInterval;

let timeLeft = 60;

const wordLists = [
    ['html', 'css', 'js', 'react', 'vue'],
    ['angular', 'svelte', 'node', 'express', 'mongo'],
    ['typescript', 'webpack', 'babel', 'jest', 'cypress'],
    ['kubernetes', 'docker', 'jenkins', 'terraform', 'ansible'],
    ['microservices', 'serverless', 'graphql', 'websocket', 'blockchain']
];

function startOnlineGame() {
    onlineStartScreen.classList.add('hidden');
    onlineGameScreen.classList.remove('hidden');
    onlineGameOverScreen.classList.add('hidden');
    onlineScore = 0;
    onlineWords = [];
    timeLeft = 60;
    updateOnlineStats();
    onlineInput.value = '';
    onlineInput.focus();
    onlineGameInterval = setInterval(onlineGameLoop, 50);
    startTimer();
}

function onlineGameLoop() {
    moveOnlineWords();
    if (Math.random() < 0.05) addOnlineWord();
}

function addOnlineWord() {
    if (onlineWords.length < 8) {
        const word = document.createElement('div');
        word.className = 'word';
        word.textContent = wordLists[Math.floor(Math.random() * wordLists.length)][Math.floor(Math.random() * 5)];
        word.style.left = `${Math.random() * (onlineGameArea.clientWidth - 100)}px`;
        word.style.top = '-30px';
        word.style.color = `hsl(${Math.random() * 360}, 100%, 75%)`;
        onlineGameArea.appendChild(word);
        onlineWords.push(word);
    }
}

function moveOnlineWords() {
    onlineWords.forEach((word, index) => {
        const top = parseFloat(word.style.top) || 0;
        if (top > onlineGameArea.clientHeight) {
            onlineGameArea.removeChild(word);
            onlineWords.splice(index, 1);
        } else {
            word.style.top = `${top + 2}px`;
        }
    });
}

function updateOnlineStats() {
    onlineScoreElement.textContent = onlineScore;
    timeLeftElement.textContent = timeLeft;
}

function checkOnlineInput() {
    const typedWord = onlineInput.value.toLowerCase();
    onlineWords.forEach((word, index) => {
        if (word.textContent.toLowerCase() === typedWord) {
            if (!isMuted) shootSound.play();
            onlineGameArea.removeChild(word);
            onlineWords.splice(index, 1);
            onlineScore += typedWord.length * 10;
            onlineInput.value = '';
            updateOnlineStats();
        }
    });
}

function startTimer() {
    const timer = setInterval(() => {
        timeLeft--;
        updateOnlineStats();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endOnlineGame();
        }
    }, 1000);
}

function endOnlineGame() {
    clearInterval(onlineGameInterval);
    if (!isMuted) gameOverSound.play();
    onlineGameScreen.classList.add('hidden');
    onlineGameOverScreen.classList.remove('hidden');
    onlineFinalScoreElement.textContent = onlineScore;
    updateLeaderboard();
}

function updateLeaderboard() {
    const playerName = playerNameInput.value || 'Anónimo';
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push({ name: playerName, score: onlineScore });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep only top 10
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score}</span>`;
        leaderboardList.appendChild(li);
    });
}
onlineStartButton.addEventListener('click', startOnlineGame);
onlineRestartButton.addEventListener('click', startOnlineGame);
muteButton.addEventListener('click', toggleMute);
onlineInput.addEventListener('input', checkOnlineInput);

// Prevent spacebar from scrolling the page
window.addEventListener('keydown', function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
    }
});