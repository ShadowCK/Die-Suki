import * as utils from "./utils.js";

/** @type {Dice[]} */
const dices = [];

export function handleEvent(type, ...params) {
  for (const dice of dices) {
    dice.handleEvent(type, ...params);
  }
}

export class Dice {
  static type = { champion: "champion", minion: "minion" };
  constructor(type = Dice.type.minion, owner = null) {
    this.type = type;
    this.isHidden = false;
    this.isDestroyed = false;
    this.value = null;
    this.maxValue = type === "champion" ? 10 : 6;
    this.owner = owner;
    this.listeners = { roll: {}, reroll: {}, hide: {}, destroy: {} };
    dices.push(this);
  }

  roll() {
    let result = utils.getRandomInt(1, this.maxValue);
    this.value = result;

    handleEvent("roll", this, result);
    return result;
  }

  reroll() {
    let result = utils.getRandomInt(1, this.maxValue);
    this.value = result;

    handleEvent("reroll", this, result);
    return result;
  }

  hide() {
    this.isHidden = true;
    // TODO
    handleEvent("hide", this);
  }

  destroy() {
    this.isDestroyed = true;
    // TODO
    handleEvent("destroy", this);
  }

  addAbility(type, listener, identifier) {
    if (!this.listeners[type]) {
      this.listeners[type] = {};
    }
    if (!identifier) {
      identifier = utils.getRandomString(16, false, true, false);
    }
    this.listeners[type][identifier] = listener;
  }

  handleEvent(type, ...params) {
    const getListener = (type, identifier) => this.listeners[type][identifier];

    // No listeners of given `type` exists (unless it's pre-set)
    if (!this.listeners[type]) return;

    for (const identifier in this.listeners[type]) {
      const listener = getListener(type, identifier);
      if (typeof listener === "function") {
        getListener(type, identifier).call(this, ...params);
      }
    }
  }
}

//FIXME: test code remove later
window.Dice = Dice;

let test = new Dice();
test.addAbility("roll", function () {
  this.value += 100;
  console.log(`success: ${this.value}`);
});

debugger;
test.roll();
