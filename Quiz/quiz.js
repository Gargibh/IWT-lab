const TOTAL_QUESTIONS = 20;

// -- Elements --
const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenResults = document.getElementById("screen-results");

const btnStart = document.getElementById("btn-start");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");
const btnReviewToggle = document.getElementById("btn-review-toggle");

const pawTrail = document.getElementById("paw-trail");
const progressLabel = document.getElementById("progress-label");
const questionText = document.getElementById("question-text");
const optionsWrap = document.getElementById("options");
const feedback = document.getElementById("feedback");

const scoreHeadline = document.getElementById("score-headline");
const scoreMessage = document.getElementById("score-message");
const badgeEl = document.getElementById("badge");
const reviewList = document.getElementById("review-list");

// -- State --
let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let userAnswers = []; // { q, options, correct, chosen, isCorrect }

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPawTrail() {
  pawTrail.innerHTML = "";
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const paw = document.createElement("span");
    paw.className = "paw";
    paw.textContent = "🐾";
    pawTrail.appendChild(paw);
  }
}

function updatePawTrail() {
  const paws = pawTrail.querySelectorAll(".paw");
  paws.forEach((paw, i) => {
    paw.classList.toggle("filled", i < currentIndex);
    paw.classList.toggle("current", i === currentIndex);
  });
}

function startQuiz() {
  const chosenQuestions = shuffle(QUESTION_BANK).slice(0, TOTAL_QUESTIONS);
  roundQuestions = chosenQuestions.map((item) => ({
    q: item.q,
    options: shuffle(item.o),
    correct: item.a,
  }));

  currentIndex = 0;
  score = 0;
  userAnswers = [];

  buildPawTrail();
  showScreen(screenQuiz);
  renderQuestion();
}

function renderQuestion() {
  const item = roundQuestions[currentIndex];
  progressLabel.textContent = `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`;
  questionText.textContent = item.q;
  feedback.textContent = "";
  feedback.className = "feedback";
  btnNext.disabled = true;
  btnNext.textContent = currentIndex === TOTAL_QUESTIONS - 1 ? "See results" : "Next question";

  optionsWrap.innerHTML = "";
  item.options.forEach((optionText) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.addEventListener("click", () => selectOption(btn, optionText));
    optionsWrap.appendChild(btn);
  });

  updatePawTrail();
}

function selectOption(selectedBtn, optionText) {
  const item = roundQuestions[currentIndex];
  const isCorrect = optionText === item.correct;

  // lock all options, mark correct/incorrect
  Array.from(optionsWrap.children).forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === item.correct) {
      btn.classList.add("correct");
    } else if (btn === selectedBtn) {
      btn.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    score++;
    feedback.textContent = "Correct! 🎉";
    feedback.classList.add("feedback-correct");
  } else {
    feedback.textContent = `Not quite — the answer is "${item.correct}".`;
    feedback.classList.add("feedback-incorrect");
  }

  userAnswers.push({
    q: item.q,
    chosen: optionText,
    correct: item.correct,
    isCorrect,
  });

  btnNext.disabled = false;
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= TOTAL_QUESTIONS) {
    showResults();
  } else {
    renderQuestion();
  }
}

function badgeForScore(s) {
  if (s >= 18) return { label: "Wildlife Expert 🐾", msg: "Outstanding! You really know your animals." };
  if (s >= 13) return { label: "Animal Explorer 🌿", msg: "Great job — you know a lot about the animal kingdom." };
  if (s >= 8) return { label: "Curious Cub 🐻", msg: "Good effort! A bit more exploring and you'll be an expert." };
  return { label: "Just Getting Started 🌱", msg: "Every explorer starts somewhere — try again to boost your score!" };
}

function showResults() {
  updatePawTrail();
  const { label, msg } = badgeForScore(score);
  scoreHeadline.textContent = `You scored ${score} / ${TOTAL_QUESTIONS}`;
  scoreMessage.textContent = msg;
  badgeEl.textContent = label;

  reviewList.innerHTML = "";
  reviewList.classList.add("hidden");
  btnReviewToggle.textContent = "Show answer review";

  userAnswers.forEach((ans, idx) => {
    const row = document.createElement("div");
    row.className = "review-item" + (ans.isCorrect ? " review-correct" : " review-incorrect");

    const qEl = document.createElement("p");
    qEl.className = "review-q";
    qEl.textContent = `${idx + 1}. ${ans.q}`;

    const aEl = document.createElement("p");
    aEl.className = "review-a";
    aEl.textContent = ans.isCorrect
      ? `Your answer: ${ans.chosen} ✔`
      : `Your answer: ${ans.chosen} ✘ — Correct answer: ${ans.correct}`;

    row.appendChild(qEl);
    row.appendChild(aEl);
    reviewList.appendChild(row);
  });

  showScreen(screenResults);
}

function showScreen(screen) {
  [screenStart, screenQuiz, screenResults].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

btnStart.addEventListener("click", startQuiz);
btnNext.addEventListener("click", nextQuestion);
btnRestart.addEventListener("click", startQuiz);
btnReviewToggle.addEventListener("click", () => {
  const isHidden = reviewList.classList.toggle("hidden");
  btnReviewToggle.textContent = isHidden ? "Show answer review" : "Hide answer review";
});
