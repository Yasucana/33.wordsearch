const words = [
  "javascript", "function", "variable", "object", "array", "string", "boolean",
  "debug", "syntax", "html", "css", "element", "browser", "script", "loop",
  "event", "method", "random", "define", "select"
];
const gridSize = 15;
let grid = [];
let startTime, selectedCells = [];
const gridContainer = document.getElementById("grid");
const wordList = document.getElementById("word-list");
const scoreDisplay = document.getElementById("score");
const playAgainBtn = document.getElementById("play-again");

function generateGame() {
  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
  scoreDisplay.textContent = "";
  selectedCells = [];
  startTime = Date.now();
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  wordList.innerHTML = "<b>Find:</b> " + words.join(", ");

  placeAllWords();

  // Fill empty spaces with random letters
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === "") {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26)).toLowerCase();
      }
    }
  }

  // Render
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[i][j];
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", () => handleCellClick(cell));
      gridContainer.appendChild(cell);
    }
  }
}

function placeAllWords() {
  const directions = [
    [0, 1],    // horizontal
    [1, 0],    // vertical
    [1, 1],    // diagonal
    [-1, 1]    // diagonal up
  ];

  for (let word of words) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (canPlaceWord(word, row, col, dir)) {
        placeWord(word, row, col, dir);
        placed = true;
      }
      attempts++;
    }
  }
}

function canPlaceWord(word, row, col, dir) {
  let [dr, dc] = dir;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
    const current = grid[r][c];
    if (current !== "" && current !== word[i]) return false;
  }
  return true;
}

function placeWord(word, row, col, dir) {
  let [dr, dc] = dir;
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function handleCellClick(cell) {
  cell.classList.toggle("selected");
  const key = `${cell.dataset.row},${cell.dataset.col}`;
  if (selectedCells.includes(key)) {
    selectedCells = selectedCells.filter(k => k !== key);
  } else {
    selectedCells.push(key);
  }

  checkWords();
}

function checkWords() {
  for (let word of words) {
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1]
    ];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        for (let dir of directions) {
          const [dr, dc] = dir;
          const positions = [];
          let matched = true;
          for (let k = 0; k < word.length; k++) {
            const r = i + dr * k;
            const c = j + dc * k;
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
              matched = false; break;
            }
            const key = `${r},${c}`;
            const letter = grid[r][c];
            if (!selectedCells.includes(key) || letter !== word[k]) {
              matched = false;
              break;
            }
            positions.push(key);
          }
          if (matched) {
            positions.forEach(key => {
              const [r, c] = key.split(",").map(Number);
              const index = r * gridSize + c;
              const cell = gridContainer.children[index];
              cell.classList.remove("selected");
              cell.classList.add("correct");
            });
            selectedCells = selectedCells.filter(k => !positions.includes(k));
          }
        }
      }
    }
  }

  const allFound = document.querySelectorAll(".correct").length >= words.reduce((a, w) => a + w.length, 0);
  if (allFound) finishGame();
}

function finishGame() {
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(100 - timeTaken * 2, 0);
  scoreDisplay.textContent = `🎉 All words found! Time: ${timeTaken}s | Score: ${score}`;
}

playAgainBtn.addEventListener("click", generateGame);
generateGame();
