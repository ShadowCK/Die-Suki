import * as utils from "./utils.js";

export class Dice {
  constructor(maxValue = 6, owner = null) {
    this.maxValue = maxValue;
    this.owner = owner;
    this.listeners = { roll: {}, reroll: {}, hide: {}, destroy: {} };
  }

  roll() {
    let result = utils.getRandomInt(1, this.maxValue);
    this.handleSkill("roll", this, result);
    return result;
  }

  reroll() {
    let result = utils.getRandomInt(1, this.maxValue);
    this.handleSkill("reroll", this, result);
    return result;
  }

  hide() {
    // TODO
    this.handleSkill("hide", this);
  }

  destroy() {
    this.handleSkill("destroy", this);
  }

  addAbility(type, listener, identifier) {
    if (!this.listeners[type]) {
      this.listeners[type] = {};
    }
    this.listeners[type] = listener;
    if (!identifier) {
      identifier = utils.getRandomString(16, false, true, false);
    }
  }

  handleSkill(type, ...params) {
    if (!this.listeners[type]) return;

    for (const listener of this.listeners[type]) {
      // Do not pass params in an array
      listener(...params);
    }
  }
}
