// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import winSound from './game.mp3';
import loseSound from './lose.mp3';

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  return null;
};

const Square = ({ value, onClick, isWinnerSquare }) => {
  return (
    <button className={`square ${isWinnerSquare ? 'winner' : ''}`} onClick={onClick}>
      {value}
    </button>
  );
};

const Board = ({ squares, onClick, winnerLine }) => {
  return (
    <div className="board">
      {squares.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onClick(index)}
          isWinnerSquare={winnerLine && winnerLine.includes(index)}
        />
      ))}
    </div>
  );
};

const App = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winnerLine, setWinnerLine] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const isBoardFull = () => {
    return squares.every((square) => square !== null);
  };

  const handleClick = (index) => {
    if (!playerName) {
      alert('Please enter your name before starting the game.');
      return;
    }

    if (winner || squares[index]) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[index] = 'X';
    setSquares(newSquares);

    const result = calculateWinner(newSquares);
    if (result) {
      setWinner(result.winner);
      setWinnerLine(result.line);
      announceWinner(result.winner);
    } else {
      setXIsNext(false);
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setWinnerLine(null);
    setXIsNext(true);
    setPlayerName('');
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  const getComputerMove = () => {
    const emptySquares = squares.reduce((acc, val, index) => {
      if (val === null) {
        acc.push(index);
      }
      return acc;
    }, []);

    switch (difficulty) {
      case 'easy':
      case 'medium':
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      case 'hard':
        // Implement the minimax algorithm for hard difficulty
        const minimaxResult = minimax(squares, 'O');
        return minimaxResult.index;
      default:
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
  };

  const minimax = (board, player) => {
    const emptySquares = board.reduce((acc, val, index) => {
      if (val === null) {
        acc.push(index);
      }
      return acc;
    }, []);

    if (calculateWinner(board)) {
      return calculateWinner(board).winner === 'X' ? { score: -1 } : { score: 1 };
    } else if (emptySquares.length === 0) {
      return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < emptySquares.length; i++) {
      const move = {};
      move.index = emptySquares[i];
      board[emptySquares[i]] = player;

      if (player === 'O') {
        const result = minimax(board, 'X');
        move.score = result.score;
      } else {
        const result = minimax(board, 'O');
        move.score = result.score;
      }

      board[emptySquares[i]] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const announceWinner = (currentWinner) => {
    const audio = new Audio(currentWinner === 'X' ? winSound : loseSound);
    audio.play();
    setTimeout(() => {
      resetGame();
      if (currentWinner === 'X') {
        alert(`Congratulations, ${playerName}! You won!`);
      } else if (currentWinner === 'O') {
        alert(`Sorry, ${playerName}. You lost.`);
      } else {
        alert(`It's a draw, ${playerName}!`);
      }
    }, 3000); // Reset the game after 3 seconds
  };

  useEffect(() => {
    if (!xIsNext && !winner) {
      const computerMove = getComputerMove();
      setTimeout(() => {
        const newSquares = squares.slice();
        newSquares[computerMove] = 'O';
        setSquares(newSquares);
        setXIsNext(true);
      }, 500);
    }
    // eslint-disable-next-line
  }, [squares]);

  const renderStatus = () => {
    return (
      <div className="status">
        {winner ? (
          <>
            {`Winner: ${winner} (${playerName})`}
            <br />
            {`Next player: ${xIsNext ? 'X' : 'O'}`}
          </>
        ) : isBoardFull() ? (
          `It's a draw, ${playerName}!`
        ) : (
          `Next player: ${xIsNext ? 'X' : 'O'} (${playerName})`
        )}
      </div>
    );
  };

  return (
    <div className="app center">
      <h1>Tic-Tac-Toe</h1>

      <label>
        Difficulty:
        <select value={difficulty} onChange={(e) => handleDifficultyChange(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <br />
      <br />

      <form>
        <label>
          Enter Your Name:
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
        </label>
      </form>
      {renderStatus()}
      <Board squares={squares} onClick={handleClick} winnerLine={winnerLine} />
      <div className="controls">
        <br></br>
        <button onClick={resetGame}>Reset Game</button><br/>
        <h3><i>Created By <a href='https://www.instagram.com/prince_.022/'>Prince</a>🤴</i></h3>
      </div>
    </div>
  );
};

export default App;
