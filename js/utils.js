/**
 * Returns a value between two others at a point on a linear scale
 * @param {number} start Start point / input value
 * @param {number} end End point / target value
 * @param {number} amt 0 = start. 1 = end.
 * @returns A value at `amt` * 100% on the invertal.
 */
export function lerp(start, end, amt) {
  return start * (1 - amt) + amt * end;
}

/**
 * Uses cosine interpolation to scale one value to another
 * @param {*} y1 Input value
 * @param {*} y2 Target value
 * @param {*} amt Strength of the interpolation
 * @returns Scaled y1
 */
export function cosineInterpolate(y1, y2, amt) {
  let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
  return y1 * (1 - amt2) + y2 * amt2;
}

/**
 * Limits the given value within [min, max]. This is equivalent to the complex use of Math.min(Math.max(min, value), max)
 * @param {number} value Original value
 * @param {number} min Minimum of the returned value.
 * @param {number} max Maximum of the returned value.
 * @returns Original value clamped within the given range.
 */
export function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns Random integer in the specified range
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns Random float in the specified range
 */
export function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @returns a random 2D unit vector in the form of {x, y}
 */
export function getRandomUnitVector() {
  let x = getRandomFloat(-1, 1);
  let y = getRandomFloat(-1, 1);
  let length = Math.sqrt(x * x + y * y);
  if (length == 0) {
    // very unlikely
    x = 1; // point right
    y = 0;
    length = 1;
  } else {
    x /= length;
    y /= length;
  }

  return { x: x, y: y };
}

/**
 * Maps the value using the map reference [Omin,Omax] =>[Mmin,Mmax]
 * @param {number} value
 * @param {number} originalMin
 * @param {number} originalMax
 * @param {number} mappedMin
 * @param {number} mappedMax
 * @returns Mapped value
 */
export function mapValue(value, originalMin, originalMax, mappedMin, mappedMax) {
  // Calculates the ratio of the value in the original range
  let ratio = (value - originalMin) / (originalMax - originalMin);

  // Maps the value to the new range based on the ratio
  return mappedMin + ratio * (mappedMax - mappedMin);
}

/**
 * Changes the first character to its upper case.
 * @param {string} string input string
 * @returns modified string
 */
export function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

/**
 * Trims the trailing zeroes of the string returned by toFixed().
 * @param {number} number Number calling toFixed()
 * @param {number} digits Parameter for toFixed()
 * @returns
 */
export function toFixed_trimZeroes(number, digits = 2) {
  return number.toFixed(digits).replace(/\.0+$/, "");
}

/**
 * Safe version of Object.assign().
 * If objA has a read-only property whose name is the same as objB's, it will NOT write to it.
 * @param {*} objA
 * @param {*} objB
 * @param {string[]} ignores Ignored properties won't be assigned to `objA`.
 */
export function assign(objA, objB, ignores = []) {
  for (const prop in objB) {
    if (ignores && ignores.includes(prop)) {
      continue;
    }

    if (objB.hasOwnProperty(prop)) {
      // Without the descriptor check, this function would be equivalent to Object.assign()
      const descriptor = Object.getOwnPropertyDescriptor(objA, prop);
      if (descriptor && !descriptor.writable) {
        continue;
      }
      objA[prop] = objB[prop];
    }
  }
}

// Static function, add to the constructor! (Object.prototype for methods)
Object.defineProperty(Object, "assign_safe", { value: assign, enumerable: false });

/**
 * Uses JSON to hard copy-paste properties of source obj into target obj.
 * @param {*} target Target object (accepts new properties)
 * @param {*} source Source object (provides properties)
 * @param {string[]} ignores Ignored properties won't be assigned to `target`.
 * @returns If the extension is successful.
 */
export function extend(target, source, ignores) {
  if (target) {
    Object.assign_safe(target, hardCopy(source), ignores);
    return true;
  }
  return false;
}

/**
 * Merges two objects into a new one.
 * @param {*} a
 * @param {*} b
 * @returns New object with all a's and b's properties
 */
export function merge(a, b) {
  if (!a || !b) {
    return undefined;
  }

  return { ...hardCopy(a), ...hardCopy(b) };
}

/**
 * Returns a hard copy of given object using JSON
 * @param {*} obj
 * @returns Hard copy of obj
 */
export function hardCopy(obj) {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Gets a time string converted from given time interval
 * @param {*} time time in seconds
 * @returns time string displaying hours, minutes and seconds
 */
export function getTimeString(time, cap = 24 * 60 * 60) {
  if (time > cap) {
    time = cap;
  }

  let seconds = Number.parseInt(time);
  let minutes = Number.parseInt(seconds / 60);
  seconds %= 60;
  let hours = Number.parseInt(minutes / 60);
  minutes %= 60;

  return `${hours}h ${minutes}min ${seconds}s`;
}

/**
 * Formats the number with big units and keeps specified demical places
 * @param {number} num Number to be formatted
 * @param {number} digits How many decimal places to keep
 * @param {boolean} useScientificNotation Whether or not to use scientific notation instead of unit
 * @param {boolean} useAbbreviation Whether or not to use the short version of the unit
 */
export function formatNumber(num, digits = 1, useScientificNotation = true, useAbbreviation = true) {
  // Note: In JavaScript, a const is a variable that is constant and cannot be reassigned.
  // If we have a large const inside of a function, it will not be recreated every time the function is called.

  // Define the names of the units.
  // https://en.wikipedia.org/wiki/Names_of_large_numbers
  const units = [
    "",
    "K",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
    "Unvigintillion",
  ];

  // https://crusaders-of-the-lost-idols.fandom.com/wiki/Large_Number_Abbreviations
  const units_abbr = [
    "",
    "K",
    "M",
    "B",
    "t",
    "q",
    "Q",
    "s",
    "S",
    "o",
    "n",
    "d",
    "U",
    "D",
    "T",
    "Qt",
    "Qd",
    "Sd",
    "St",
    "O",
    "N",
    "v",
    "c",
  ];

  // Handle numbers less than 1000.
  if (num < 1000) {
    return toFixed_trimZeroes(num, digits);
  }

  // Handle Infinity
  if (num === Infinity) {
    return "Infinity";
  }

  function scientificNotation(num, digits) {
    let exponent = Math.floor(Math.log10(num));
    let shortNum = toFixed_trimZeroes(num / Math.pow(10, exponent), digits);
    return `${shortNum}e${exponent}`;
  }

  if (useScientificNotation) {
    return scientificNotation(num, digits);
  }

  // Determine the appropriate unit.
  let unitIndex = Math.floor(Math.log10(num) / 3);
  if (unitIndex < units.length) {
    let unit = useAbbreviation ? units_abbr[unitIndex] : units[unitIndex];

    // Divide the number by 1000 raised to the appropriate power and limit its decimal places.
    let shortNum = toFixed_trimZeroes(num / Math.pow(1000, unitIndex), digits);

    // Return the number with the appropriate unit suffix.
    return `${shortNum}${unit.length == 1 ? "" : " "}${unit}`;
  }
  // If no valid unit can be used for this number (too large), uses scientific notation even if it's turned off.
  else {
    return scientificNotation(num, digits);
  }
}

/**
 * Generates random (X, Y) coordinates where X can be within either (-maxX,-minX) or (minX,maxX); Same for Y.
 * @param {} minX
 * @param {*} maxX
 * @param {*} minY
 * @param {*} maxY
 * @returns X,Y coordinates as object literal
 */
export function randomCoordinate(minX, maxX, minY, maxY) {
  // Computes X coordinate
  const x = Math.random() * (maxX - minX) + minX;
  const xSign = Math.random() < 0.5 ? -1 : 1;
  const xCoordinate = xSign * x;

  // Computes Y coordinate
  const y = Math.random() * (maxY - minY) + minY;
  const ySign = Math.random() < 0.5 ? -1 : 1;
  const yCoordinate = ySign * y;

  return { x: xCoordinate, y: yCoordinate };
}

/**
 * @param {Array} array
 * @returns The last index of an array
 */
export function lastIndex(array) {
  return array.length - 1;
}

/**
 * @returns The last index of an array
 */
Object.defineProperty(Array.prototype, "lastIndex", { value: () => this.length - 1, enumerable: false });

/**
 * Gets a variable from the element's dataset.
 * @param {string} key Key for the variable
 * @returns {string} Value of the variable
 */
HTMLElement.prototype.getData = function (key) {
  return this.dataset[key];
};

/**
 * Writes a variable to the element's dataset.
 * Because the default of `value` is `""`, won't set the data to be
 * a string `"undefined"` as directly calling `this.dataset[key] = value`;
 * @param {string} key Key for the variable
 * @param {*} value Value of the variable
 */
HTMLElement.prototype.setData = function (key, value = "") {
  this.dataset[key] = value;
};

/**
 * Deletes a variable from the element's dataset (if it exists)
 * @param {string} key Key for the variable
 */
HTMLElement.prototype.removeData = function (key) {
  delete this.dataset[key];
};

/**
 * @param {string} key Key of `dataset`'s property
 * @param {*} value If left undefined, won't check for the value.
 * @returns If the element's dataset contains a variable named as `key`, with specified value.
 */
HTMLElement.prototype.containsData = function (key, value) {
  const data = this.dataset[key];
  if (!data && data != "") return false;
  return value === undefined ? true : data === value.toString();
};

/**
 * @param {string} variable NAME of the variable.
 * @returns Whether the variable has been declared
 */
export function isDeclared(variable) {
  try {
    eval(variable);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Filters all `token` (placeholders) in a string by the returned value of `replacer`
 */
export class CustomFilter {
  /**
   * @param {string} token Identifier for the placeholder
   * @param {Function} replacer Required to get a replacement for the placeholder.
   */
  constructor(token = "{placeholder}", replacer) {
    /** Identifier for the placeholder
     * @type {string} */
    this.token = token;
    /** Required to get a replacement for the placeholder.
     * @type {Function} */
    this.replacer = replacer;
  }

  /**
   * Applies the filter to the input string to replace all matching placeholders
   * @param {string} string
   * @returns `string` with all placeholders parsed
   */
  apply(string) {
    if (!this.replacer) return string;

    let replacement = this.replacer().toString();
    if (!isValidString(replacement)) return string;

    return string.replaceAll(this.token, replacement);
  }
}

/**
 * In addition to {@link CustomFilter}, allows the user to manually set a {@link replacement}.
 * When the filter is applied, it will prioritize the use of `replacement`.
 * The {@link replacer} is only used in the absence of a `replacement`.
 */
export class StaticFilter extends CustomFilter {
  /**
   * @param {string} token Identifier for the placeholder
   * @param {Function} replacer Required to get a replacement for the placeholder.
   */
  constructor(token = "{placeholder}", replacer) {
    super(token, replacer);
    /** Every replacement is one-time use
     * @type {string} */
    this.replacement = "";
  }

  /**
   * @returns Whether the `replacement` property is set.
   */
  hasReplacement() {
    // Undefined, null, empty string are all falsy.
    return !!this.replacement;
  }

  /**
   * @param {string} replacement Replacement for the placeholder
   * @returns this
   */
  setReplacement(replacement) {
    this.replacement = replacement.toString();
    return this;
  }

  /**
   * Returns the replacement and removes it (`replacement` is one-time use)
   * @returns `this.replacement`
   */
  fetchReplacement() {
    let replacement = this.replacement;
    this.replacement = "";
    return replacement;
  }

  apply(string) {
    if (!this.replacer) return string;

    let replacement = (this.hasReplacement() ? this.fetchReplacement() : this.replacer()).toString();
    if (!isValidString(replacement)) return string;

    return string.replaceAll(this.token, replacement);
  }
}

/**
 * Supports dynamic placeholders.
 * e.g., when `token` = "attribute", it matches `{attribute:anyKey}` and inputs the key into the replacer.
 */
export class DynamicFilter extends CustomFilter {
  /**
   * @param {string} token Identifier for the placeholder
   * @param {Function} replacer Required to get a replacement for the placeholder. Supports a parameter for the key.
   * @param {string} separator Separates the token and key.
   * @param {string} leftWrapper Wrapping symbol to the left. Could be `""`.
   * @param {string} rightWrapper Wrapping symbol to the right. Could be `""`.
   */
  constructor(token = "attribute", replacer, separator = ":", leftWrapper = "{", rightWrapper = "}") {
    super(token, replacer);
    this.separator = separator;
    this.leftWrapper = leftWrapper;
    this.rightWrapper = rightWrapper;
  }

  apply(string) {
    if (!this.replacer) return string;

    const regex = new RegExp(`${this.leftWrapper}${this.token}${this.separator}(.*?)${this.rightWrapper}`, "g");
    return string.replaceAll(regex, (match, key) => {
      if (!key) return match;

      let replacement = this.replacer(key).toString();
      return isValidString(replacement) ? replacement : match;
    });
  }
}

/**
 * Handles parsing certain strings.
 */
export class StringParser {
  /**
   * @param {string} formula Math formula with placeholders
   * @param {CustomFilter[]} filters Used to replace the replaceholders
   * @returns Parsed numeric result
   */
  static parseFormula(formula, ...filters) {
    for (const filter of filters) {
      formula = filter.apply(formula);
    }
    try {
      return math.evaluate(formula);
    } catch (e) {
      console.log(`An error occurred while parsing formula ${formula} with filters:`);
      console.log(filters);
      console.log(`${e.name}: ${e.message}`);
      console.trace();
      return null;
    }
  }
}

/**
 * @param {string | *} string May be a valid string, or not a string at all.
 * @returns {boolean} Whether `string` is a valid string (false if `string` is not a string, empty, "undefined" or "null")
 */
export function isValidString(string) {
  if (!!!string || (typeof string !== "string" && !string instanceof String)) {
    return false;
  }
  return string != "undefined" && string != "null";
}

/**
 * @param {*} string May be a string.
 * @returns {boolean} Whether `string` is a string.
 */
export function isString(string) {
  return typeof string === "string" || string instanceof String;
}

/**
 * Chainable version of HTMLElement.prototype.append(nodes).
 * append() returns nothing, making it unable to be chained
 * @param  {...Node} nodes
 * @returns {HTMLElement} this
 */
HTMLElement.prototype.append_chain = function (...nodes) {
  // The rest parameter `nodes` is now an array of input parameters [node1,node2,node3...].
  // The spread operator separates them as individuals again.
  this.append(...nodes);
  // Is equivalent to the below statement
  // this.append.apply(this, nodes);
  return this;
};

// Overwrites the original `addEventListener`
// EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;
/**
 * Chainable version of original `addEventListener` and keeps track of all added event listeners.
 * TODO: Still lacks a modified version of `removeEventListener` to fully implement tracking!
 * Reference: https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html
 * @param {string} type
 * @param {boolean} listener Callback function to execute on event
 * @param {AddEventListenerOptions | boolean} options
 * @returns {EventTarget} this
 */
EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (options == undefined) options = false;
  this._addEventListener(type, listener, options);
  // Creates map for the event listener lists
  if (!this.eventListenerList) this.eventListenerList = {};
  // Creates array as the event listener list
  if (!this.eventListenerList[type]) this.eventListenerList[type] = [];
  // Stores the event listener
  this.eventListenerList[type].push({ listener: listener, options: options });
  return this;
};

/**
 * Gets the array for the event listeners of target type or the entire dictionary if `type` is invalid.
 * @param {string} type Type of the event listeners
 * ! Do not write to the returned object
 */
EventTarget.prototype.getEventListeners = function (type) {
  // ? Maybe returning null is better, because it's not heavily used.
  if (!this.eventListenerList) return [];
  if (!type) {
    // Returns the entire map
    return this.eventListenerList;
  }
  // ? Maybe returning null is better, because it's not heavily used.
  if (!this.eventListenerList[type]) {
    return [];
  }
  return this.eventListenerList[type];
};

/**
 * @param {string} type Type of the event listeners
 * @returns {boolean} Whether the {@link EventTarget} has been registered a listener of `type`
 */
EventTarget.prototype.hasEventListener = function (type) {
  if (!this.eventListenerList) return false;
  if (!this.eventListenerList[type]) false;
  return this.eventListenerList[type].length > 0;
};

/**
 * Displays all event listeners registered for an element.
 * @param {HTMLElement} element
 */
export function showEvents(element) {
  console.log("Registered event listeners for element:");
  console.log(element);
  _showEvents(element.getEventListeners());
}

/**
 * Helper method for {@link showEvents}
 * @param {Object} events Entire `eventListenerList` returned by `EventTarget.getEventListeners(type)` if `type==undefined`
 */
function _showEvents(events) {
  for (let event of Object.keys(events)) {
    console.log(event + " ----------------> " + events[event].length);
    for (let i = 0; i < events[event].length; i++) {
      console.log(events[event][i].listener.toString());
    }
  }
}

// Overwrites document.createElement().
Document.prototype._createElement = Document.prototype.createElement;
/**
 * Creates an HTMLElement with defiend `attribtues` and `properties`.
 * This saves the headache to add them one by one.
 * @param {string} tagName The name of an element.
 * @param {Object} attributes Object literal storing the entries for attributes.
 * @param {Object} properties Object literal storing the entries for properties.
 * @param {ElementCreationOptions} options See {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement}
 * @returns {HTMLElement}
 */
Document.prototype.createElement = function (tagName, attributes, properties, options) {
  /** @type {HTMLElement} */
  let element = this._createElement(tagName, options);
  // Adds attribtues to the element
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  for (const key in properties) {
    element[key] = properties[key];
  }
  return element;
};

/**
 * Updates the innerHTML of an HTMLElement if the new innerHTML is not the same.
 * @param {HTMLElement} element
 * @param {string} newHTML New innerHTML for `element`
 */
export function setInnerHTML(element, newHTML) {
  // * For the sake of resources. Getting innerHTML is much less computationally expensive than setting it.
  if (element.innerHTML === newHTML) return;
  element.innerHTML = newHTML;
}

/**
 * Sets the inline styles together to avoid multiple statements of element.style.aaa="bbb".
 * @param {Map<string, string>} styles Object literal as a map
 * @returns {HTMLElement} this
 */
HTMLElement.prototype.setInlineStyle = function (styles) {
  // Not an object
  if (typeof styles !== "object") {
    console.log(`Input styles "${styles}" is not a valid object literal or Map!`);
    return;
  }
  for (const [key, value] of Object.entries(styles)) {
    // Wrong key
    if (this.style[key] === undefined) continue;
    // In case the value is not a string, converts it.
    this.style[key] = value.toString();
  }
  return this;
};

export function getRandomString(length, hasNumbers = true, hasLetters = true, hasSpecialCharacters = false) {
  let ranges = [];
  if (hasNumbers) ranges.push([48, 57]);
  if (hasLetters) ranges.push([65, 90], [97, 122]);
  if (hasSpecialCharacters) ranges.push([33, 47], [58, 64], [91, 96], [123, 126]);

  let chars = [];
  for (let i = 0; i < length; i++) {
    chars.push(getRandomIndex("default", ...ranges));
  }

  return String.fromCharCode(...chars);
}

Number.prototype.isInRange = function (min, max, includeMin = true, includeMax = true) {
  return (includeMin ? this >= min : this > min) && (includeMax ? this <= max : this < max);
};

/**
 * @param {string} type "default", "sort", "combine". With optimal `ranges`, use "default" to save resources.
 * @param  {...any} ranges [min, max] or {min, max}, range is inclusive
 * @returns {number}
 */
export function getRandomIndex(type = "combine", ...ranges) {
  // If ranges are arrays, convert them to objects
  ranges = ranges.map((range) => (range instanceof Array ? { min: range[0], max: range[1] } : range));

  // Make sure ranges have right min, max properties
  for (const range of ranges) {
    if (range.min > range.max) {
      let trueMin = range.max;
      range.max = range.min;
      range.min = trueMin;
    }
  }

  // Sorts out mins and maxs. Note that combine requires sort.
  if (type === "sort" || type === "combine") {
    // First, stores all mins and maxs in the `sorted` object literal
    let sorted = ranges.reduce(
      (accumulator, currentValue) => {
        accumulator.mins.push(currentValue.min);
        accumulator.maxs.push(currentValue.max);
        return accumulator;
      },
      { mins: [], maxs: [] }
    );
    // Sorts mins and maxs from smallest to biggest
    const smallToBig = (a, b) => a - b;
    sorted.mins = sorted.mins.sort(smallToBig);
    sorted.maxs = sorted.maxs.sort(smallToBig);
    // Using stored values, rearranges `ranges` to the right order.
    for (let i = 0; i < ranges.length; i++) {
      ranges[i] = { min: sorted.mins[i], max: sorted.maxs[i] };
    }
  }

  // Combine overlapping ranges. Requires ranges to be sorted first.
  if (type === "combine") {
    for (let i = 0; i < ranges.length - 1; i++) {
      if (ranges[i].max >= ranges[i + 1].min) {
        ranges[i + 1].min = ranges.splice(i, 1)[0].min;
        i--;
      }
    }
  }

  // Generates random index as if the intervals are connected and finds the corresponding value
  let totalIndices = 0;
  for (const range of ranges) {
    range.start = totalIndices;
    range.end = totalIndices + range.max - range.min;

    range.count = range.max - range.min + 1;
    totalIndices += range.count;
  }
  // For example, "4" on [1,3] ∪ [7,13] is 8 -> 1,2,3,7,8 (0,1,2,3,*4*)
  const indexInAllRanges = getRandomInt(0, totalIndices - 1);
  for (const range of ranges) {
    if (indexInAllRanges.isInRange(range.start, range.end)) {
      // Finds the value in the range that contains the index
      const indexInRange = indexInAllRanges - range.start;
      return range.min + indexInRange;
    }
    continue;
  }
}

export function getRandomChar(fromIndex, toIndex) {
  return getRandomString(fromIndex, toIndex, 1);
}
