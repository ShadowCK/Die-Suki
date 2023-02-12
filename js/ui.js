import * as debug from "./debug.js";
import gameData from "./gameData.js";
import * as main from "./main.js";
import { Player, players } from "./player.js";
import * as player from "./player.js";
import { Dice } from "./dice.js";
import * as dice from "./dice.js";
import { setInnerHTML } from "./utils.js";

let btnStartGame, inputDebugLevel, labelDebugLevel;

export function setupUI() {
  btnStartGame = document.querySelector("#btn-start-game");
  btnStartGame?.addEventListener("click", main.startGame);

  inputDebugLevel = document.querySelector("#input-debug-level");
  labelDebugLevel = document.querySelector("label[for='input-debug-level']");
  inputDebugLevel?.addEventListener("change", () => {
    debug.setLevel((labelDebugLevel.innerHTML = inputDebugLevel.value));
  });
}

export function generateDices() {
  for (const player of players) {
    let html = player.dices
      .map((dice) => `<li><span class="dice-name">${dice.name}</span><span class="dice-value">0</span></li>`)
      .join("")
      .addTag("ol");
    if (player.isHuman()) {
      setInnerHTML(document.querySelector("#player-dices"), html);
    } else {
      setInnerHTML(document.querySelector("#enemy-dices"), html);
    }
  }
}

export class Info {
  constructor(string = "Unknown", duration = 1) {
    this.string = string;
    this.duration = duration;
    this.timer = 0;

    let element = document.createElement("li", undefined, { innerHTML: `${string}` });
    this.element = document.querySelector("#infos").appendChild(element);
  }

  update(deltaTime) {
    this.timer += deltaTime;
    return this.isOff;
  }

  get isOn() {
    return this.timer < this.duration;
  }

  get isOff() {
    return this.timer >= this.duration;
  }

  get timeLeft() {
    return Math.max(0, this.duration - this.timer);
  }
}

export function addInfo(string, duration) {
  gameData.infos.push(new Info(string, duration));
}

export function update() {
  document.querySelector("#fps").innerHTML = gameData.fps;
  debug.setLevel((labelDebugLevel.innerHTML = inputDebugLevel.value));

  updateInfos();
}

function updateInfos() {
  for (let i = 0; i < gameData.infos.length; i++) {
    const info = gameData.infos[i];
    // If info has expired, update() returns true
    if (info.update(gameData.deltaTime)) {
      info.element.parentElement.removeChild(info.element);
      gameData.infos.splice(i, 1);
      i--;
    } else {
      info.element.setInlineStyle({ opacity: info.timeLeft / info.duration });
    }
  }
}
