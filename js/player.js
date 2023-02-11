const players = [];

export class Player {
  constructor() {
    this.champions = [];
    this.minions = [];
    players.push(this);
  }
  get dices() {
    return this.champions.concat(this.minions);
  }
}
