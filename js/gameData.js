import * as ui from "./ui.js";

// ********** Metrics **********
let deltaTime; // Time elapsed between frames
let totalRunTime; // Time elapsed since startup
let previousTotalRunTime; // Time elapsed from startup to last frame
let fps; // Frames per second
let paused = false; // If paused, gameLoop (and most other tasks) will not be executed.
let hasStarted = false;
/** @type {ui.Info[]} */
export const infos = [];

// Helper interface that makes the variables writable via setters
let gameData = {
  get deltaTime() {
    return deltaTime;
  },
  set deltaTime(value) {
    deltaTime = value;
  },
  get totalRunTime() {
    return totalRunTime;
  },
  set totalRunTime(value) {
    totalRunTime = value;
  },
  get previousTotalRunTime() {
    return previousTotalRunTime;
  },
  set previousTotalRunTime(value) {
    previousTotalRunTime = value;
  },
  get fps() {
    return fps;
  },
  set fps(value) {
    fps = value;
  },
  get paused() {
    return paused;
  },
  set paused(value) {
    paused = value;
  },
  get hasStarted() {
    return hasStarted;
  },
  set hasStarted(value) {
    hasStarted = value;
  },
  get infos() {
    return infos;
  },
};

// Note: `export default` must be after the declaration so that the value imported would stay the same
// Unlike named exports which are evaluated each time the module is imported
export default gameData;
