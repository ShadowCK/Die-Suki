import gameData from "./gameData.js";
import * as main from "./main.js";

export function setupUI() {}

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

// FIXME: test only, remove later
window.addInfo = addInfo;

export function addInfo(string, duration) {
  gameData.infos.push(new Info(string, duration));
}

export function update() {
  document.querySelector("#fps").innerHTML = gameData.fps;
  document.querySelector("#btn-start-game").addEventListener("click", main.startGame);
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
