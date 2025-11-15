import melbourneImage from "../../assets/Melbourne Explore Places.jpg";

const sampleData = [
  {
    destination: {
      id: 1,
      title: "Melbourne",
      image: melbourneImage,
      startDate: "2025-01-01",
      endDate: "2025-01-05",
    },
    items: [
      {
        title: "Christmas Square",
        dateRange: {
          start: "2024-11-28",
          end: null,
        },
        location: "Fed Square",
        description: "Immerse yourself in the magic of Christmas.",
        highlights: [
          "17.5 metre tree light up",
          "light and sound shows",
          "candy cane wonderland",
        ],
        category: "attraction",
      },
      {
        title: "Crown Christmas River Show",
        dateRange: {
          start: "2024-11-28",
          end: null,
        },
        location: "Southbank Promenade, Crown",
        description:
          "Mind-blowing river show with water fountains, glowing lasers, and light projections.",
        highlights: ["dazzling Christmas display"],
        category: "attraction",
      },
      {
        title: "Moonlight Cinema",
        dateRange: {
          start: "2024-12-03",
          end: "2025-04-05",
        },
        location: "Royal Botanic Gardens",
        description: "Enjoy new releases and old flicks under the stars.",
        highlights: ["Wicked: For Good", "Bruce Springsteen biopic"],
        category: "other",
      },
      {
        title: "Christmas Cinema",
        dateRange: {
          start: "2024-12-06",
          end: "2024-12-21",
        },
        location: "The Capitol",
        description: "Feel-good movies with popcorn and a choc top.",
        highlights: ["Home Alone"],
        category: "restaurant",
      },
      {
        title: "Westwood | Kawakubo",
        dateRange: {
          start: "2024-12-07",
          end: "2025-04-19",
        },
        location: "NGV",
        description: "Explore work by Vivienne Westwood and Rei Kawakubo.",
        highlights: ["rare garments"],
        category: "other",
      },
      {
        title: "The ultimate Melbourne live gig guide",
        dateRange: {
          start: null,
          end: null,
        },
        location: "Melbourne",
        description: "",
        highlights: [
          "iconic Detroit DJ Moodyman",
          "Ghibli concert at Paris Jazz Cat",
          "free concert at St Paul's Cathedral",
        ],
        category: "event",
      },
      {
        title: "Unmissable theatre shows",
        dateRange: {
          start: null,
          end: null,
        },
        location: "Melbourne",
        description: "",
        highlights: [
          "Cats the Musical",
          "A Christmas Carol",
          "The Idols of Musical Theatre",
        ],
        category: "other",
      },
    ],
  },
];

export default sampleData;
