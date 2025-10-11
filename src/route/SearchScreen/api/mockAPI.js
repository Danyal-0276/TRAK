export const fetchNewsFeed = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomSuffix = Math.floor(Math.random() * 1000);

      const allNews = [
        {
          id: "1",
          title: `Pakistan wins T20 Final in dramatic finish #${randomSuffix}`,
          source: "BBC Sports",
          time: "2h ago",
          tags: ["Sports", "Cricket", "T20"],
          content:
            "A stunning performance from Pakistan secures victory in the T20 final, thrilling fans around the world.",
        },
        {
          id: "2",
          title: `AI Revolutionizing Global Industries #${randomSuffix}`,
          source: "TechCrunch",
          time: "5h ago",
          tags: ["AI", "Technology", "Innovation"],
          content:
            "Artificial Intelligence continues to transform business, healthcare, and education through automation and predictive insights.",
        },
        {
          id: "3",
          title: `Stock Market Surges Amid Economic Optimism #${randomSuffix}`,
          source: "Bloomberg",
          time: "3h ago",
          tags: ["Business", "Finance", "Stocks"],
          content:
            "Global markets rally as investors remain optimistic about new economic reforms and strong corporate earnings reports.",
        },
        {
          id: "4",
          title: `NASA Confirms Discovery of New Exoplanet #${randomSuffix}`,
          source: "Space.com",
          time: "6h ago",
          tags: ["Science", "Space", "Astronomy"],
          content:
            "NASA's James Webb Telescope has identified a potentially habitable exoplanet 120 light-years away from Earth.",
        },
        {
          id: "5",
          title: `New Health Guidelines Released for 2025 #${randomSuffix}`,
          source: "World Health Organization",
          time: "4h ago",
          tags: ["Health", "Wellness", "Medicine"],
          content:
            "WHO announces updated dietary and exercise recommendations to help tackle global obesity and cardiovascular diseases.",
        },
        {
          id: "6",
          title: `Hollywood Sees Record Box Office Year #${randomSuffix}`,
          source: "Variety",
          time: "1d ago",
          tags: ["Entertainment", "Movies", "Hollywood"],
          content:
            "Blockbuster hits and streaming deals drive the film industry to its most profitable year since 2019.",
        },
        {
          id: "7",
          title: `Tech Giants Battle Over AI Dominance #${randomSuffix}`,
          source: "The Verge",
          time: "7h ago",
          tags: ["AI", "Tech News", "Startups"],
          content:
            "OpenAI, Google, and Anthropic race to lead the next era of generative AI development and ethical implementation.",
        },
        {
          id: "8",
          title: `Major Political Shift in Upcoming Elections #${randomSuffix}`,
          source: "Reuters",
          time: "8h ago",
          tags: ["Politics", "Elections", "Government"],
          content:
            "Analysts predict surprising trends ahead of the national elections as new parties gain traction among young voters.",
        },
        {
          id: "9",
          title: `Climate Change Accelerates Glacial Melting #${randomSuffix}`,
          source: "National Geographic",
          time: "12h ago",
          tags: ["Environment", "Climate", "Nature"],
          content:
            "Recent studies show an alarming increase in glacier melting rates, threatening ecosystems and global sea levels.",
        },
        {
          id: "10",
          title: `Apple Announces New VisionOS Update #${randomSuffix}`,
          source: "Engadget",
          time: "10h ago",
          tags: ["Apple", "Technology", "Innovation"],
          content:
            "Apple introduces new features in VisionOS that enhance AR experiences and developer capabilities for the Vision Pro.",
        },
      ];

      
      const shuffled = allNews.sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * 4) + 5; 
      const randomSubset = shuffled.slice(0, count);

      resolve(randomSubset);
    }, 1000);
  });
};
    