import * as ui from "./ui.js";
import gameData from "./gameData.js";
import * as utils from "./utils.js";
import { Dice } from "./dice.js";
import * as debug from "./debug.js";

window.addEventListener("load", init);

function init() {
  ui.setupUI();
  gameLoop();
  debug.log(utils.StringParser.parseFormula("15+3*9"), 0);
}

/**
 * Continuously updates game data and graphics!
 * @param {number} realtimeSinceStartup time since the page is loaded
 */
function gameLoop(realtimeSinceStartup) {
  requestAnimationFrame(gameLoop);

  const data = gameData;
  if (!data.paused) {
    // Calculates delta time
    realtimeSinceStartup /= 1000; // To seconds
    data.totalRunTime = realtimeSinceStartup;
    data.deltaTime = data.totalRunTime - data.previousTotalRunTime;
    data.previousTotalRunTime = realtimeSinceStartup;
    // In case of any lags, restrict deltaTime to be reasonably large.
    if (data.deltaTime > 1 / 10) data.deltaTime = 1 / 10;
    // Updates FPS
    data.fps = Math.round(1 / data.deltaTime);

    // Main body of the update
    updateGame();
    ui.update();
  }
}

function updateGame() {}

export function startGame() {
  if (gameData.hasStarted) {
    ui.addInfo(`You are already in game! (${new Date().toLocaleTimeString()})`, 2.5);
    return;
  }
  ui.addInfo(`Game starts! (${new Date().toLocaleTimeString()})`, 10);
  gameData.hasStarted = true;
  debug.log("Game starts!", 0);
}
