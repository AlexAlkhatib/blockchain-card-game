
class CardMetadataGenerator {
  constructor() {
    this.types = ["Skeleton", "Warrior", "Beast", "Assassin", "Monster", "Mage"];
    this.values = ["Common", "Rare", "Mythical", "Legendary"];
  }

  async getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  async createRandomCard() {
    const type = await this.getRandomElement(this.types);
    const value = await this.getRandomElement(this.values);
    const timestamp = `${Math.floor(Date.now() / 1000)}`;

    return {
      name: `A super cool ${type}`,
      type: type,
      value: value,
      hash: "",
      previousOwners: [],
      createdAt: timestamp,
      lastTransferAt: timestamp
    };
  }
}

export default CardMetadataGenerator;
