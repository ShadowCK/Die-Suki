import { Dice, EventListener } from "./dice.js";
import * as ui from "./ui.js";
import * as debug from "./debug.js";

window.Dice = Dice;
window.addInfo = ui.addInfo;
window.debug = debug;

window.addEventListener("load", init);

function init() {
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
}
