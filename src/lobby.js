import TicTacToeGame from './game';

/**
 * Waiting queue list
 */
let waitingQueue = [];

/**
 * Game lobby list
 */
const games = {};

/**
 * Match status
 */
export const matchStatus = {
  Started: 0,
  InMatch: 1,
  Finish: 2,
};

/**
 * Put the player to waiting list
 *
 * @param {Object} socket Player socket
 */
function enterWaitingQueue(socket) {
  if (!waitingQueue.some((item) => item.socketId === socket.id)) {
    waitingQueue.push({ socket, socketId: socket.id });
  }
}

/**
 * Remove players from the waiting queue
 *
 * @param {number} socketIds Player sockets
 * @returns
 */
function leaveWaitingQueue(socketIds) {
  if (!socketIds) return;

  waitingQueue = waitingQueue.filter(
    (socket) => !socketIds.includes(socket.socketId)
  );
}

/**
 * Create game lobby
 *
 * @param {Object} playerXSocket Player X socket
 * @param {Object} playerOSocket Player O socket
 */
function GameLobby(playerXSocket, playerOSocket) {
  this.matchStatus = matchStatus.Started;
  this.players = [];
  this.gameBoard = new TicTacToeGame();

  // player X
  this.players.push({
    socket: playerXSocket,
    socketId: playerXSocket.id,
    opponentId: playerOSocket.id,
    mark: 'X',
  });

  // player O
  this.players.push({
    socket: playerOSocket,
    socketId: playerOSocket.id,
    opponentId: playerXSocket.id,
    mark: 'O',
  });
}

GameLobby.prototype = {
  /**
   * Get the player
   *
   * @param {number} socketId Player socket Id
   * @returns The player
   */
  getPlayer(socketId) {
    return this.players.find((player) => player.socketId === socketId);
  },

  getOpponent(socketId) {
    const player = this.getPlayer(socketId);
    const opponent = this.getPlayer(player.opponentId);
    return opponent;
  },

  /**
   * Get the TicTacToe game board
   *
   * @returns The Game board
   */
  getGameBoard() {
    return this.gameBoard;
  },

  /**
   * Call a function for each player
   *
   * @param {function} callback Callback Function to call
   */
  emitToPlayers(callback) {
    this.players.forEach((player) => callback(player));
  },

  /**
   * Update the `matchStatus` value
   *
   * @param {matchStatus} newStatus New status
   */
  updateMatchStatus(newStatus) {
    this.matchStatus = newStatus;
  },
};

/**
 * Search for a game
 *
 * @param {Object} socket Player socket
 * @returns
 */
export function searchGame(socket) {
  if (waitingQueue.some((item) => item.socketId === socket.id)) {
    // Already searching for a game
    return;
  }

  if (waitingQueue.length < 1) {
    enterWaitingQueue(socket);
    return;
  }

  const playerX = waitingQueue[0].socket;
  const playerO = socket;
  const newGame = new GameLobby(playerX, playerO);

  games[playerX.id] = newGame;
  games[playerO.id] = newGame;

  leaveWaitingQueue([playerX.id, playerO.id]);
}

/**
 * Get the game lobby information for the player
 *
 * @param {number} socketId
 * @returns
 */
export function getGameLobby(socketId) {
  return games[socketId];
}

/**
 * Remove player from the lobby and clear the objetcs
 *
 * @param {number} socketId
 */
export function leaveGameLobby(socketId) {
  leaveWaitingQueue(socketId);
  if (games[socketId]) {
    const opponent = games[socketId].getOpponent(socketId);
    delete games[socketId].gameBoard;
    delete games[socketId];
    delete games[opponent.socketId];
  }
}
