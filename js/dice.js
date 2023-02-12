import * as debug from "./debug.js";
import * as utils from "./utils.js";

/** @type {Dice[]} */
const dices = [];
const postponedListeners = [];

export function handlePostponedEvents() {
  let listener;
  while ((listener = postponedListeners.pop())) {
    listener();
  }
}

export function handleEvent(type, ...params) {
  for (const dice of dices) {
    debug.log(`handling ${type} event for ${dice}`, 1);
    dice.handleEvent(type, ...params);
  }
  handlePostponedEvents();
}

export class EventListener {
  constructor(immediate = true, listener, holder = null) {
    this.immediate = immediate;
    this.listener = listener;
    this.holder = holder;
  }

  /**
   * Executes the listener with given parameters (event metadata)
   * @param  {...any} params
   */
  execute(...params) {
    if (this.immediate) {
      this.listener.call(this.holder, ...params);
    } else {
      postponedListeners.push(() => {
        debug.log("postponed", 1);
        this.listener.call(this.holder, ...params);
      });
    }
  }

  /**
   * Allows EventListener to be called as a function via instance.call(), though it's still
   * impossible to directly invoke an instance of a class in JavaScript as if it were a function
   * @param {*} holder Temporarily replaces `this.holder` if not undefined
   * @param  {...any} params
   */
  call(holder, ...params) {
    // Calls the listener with the specified holder
    if (holder !== undefined) {
      /** This avoids changing the signature of execute() and all its existing
          calls to accept an external holder as execute(holder, ...params)  */
      const original = this.holder;
      this.holder = holder;
      this.execute(...params);
      this.holder = original;
    }
    // Uses bound holder
    else {
      this.execute(...params);
    }
  }
}

export class Dice {
  static type = { champion: "Champion", minion: "Minion" };

  constructor(name = utils.getRandomString(4, false, true, false), type = Dice.type.minion, owner = null) {
    this.name = name;
    this.type = type;
    this.isHidden = false;
    this.isDestroyed = false;
    this.value = null;
    this.maxValue = type === Dice.type.champion ? 10 : 6;
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

  addAbility(type, listener, { identifier = undefined, immediate = undefined } = {}) {
    if (!this.listeners[type]) {
      this.listeners[type] = {};
    }
    if (!identifier) {
      identifier = utils.getRandomString(16, false, true, false);
    }
    // Wraps given function as an EventListener
    if (typeof listener === "function") {
      listener = new EventListener(immediate, listener, this);
    }
    // If `listener` is neither a function nor an EventListener, throws an error.
    else if (!(listener instanceof EventListener)) {
      throw new Error(`Incorrect listener for addAbility() - ${listener}`);
    }
    this.listeners[type][identifier] = listener;
  }

  handleEvent(type, ...params) {
    const getListener = (type, identifier) => this.listeners[type][identifier];

    // No listeners of given `type` exists (unless it's pre-set)
    if (!this.listeners[type]) return;

    for (const identifier in this.listeners[type]) {
      const listener = getListener(type, identifier);
      if (listener instanceof EventListener) {
        listener.execute(...params);
      }
      // Technically this wouldn't happen
      else if (typeof listener === "function") {
        listener.call(this, ...params);
      }
    }
  }

  toString() {
    debug.log(this, 1);
    return `${this.type} dice "${this.name}" - owner: ${this.owner}`;
  }
}

//FIXME: test code remove later
window.Dice = Dice;

let test = new Dice();
test.addAbility("roll", function () {
  this.value += 100;
  debug.log(`success: ${this.value}`, 1);
});

test.addAbility(
  "roll",
  new EventListener(
    true,
    function () {
      this.value *= 10;
      debug.log(`success: ${this.value}`, 1);
    },
    test
  )
);

test.addAbility(
  "roll",
  new EventListener(
    false,
    function () {
      this.value *= -1;
      debug.log(`success: ${this.value}`, 1);
    },
    test
  )
);

test.roll();

test.roll();
