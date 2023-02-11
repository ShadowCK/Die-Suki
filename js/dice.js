import * as utils from "./utils.js";

/** @type {Dice[]} */
const dices = [];
const postponedListeners = [];

export function handlePostponedEvents() {
  for (const listener of postponedListeners) {
    listener();
  }
}

export function handleEvent(type, ...params) {
  for (const dice of dices) {
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

  execute(...params) {
    if (this.immediate) {
      this.listener.call(this.holder, ...params);
    } else {
      postponedListeners.push(() => {
        console.log("postponed");
        this.listener.call(this.holder, ...params);
      });
    }
  }

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
      // if (listener instanceof EventListener) {
      //   listener.execute(...params);
      // }
      // else if (typeof listener === "function") {
      //   listener.call(this, ...params);
      // }

      // * Small trick: EventListener also has a `call` function, but it may cause confusion!
      if (listener instanceof EventListener || typeof listener === "function") {
        listener.call(this, ...params);
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

test.addAbility(
  "roll",
  new EventListener(
    true,
    function () {
      this.value *= 10;
      console.log(`success: ${this.value}`);
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
      console.log(`success: ${this.value}`);
    },
    test
  )
);

debugger;
test.roll();
