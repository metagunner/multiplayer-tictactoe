/* (function (global) {
  function _initBoard() {}

  function TicTacToeClient() {
    _initBoard();
  }

  TicTacToeClient.prototype = {
    startGame: function () {},
  };

  global.TicTacToeClient = TicTacToeClient;
})(this.window); */

// eslint-disable-next-line no-undef
const socket = io();
const gameBoard = document.querySelector('.game-board');
const messages = document.querySelector('#message-list');
const searchGameBtn = document.querySelector('#searchGame');

let myTurn = false;

const messageTypes = {
  success: 'success-message',
  error: 'error-message',
  info: 'info-message',
};

/**
 * Print the board
 */
function drawBoard(board) {
  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const arrayIndex = row * board.length + column + 1;
      const cell = document.querySelector(`[data-cell-index="${arrayIndex}"]`);
      if (board[row][column] !== '' && cell.innerText === '') {
        const mark = document.createElement('span');
        mark.innerText = board[row][column];
        cell.append(mark);
      }
    }
  }
}

function toggleBoardActivity() {
  if (myTurn) {
    document
      .querySelectorAll('.board-cell')
      .forEach((item) => item.classList.remove('cell-disabled'));
  } else {
    document
      .querySelectorAll('.board-cell')
      .forEach((item) => item.classList.add('cell-disabled'));
  }
}

function showMessage(text, type) {
  const newMessage = document.createElement('p');
  newMessage.innerText = text;
  newMessage.classList = type;
  messages.append(newMessage);

  /* Auto scroll to bottom */
  // Height of the new message
  const newMessageStyle = getComputedStyle(newMessage);
  const newMessageMargin =
    parseInt(newMessageStyle.marginBottom, 10) +
    parseInt(newMessageStyle.marginTop, 10);
  const newMessageHeight = newMessageMargin + newMessage.offsetHeight;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of the message container
  const containerHeight = messages.scrollHeight;

  // How far I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  // Is there more space to scroll?
  if (containerHeight - scrollOffset > 0) {
    // scroll to bottom
    messages.scrollTop += messages.scrollTop + newMessageHeight;
  }
}

function clearMessages() {
  messages.innerHTML = '';
}

showMessage(
  'Click the "Battle!" button to search for a opponent.',
  messageTypes.info
);

function searchGame() {
  clearMessages();
  showMessage('Searching for a opponent...', messageTypes.info);
  socket.emit('searching');
  searchGameBtn.style.display = 'none';
}

function startGame() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < 9; i += 1) {
    const boardCell = document.createElement('div');
    boardCell.classList.add('board-cell');
    boardCell.dataset.cellIndex = i + 1;

    boardCell.addEventListener('click', (e) => {
      const position = e.target.dataset.cellIndex || -1;
      socket.emit('make-move', position);
    });

    gameBoard.append(boardCell);
  }
}

searchGameBtn.addEventListener('click', () => {
  searchGame();
});

socket.on('game-started', (playerInfo) => {
  showMessage('Game is started.', messageTypes.info);
  if (playerInfo.mark === 'X') {
    showMessage('It is your turn. Place your mark.', messageTypes.info);
    myTurn = true;
  } else {
    showMessage('Waiting for opponent move...', messageTypes.info);
    myTurn = false;
  }
  startGame();
  toggleBoardActivity();
});

socket.on('move-made', (gameState) => {
  myTurn = !myTurn;
  if (myTurn) {
    showMessage('It is your turn. Place your mark.', messageTypes.info);
  } else {
    showMessage('Waiting for opponent move...', messageTypes.info);
  }
  toggleBoardActivity();
  drawBoard(JSON.parse(gameState.gameBoard));
});

socket.on('game-over', ({ winner, youWon }) => {
  const resultContent = document.createElement('div');
  resultContent.classList = 'game-result';
  resultContent.innerHTML = '';

  const winnerHeading = document.createElement('h1');
  if (winner === 'DRAW') {
    winnerHeading.classList = 'result-draw';
    winnerHeading.innerText = 'DRAW';
  } else if (winner === 'OPPONENT LEFT') {
    winnerHeading.classList = 'result-youwon';
    winnerHeading.innerText = 'YOU WON';
    clearMessages();
    showMessage('Your opponent left the game', messageTypes.success);
  } else if (youWon) {
    winnerHeading.classList = 'result-youwon';
    winnerHeading.innerText = 'YOU WON';
  } else {
    winnerHeading.classList = 'result-youlose';
    winnerHeading.innerText = 'YOU LOSE';
  }

  gameBoard.style.filter = 'blur(7px)';
  resultContent.append(winnerHeading);
  document.querySelector('.game-wrapper').prepend(resultContent);
});

socket.on('message', (message) => {
  showMessage(message.message, message.messageType);
});
