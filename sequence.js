/*
  DIV VARIABLES
*/

const number1 = document.getElementById('number1');
const number2 = document.getElementById('number2');
const number3 = document.getElementById('number3');
const number4 = document.getElementById('number4');
const number5 = document.getElementById('number5');
const answer1 = document.getElementById('answer1');
const answer2 = document.getElementById('answer2');
const answer3 = document.getElementById('answer3');
const answer4 = document.getElementById('answer4');
const countdown = document.getElementById('countdown');
const answeredDiv = document.getElementById("answered");



/*
  GAME VARIABLES
*/

let countdownId;
let gameActive = false;
let answered = 0;
let score = 0;



/*
  GREEN / RED GLOW
*/

let answersContainer = document.getElementById("answers");
//isCorrect = true -> green, = false -> red, = 'reset' -> resets the glow
function answerGlow(isCorrect) {
  answersContainer.style.animation = 'none';
  void answersContainer.offsetHeight;
  answersContainer.style.animation = '';
  if (isCorrect === true) {
    answersContainer.style.animation = '1.5s glow-green';
  } else if (isCorrect === false) {
    answersContainer.style.animation = '1.5s glow-red';
  }
}



/*
  GAME DATA
*/

function getGameData() {
  return { gameScore: score, gameAnswered: answered};
}

function endGame() {
  clearInterval(countdownId);
  gameActive = false;
  score = 0;
  answered = 0;
  answeredDiv.textContent = `Problems Answered: ${answered}`;
  countdown.textContent = '1:00';
  answerGlow('reset');
}



/*
  GAME FUNCTIONS
*/

async function game() {
  score = 0;
  gameActive = true;
  timer();

  while (gameActive) {
    await question();
  }
}

function timer() {
  let counter = 60;
  clearInterval(countdownId);
  countdownId = setInterval(() => {
    counter--;

    if (counter <= 0) {
      showPage('score-page');
      setScorePage(score, answered);
      endGame();
      return;
    }

    countdown.textContent = `${Math.floor(counter / 60)}:${String(counter % 60).padStart(2, '0')}`;
  }, 1000);
}

async function question() {
  if (!gameActive) {
    return;
  }

  let values = questionPicker();  //{ questionNums: [1, 2, 3, 4, 5, correct], answerNums: [correct, 1, 2, 3], addPoints: 1, losePoints: -1}
  let correct;
  let points;
  let answerChoices;

  function assignGameValues() {
    correct = values.answerNums[0];
    points = [values.addPoints, values.losePoints];

    number1.textContent = values.questionNums[0];
    number2.textContent = values.questionNums[1];
    number3.textContent = values.questionNums[2];
    number4.textContent = values.questionNums[3];
    number5.textContent = values.questionNums[4];


    answerChoices = shuffle(values.answerNums);
    answer1.textContent = answerChoices[0];
    answer2.textContent = answerChoices[1];
    answer3.textContent = answerChoices[2];
    answer4.textContent = answerChoices[3];
  }
  assignGameValues();
  

  const chosenAnswer = await Promise.race([
    waitForChoice(document.getElementById('answers')),
    waitForGameEnd()
  ]);

  if (!gameActive) {
    return;
  }

  if (correct === chosenAnswer) {
    score += points[0];
    answerGlow(true);
  } else if (chosenAnswer !== null) {
    score += points[1];
    answerGlow(false);
  }
  answered++;
  answeredDiv.textContent = `Problems Answered: ${answered}`;
}

function questionPicker() {
  if (answered < 1) {
    return type1();
  } else if (answered < 5) {
    return weight([type1, type2], [1, 1])();
  } else if (answered < 8) {
    return weight([type1, type2, type3, type4, type5], [2, 2, 3, 4, 4])();
  } else if (answered < 14) {
    return weight([type1, type2, type3, type4, type5], [2, 2, 3, 7, 7])();
  } else if (answered < 20) {
    return weight([type1, type2, type3, type4, type5, type6, type7], [2, 2, 3, 6, 6, 6, 6])();
  } else if (answered < 25) {
    return weight([type1, type2, type3, type4, type5, type6, type7, type8, type9], [2, 2, 3, 5, 5, 5, 5, 6, 6])();
  } else {
    return weight([type1, type2, type3, type4, type5, type6, type7, type8, type9], [3, 3, 4, 5, 5, 4, 4, 4, 3])();
  }
}
//returns a value based on its assigned weight
function weight(items, weights) {
  let weightedSum = weights.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  let randomNum = Math.floor(Math.random() * weightedSum);

  for (let i = 0; i < items.length; i++) {
    if (randomNum < weights[i]) {
      return items[i];
    }
    randomNum -= weights[i];
  }
}

function waitForChoice(containerElement) {
  return new Promise((resolve) => {
    function handleClick(event) {
      containerElement.removeEventListener('click', handleClick);
      resolve(Number(event.target.textContent));
    }

    containerElement.addEventListener('click', handleClick);
  });
}

function waitForGameEnd() {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (!gameActive) {
        clearInterval(intervalId);
        resolve(null);
      }
    }, 50);
  });
}



/*
  GAME QUESTION TYPES
*/

let startingValues = [];
for (let i = 1; i <= 15; i++) {
  startingValues.push(i);
}

//addition
function type1() {
  let diff = Math.floor(Math.random() * 20) + 6;
  let questionNumsArray = [Math.floor(Math.random() * 39) + 2];
  questionNumsArray.push(questionNumsArray[0] + diff);
  questionNumsArray.push(questionNumsArray[1] + diff);
  questionNumsArray.push(questionNumsArray[2] + diff);
  questionNumsArray.push(questionNumsArray[3] + diff);
  let correct = questionNumsArray[4] + diff;
  questionNumsArray.push(correct);

  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct - 20, correct + 5, correct - 5, diff];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return { 
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 5,
    losePoints: -6,
  };
}
//subtraction
function type2() {
  let start = Math.floor(Math.random() * 101) + 100;
  let diff = Math.floor(Math.random() * 15) + 5;

  let questionNumsArray = [];
  for (let i = 0; i < 5; i++) {
    questionNumsArray.push(start - i * diff);
  }
  let correct = start - 5 * diff;
  questionNumsArray.push(correct);

  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct + 20, correct + 5, correct - 5, diff];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 6,
    losePoints: -6,
  };
}
//geometric
function type3() {
  let multiplier = Math.floor(Math.random() * 3) + 2;
  let questionNumsArray = [Math.floor(Math.random() * 7) + 2];
  for (let i = 1; i < 5; i++) {
    questionNumsArray.push(questionNumsArray[i - 1] * multiplier);
  }
  let correct = questionNumsArray[4] * multiplier;
  questionNumsArray.push(correct);

  let potentialWrongAnswers = [(correct / multiplier) * (multiplier + 1), (correct / multiplier) * (multiplier - 1), correct / multiplier, multiplier, correct - Math.floor(correct/2) + 10, correct - 100, correct + 500];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 8,
    losePoints: -10,
  };
}
//interleaving sequences
function type4() {
  startingValues = shuffle(startingValues);
  let diff = Math.floor(Math.random() * 10) + 6;

  let questionNumsArray = [];
  questionNumsArray.push(startingValues[0]);
  questionNumsArray.push(startingValues[1]);
  questionNumsArray.push(startingValues[0] + diff);
  questionNumsArray.push(startingValues[1] + diff);
  questionNumsArray.push(startingValues[0] + 2 * diff);
  let correct = startingValues[1] + 2 * diff;
  questionNumsArray.push(correct);

  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct - 20, correct + 5, correct - 5, diff];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 14,
    losePoints: -9,
  };
}
//fibonnaci
function type5() {
  startingValues = shuffle(startingValues);
  let sequence = [startingValues[0], startingValues[1], startingValues[0] + startingValues[1], startingValues[0] + 2*startingValues[1], 2*startingValues[0] + 3*startingValues[1], 3*startingValues[0] + 5*startingValues[1]];
  let correct = sequence[5];


  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct - 20, correct + 5, correct - 5];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: sequence,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 14,
    losePoints: -9,
  };
}
//Quadratic
function type6() {
  startingNum = Math.floor(Math.random() * 12) + 4;
  let sequence = [startingNum];
  let secondDifference = 2;
  let sequenceDifferences = [Math.floor(Math.random() * 3) + 1];
  for (let i = sequenceDifferences[0] + secondDifference; i <= (sequenceDifferences[0] + 4 * secondDifference); i += secondDifference) {
    sequenceDifferences.push(i);
  }
  for (let i = 0; i < 5; i++) {
    sequence.push(sequence.at(-1) + sequenceDifferences[i]);
  }
  let correct = sequence[5];

  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct - 20, correct + 5, correct - 5];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: sequence,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 17,
    losePoints: -10,
  };
}
//Quadratic with different 2nd differences
function type7() {
  startingNum = Math.floor(Math.random() * 12) + 4;
  let sequence = [startingNum];
  let secondDifference = Math.floor(Math.random() * 3) + 3;
  let sequenceDifferences = [Math.floor(Math.random() * 3) + 1];
  for (let i = sequenceDifferences[0] + secondDifference; i <= (sequenceDifferences[0] + 4 * secondDifference); i += secondDifference) {
    sequenceDifferences.push(i);
  }
  for (let i = 0; i < 5; i++) {
    sequence.push(sequence.at(-1) + sequenceDifferences[i]);
  }
  let correct = sequence[5];

  let potentialWrongAnswers = [correct - 1, correct + 1, correct - 10, correct + 10, correct * 2, correct - 2, correct - 20, correct + 5, correct - 5, correct + 3, correct - 3];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: sequence,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 24,
    losePoints: -10,
  };
}
//Squares
function type8() {
  let startingNum = Math.floor(Math.random() * 27) + 4;
  let skip = Math.floor(Math.random() * 3) + 1;
  let questionNumsArray = [];
  for (let i = startingNum; i < startingNum + 6 * skip; i += skip) {
    questionNumsArray.push(i**2);
  }
  let correct = questionNumsArray[5];

  let potentialWrongAnswers = [(questionNumsArray[4]), (Math.pow(correct, 1/2) + 1)**2, correct - 50, correct + 50, correct - Math.floor(correct/2) + 10, correct - 100, correct + 500, correct + 5, correct - 5, correct + 20, correct - 20];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 19,
    losePoints: -11,
  };
}
//Cubes
function type9() {
  let startingNum = Math.floor(Math.random() * 5) + 2;
  let skip = Math.floor(Math.random() * 3) + 1;
  let questionNumsArray = [];
  for (let i = startingNum; i < startingNum + 6 * skip; i += skip) {
    questionNumsArray.push(i**3);
  }
  let correct = questionNumsArray[5];

  let potentialWrongAnswers = [(questionNumsArray[4]), (Math.round(Math.pow(correct, 1/3) + 1))**3, correct - 50, correct + 50, correct - Math.floor(correct/2) + 10, correct - 100, correct + 500, correct + 5, correct - 5, correct + 20, correct - 20];
  let answers = shuffle(potentialWrongAnswers).slice(0, 3);
  return {
    questionNums: questionNumsArray,
    answerNums: [correct, answers[0], answers[1], answers[2]],
    addPoints: 25,
    losePoints: -9,
  };
}

function shuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}