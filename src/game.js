const TicTacToeGame = function TicTacToeGame() {
  this.initBoard();
};

TicTacToeGame.prototype = {
  board: [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ],
  currentPlayer: 'X',
  isGameOver: false,
  moveCount: 0,
  winner: '',

  /**
   * Initialize the game board
   */
  initBoard() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
  },

  /**
   * Get the current player mark
   *
   * @returns {string} Current player mark
   */
  getCurrentPlayerMark() {
    return this.currentPlayer;
  },

  /**
   * Get the winner player char or 'DRAW' for draw
   *
   * @returns {string} Winner player char or 'DRAW'
   */
  getWinner() {
    return this.winner;
  },

  /**
   * Return the board as JSON
   *
   * @returns {string} board as JSON
   */
  getBoardJSON() {
    return JSON.stringify(this.board);
  },

  /**
   * Mark the board with given position
   *
   * @param {number} position
   * @returns {boolean} Game is over or not
   */
  makeMove(position) {
    if (!this.isInt(position)) {
      throw Error('Invalid index');
    }

    // convert to 0 based
    const index = position - 1;

    const { row, column } = this.convertIndexToRowColumn(index);

    // ensure input is an available cell
    const maxIndexNumber = this.board.length * this.board.length;
    if (index > maxIndexNumber || index < 0) {
      throw Error('Wrong position!');
    }

    // check if the poisition is occupied
    if (this.board[row][column] !== '') {
      throw Error('Position is occupied');
    }

    this.moveCount += 1;
    this.board[row][column] = this.currentPlayer;
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    if (this.moveCount > 4 && this.checkBoard()) {
      return true;
    }

    return false;
  },

  /**
   * Check the board to see if the player had a winning move or it is a draw
   *
   * @returns {boolean} The game is over or not
   */
  checkBoard() {
    // Check horizontal
    for (let row = 0; row < this.board.length; row += 1) {
      const playerChr = this.board[row][0];

      // empty cell, move to next row
      if (playerChr !== '') {
        let win = true;
        for (let column = 1; column < this.board[row].length; column += 1) {
          if (playerChr !== this.board[row][column]) {
            // continue with the next row
            win = false;
            break;
          }
        }

        // game is over, break from the loop
        if (win) {
          this.winner = playerChr;
          this.isGameOver = true;
          break;
        }
      }
    }

    // 0 1 2
    // 3 4 5
    // 6 7 8
    // Check vertical
    if (!this.isGameOver) {
      let win = true;
      let playerChr = '';
      // column: 0 0 0, 1 1 1, 2 2 2
      // row:    0 1 2, 0 1 2, 0 1 2
      for (let column = 0; column < this.board.length; column += 1) {
        playerChr = this.board[0][column];

        // empty cell, move to next column
        if (playerChr !== '') {
          win = true;
          for (let row = 1; row < this.board.length; row += 1) {
            if (playerChr !== this.board[row][column]) {
              // contiune with the next column
              win = false;
              break;
            }
          }

          // game is over
          if (win) {
            this.winner = playerChr;
            this.isGameOver = true;
            break;
          }
        }
      }
    }

    // Check diagonal
    if (!this.isGameOver) {
      // Check manualy since there is only two sides
      if (
        this.board[0][0] !== '' &&
        this.board[0][0] === this.board[1][1] &&
        this.board[1][1] === this.board[2][2]
      ) {
        this.isGameOver = true;
        // this.winner = this.board[0][0];
        [[this.winner]] = this.board; // for eslint
      }

      if (
        this.board[0][2] !== '' &&
        this.board[0][2] === this.board[1][1] &&
        this.board[1][1] === this.board[2][0]
      ) {
        this.isGameOver = true;
        // this.winner = this.board[0][2];
        [, , [, , this.winner]] = this.board; // for eslint
      }
    }

    // Check for a draw
    if (!this.isGameOver && this.moveCount === 9) {
      this.isGameOver = true;
      this.winner = 'DRAW';
    }

    return this.isGameOver;
  },

  /**
   * Convert given index number to approiate row and column number
   *
   * @param {number} index Array index to convert to row and column - 0 based
   * @returns {Object} row and column numbers
   */
  convertIndexToRowColumn(index) {
    // board numbers: 0 1 2 3 4 5 6 7 8
    // row:           0 0 0 1 1 1 2 2 2
    // column:        0 1 2 0 1 2 0 1 2
    const width = this.board.length;
    const row = parseInt(index / width, 10);
    const column = index % width;

    return { row, column };
  },

  /**
   * Converts given row and column to approite array index
   *
   * @param {number} row Array row number
   * @param {number} column Array column number
   * @returns {number} 0 based index
   */
  convertRowColumnToIndex(row, column) {
    const width = this.board.length;
    return row * width + column;
  },

  /**
   * Checks if the given value is an integer
   *
   * @param {any} value value to check
   * @returns {boolean} Given value is integer or not
   */
  isInt(value) {
    if (!Number.isSafeInteger(parseInt(value, 10))) {
      return false;
    }

    // is float
    if (value % 1 !== 0) {
      return false;
    }

    if (value < 0) {
      return false;
    }

    return true;
  },
};

export default TicTacToeGame;
