// 1 - Start enchant.js
enchant();

ROW_SIZE = 33;
COL_SIZE = 32;
MAX_ROWS = 10;
MAX_COLS = 8;

GRID_X_OFFSET = 4;
GRID_Y_OFFSET = 54;

JAIL1_X_OFFSET = 272;
JAIL1_Y_OFFSET = 53;

JAIL2_X_OFFSET = 300;
JAIL2_Y_OFFSET = 53;

WHITE_PIECE_Y_OFFSET = 2;

var ePieceColor = {
	BLACK : {value: 0, name: "black"},
	WHITE : {value: 1, name: "white"}
}

var ePieceType = {
  PAWN : {value: 0, name: "pawn"}, 
  ROOK : {value: 1, name: "rook"}, 
  KNIGHT : {value: 2, name: "knight"},
  BISHOP : {value: 3, name: "bishop"},
  QUEEN : {value: 4, name: "queen"},
  KING : {value: 5, name: "king"}
};

var ButtonSprite = Class.create(Sprite, {
	initialize: function(scene, x, y) {
		this.scene = scene;

		Sprite.call(this,x,y);
	}
});

var ResetButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.reset();
	}
});

var SwapButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.swap_horiz();
	}
});

var FlipButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.swap_vert();
	}
});

var OptionsButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.show_options();
	}
});

var Jail = Class.create(Sprite, {
	initialize: function (x,y){
		this.xBase = x;
		this.yBase = y;
		this.pieces = [];
	},
	add_piece: function(piece){
		if (this.pieces.indexOf(piece) == -1){

			piece.scale(0.5,0.5);
			
			x = this.xBase - 15;
			y = this.pieces.length * (ROW_SIZE / 2 + 3) + 37;	

			piece.move_to(x,y);
			this.pieces.push(piece);
		}
	},
	reset: function(){
		this.pieces = [];
	}
});


var Tile = Class.create(Sprite, {
	initialize: function(row, col, scene) {
		Sprite.apply(this,[COL_SIZE,ROW_SIZE]);

		this.row = row;
		this.col = col;
		this.scene = scene;
		this.board = scene.board;
		this.pieceGroup = scene.pieceGroup;
		this.tileGroup = scene.tileGroup;

		this.piece = null;

		//this.backgroundColor = 'black';

		this.addEventListener(Event.TOUCH_START, this.handle_click);
	},

	handle_click: function(evt) {
		// if a piece was in move state, drop it to this tile
		// only if there's no tile here presently
		for (var i = this.pieceGroup.childNodes.length - 1; i >= 0; i--) {
			currentPiece = this.pieceGroup.childNodes[i];
			if (currentPiece.is_moving() && currentPiece.valid_moves.indexOf(this) != -1)
			{
				// move piece to this tile
				this.scene.move_piece_to_tile(currentPiece,this);
				this.scene.switch_current_turn();
				currentPiece.reset();
				this.scene.reset_all_tiles();
				break;
			}
		}
	},

	reset: function() {
		this.opacity = 1.0;
		this.backgroundColor = 'transparent';
	},

	highlight: function() {
		this.opacity = 0.5;
		this.backgroundColor = 'blue';
	}
});

var Piece = Class.create(Sprite, {
	initialize: function(scene, color, type) {

		Sprite.apply(this,[47,47]);
		
		this.scene = scene;
		this.color = color;
		this.type = type;
		this.tile = null; // override later
		this.valid_moves = [];

		asset = "res/" + color.name + " " + type.name + ".png"
		this.image = Game.instance.assets[asset]; 

		//this.backgroundColor = 'blue';
		this.scale(0.75,0.75);

		this.reset();

		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},

	set_color: function(color) {
		this.color = color;
		asset = "res/" + this.color.name + " " + this.type.name + ".png";
		this.image = Game.instance.assets[asset]; 
	},

	handle_mouse_down: function (evt) {

		if (this.can_move()) {
			this.set_moving();
			for( var i = 0; i < this.valid_moves.length; i++ ) {
				currentTile = this.valid_moves[i];
				currentTile.highlight();
			}
		} else if (this.is_moving()) {
			this.reset();
			this.scene.reset_all_tiles();
			return;
		}

		// this piece is being taken

		// find the aggressor
		aggressor = null;
		for (var i = this.scene.pieceGroup.childNodes.length - 1; i >= 0; i--) {
			currentPiece = this.scene.pieceGroup.childNodes[i];

			if (currentPiece.is_moving()) {
				aggressor = currentPiece;
				break;
			}
		}

		// make sure its a valid move
		// no fratricide allowed!
		if (aggressor && aggressor.valid_moves.indexOf(this.tile) != -1 && this.color != aggressor.color) {

			this.scene.take_piece(this);
			this.scene.move_piece_to_tile(aggressor,this.tile);

			this.scene.switch_current_turn();
			this.scene.reset_all_tiles();
			
			aggressor.reset();
			console.log('piece taken');
		}

	},

	can_move: function() {
		if (this.is_moving()) {
			return false;
		}

		if (this.scene.current_turn.color !== this.color) {
			return false;
		}
		// if any other piece is clicked
		for (var i = this.scene.pieceGroup.childNodes.length - 1; i >= 0; i--) {
			currentPiece = this.scene.pieceGroup.childNodes[i];
			if (currentPiece.is_moving() && this != currentPiece) {
				return false;
			}
		}
		return true;
	},

	reset: function () {
		this.buttonMode = 'up';
		this.opacity = 1.0;
		this.touchEnabled = true;
		this.visible = true;
	},

	set_moving: function () {
		this.buttonMode = 'down';
		this.opacity = 0.5;
	},

	is_moving: function () {
		return this.buttonMode == 'down';
	},

	move_to: function(x, y) {
		this.tl.moveTo(x,y,5);
	},

	set_taken: function() {	
		// move to taken queue
		this.opacity = 0.5;
		this.touchEnabled = false;
	}
});

// Specific pieces

var Rook = Class.create(Piece, {
	initialize: function(scene,color) {
		Piece.call(this,scene, color, ePieceType.ROOK);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},

	get_valid_moves: function() {
		moves = [];

		currRow = this.tile.row;
		currCol = this.tile.col;

		board = this.scene.board;

		maxDistance = Math.max(MAX_COLS,MAX_ROWS);

		for (var i = 1; i != maxDistance; i++) {
			// The rooks moves are blocked by other pieces
			if (board[currCol+i] && board[currCol+i][currRow]) {
				tile1 = board[currCol+i][currRow];
				if (tile1.piece) {
					if (tile1.piece.color != this.color) {
						moves.push(tile1);
					}
					break;
				}
				moves.push(tile1);
			}
		}
		for (var i = 1; i != maxDistance; i++) {

			if (board[currCol-i] && board[currCol-i][currRow]) {
				tile2 = board[currCol-i][currRow];
				if (tile2.piece) {
					if (tile2.piece.color != this.color) {
						moves.push(tile2);
					}
					break;
				}
				moves.push(tile2);
			}
		}
		for (var i = 1; i != maxDistance; i++) {

			if (board[currCol] && board[currCol][currRow+i]) {
				tile3 = board[currCol][currRow+i];
				if (tile3.piece) {
					if (tile3.piece.color != this.color) {
						moves.push(tile3);
					}
					break;
				}
				moves.push(tile3);
			}
		}
		for (var i = 1; i != maxDistance; i++) {
			
			if (board[currCol] && board[currCol][currRow-i]) {
				tile4 = board[currCol][currRow-i];
				if (tile4.piece) {
					if (tile4.piece.color != this.color) {
						moves.push(tile4);
					}
					break;
				}
				moves.push(tile4);
			}
		}

		this.valid_moves = moves;
	}
});

var Knight = Class.create(Piece, {
	initialize: function(scene,color) {
		Piece.call(this,scene, color, ePieceType.KNIGHT);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},
	get_valid_moves: function() {
		moves = [];

		currRow = this.tile.row;
		currCol = this.tile.col;

		// 8 possible moves for knights
		board = this.scene.board;
		currTile = board[currCol][currRow];

		colOffsets = [-2,-1,1,2];
		rowOffsets = [-2,-1,1,2];

		for (var i = 0; i < colOffsets.length; i++) {
			for (var j = 0; j < rowOffsets.length; j++ ) {
				if ((colOffsets[i] * rowOffsets[j]) == 4 || 
					(colOffsets[i] * rowOffsets[j]) == 1 ||
					(colOffsets[i] * rowOffsets[j]) == -4 ||
					(colOffsets[i] * rowOffsets[j]) == -1)
					continue;

				col = currCol + colOffsets[i];
				row = currRow + rowOffsets[j];

				if (board[col] && board[col][row]) {
					tile = board[col][row];
					if (!tile.piece || (tile.piece && tile.piece.color != this.color))
						moves.push(board[col][row]);
				}
			}
		}

		this.valid_moves = moves;
	}
});

var Bishop = Class.create(Piece, {
	initialize: function(scene,color) {
		Piece.call(this,scene, color, ePieceType.BISHOP);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},
	get_valid_moves: function() {
		moves = [];

		board = this.scene.board;

		// diagonals
		currRow = this.tile.row;
		currCol = this.tile.col;

		board = this.scene.board;

		maxDistance = Math.max(MAX_COLS,MAX_ROWS);

		for (var i = 1; i != maxDistance; i++ ) {
			if (board[currCol+i] && board[currCol+i][currRow+i]) {
				tile = board[currCol+i][currRow+i];
				if (tile.piece) {
					if (tile.piece.color != this.color) {
						moves.push(tile);
					}
					break;
				}
				moves.push(tile);
			}
		}
		for (var i = 1; i != maxDistance; i++ ) {
			if (board[currCol-i] && board[currCol-i][currRow-i]) {
				tile = board[currCol-i][currRow-i];
				if (tile.piece) {
					if (tile.piece.color != this.color) {
						moves.push(tile);
					}
					break;
				}
				moves.push(tile);
			}
		}
		for (var i = 1; i != maxDistance; i++ ) {
			if (board[currCol+i] && board[currCol+i][currRow-i]) {
				tile = board[currCol+i][currRow-i];
				if (tile.piece) {
					if (tile.piece.color != this.color) {
						moves.push(tile);
					}
					break;
				}
				moves.push(tile);
			}
		}
		for (var i = 1; i != maxDistance; i++ ) {
			if (board[currCol-i] && board[currCol-i][currRow+i]) {
				tile = board[currCol-i][currRow+i];
				if (tile.piece) {
					if (tile.piece.color != this.color) {
						moves.push(tile);
					}
					break;
				}
				moves.push(tile);
			}
		}

		this.valid_moves = moves;
	}
});

var Queen = Class.create(Piece, {
	initialize: function(scene,color) {
		Piece.call(this,scene, color, ePieceType.QUEEN);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},
	get_valid_moves: function() {
		moves = [];

		// rook + bishop moves what what
		tempRook = new Rook(this.scene,this.color);
		tempRook.tile = this.tile;
		tempRook.get_valid_moves();

		tempBishop = new Bishop(this.scene,this.color);
		tempBishop.tile = this.tile;
		tempBishop.get_valid_moves();

		moves = tempRook.valid_moves.concat(tempBishop.valid_moves);

		this.valid_moves = moves;
	}
});

var King = Class.create(Piece, {
	initialize: function(scene,color) {
		Piece.call(this,scene, color, ePieceType.KING);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},
	get_valid_moves: function() {
		moves = [];

		// check all directions
		currRow = this.tile.row;
		currCol = this.tile.col;

		board = this.scene.board; 

		possibleMoves = [];
		if (board[currCol] && board[currCol][currRow-1])
			possibleMoves.push(board[currCol][currRow-1]);

		if (board[currCol+1] && board[currCol+1][currRow-1])
			possibleMoves.push(board[currCol+1][currRow-1]);

		if (board[currCol+1] && board[currCol+1][currRow])
			possibleMoves.push(board[currCol+1][currRow]);

		if (board[currCol+1] && board[currCol+1][currRow+1])
			possibleMoves.push(board[currCol+1][currRow+1]);

		if (board[currCol] && board[currCol][currRow+1])
			possibleMoves.push(board[currCol][currRow+1]);

		if (board[currCol-1] && board[currCol-1][currRow+1])
			possibleMoves.push(board[currCol-1][currRow+1]);

		if (board[currCol-1] && board[currCol-1][currRow])
			possibleMoves.push(board[currCol-1][currRow]);

		if (board[currCol-1] && board[currCol-1][currRow-1])
			possibleMoves.push(board[currCol-1][currRow-1]);

		for (var i = 0 ; i != possibleMoves.length; i++) {
			tile = possibleMoves[i];
			if (tile && tile.piece) {
				if (tile.piece.color != this.color) {
					moves.push(tile);
				}
			}
			else
				moves.push(tile);
		}

		this.valid_moves = moves;
	}
});

var Pawn = Class.create(Piece, {
	initialize: function(scene,color,direction) {
		Piece.call(this,scene, color, ePieceType.PAWN);
		this.addEventListener(Event.TOUCH_START,this.handle_mouse_down);
		this.firstMove = true;
		this.direction = direction;
	},
	handle_mouse_down: function (evt) {
		this.get_valid_moves();
		Piece.prototype.handle_mouse_down.call(this,evt);
	},
	get_valid_moves: function() {
		moves = [];

		currRow = this.tile.row;
		currCol = this.tile.col;

		board = this.scene.board;

		possibleMoves = [];
		possibleAttacks = [];

		if( this.direction > 0) {
			if (board[currCol+1] && board[currCol+1][currRow])
				possibleMoves.push(board[currCol+1][currRow]);
		}
		else {
			if (board[currCol-1] && board[currCol-1][currRow])
				possibleMoves.push(board[currCol-1][currRow]);
		}

		if (this.firstMove) {
			// pawns can move 2 spaces on first move only
			if( this.direction > 0) {
				if (board[currCol+2] && board[currCol+2][currRow] && !board[currCol+1][currRow].piece) {
					possibleMoves.push(board[currCol+2][currRow]);
				}
			} else {
				if (board[currCol-2] && board[currCol-2][currRow] && !board[currCol-1][currRow].piece) {
					possibleMoves.push(board[currCol-2][currRow]);
				}
			}
		}
		if( this.direction > 0) {
			if (board[currCol+1] && board[currCol+1][currRow-1])
				possibleAttacks.push(board[currCol+1][currRow-1]);

			if (board[currCol+1] && board[currCol+1][currRow+1])
				possibleAttacks.push(board[currCol+1][currRow+1]);
		} else {
			if (board[currCol-1] && board[currCol-1][currRow+1])
				possibleAttacks.push(board[currCol-1][currRow+1]);

			if (board[currCol-1] && board[currCol-1][currRow-1])
				possibleAttacks.push(board[currCol-1][currRow-1]);
		}

		// move only straight forward
		for (var i = 0 ; i != possibleAttacks.length; i++) {
			tile = possibleAttacks[i];
			if (tile && tile.piece) {
				if (tile.piece.color != this.color) {
					moves.push(tile);
				}
			}
		}

		// move only straight forward
		for (var i = 0 ; i != possibleMoves.length; i++) {
			tile = possibleMoves[i];
			if (!tile.piece)
				moves.push(tile);
		}


		this.valid_moves = moves;
	},
	switch_direction: function() {
		this.direction *= -1;
	}
});

// White pieces
var WhiteRook = Class.create(Rook, {
	initialize: function(scene) {
		Rook.call(this,scene,ePieceColor.WHITE);
	}
});

var WhiteKnight = Class.create(Knight, {
	initialize: function(scene) {
		Knight.call(this,scene,ePieceColor.WHITE);
	}
});

var WhiteBishop = Class.create(Bishop, {
	initialize: function(scene) {
		Bishop.call(this,scene,ePieceColor.WHITE);
	}
});

var WhiteQueen = Class.create(Queen, {
	initialize: function(scene) {
		Queen.call(this,scene,ePieceColor.WHITE);
	}
});

var WhiteKing = Class.create(King, {
	initialize: function(scene) {
		King.call(this,scene,ePieceColor.WHITE);
	}
});

var WhitePawn = Class.create(Pawn, {
	initialize: function(scene,direction) {
		Pawn.call(this,scene,ePieceColor.WHITE,direction);
	}
});

// Black pieces
var BlackRook = Class.create(Rook, {
	initialize: function(scene) {
		Rook.call(this,scene,ePieceColor.BLACK);
	}
});

var BlackKnight = Class.create(Knight, {
	initialize: function(scene) {
		Knight.call(this,scene,ePieceColor.BLACK);
	}
});

var BlackBishop = Class.create(Bishop, {
	initialize: function(scene) {
		Bishop.call(this,scene,ePieceColor.BLACK);
	}
});

var BlackQueen = Class.create(Queen, {
	initialize: function(scene) {
		Queen.call(this,scene,ePieceColor.BLACK);
	}
});

var BlackKing = Class.create(King, {
	initialize: function(scene) {
		King.call(this,scene,ePieceColor.BLACK);
	}
});

var BlackPawn = Class.create(Pawn, {
	initialize: function(scene,direction) {
		Pawn.call(this,scene,ePieceColor.BLACK,direction);
	}
});

var MainScene = Class.create(Scene, {
	// The main gameplay scene.
	initialize: function(whiteSelections,blackSelections) {
		var game;

		this.whiteSelections = whiteSelections;
		this.blackSelections = blackSelections;

		// 1 - Call superclass constructor
		Scene.apply(this);
		// 2 - Access to the game singleton instance
		game = Game.instance;

		this.reset();

	},
	reset: function() {

		for (var i = this.childNodes.length - 1; i >= 0; i--) {
			this.removeChild(this.childNodes[i]);
		}

		this.board = [[],[],[],[],[],[],[],[]];

		if (this.whiteSelections[0] == ePieceType.BISHOP) 
			whiteSelection1 = new WhiteBishop(this);
		else
			whiteSelection1 = new WhiteKnight(this);

		if (this.whiteSelections[1] == ePieceType.BISHOP) 
			whiteSelection2 = new WhiteBishop(this);
		else
			whiteSelection2 = new WhiteKnight(this);

		if (this.blackSelections[0] == ePieceType.BISHOP) 
			blackSelection1 = new BlackBishop(this);
		else
			blackSelection1 = new BlackKnight(this);

		if (this.blackSelections[1] == ePieceType.BISHOP) 
			blackSelection2 = new BlackBishop(this);
		else
			blackSelection2 = new BlackKnight(this);

		this.defaultLayout = [
			// Column 1
			[ 
			  new BlackRook(this),
			  new BlackKnight(this),
			  new BlackBishop(this),
			  new BlackQueen(this),
			  blackSelection1,
			  blackSelection2,
			  new BlackKing(this),
			  new BlackBishop(this),
			  new BlackKnight(this),
			  new BlackRook(this)
			],
			// Column 2
			[
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1),
			  new BlackPawn(this,1)
			],
			// Column 3-6
			[],[],[],[],

			// Column 7,8
			[
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1),
			  new WhitePawn(this,-1)
			],

			[			  
			  new WhiteRook(this),
			  new WhiteKnight(this),
			  new WhiteBishop(this),
			  new WhiteKing(this),
			  whiteSelection1,
			  whiteSelection2,
			  new WhiteQueen(this),
			  new WhiteBishop(this),
		  	  new WhiteKnight(this),
		  	  new WhiteRook(this)
		   ]];
		

		background = new Sprite(320,440);
		background.image = Game.instance.assets['res/BG.png'];
		this.addChild(background);

		this.tileGroup = new Group();
		this.pieceGroup = new Group();
		this.jail_white = new Jail(JAIL1_X_OFFSET,JAIL1_Y_OFFSET);
		this.jail_black = new Jail(JAIL2_X_OFFSET,JAIL2_Y_OFFSET);

		for ( var i = 0 ; i < MAX_COLS ; i++ )
		{ 
			for ( var j = 0 ; j < MAX_ROWS ; j++ )
			{
				tile = new Tile(j, i, this);
				tile.x = GRID_X_OFFSET + i * tile.width; 
				tile.y = GRID_Y_OFFSET + j * tile.height;
				this.tileGroup.addChild(tile);
				
				this.board[i][j] = tile;

				if( this.defaultLayout[i] && this.defaultLayout[i][j] )
				{
					piece = this.defaultLayout[i][j];
					this.move_piece_to_tile(piece,tile);
					piece.firstMove = true;

					piece.reset();
					this.pieceGroup.addChild(piece);	
				}

			}
		}
		this.addChild(this.tileGroup);
		this.addChild(this.pieceGroup);

		this.addChild(new ResetButton(this, 92, 392, 66, 26, ''));
		this.addChild(new SwapButton(this, 209, 392, 55, 26, ''));
		this.addChild(new FlipButton(this, 162, 392, 43, 26, ''));
		this.addChild(new OptionsButton(this, 4, 392, 81, 26, ''));

		this.current_turn = new WhitePawn();
		this.current_turn.scale(0.5,0.5);
		this.current_turn.x = 190;
		this.current_turn.y = 406;
		this.current_turn.touchEnabled = false;
		this.addChild(this.current_turn);

	},
	swap_horiz: function() {
		for ( var i = 0 ; i < MAX_COLS / 2 ; i++ )
		{ 
			for ( var j = 0 ; j < MAX_ROWS ; j++ )
			{
				tile1 = this.board[i][j];
				tile2 = this.board[MAX_COLS - i - 1][j];

				piece1 = tile1.piece;
				piece2 = tile2.piece;
				
				if (piece1)
					piece1FirstMove = piece1.firstMove;

				if (piece2)
					piece2FirstMove = piece2.firstMove;

				this.swap_pieces_between_tiles(tile1,tile2);

				if (piece1 && piece1FirstMove) 
					piece1.firstMove = true;
			
				if (piece2 && piece2FirstMove)
					piece2.firstMove = true;

				if (piece1 && piece1.direction)
					piece1.direction *= -1;

				if (piece2 && piece2.direction)
					piece2.direction *= -1;
			}
		}
	},
	swap_vert: function() {
		for ( var i = 0 ; i < MAX_COLS ; i++ )
		{ 
			for ( var j = 0 ; j < MAX_ROWS / 2 ; j++ )
			{
				tile1 = this.board[i][j];
				tile2 = this.board[i][MAX_ROWS - j - 1];
				
				var piece1 = tile1.piece;
				var piece2 = tile2.piece;

				if (piece1)
					piece1FirstMove = piece1.firstMove;

				if (piece2)
					piece2FirstMove = piece2.firstMove;

				this.swap_pieces_between_tiles(tile1,tile2);
	
				if (piece1 && piece1FirstMove) 
					piece1.firstMove = true;
			
				if (piece2 && piece2FirstMove)
					piece2.firstMove = true;

			}
		}
	},
	switch_current_turn: function() {
		if (this.current_turn.color == ePieceColor.BLACK) {
			this.current_turn.set_color(ePieceColor.WHITE);
			this.current_turn.y += 3;
		} else {
			this.current_turn.set_color(ePieceColor.BLACK);
			this.current_turn.y -= 3;
		}
	},
	reset_all_tiles: function() {
		// reset all tiles
		for (var i = this.tileGroup.childNodes.length - 1; i >= 0; i--) {
			currentTile = this.tileGroup.childNodes[i];
			currentTile.reset();
		}
	},
	take_piece: function(piece) {
		piece.set_taken();
		if (piece.color == ePieceColor.BLACK) {
			this.jail_black.add_piece(piece);
		}
		else {
			this.jail_white.add_piece(piece);
		}
	},

	move_piece_to_tile: function(piece,tile) {
		x = tile.x;
		y = tile.y;

		x -= 0.2*47 - 4;
		y -= 0.2*47 - 3;

		if (piece.color == ePieceColor.WHITE)
		{
			y += 3;
		}

		// unregister piece from tile
		if (piece.tile && piece.tile.piece) 
			piece.tile.piece = null;

		piece.tile = tile;
		tile.piece = piece;

		if (piece.firstMove) {
			piece.firstMove = false;
		}

		piece.move_to(x,y);
	},
	swap_pieces_between_tiles: function(tile1,tile2) {
		piece1 = tile1.piece;
		piece2 = tile2.piece;

		if (piece1) {
			this.move_piece_to_tile(piece1,tile2);
		}
		if (piece2) {
			this.move_piece_to_tile(piece2,tile1);
		}

		// force bindings
		tile2.piece = piece1;
		tile1.piece = piece2;

		if (piece1) 
			piece1.tile = tile2;

		if (piece2)
			piece2.tile = tile1;
	},

	show_options: function() {
		var optionsScene = new OptionScene();	
		Game.instance.pushScene(optionsScene);
	}

});

var Selector = Class.create(Sprite, {
	initialize: function(group,x,y,color,type,selected) {
		Sprite.apply(this,[47,47]);
		asset = "res/" + color.name + " " + type.name + ".png"
		this.image = Game.instance.assets[asset]; 
		this.group = group;
		this.x = x;
		this.y = y;
		this.type = type;

		this.addEventListener(Event.TOUCH_START,this.toggle_selection);

		this.selected = false;
		if (selected) {
			this.select();
		}
	},
	is_selected: function() {
		return this.selected;
	},
	toggle_selection: function() {
		
		if (this.selected) {
			this.reset();
		} else if (this.group.selectCount < 2) {
			this.select();
		}
		console.log(this.group.selectCount);
	},
	select: function() {
		this.selected = true;
		this.opacity = 0.5;
		this.backgroundColor = 'blue';
		this.group.selectCount += 1;
	},
	reset: function() {
		this.selected = false;
		this.opacity = 1.0;
		this.backgroundColor = 'transparent';
		this.group.selectCount -= 1;
	}
});

var SelectorGroup = Class.create(Group, {
	
	initialize: function(x,y,color) {
		Group.call(this);
		this.selectCount = 0;

		this.selectors = [];
		this.selectors.push(new Selector(this,x,y,color,ePieceType.BISHOP,true));
		this.selectors.push(new Selector(this,x+47,y+47,color,ePieceType.KNIGHT,true));
		this.selectors.push(new Selector(this,x,y+47,color,ePieceType.BISHOP,false));
		this.selectors.push(new Selector(this,x+47,y,color,ePieceType.KNIGHT,false));

		for (var i = 0 ; i != this.selectors.length; i++ ) {
			this.addChild(this.selectors[i]);
		}
	},
	get_selections: function() {
		selections = [];
		for (var i = 0 ; i != this.selectors.length; i++ ) {
			if (this.selectors[i].selected) {
				selections.push(this.selectors[i].type);
			}
		}
		return selections;
	}


});

var OkButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.scene = scene;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.transfer_control_to_main_scene();
	}
});

var CancelButton = Class.create(ButtonSprite, {
	initialize: function(scene,x,y,width,height,color) {
		ButtonSprite.call(this, scene, x, y);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.backgroundColor = color;

		this.scene = scene;

		this.addEventListener(Event.TOUCH_START,this.onClick);
	},

	onClick: function() {
		this.scene.pop_scene();
	}
});

var OptionScene = Class.create(Scene, {
	initialize: function() {
		Scene.apply(this);
		background = new Sprite(320,440);
		background.image = Game.instance.assets['res/OptionsBG.png'];
		this.addChild(background);

		this.addChild(new OkButton(this,108,382,100, 50, ''));
		this.addChild(new CancelButton(this,214,382,100, 50, ''));

		this.whiteSelectorGroup = new SelectorGroup(36,87,ePieceColor.WHITE);
		this.blackSelectorGroup = new SelectorGroup(187,87,ePieceColor.BLACK);

		this.addChild(this.whiteSelectorGroup);
		this.addChild(this.blackSelectorGroup);
	},
	transfer_control_to_main_scene: function() {
		whiteSelections = this.whiteSelectorGroup.get_selections();
		blackSelections = this.blackSelectorGroup.get_selections();

		var mainScene = new MainScene(whiteSelections, blackSelections);	
		Game.instance.replaceScene(mainScene);
	},
	pop_scene: function() {
		if (this != Game.instance.rootScene)
			Game.instance.popScene();
		else
			this.transfer_control_to_main_scene();
	}
});

// 2 - On document load
window.onload = function() {
	// 3 - Starting point
	var game = new Game(320, 440);
	// 4 - Preload resources
	game.preload(
		 'res/black bishop.png',
		 'res/black king.png',
		 'res/black knight.png',
		 'res/black pawn.png',
		 'res/black queen.png',
		 'res/black rook.png',
		 'res/white bishop.png',
		 'res/white king.png',
		 'res/white knight.png',
		 'res/white pawn.png',
		 'res/white queen.png',
		 'res/white rook.png',
		 'res/BG.png',
		 'res/OptionsBG.png'
		         );
	// 5 - Game settings
	game.fps = 30;
	game.scale = 1;
	game.onload = function() {
		// Once Game finishes loading
		var optionScene = new OptionScene();
		game.pushScene(optionScene);
	}
	// 7 - Start
	game.start();
	window.scrollTo(0, 0);
}