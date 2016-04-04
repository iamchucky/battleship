'use strict';
(function() {

  // top level ties
  // init game
  // ties interaction
  app.Game = function() {
    // init boards
    this.boards = [new app.Board(0), new app.Board(1)];
  };

  app.Game.prototype = {

    init: function() {
      for (var i = 0; i < this.boards.length; ++i) {
        var b = this.boards[i];
        b.placeShips();
        b.registerUIEventHandlers();
        b.registerEndTurnHandler(this.onChangeTurn.bind(this));
        b.registerWinnerHandler(this.onWinning.bind(this));
      }
      // player0's turn first
      this.boards[1].endTurn();
    },

    onChangeTurn: function(id) {
      var nextId = 0;
      if (id == 0) {
        nextId = 1;
      }
      console.log('player'+nextId+"'s turn");

      this.boards[nextId].onMyTurn();
    },

    onWinning: function(id) {
      var elem = document.getElementById('winningText');
      if (elem) {
        elem.textContent = 'Player'+id+' Won!';
        elem.style.display = 'block';
        setTimeout(function() {
          elem.style.opacity = 1;
        }, 10);
      }
    }

  };

})();
