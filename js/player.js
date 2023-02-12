import { Dice } from "./dice.js";
import * as dice from "./dice.js";
import { getRandomElement, getRandomString } from "./utils.js";

export const players = [];

export function initPlayers() {
  // Creates Player objects for the player and computer
  let player = new Player("You");
  let computer = new Player("The opponent");
  // Stores the objects in `players` array
  players.push(player, computer);
  // Sets up their next player
  players.forEach((element, index, array) => {
    element.nextPlayer = array[(index + 1) % array.length];
    // * Random starting dices. Allows repetitive dices (temporarily)
    // Adds two champions and four minions
    const dices = [...getRandomElement(dice.configs.champions, 2), ...getRandomElement(dice.configs.minions, 4)].map(
      (dice) => new Dice(dice)
    );
    debugger;
    element.addDice(...dices);
  });
}

export class Player {
  /**
   * @param {string} name
   * @param {Dice[]} dices It's a Dice array. Do not pass by spread syntax!
   */
  constructor(name = getRandomString(4, false, true, false), dices = []) {
    this.name = name;
    this.champions = [];
    this.minions = [];
    this.addDice(...dices);

    this.nextPlayer = null;
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
    for (const _dice of dices) {
      if (_dice.type === Dice.type.champion) {
        this.champions.push(_dice);
      } else if (_dice.type === Dice.type.minion) {
        this.minions.push(_dice);
      } else {
        debug.log(`Failed to add ${_dice} to ${this} - Invalid type "${_dice.type}"`, 0);
        return;
      }
      _dice.owner = this;
      dice.dices.push(_dice);
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
