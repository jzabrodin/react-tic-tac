import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={() => {
            props.onClick()
        }}>
            {props.value}
        </button>
    );
}

function BoldSquare(props) {
    return (
        <button className="square" onClick={() => {
            props.onClick()
        }}>
            <bold>{props.value}</bold>
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i, bold = false) {
        if (bold) {
            return <BoldSquare
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        }
        return <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {

        const row_count = this.props.size[0];
        const col_count = this.props.size[1];
        let counter = 0;

        let rows = [];

        for (let i = 0; i < row_count; i++) {
            let cols = [];
            for (let j = 0; j < col_count; j++) {
                let winObject = this.state ? this.state.winObject : false;
                if (winObject) {
                    let bold = Boolean(winObject.line.includes(counter));
                    cols.push(this.renderSquare(i, bold));
                } else {
                    cols.push(this.renderSquare(counter));
                }
                counter++;
            }
            rows.push(<div className="board-row">{cols}</div>);
        }

        return rows;

    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            xIsNext: true,
            stepNumber: 0,
            movesHistory: [],
            size: [3, 3],
            winObject: {}
        };
    }


    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const movesHistory = this.state.movesHistory;

        let winObject = calculateWinner(squares);
        let winner = winObject ? winObject.winner : false;

        if (squares[i] || winner) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            squares: squares,
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
            movesHistory: movesHistory.concat(i),
        })
    }

    jumpTo(move) {
        this.setState(
            {
                stepNumber: move,
                xIsNext: (move % 2) === 0,
            }
        )
    }

    render() {

        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winObject = calculateWinner(current.squares);
        const winner = (winObject) ? winObject.winner : {};
        const movesHistory = this.state.movesHistory;
        const size = this.state.size;
        const moves = this.getMoves(history, movesHistory);

        let status;
        if (winner) {
            status = 'Winner is : ' + winner;
        } else if (this.state.stepNumber === 9) {
            status = 'Draw :( ';
        } else {
            status = 'Next player ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game"
            >
                <div className="game-board">
                    <Board squares={current.squares}
                           size={size}
                           onClick={(i) => {
                               this.handleClick(i)
                           }}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    getMoves(history, movesHistory) {

        const currentStep = this.state.stepNumber;

        return history.map((step, move) => {

                let desc = move ? 'Go to move #' + move : 'Go to start';

                const row = movesHistory ? (movesHistory[move] % 3 + 1) : 0;
                const col = movesHistory ? Number.parseInt((movesHistory[move] / 3) + 1) : 0;

                if (col && row) {
                    desc += ` [${col} , ${row}] `;
                }

                if (currentStep === move) {
                    return <li key={move}>
                        <button onClick={() => {
                            this.jumpTo(move)
                        }}>
                            <h5>{desc}</h5>
                        </button>
                    </li>
                } else {
                    return <li key={move}>
                        <button onClick={() => {
                            this.jumpTo(move)
                        }}>
                            {desc}
                        </button>
                    </li>
                }


            }
        );

    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {

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
        if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c] && squares[c] === squares[a]) {
            let winObject = {line: lines[i], winner: squares[a]};
            this.setState({winObject: winObject});
            return winObject;
        }
    }
    return null;
}