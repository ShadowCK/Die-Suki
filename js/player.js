import { Dice } from "./dice.js";
import { getRandomString } from "./utils.js";

const players = [];

export function initPlayers() {
  // Creates Player objects for the player and computer
  let player = new Player("You");
  let computer = new Player("The opponent");
  // Stores the objects in `players` array
  players.push(player, computer);
  // Sets up their next player
  players.forEach((element, index, array) => {
    element.nextPlayer = array[(index + 1) % array.length];
  });
  // TODO: Adds starting dices
}

export class Player {
  /**
   * @param {string} name
   * @param {Dice[]} dices It's a Dice array. Do not pass by spread syntax!
   */
  constructor(name = getRandomString(4, false, true, false), dices) {
    this.name = name;
    this.champions = [];
    this.minions = [];
    this.addDice(...dices);

    this.nextPlayer = null;

    players.push(this);
  }
  get dices() {
    return this.champions.concat(this.minions);
  }

  setNextPlayer(player) {
    this.nextPlayer = player;
  }

  /**
   * @param  {...Dice} dices Do use spread syntax.
   */
  addDice(...dices) {
    for (const dice of dices) {
      if (dice.type === Dice.type.champion) {
        this.champions.push(dice);
      } else if (dice.type === Dice.type.minion) {
        this.minions.push(dice);
      } else {
        debug.log(`Failed to add ${dice} to ${this} - Invalid type "${dice.type}"`, 0);
        return;
      }
      dice.owner = this;
    }
  }

  ownsDice(dice) {
    for (const element of this.dices) {
      if (element === dice) {
        return true;
      }
    }
    return false;
  }

  toString() {
    return `Player ${this.name}`;
  }

  selectDice() {
    // TODO:
  }
}
