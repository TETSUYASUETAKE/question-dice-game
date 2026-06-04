// 質問リスト: ここを編集すると、ゲームに出る質問を変えられます。
// category はカテゴリボタン名と同じ文字にしてください。
const QUESTIONS = [
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしのカッコいいところ、カワイイところを伝えてみよう"
  },
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしをとびきりの笑顔にしてみよう"
  },
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしに大好きなところを3つ伝えてみよう"
  },
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしに今一番頑張っていることを教えてあげよう"
  },
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしに好きな人の名前を小声で教えてあげよう"
  },
  {
    category: "ミラートーキング",
    text: "鏡の中のぼく／わたしに、今まで誰かに言われて1番うれしかった言葉を教えてあげよう"
  }
];

const HISTORY_LIMIT = 5;
const FACE_NAMES = ["front", "right", "back", "left", "top", "bottom"];
const FACE_LABELS = ["正面", "右", "うしろ", "左", "上", "下"];
const FACE_ROTATIONS = {
  front: { x: 0, y: 0 },
  right: { x: 0, y: -90 },
  back: { x: 0, y: 180 },
  left: { x: 0, y: 90 },
  top: { x: -90, y: 0 },
  bottom: { x: 90, y: 0 }
};

const dice = document.getElementById("dice");
const cubeScene = document.querySelector(".cube-scene");
const diceFaces = document.querySelectorAll(".dice-face");
const rollButton = document.getElementById("rollButton");
const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("questionText");
const currentCategory = document.getElementById("currentCategory");
const historyList = document.getElementById("historyList");
const categoryButtons = document.querySelectorAll(".category-button");

let selectedCategory = "all";
let lastQuestionText = "";
let history = [];
let faceQuestions = [];
let isRolling = false;
let isStopping = false;
let pendingWinningFace = null;
let pendingFaceLabel = "";
let pendingStoppedTransform = "";

function getAvailableQuestions() {
  if (selectedCategory === "all") {
    return QUESTIONS;
  }

  return QUESTIONS.filter((question) => question.category === selectedCategory);
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function pickFaceQuestions() {
  const availableQuestions = getAvailableQuestions();

  if (availableQuestions.length === 0) {
    return [];
  }

  const shuffled = shuffleQuestions(availableQuestions);
  const picked = [];

  for (let index = 0; picked.length < FACE_NAMES.length; index += 1) {
    picked.push(shuffled[index % shuffled.length]);
  }

  return picked;
}

function pickWinningFace() {
  const possibleIndexes = faceQuestions
    .map((question, index) => ({ question, index }))
    .filter((item) => item.question.text !== lastQuestionText);

  const candidates = possibleIndexes.length > 0
    ? possibleIndexes
    : faceQuestions.map((question, index) => ({ question, index }));

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function setDiceFaces() {
  faceQuestions = pickFaceQuestions();

  diceFaces.forEach((face, index) => {
    const question = faceQuestions[index];
    face.querySelector(".face-label").textContent = FACE_LABELS[index];
    face.querySelector(".face-text").textContent = question ? question.text : "質問がありません";
  });
}

function setDiceRotation(faceName) {
  const rotation = FACE_ROTATIONS[faceName];
  const extraTurnsX = 360 * 2;
  const extraTurnsY = 360 * 2;
  const rollDirection = Math.random() > 0.5 ? 1 : -1;
  const viewX = rotation.x - 10;
  const viewY = rotation.y + 14;

  dice.style.setProperty("--spin-start-x", `${rotation.x - extraTurnsX}deg`);
  dice.style.setProperty("--spin-start-y", `${rotation.y + extraTurnsY}deg`);
  dice.style.setProperty("--spin-mid-x", `${rotation.x + 360}deg`);
  dice.style.setProperty("--spin-mid-y", `${rotation.y - 440}deg`);
  dice.style.setProperty("--spin-end-x", `${rotation.x}deg`);
  dice.style.setProperty("--spin-end-y", `${rotation.y}deg`);
  dice.style.setProperty("--spin-view-x", `${viewX}deg`);
  dice.style.setProperty("--spin-view-y", `${viewY}deg`);
  dice.style.setProperty("--hop-start-x", `${rollDirection * -38}px`);
  dice.style.setProperty("--hop-mid-x", `${rollDirection * 24}px`);
  dice.style.setProperty("--roll-z", `${rollDirection * 24}deg`);
  pendingStoppedTransform = `translate3d(0, 0, 0) rotateX(${viewX}deg) rotateY(${viewY}deg) rotateZ(0deg)`;
}

function renderQuestion(question, faceLabel) {
  if (!question) {
    questionTitle.textContent = "質問がありません";
    questionText.textContent = "このカテゴリには、まだ質問が入っていません。";
    currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
    return;
  }

  questionTitle.textContent = `${faceLabel}に出た質問`;
  questionText.textContent = question.text;
  currentCategory.textContent = question.category;
  lastQuestionText = question.text;
  addToHistory(question);
}

function addToHistory(question) {
  history = [
    question,
    ...history.filter((item) => item.text !== question.text)
  ].slice(0, HISTORY_LIMIT);

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-history";
    emptyItem.textContent = "まだありません";
    historyList.appendChild(emptyItem);
    return;
  }

  history.forEach((question) => {
    const item = document.createElement("li");
    item.textContent = `${question.category}: ${question.text}`;
    historyList.appendChild(item);
  });
}

function setCategoryButtonsDisabled(isDisabled) {
  categoryButtons.forEach((button) => {
    button.disabled = isDisabled;
  });
}

function rollDice() {
  setDiceFaces();

  if (faceQuestions.length === 0) {
    renderQuestion(null);
    return;
  }

  pendingWinningFace = null;
  pendingFaceLabel = "";
  isRolling = true;
  isStopping = false;
  rollButton.textContent = "サイコロを止める";
  rollButton.setAttribute("aria-label", "サイコロを止めて質問を出す");
  setCategoryButtonsDisabled(true);
  dice.style.transform = "";
  questionTitle.textContent = "サイコロ回転中";
  questionText.textContent = "もう一度ボタンを押すと止まるよ。";
  currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
  dice.classList.remove("is-rolling");
  dice.classList.remove("is-stopping");
  cubeScene.classList.remove("is-rolling");
  cubeScene.classList.remove("is-stopping");
  void dice.offsetWidth;
  void cubeScene.offsetWidth;
  dice.classList.add("is-rolling");
  cubeScene.classList.add("is-rolling");
}

function stopDice() {
  if (!isRolling || isStopping) {
    return;
  }

  pendingWinningFace = pickWinningFace();
  const faceName = FACE_NAMES[pendingWinningFace.index];
  pendingFaceLabel = FACE_LABELS[pendingWinningFace.index];

  isRolling = false;
  isStopping = true;
  rollButton.disabled = true;
  rollButton.textContent = "止まっています";
  setDiceRotation(faceName);
  dice.style.transform = "";
  dice.classList.remove("is-rolling");
  cubeScene.classList.remove("is-rolling");
  dice.classList.remove("is-stopping");
  cubeScene.classList.remove("is-stopping");
  void dice.offsetWidth;
  void cubeScene.offsetWidth;
  dice.classList.add("is-stopping");
  cubeScene.classList.add("is-stopping");

  window.setTimeout(() => {
    renderQuestion(pendingWinningFace.question, pendingFaceLabel);
    dice.classList.remove("is-stopping");
    cubeScene.classList.remove("is-stopping");
    dice.style.transform = pendingStoppedTransform;
    rollButton.disabled = false;
    rollButton.textContent = "もう一度ふる";
    rollButton.setAttribute("aria-label", "サイコロを振って質問を出す");
    setCategoryButtonsDisabled(false);
    isStopping = false;
    rollButton.focus();
  }, 900);
}

function handleRollButtonClick() {
  if (isRolling) {
    stopDice();
    return;
  }

  rollDice();
}

function selectCategory(button) {
  selectedCategory = button.dataset.category;
  categoryButtons.forEach((categoryButton) => {
    const isSelected = categoryButton === button;
    categoryButton.classList.toggle("is-active", isSelected);
    categoryButton.setAttribute("aria-pressed", String(isSelected));
  });

  currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
  questionTitle.textContent = "カテゴリを選びました";
  questionText.textContent = "サイコロの6面に質問が入ります。ボタンを押して回してみよう。";
  setDiceFaces();
}

setDiceFaces();
rollButton.addEventListener("click", handleRollButtonClick);

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => selectCategory(button));
});
