import * as debug from "./debug.js";
import * as utils from "./utils.js";
import { Player } from "./player.js";
import { addInfo } from "./ui.js";

/** @type {Dice[]} */
export const dices = [];
const postponedListeners = [];

export function handlePostponedEvents() {
  let listener;
  while ((listener = postponedListeners.pop())) {
    listener();
  }
}

export function handleEvent(type, ...params) {
  for (const dice of dices) {
    debug.log(`${dice} handling ${type} event`, 1);
    dice.handleEvent(type, ...params);
  }
  handlePostponedEvents();
}

export class EventListener {
  constructor(immediate = true, listener, holder, identifier, type) {
    // Copy constructor
    if (arguments[0] instanceof EventListener) {
      utils.assign(this, arguments[0]);
      // 2nd parameter would be the new holder
      if (arguments[1]) {
        this.holder = arguments[1];
      }
      return this;
    }

    this.immediate = immediate;
    this.listener = listener;
    this.holder = holder;
    this.identifier = identifier;
    this.type = type;
  }

  setHolder(holder) {
    this.holder = holder;
    return this;
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
  static events = { roll: "roll", reroll: "reroll", hide: "hide", destroy: "destroy" };

  constructor(name = utils.getRandomString(4, false, true, false), type = Dice.type.minion, owner = null) {
    // Copy constructor
    if (arguments[0] instanceof Dice) {
      const other = arguments[0];
      utils.assign(this, other, ["uuid", "listeners"]);

      this.uuid = utils.generateUUID();

      this.listeners = {
        [Dice.events.roll]: {},
        [Dice.events.reroll]: {},
        [Dice.events.hide]: {},
        [Dice.events.destroy]: {},
      };
      for (const type of Object.keys(other.listeners)) {
        for (const identifier of Object.keys(other.listeners[type])) {
          let listener = other.listeners[type][identifier];
          if (listener instanceof EventListener) {
            listener = new EventListener(listener).setHolder(this);
          }
          this.addAbility(type, listener, { identifier: identifier });
        }
      }
      return this;
    }
    // New Dice
    this.name = name;
    this.uuid = utils.generateUUID();
    this.description = "No description for this dice.";
    this.type = type;
    this.isHidden = false;
    this.isDestroyed = false;
    this.isDisabled = false;
    this.value = null;
    this.minValue = 1;
    this.maxValue = type === Dice.type.champion ? 10 : 6;
    /** @type {Player} */
    this.owner = owner;
    this.listeners = {
      [Dice.events.roll]: {},
      [Dice.events.reroll]: {},
      [Dice.events.hide]: {},
      [Dice.events.destroy]: {},
    };
  }

  addDescription(description) {
    this.description = description;
    return this;
  }

  roll() {
    const outcome = utils.getRandomInt(this.minValue, this.maxValue);
    this.value = outcome;

    handleEvent("roll", this, outcome);
    return outcome;
  }

  reroll() {
    const previousRoll = this.value;
    const outcome = utils.getRandomInt(this.minValue, this.maxValue);
    this.value = outcome;

    handleEvent("reroll", this, outcome, previousRoll);
    return outcome;
  }

  // TODO: this is not complete
  hide() {
    this.isHidden = true;
    handleEvent("hide", this);
  }

  // TODO: this is not complete
  destroy(source) {
    if (!source) {
      throw Error(`"destroy" event must have a source! - in ${this}`);
    }

    if (!source instanceof Player || !source instanceof Dice) {
      throw Error(`"destroy" event has an invalid source! - in ${this}`);
    }

    if (!this.isDestroyed) {
      this.isDestroyed = true;
      handleEvent("destroy", this, source);
    }
  }

  disable() {
    this.isDisabled = true;
    // TODO: maybe add an event for "disable" but it may be too much for a simple game
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
      listener = new EventListener(immediate, listener, this, identifier, type);
    }
    // If `listener` is neither a function nor an EventListener, throws an error.
    else if (!(listener instanceof EventListener)) {
      throw new Error(`Incorrect listener for addAbility() - ${listener}`);
    }
    this.listeners[type][identifier] = listener;
    return this;
  }

  handleEvent(type, ...params) {
    if (this.isDisabled) return;

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
    return `${this.type} dice "${this.name}" - owner: ${this.owner}`;
  }

  equals(other) {
    return this.uuid === other.uuid;
  }

  /**
   * @param {Dice | Player} other
   * @returns Whether `other` is `this` or an ally dice or is the human player
   */
  isAlly(other) {
    if (!this.owner || !other.owner) {
      return false;
    }

    if (other instanceof Player) {
      return this.owner === other;
    } else if (other instanceof Dice) {
      return this.owner.ownsDice(other);
    }

    return false;
  }
}

export const configs = {
  /** @type {Dice[]} */
  champions: [],
  /** @type {Dice[]} */
  minions: [],
  /** @type {Dice[]} */
  all: [],
};

function addToConfig(...dices) {
  for (const dice of dices) {
    if (dice.type === Dice.type.champion) {
      configs.champions.push(dice);
    } else if (dice.type === Dice.type.minion) {
      configs.minions.push(dice);
    } else {
      debug.log(`Failed to add ${dice} to configs - Invalid type "${dice.type}"`, 0);
    }
    configs.all.push(dice);
  }
}
//#region Minions
addToConfig(
  new Dice("Warrior", Dice.type.minion)
    .addAbility(
      Dice.events.roll,
      function (dice, outcome) {
        if (!this.isAlly(dice)) {
          dice.value = outcome - 1;
        }
      },
      { immediate: true }
    )
    .addDescription("[On enemy roll] Subtracts the outcome by 1"),
  new Dice("Wizard", Dice.type.minion)
    .addAbility(
      Dice.events.roll,
      function (dice, outcome) {
        if (this === dice) {
          this.value = outcome + 1;
        }
      },
      { immediate: true }
    )
    .addDescription("[On self roll] Adds 1 to the outcome"),
  new Dice("Berzerker", Dice.type.minion)
    .addAbility(
      Dice.events.destroy,
      function (dice) {
        if (this === dice) {
          this.isDestroyed = false;
          // Shorter, and also faster than Math.floor() to convert a float to int
          this.value = (this.value / 2) | 0;
        }
      },
      { immediate: true }
    )
    .addDescription("[On self destroy] Instead of getting destroyed, have its outcome halved"),
  new Dice("Ranger", Dice.type.minion)
    .addAbility(
      Dice.events.reroll,
      function (dice, outcome, previousRoll) {
        if (this === dice) {
          if (outcome < previousRoll) {
            this.value = previousRoll;
          }
        }
      },
      { immediate: true }
    )
    .addDescription("[On self reroll] Number rerolled will not be less than the current."),
  new Dice("Rogue", Dice.type.minion)
    .addAbility(
      Dice.events.hide,
      function (dice) {
        if (this === dice) {
          this.value += 2;
        }
      },
      { immediate: true }
    )
    .addDescription("[On self hide] Adds 2 to the outcome")
);
//#endregion

//#region Champions
addToConfig(
  new Dice("King", Dice.type.champion)
    .addAbility(
      Dice.events.hide,
      function (dice) {
        if (!this.isAlly(dice)) {
          this.minValue += 2;
          this.maxValue += 2;
          this.value = utils.getRandomInt(this.minValue, this.maxValue);
        }
      },
      { immediate: true }
    )
    .addDescription("[On enemy hide] Applies +2/+2 and rerolls this dice."),
  new Dice("Queen", Dice.type.champion)
    .addAbility(
      Dice.events.roll,
      function (dice) {
        if (this.isAlly(dice)) {
          dice.value = utils.getRandomInt(dice.minValue, dice.maxValue + 4);
        }
      },
      { immediate: true }
    )
    .addDescription("[On ally roll] Adds 4 to the outcome maximum"),
  new Dice("Knight", Dice.type.champion)
    .addAbility(
      Dice.events.destroy,
      function (dice, source) {
        if (this.isAlly(dice) && !this.isAlly(source)) {
          /** @type {Player} */
          const opponent = source instanceof Player ? source : source.owner;
          const champions = opponent.champions.slice(0);
          let champion;
          while (
            champions.length > 0 &&
            (champion = champions.splice(utils.getRandomInt(0, champions.lastIndex), 1)[0]).isDisabled
          ) {
            // Nothing needed here
          }
          champion.isDisabled = true;
          addInfo(`${champion} is disabled by ${this}`, 60);
        }
      },
      { immediate: true }
    )
    .addDescription("[On ally destroy] Randomly disables an undisabled champion of your opponent for one turn")
);
//#endregion
