import { romanize } from "./utils.js";

export let debugLevel = 0;

/**
 * Conditional console.log() function dependent on current and required debug levels.
 * @param {string} text Text to print
 * @param {number} level Required debug level
 * @param {bool} isOnlyCurrent Whether to print debug message only when the two levels are exactly the same
 */
export function log(text, level = 0, isOnlyCurrent = true) {
  let worked = false;
  if (!isOnlyCurrent) {
    if (debugLevel >= level) worked = true;
  } else if (debugLevel == level) worked = true;
  if (worked) {
    if (level > 0) text = "*" + romanize(level) + "* " + text;
    console.log(text);
  }
}

export function setLevel(num) {
  num = parseInt(num);
  debugLevel = num < 0 ? 0 : num;
}

export function addLevels(num = 1) {
  setLevel(debugLevel + num);
}

export function subtractLevels(num = 1) {
  setLevel(debugLevel - num);
}
