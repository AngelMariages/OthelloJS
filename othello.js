/*
 * othello
 *
 * Copyright 2016 Àngel Mariages <angel[dot]mariages[at]gmail[dot]com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
	*/
var c,ctx;
var gameLoop;
var gameBoard = new Array(8);
var tmpPieceDrawCount = 0;
for (var i = 0; i < gameBoard.length; i++) {
	gameBoard[i] = new Array(8);
};
var tmpPiece;

var mode = 1;//1 - Two players, 2 - Singleplayer

window.onload = function() {
	c = document.getElementById("canvasGame");
	ctx = c.getContext("2d");

	resetBoard();

	gameLoop = setInterval(function() {
		drawBoard("8", c.width, c.height);
	}, 1000/60);
	c.addEventListener('mousemove', function(event) {
		var mousePos = getMousePos(event);
		/*var cell = getCellFromXY(mousePos.x, mousePos.y);
		var centerCell = getCenterOfCell(cell.x, cell.y);*/
		mouseMove(mousePos.x, mousePos.y);
		//mouseClick(mousePos.x, mousePos.y);
		//console.log("X: " + mousePos.x + " Y: " + mousePos.y + " Casella: " + cell.x + "," + cell.y);
	}, false);

	c.addEventListener('mousedown', function(event) {
		var mousePos = getMousePos(event);
		//mouseClick(event.clientX - bcl.left, event.clientY - bcl.top, event.buttons);
		mouseClick(mousePos.x, mousePos.y, event.buttons);
	}, false);

	document.getElementById('reset').onclick = function() {
		if(typeof gameLoop !== 'undefined') {
			resetBoard();
		}
	}

	document.getElementById('mode').onclick = function() {
		if(mode === 1) {
			mode = 2;
			document.getElementById('mode').innerHTML = "Two players";
			resetBoard();
		} else if(mode === 2) {
			mode = 1;
			document.getElementById('mode').innerHTML = "Singleplayer";
			resetBoard();
		}
	}
};

/*
 * Cell constructor
 * @param x - x position in the game grid
 * @param y - y position in the game grid
 * @param player - who owns that cell
*/
function Cell(x, y, player) {
	this.x = x;
	this.y = y;
	this.center = getCenterOfCell(x,y);
	this.player = player;
}



function getMousePos(event) {
	var bcl = c.getBoundingClientRect();
	return {
		x : (event.clientX - bcl.left) / (bcl.right - bcl.left) * c.width,
		y : (event.clientY - bcl.top) / (bcl.bottom - bcl.top) * c.height
	}
}

function mouseClick(mouseX, mouseY, button) {
	var cell = getCellFromXY(mouseX, mouseY);
	console.log("Click on:" + cell.x + "," + cell.y + " - " + isCellFull(cell.x, cell.y) + " - B:" + button);
	if(button === 1) {
		if(!isCellFull(cell.x, cell.y)) {
			var pieces = checkMove(cell.x, cell.y, tmpPiece.player)

			if(pieces.length > 0) {
				if(mode === 1) {
					putPiece(cell.x, cell.y, tmpPiece.player);
					for (var i = 0; i < pieces.length; i++) {
						putPiece(pieces[i].x, pieces[i].y, tmpPiece.player);
					};
					tmpPiece = new Cell(-1, -1, tmpPiece.player == 1 ? 2 : 1);

					//Check avaible moves for other player
					if(!playerCanMove(tmpPiece.player)) {
						alert("No more moves for player " + tmpPiece.player + ", turn for player " + (tmpPiece.player == 1 ? 2 : 1));
						tmpPiece = new Cell(-1, -1, tmpPiece.player == 1 ? 2 : 1);
					}
					document.getElementById('msg').innerHTML = "Player " + tmpPiece.player + " [" + (tmpPiece.player === 1 ? "WHITE" : "BLACK") + "] turn.";
				} else if(mode === 2) {
					putPiece(cell.x, cell.y, tmpPiece.player);
					for (var i = 0; i < pieces.length; i++) {
						putPiece(pieces[i].x, pieces[i].y, tmpPiece.player);
					};
					tmpPiece = new Cell(-1,-1,tmpPiece.player);

					var posibleMoves = [];
					var otherPlayer = tmpPiece.player == 1 ? 2 : 1;
					var move;
					var best = 0;
					if(playerCanMove(otherPlayer)) {
						for (var i = 0; i < gameBoard.length; i++) {
							for (var j = 0; j < gameBoard.length; j++) {
								if(!isCellFull(i, j)) {
									move = checkMove(i, j, otherPlayer);
									if(move.length > 0) {
										posibleMoves.push({
											x : i,
											y : j,
											pieces : move
										});
									}
								}
							};
						};
						for (var i = 0; i < posibleMoves.length; i++) {
							if(posibleMoves[i].pieces.length > best)
								best = i;
						};

						console.log("Best: " + posibleMoves[best].x + "," + posibleMoves[best].y);
						putPiece(posibleMoves[best].x, posibleMoves[best].y, otherPlayer);
						for (var i = 0; i < posibleMoves[best].pieces.length; i++) {
							putPiece(posibleMoves[best].pieces[i].x, posibleMoves[best].pieces[i].y, otherPlayer);
						};
						if (!playerCanMove(tmpPiece.player)) {
							var countA = 0;
							var countB = 0;
							for (var i = 0; i < gameBoard.length; i++) {
								for (var j = 0; j < gameBoard.length; j++) {
									if(gameBoard[i][j].player === 1) {
										countA++;
									}
									if(gameBoard[i][j].player === 2) {
										countB++;
									}
								};
							};
							if(countA > countB) {
								alert("Player 1 wins!");
							} else if(countB > countA) {
								alert("Player 2 wins!");
							} else {
								alert("Draft!");
							}
						}
					} else if (!playerCanMove(tmpPiece.player)) {
						var countA = 0;
						var countB = 0;
						for (var i = 0; i < gameBoard.length; i++) {
							for (var j = 0; j < gameBoard.length; j++) {
								if(gameBoard[i][j].player === 1) {
									countA++;
								}
								if(gameBoard[i][j].player === 2) {
									countB++;
								}
							};
						};
						if(countA > countB) {
							alert("Player 1 wins!");
						} else if(countB > countA) {
							alert("Player 2 wins!");
						} else {
							alert("Draft!");
						}
					}
				}
			}
		}
	}
}

function playerCanMove(player) {
	for(var i = 0; i < gameBoard.length; i++) {
		for(var j = 0; j < gameBoard.length; j++) {
			if(!isCellFull(i,j)) {
				if(checkMove(i, j, player).length > 0) {
					return true;
				}
			}
		}
	}
	return false;
}

function mouseMove(mouseX, mouseY) {
	var mouse = getCellFromXY(mouseX, mouseY);
	var cell = new Cell(mouse.x, mouse.y);

	/*document.getElementById('msg').innerHTML = "MouseX: " + mouseX + "," + "MouseY: " + mouseY;
	document.getElementById('msg').innerHTML += " - Casella: " + cell.x + ", " + cell.y;
	document.getElementById('msg').innerHTML += " - CenteCasella: " + cell.center.x + ", " + cell.center.y;*/
	if(!isCellFull(cell.x, cell.y)) {
		tmpPiece = new Cell(cell.x, cell.y, tmpPiece.player);
		tmpPieceDrawCount = 0;
	}
	else
		tmpPiece = new Cell(-1,-1, tmpPiece.player);
}

function getCenterOfCell(cellX, cellY) {
	var width = c.width / 8;
	return {
		x : width / 2 + width * cellX,
		y : width / 2 + width * cellY
	};
}

function getCellFromXY(x, y) {
	return {
		x : parseInt(x / (c.width / 8)),
		y : parseInt(y / (c.height / 8))
	};
}

function isCellFull(x, y) {
	return (gameBoard[x][y].player == 1 || gameBoard[x][y].player == 2);
}

function putPiece(pieceX, pieceY, player) {
	gameBoard[pieceX][pieceY] = new Cell(pieceX, pieceY, player);
}

function drawPiece(pieceX, pieceY, color) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pieceX, pieceY, 50, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.lineWidth = "4";
	ctx.strokeStyle = "#000";
	ctx.stroke();
	ctx.closePath();
}

function drawPieces() {
	for (var i = 0; i < gameBoard.length; i++) {
		for (var j = 0; j < gameBoard[i].length; j++) {
			switch(gameBoard[i][j].player) {
				case 1: {
					drawPiece(gameBoard[i][j].center.x, gameBoard[i][j].center.y, "#FFFFFF");
					break;
				}
				case 2: {
					drawPiece(gameBoard[i][j].center.x, gameBoard[i][j].center.y, "#000000");
					break;
				}
			}
		};
	};

	if(tmpPiece.x != -1 && tmpPiece.y != -1) {
		var time = 30;
		if(tmpPieceDrawCount < time)
			if(checkMove(tmpPiece.x, tmpPiece.y, tmpPiece.player).length > 0)
				drawPiece(tmpPiece.center.x, tmpPiece.center.y, "#00FF00");
			else
				drawPiece(tmpPiece.center.x, tmpPiece.center.y, "#FF0000");
		if(tmpPieceDrawCount > time * 2)
			tmpPieceDrawCount = 0;
		tmpPieceDrawCount++;
	}
}

function drawBoard(lineWidth, width, height) {
	var colors = ["#6FFF00", "#FF00FF", "#FFFF00", "#4D4DFF", "#FE0001", "#FF4105", "#993CF3"]; //For debuging
	ctx.beginPath();
	ctx.fillStyle = "#339966";
	ctx.rect(0, 0, width, height);
	ctx.fill();
	ctx.lineWidth = lineWidth * 2;
	ctx.strokeStyle = "#000";
	ctx.stroke();
	ctx.closePath();

	for (var i = 1; i < 8; i++) {
		var x = (width / 8) * i;
		var y = (height / 8) * i;
		/*if(i % 2 == 0) {
			x += 0.5;
			y += 0.5;
		}*/

		ctx.beginPath();
		//ctx.strokeStyle = colors[i - 1];
		ctx.lineWidth = lineWidth;
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		//ctx.strokeStyle = colors[colors.length - i];
		ctx.lineWidth = lineWidth;
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
		ctx.closePath();
	};

	drawPieces();
}

function resetBoard() {
	for (var i = 0; i < gameBoard.length; i++) {
		for(var j = 0; j < gameBoard[i].length; j++) {
			gameBoard[i][j] = new Cell(0,0,0);
		}
	}
	gameBoard[3][3] = new Cell(3,3,1);
	gameBoard[4][3] = new Cell(4,3,2);
	gameBoard[3][4] = new Cell(3,4,2);
	gameBoard[4][4] = new Cell(4,4,1);

	/*gameBoard[0][0] = new Cell(0,0,1);
	gameBoard[1][0] = new Cell(1,0,2);
	gameBoard[0][1] = new Cell(0,1,2);

	gameBoard[0][7] = new Cell(0,7,1);
	gameBoard[0][6] = new Cell(0,6,2);*/


	/*gameBoard[3][3] = new Cell(3,3,1);
	gameBoard[4][3] = new Cell(4,3,2);
	gameBoard[2][4] = new Cell(2,4,1);
	gameBoard[3][4] = new Cell(3,4,1);
	gameBoard[4][4] = new Cell(4,4,2);
	gameBoard[2][5] = new Cell(2,5,2);
	gameBoard[3][5] = new Cell(3,5,1);
	gameBoard[4][5] = new Cell(4,5,1);
	gameBoard[2][6] = new Cell(2,6,2);
	gameBoard[3][6] = new Cell(3,6,2);
	gameBoard[4][6] = new Cell(4,6,2);
	gameBoard[5][6] = new Cell(5,6,2);
	gameBoard[6][6] = new Cell(6,6,2);
	gameBoard[6][7] = new Cell(6,7,1);*/

	tmpPiece = new Cell(-1,-1,1);

	document.getElementById('msg').innerHTML = "Player " + tmpPiece.player + " [" + (tmpPiece.player === 1 ? "WHITE" : "BLACK") + "] turn.";
}

function checkMove(x, y, player) {
	var otherPiecesList = [];
	var otherPiecesListTmp = [];

	if(!(player === 1 || player === 2))
		return [];
	var otherPlayer = player == 1 ? 2 : 1;
	//Check up pieces of the other player
	if((y - 1) >= 0) {
		if(gameBoard[x][y - 1].player !== player && gameBoard[x][y - 1].player !== 0) {
			for(var i = y - 1; i >= 0; i--) {
				if(gameBoard[x][i].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[x][i].player === 0) {
					break;
				}  else if(gameBoard[x][i].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : x,
						y : i
					});
				}
			}
		}
	}
	//Check down pieces of the other player
	otherPiecesListTmp = [];
	if((y + 1) < gameBoard.length - 1) {
		if(gameBoard[x][y + 1].player !== player && gameBoard[x][y + 1].player !== 0) {
			for(var i = y + 1; i < gameBoard.length; i++) {
				if(gameBoard[x][i].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[x][i].player === 0) {
					break;
				}  else if(gameBoard[x][i].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : x,
						y : i
					});
				}
			}
		}
	}
	//Check left pieces of the other player
	otherPiecesListTmp = [];
	if((x - 1) >= 0) {
		if(gameBoard[x - 1][y].player !== player && gameBoard[x - 1][y].player !== 0) {
			for(var i = x - 1; i >= 0; i--) {
				if(gameBoard[i][y].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][y].player === 0) {
					break;
				} else if(gameBoard[i][y].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : y
					});
				}
			}
		}
	}
	//Check right pieces of the other player
	otherPiecesListTmp = [];
	if((x + 1) < gameBoard.length - 1) {
		if(gameBoard[x + 1][y].player !== player && gameBoard[x + 1][y].player !== 0) {
			for(var i = x + 1; i < gameBoard.length; i++) {
				if(gameBoard[i][y].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][y].player === 0) {
					break;
				} else if(gameBoard[i][y].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : y
					});
				}
			}
		}
	}
	//Check right-up pieces of the other player
	otherPiecesListTmp = [];
	if((x + 1) < gameBoard.length - 1 && (y - 1) >= 0) {
		if(gameBoard[x + 1][y - 1].player !== player && gameBoard[x + 1][y - 1].player !== 0) {
			for(var i = x + 1, j = y - 1; i < gameBoard.length && j >= 0; i++, j--) {
				if(gameBoard[i][j].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][j].player === 0) {
					break;
				} else if(gameBoard[i][j].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : j
					});
				}
			}
		}
	}
	//Check left-up pieces of the other player
	otherPiecesListTmp = [];
	if((x - 1) >= 0 && (y - 1) >= 0) {
		if(gameBoard[x - 1][y - 1].player !== player && gameBoard[x - 1][y - 1].player !== 0) {
			for(var i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--) {
				if(gameBoard[i][j].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][j].player === 0) {
					break;
				} else if(gameBoard[i][j].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : j
					});
				}
			}
		}
	}
	//Check left-down pieces of the other player
	otherPiecesListTmp = [];
	if((x - 1) >= 0 && (y + 1) < gameBoard.length - 1) {
		if(gameBoard[x - 1][y + 1].player !== player && gameBoard[x - 1][y + 1].player !== 0) {
			for(var i = x - 1, j = y + 1; i >= 0 && j < gameBoard.length; i--, j++) {
				if(gameBoard[i][j].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][j].player === 0) {
					break;
				} else if(gameBoard[i][j].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : j
					});
				}
			}
		}
	}
	//Check right-down pieces of the other player
	otherPiecesListTmp = [];
	if((x + 1) < gameBoard.length - 1 && (y + 1) < gameBoard.length - 1) {
		if(gameBoard[x + 1][y + 1].player !== player && gameBoard[x + 1][y + 1].player !== 0) {
			for(var i = x + 1, j = y + 1; i < gameBoard.length && j < gameBoard.length; i++, j++) {
				if(gameBoard[i][j].player === player) {
					otherPiecesListTmp.forEach(function(element, index, array) {
						otherPiecesList.push( {
							x: element.x,
							y: element.y
						});
					});
					break;
				} else if(gameBoard[i][j].player === 0) {
					break;
				} else if(gameBoard[i][j].player === otherPlayer) {
					otherPiecesListTmp.push({
						x : i,
						y : j
					});
				}
			}
		}
	}
	return otherPiecesList;
}