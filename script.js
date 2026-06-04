// 質問リスト: ここを編集すると、ゲームに出る質問を変えられます。
// category はカテゴリボタン名と同じ文字にしてください。
const QUESTIONS = [
  {
    category: "自分を知る",
    text: "自分のすきなところを1つ言うなら？"
  },
  {
    category: "自分を知る",
    text: "さいきん、できるようになってうれしかったことは？"
  },
  {
    category: "自分を知る",
    text: "自分を色でたとえると何色？"
  },
  {
    category: "自分を知る",
    text: "元気が出る言葉はどんな言葉？"
  },
  {
    category: "自分を知る",
    text: "自分の得意なことを1つ言うなら？"
  },
  {
    category: "自分を知る",
    text: "自分にプレゼントしたい言葉は？"
  },
  {
    category: "友だち・家族",
    text: "だれかに『ありがとう』と言うなら、だれに言う？"
  },
  {
    category: "友だち・家族",
    text: "友だちと一緒にやってみたい遊びは？"
  },
  {
    category: "友だち・家族",
    text: "家族のすてきだなと思うところは？"
  },
  {
    category: "友だち・家族",
    text: "だれかを笑顔にするなら、何をする？"
  },
  {
    category: "友だち・家族",
    text: "最近だれかに助けてもらったことは？"
  },
  {
    category: "友だち・家族",
    text: "一緒にいると安心する人はだれ？"
  },
  {
    category: "未来",
    text: "明日、楽しみにしていることは？"
  },
  {
    category: "未来",
    text: "いつか行ってみたい場所はどこ？"
  },
  {
    category: "未来",
    text: "未来の自分に聞いてみたいことは？"
  },
  {
    category: "未来",
    text: "新しくチャレンジしたいことは？"
  },
  {
    category: "未来",
    text: "来週の自分に応援を送るなら？"
  },
  {
    category: "未来",
    text: "大きくなったら何を大切にしたい？"
  },
  {
    category: "今日の気持ち",
    text: "今日の気持ちを天気で言うと？"
  },
  {
    category: "今日の気持ち",
    text: "今日、いちばん心に残ったことは？"
  },
  {
    category: "今日の気持ち",
    text: "今の気持ちに名前をつけるなら？"
  },
  {
    category: "今日の気持ち",
    text: "今日の自分にやさしい一言をかけるなら？"
  },
  {
    category: "今日の気持ち",
    text: "今日、ほっとした瞬間はあった？"
  },
  {
    category: "今日の気持ち",
    text: "今、からだはどんな気分？"
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
  const extraTurnsX = 360 * (2 + Math.floor(Math.random() * 2));
  const extraTurnsY = 360 * (2 + Math.floor(Math.random() * 2));

  dice.style.setProperty("--spin-start-x", `${rotation.x - extraTurnsX}deg`);
  dice.style.setProperty("--spin-start-y", `${rotation.y + extraTurnsY}deg`);
  dice.style.setProperty("--spin-mid-x", `${rotation.x + 260}deg`);
  dice.style.setProperty("--spin-mid-y", `${rotation.y - 320}deg`);
  dice.style.setProperty("--spin-end-x", `${rotation.x}deg`);
  dice.style.setProperty("--spin-end-y", `${rotation.y}deg`);
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

function rollDice() {
  setDiceFaces();

  if (faceQuestions.length === 0) {
    renderQuestion(null);
    return;
  }

  const winningFace = pickWinningFace();
  const faceName = FACE_NAMES[winningFace.index];
  const faceLabel = FACE_LABELS[winningFace.index];

  rollButton.disabled = true;
  questionTitle.textContent = "サイコロ回転中";
  questionText.textContent = "正面に出る質問を見ていてね。";
  currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
  setDiceRotation(faceName);
  dice.classList.remove("is-rolling");
  void dice.offsetWidth;
  dice.classList.add("is-rolling");

  window.setTimeout(() => {
    renderQuestion(winningFace.question, faceLabel);
    dice.classList.remove("is-rolling");
    rollButton.disabled = false;
    rollButton.focus();
  }, 1280);
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
rollButton.addEventListener("click", rollDice);

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => selectCategory(button));
});
