// 質問リスト: ここを編集すると、ゲームに出る質問を変えられます。
// category は下のカテゴリボタン名と同じ文字にしてください。
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
  }
];

const HISTORY_LIMIT = 5;

const dice = document.getElementById("dice");
const rollButton = document.getElementById("rollButton");
const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("questionText");
const currentCategory = document.getElementById("currentCategory");
const historyList = document.getElementById("historyList");
const categoryButtons = document.querySelectorAll(".category-button");

let selectedCategory = "all";
let lastQuestionText = "";
let history = [];

function getAvailableQuestions() {
  if (selectedCategory === "all") {
    return QUESTIONS;
  }

  return QUESTIONS.filter((question) => question.category === selectedCategory);
}

function pickRandomQuestion() {
  const availableQuestions = getAvailableQuestions();

  if (availableQuestions.length === 0) {
    return null;
  }

  if (availableQuestions.length === 1) {
    return availableQuestions[0];
  }

  let pickedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

  while (pickedQuestion.text === lastQuestionText) {
    pickedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  return pickedQuestion;
}

function renderQuestion(question) {
  if (!question) {
    questionTitle.textContent = "質問がありません";
    questionText.textContent = "このカテゴリには、まだ質問が入っていません。";
    currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
    return;
  }

  questionTitle.textContent = "出た質問";
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
  rollButton.disabled = true;
  dice.classList.remove("is-rolling");
  void dice.offsetWidth;
  dice.classList.add("is-rolling");

  window.setTimeout(() => {
    const question = pickRandomQuestion();
    renderQuestion(question);
    rollButton.disabled = false;
    rollButton.focus();
  }, 520);
}

function selectCategory(button) {
  selectedCategory = button.dataset.category;
  categoryButtons.forEach((categoryButton) => {
    const isSelected = categoryButton === button;
    categoryButton.classList.toggle("is-active", isSelected);
    categoryButton.setAttribute("aria-pressed", String(isSelected));
  });

  currentCategory.textContent = selectedCategory === "all" ? "ぜんぶ" : selectedCategory;
}

rollButton.addEventListener("click", rollDice);

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => selectCategory(button));
});
