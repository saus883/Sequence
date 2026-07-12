/*
  LEADERBOARD
*/
const LEADERBOARD_API_URL = 'https://script.google.com/macros/s/AKfycbyzl8KyVy_7J5ZEAWiccGJnV6xTS0DNTVe8aW7GDBUsnyh63VLn77q7B_f3kk038YqJ/exec';

async function submitScore(name, score) {
  const res = await fetch(LEADERBOARD_API_URL, {
    method: 'POST',
    // text/plain avoids a CORS preflight request against Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ name, score })
  });
  return res.json(); // { status: 'ok' } or { status: 'error', message: '...' }
}
async function getLeaderboard() {
  const res = await fetch(LEADERBOARD_API_URL);
  const data = await res.json();

  if (data.status !== 'ok') {
    throw new Error(data.message || 'Failed to load leaderboard');
  }

  return data.entries; // [{ name, score, timestamp }, ...] sorted high to low
}
async function loadLeaderboard() {
  const loadingEl = document.getElementById('loading');
  const leaderboardContainer = document.getElementById('leaderboard');

  if (!loadingEl || !leaderboardContainer) {
    return;
  }

  loadingEl.style.display = 'flex';

  Array.from(leaderboardContainer.children).forEach((child) => {
    if (child.id !== 'loading') {
      child.remove();
    }
  });

  try {
    const leaderboard = await getLeaderboard();
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.className = 'leaderboard-list';

    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'leaderboard-empty';
      emptyMessage.textContent = 'No scores yet.';
      leaderboardDiv.appendChild(emptyMessage);
    } else {
      leaderboard.forEach((entry, index) => {
        const row = document.createElement('div');
        const rank = document.createElement('div');
        const name = document.createElement('div');
        const score = document.createElement('div');

        row.className = 'leaderboard-row';
        rank.className = 'leaderboard-rank';
        name.className = 'leaderboard-name';
        score.className = 'leaderboard-score';
        if (entry.score < 40) {
          score.classList.add('common-tier');
        } else if (entry.score < 80) {
          score.classList.add('uncommon-tier');
        } else if (entry.score < 110) {
          score.classList.add('rare-tier');
        } else if (entry.score < 140) {
          score.classList.add('epic-tier');
        } else if (entry.score < 170) {
          score.classList.add('champion-tier');
        } else {
          score.classList.add('legendary-tier');
        }

        rank.textContent = `${index + 1}.`;
        name.textContent = entry?.name || 'Unknown';
        score.textContent = entry?.score ?? 0;

        row.append(rank, name, score);
        leaderboardDiv.appendChild(row);
      });
    }

    leaderboardContainer.appendChild(leaderboardDiv);
  } catch (error) {
    const message = document.createElement('div');
    message.className = 'leaderboard-error';
    message.textContent = 'Unable to load leaderboard. Please try again.';
    leaderboardContainer.appendChild(message);
    console.error(error);
  } finally {
    loadingEl.style.display = 'none';
  }
}
window.addEventListener('DOMContentLoaded', loadLeaderboard);


/*
  HOME PAGE SLIDER
*/
function setSlider() {
  let values = [type1, type2, type3, type4, type5, type6, type7, type8, type9][Math.floor(Math.random() * 9)]();
  const numbers = document.querySelectorAll('.slide-num');
  for (let i = 0; i < 6; i++) {
    numbers.item(i).textContent = values.questionNums[i];
  }
}
window.addEventListener('DOMContentLoaded', setSlider);
const slide = document.querySelector('.home-bottom');
slide.addEventListener('animationiteration', () => {
  setSlider();
});









/*
  SWITCHING PAGES
*/
function showPage(activate) {
  document.querySelector('.active').classList.remove('active');
  document.getElementById(activate).classList.add('active');
}

async function setScorePage(score, answered) {
  const scoreDiv = document.getElementById("score");
  scoreDiv.textContent = `Score: ${score}`;
  const finalProblemsAnswered = document.getElementById("final-answered");
  finalProblemsAnswered.textContent = `Problems Answered: ${answered}`;
  if (document.getElementById('username').value !== '') {
    const message = document.getElementById('high-score-message');
    let leaderboardData = [];
    try {
      leaderboardData = await getLeaderboard();
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      leaderboardData = [];
    }
    const nameIndex = leaderboardData.findIndex(row => row.name === document.getElementById('username').value);
    if (nameIndex === -1) {
      message.textContent = `New High Score!`;
    } else if (score > leaderboardData[nameIndex].score){
      message.textContent = `New High Score!`;
    } else {
      message.textContent = ``;
    }
    submitScore(document.getElementById('username').value, score);
  }

  return [score, answered];
}







/*
  BUTTONS
*/
const start = document.getElementById('start');
start.addEventListener('click', function() {
  showPage('game-page');
  game();
});

const homeLeaderboard = document.getElementById('access-leaderboard');
homeLeaderboard.addEventListener('click', function() {
  showPage('leaderboard-page');
});

const gameBack = document.getElementById('game-back');
gameBack.addEventListener('click', function() {
  endGame();
  showPage('home-page');
});

const scoreBack = document.getElementById('score-back');
scoreBack.addEventListener('click', function() {
  showPage('home-page');
});

const playAgain = document.getElementById('play-again');
playAgain.addEventListener('click', function() {
  showPage('game-page');
  game();
});

const scoreLeaderBoard = document.getElementById('score-access-leaderboard');
scoreLeaderBoard.addEventListener('click', function() {
  loadLeaderboard();
  showPage('leaderboard-page');
});

const leaderboardBack = document.getElementById('leaderboard-back');
leaderboardBack.addEventListener('click', function() {
  showPage('home-page');
});









