import type { Content } from "@/engine/engine";

export const content: Content = {
  skills: {
    foraging: {
      id: "foraging",
      name: "Foraging",
      description:
        "The noble art of eating whatever grows near the pond and calling it a lifestyle.",
    },
  },
  items: {
    duckweed: {
      id: "duckweed",
      name: "Duckweed",
      description:
        "Named after ducks. Eaten by ducks. Nobody asked the duckweed how it feels about this.",
    },
  },
  actions: {
    "forage-duckweed": {
      id: "forage-duckweed",
      skillId: "foraging",
      name: "Forage Duckweed",
      description: "Tail up, head under, dignity optional.",
      cycleMs: 3000,
      experiencePerCycle: 10,
      yields: [{ itemId: "duckweed", quantity: 1 }],
    },
  },
};
