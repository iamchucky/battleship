'use strict';
(function() {

  var boardSize = 10;
  var ships = {
    'aircraft-carrior': 5,
    'battleship': 4,
    'submarine': 3,
    'destroyer': 3,
    'patrol-boat': 2
  };

  app.Board = function(playerId) {
    this.playerId = playerId;
    this.myTurn = false;
    this.ships = {
      'aircraft-carrior': 5,
      'battleship': 4,
      'submarine': 3,
      'destroyer': 3,
      'patrol-boat': 2
    };
    this.cells = [];
    this.endTurnHandlers = [];
    this.winnerHandlers = [];

    // allocate cells
    for (var i = 0; i < boardSize; ++i) {
      var row = [];
      for (var j = 0; j < boardSize; ++j) {
        var state = {
          ship: null,
          guessed: false
        };
        row.push(state);
      }
      this.cells.push(row);
    }
  };

  app.Board.prototype = {

    placeShips: function() {
      // randomly place ships
      for (var ship in ships) {
        var shipLen = ships[ship];
        while(1) {
          // pad the board by the ship len
          var pos = getPosition(shipLen);

          // loop over the ship len make sure no overlap
          if (checkCellOccupiedForShip(this.cells, pos, shipLen)) {
            continue;
          }

          markShipOccupiedAt(this.cells, pos, shipLen, ship);
          break;
        }
      }
    },

    registerUIEventHandlers: function() {
      var self = this;
      var boardElemId = 'player'+this.playerId;
      var elem = document.getElementById(boardElemId);
      if (!elem) {
        console.error('no elem');
        return;
      }

      elem.addEventListener('click', function(e) {
        if (!self.myTurn) {
          return;
        }

        if (e.target.hasAttribute('row') && e.target.hasAttribute('col')) {
          var r = parseInt(e.target.getAttribute('row'));
          var c = parseInt(e.target.getAttribute('col'));

          if (self.cells[r][c].guessed) {
            return;
          }

          if (self.cells[r][c].ship) {
            self.ships[self.cells[r][c].ship]--;
            e.target.classList.add('hit');
            self.checkAllShips();
          } else {
            // my turn ends
            self.endTurn();
          }
          //console.log(e.target);
          //console.log(boardElemId);
          //console.log(self.cells[r][c].ship);

          self.cells[r][c].guessed = true;
          e.target.classList.add('guessed');
        }
      });
    },

    checkAllShips: function() {
      var done = true;
      // the game is not done if there is at least one ship block
      for (var ship in this.ships) {
        if (this.ships[ship] > 0) {
          done = false;
          break;
        }
      }
      // update the ui for remaining ship block
      this.updateStat();

      if (done) {
        // player win
        this.disableThisBoard(true);
        this.signalWinner();
        console.log('player'+this.playerId+' win');
      }
    },

    signalWinner: function() {
      for (var i = 0; i < this.endTurnHandlers.length; ++i) {
        this.winnerHandlers[i](this.playerId);
      }
    },

    updateStat: function() {
      var elem = document.getElementById('player'+this.playerId+'-ships');
      if (!elem) {
        return;
      }
      var htmlStr = '';
      for (var ship in this.ships) {
        if (this.ships[ship] == 0) {
          htmlStr += '<p>'+ships[ship]+' '+ship+'</p>';
        }
      }
      elem.innerHTML = htmlStr;
    },

    disableThisBoard: function(disableIt) {
      var elem = document.getElementById('player'+this.playerId);
      if (elem) {
        if (disableIt) {
          elem.classList.add('disable');
        } else {
          elem.classList.remove('disable');
        }
      }
    },

    // events for Game
    onMyTurn: function() {
      this.myTurn = true;
      this.disableThisBoard(false);
    },

    registerEndTurnHandler: function(cb) {
      this.endTurnHandlers.push(cb);
    },
    registerWinnerHandler: function(cb) {
      this.winnerHandlers.push(cb);
    },

    endTurn: function() {
      this.myTurn = false;
      this.disableThisBoard(true);

      // signal end turn
      for (var i = 0; i < this.endTurnHandlers.length; ++i) {
        this.endTurnHandlers[i](this.playerId);
      }
    }

  };

  function getPosition(shipLen) {
    var o = randNum(0, 3); // orientation
    var left = 0;
    var top = 0;
    var right = boardSize-1;
    var bottom = boardSize-1;
    switch(o) {
      case 0:
        top += shipLen-1;
        break;
      case 1:
        right -= shipLen-1;
        break;
      case 2:
        bottom -= shipLen-1;
        break;
      case 3:
        left += shipLen-1;
        break;
    }
    var r = randNum(top, bottom);
    var c = randNum(left, right);
    return { r: r, c: c, o: o };
  }

  function markShipOccupiedAt(cells, pos, len, ship) {
    for (var i = 0; i < len; ++i) {
      if (i != 0) {
        pos = nextPos(pos);
      }

      cells[pos.r][pos.c].ship = ship;
      //console.log('Ship ' + ship + ' placed at ' + pos.r + ',' + pos.c);
    }
  }

  function nextPos(pos) {
    var r = pos.r;
    var c = pos.c;
    switch (pos.o) {
      case 0: // up
        r--;
        break;
      case 1: // right
        c++;
        break;
      case 2: // down
        r++;
        break;
      case 3: // left
        c--;
        break;
    }
    return { r: r, c: c, o: pos.o };
  }

  function checkCellOccupiedForShip(cells, pos, len) {
    if (cells[pos.r][pos.c].ship !== null) {
      return true;
    }

    for (var i = 1; i < len; ++i) {
      pos = nextPos(pos);

      if (cells[pos.r][pos.c].ship !== null) {
        return true;
      }
    }
    return false;
  }

  function randNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
