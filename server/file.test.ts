import { describe, expect, it } from "vitest";
import { PublicRuntimeConfig, RuntimeConfig } from "nuxt/schema";
import {
  generateSkipRanges,
  imagePathForId,
  checkInputShowData,
  extractPerLanguageData,
  offsetTimeBySkipRanges,
} from "./file";

describe("generateSkipRanges", () => {
  it("should convert episode skip ranges", () => {
    expect(
      generateSkipRanges(
        0,
        { skipRanges: [{ start: "1:01", end: "1:08" }] },
        undefined,
      ),
    ).toEqual([{ start: 61, length: 7 }]);
  });

  it("should sort episode skip ranges", () => {
    expect(
      generateSkipRanges(
        0,
        {
          skipRanges: [
            { start: "0:50", length: 10 },
            { start: "0:10", length: 9 },
          ],
        },
        undefined,
      ),
    ).toEqual([
      { start: 10, length: 9 },
      { start: 50, length: 10 },
    ]);
  });

  it("should convert common skip ranges", () => {
    expect(
      generateSkipRanges(0, undefined, {
        skipRanges: [{ start: "1:01", end: "1:08" }],
      }),
    ).toEqual([{ start: 61, length: 7 }]);
  });

  it("should complain on invalid skip ranges", () => {
    expect(() =>
      generateSkipRanges(0, { skipRanges: [{ start: "0:01" }] }, undefined),
    ).toThrowError("required");
  });

  it("should generate skip range for intro", () => {
    expect(
      generateSkipRanges(0, { openingIntro: { end: "0:08" } }, undefined),
    ).toEqual([{ start: 0, length: 8 }]);
  });

  it("should generate skip range for cold open", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introEnd: "0:28" } },
        undefined,
      ),
    ).toEqual([{ start: 8, length: 20 }]);
  });

  it("should fill in cold open intro length from common timings", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:07" } },
        { coldOpen: { introLength: "0:55" } },
      ),
    ).toEqual([{ start: 7, length: 55 }]);
  });

  it("should prefer episode data when generating skip range for cold open", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introEnd: "0:28" } },
        { coldOpen: { introLength: "0:17" } },
      ),
    ).toEqual([{ start: 8, length: 20 }]);

    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introLength: "0:17" } },
        { coldOpen: { introEnd: "0:28" } },
      ),
    ).toEqual([{ start: 8, length: 17 }]);
  });

  it("should generate skip range for credits using start", () => {
    expect(
      generateSkipRanges(130, undefined, { endCredits: { start: "1:58" } }),
    ).toEqual([{ start: 118, length: 12 }]);
  });

  it("should generate skip range for credits using endOffset", () => {
    expect(
      generateSkipRanges(200, undefined, { endCredits: { endOffset: "1:12" } }),
    ).toEqual([{ start: 200 - 72, length: 72 }]);
  });

  it("should generate multiple skip ranges for everything", () => {
    expect(
      generateSkipRanges(
        130,
        {
          coldOpen: { introStart: "0:08", introEnd: "0:28" },
          endCredits: { start: "1:58" },
        },
        undefined,
      ),
    ).toEqual([
      { start: 8, length: 20 },
      { start: 118, length: 12 },
    ]);
  });
});

const oneLanguageOneEpisodeInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
      ],
    },
  ],
};

const languageMismatchInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
      {
        language: "xn",
        name: "Xest Xhow",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
      ],
    },
  ],
};

const languageDuplicateInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
      {
        language: "xn",
        name: "Xest Xhow",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
      ],
    },
  ],
};

const oneLanguageTwoEpisodeNoOverviewInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
        },
      ],
    },
    {
      season_number: 1,
      episode_number: 2,
      perLanguage: [
        {
          language: "en",
          name: "My Second Episode",
        },
      ],
    },
  ],
};

const oneLanguageSixEpisodeInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
      ],
    },
    {
      season_number: 1,
      episode_number: 2,
      perLanguage: [
        {
          language: "en",
          name: "My Second Episode",
          overview: "In the second episode, the second episode happens.",
        },
      ],
    },
    {
      season_number: 1,
      episode_number: 3,
      perLanguage: [
        {
          language: "en",
          name: "My Third Episode",
          overview: "In the third episode, the third episode happens.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode Redux",
          overview: "In the first episode, the first episode happens again.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 2,
      perLanguage: [
        {
          language: "en",
          name: "My Second Episode Redux",
          overview: "In the second episode, the second episode happens again.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 3,
      perLanguage: [
        {
          language: "en",
          name: "My Third Episode Redux",
          overview: "In the third episode, the third episode happens again.",
        },
      ],
    },
  ],
};

const twoLanguageSixEpisodeInputShowData = {
  name: {
    name: "Test Show",
    perLanguage: [
      {
        language: "en",
        name: "Test Show",
      },
      {
        language: "xn",
        name: "Xest Xhow",
      },
    ],
  },
  episodes: [
    {
      season_number: 1,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode",
          overview: "In the first episode, the first episode happens.",
        },
        {
          language: "xn",
          name: "Xy Xirst Xpisode",
          overview: "Xn the first episode, the first episode happens.",
        },
      ],
    },
    {
      season_number: 1,
      episode_number: 2,
      perLanguage: [
        {
          language: "en",
          name: "My Second Episode",
          overview: "In the second episode, the second episode happens.",
        },
        {
          language: "xn",
          name: "Xy Xecond Xpisode",
          overview: "Xn the second episode, the second episode happens.",
        },
      ],
    },
    {
      season_number: 1,
      episode_number: 3,
      perLanguage: [
        {
          language: "en",
          name: "My Third Episode",
          overview: "In the third episode, the third episode happens.",
        },
        {
          language: "xn",
          name: "Xy Xhird Xpisode",
          overview: "Xn the third episode, the third episode happens.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 1,
      perLanguage: [
        {
          language: "en",
          name: "My First Episode Redux",
          overview: "In the first episode, the first episode happens again.",
        },
        {
          language: "xn",
          name: "Xy Xirst Xpisode Xedux",
          overview: "Xn the first episode, the first episode happens again.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 2,
      perLanguage: [
        {
          language: "en",
          name: "My Second Episode Redux",
          overview: "In the second episode, the second episode happens again.",
        },
        {
          language: "xn",
          name: "Xy Xecond Xpisode Xedux",
          overview: "Xn the second episode, the second episode happens again.",
        },
      ],
    },
    {
      season_number: 2,
      episode_number: 3,
      perLanguage: [
        {
          language: "en",
          name: "My Third Episode Redux",
          overview: "In the third episode, the third episode happens again.",
        },
        {
          language: "xn",
          name: "Xy Xhird Xpisode Xedux",
          overview: "Xn the third episode, the third episode happens again.",
        },
      ],
    },
  ],
};

describe("checkInputShowData", () => {
  it("should be ok on a 1-episode show", () => {
    checkInputShowData(oneLanguageOneEpisodeInputShowData);
  });

  it("should be ok on a 6-episode show", () => {
    checkInputShowData(oneLanguageSixEpisodeInputShowData);
  });

  it("should be ok on a 2-language 6-episode show", () => {
    checkInputShowData(twoLanguageSixEpisodeInputShowData);
  });

  it("should throw an error if there are no languages", () => {
    expect(() =>
      checkInputShowData({
        name: { name: "X", perLanguage: [] },
        episodes: oneLanguageSixEpisodeInputShowData.episodes,
      }),
    ).toThrow("language");
  });

  it("should throw an error if there are duplicated languages", () => {
    expect(() =>
      checkInputShowData({
        name: {
          name: "X",
          perLanguage: [
            { language: "xn", name: "xn" },
            { language: "xn", name: "xn" },
          ],
        },
        episodes: oneLanguageSixEpisodeInputShowData.episodes,
      }),
    ).toThrow("Duplicate");
  });

  it("should throw an error if there are mismatched languages with episodes", () => {
    expect(() => checkInputShowData(languageMismatchInputShowData)).toThrow(
      "languages in",
    );
  });

  it("should throw an error if there are duplicated languages in episodes", () => {
    expect(() => checkInputShowData(languageDuplicateInputShowData)).toThrow(
      "Duplicate",
    );
  });
});

describe("extractPerLanguageData", () => {
  it("should be ok on a 1-episode show", () => {
    expect(extractPerLanguageData(oneLanguageOneEpisodeInputShowData)).toEqual({
      en: {
        name: "Test Show",
        synopsisAvailable: true,
        episodes: [
          {
            season: 1,
            episode: 1,
            name: "My First Episode",
            synopsis: "In the first episode, the first episode happens.",
          },
        ],
      },
    });
  });

  it("should indicate if no synopsis", () => {
    expect(
      extractPerLanguageData(oneLanguageTwoEpisodeNoOverviewInputShowData),
    ).toEqual({
      en: {
        name: "Test Show",
        synopsisAvailable: false,
        episodes: [
          {
            season: 1,
            episode: 1,
            name: "My First Episode",
          },
          {
            season: 1,
            episode: 2,
            name: "My Second Episode",
          },
        ],
      },
    });
  });

  it("should be ok on a 6-episode show", () => {
    expect(extractPerLanguageData(oneLanguageSixEpisodeInputShowData)).toEqual({
      en: {
        name: "Test Show",
        synopsisAvailable: true,
        episodes: [
          {
            season: 1,
            episode: 1,
            name: "My First Episode",
            synopsis: "In the first episode, the first episode happens.",
          },
          {
            season: 1,
            episode: 2,
            name: "My Second Episode",
            synopsis: "In the second episode, the second episode happens.",
          },
          {
            season: 1,
            episode: 3,
            name: "My Third Episode",
            synopsis: "In the third episode, the third episode happens.",
          },
          {
            season: 2,
            episode: 1,
            name: "My First Episode Redux",
            synopsis: "In the first episode, the first episode happens again.",
          },
          {
            season: 2,
            episode: 2,
            name: "My Second Episode Redux",
            synopsis:
              "In the second episode, the second episode happens again.",
          },
          {
            season: 2,
            episode: 3,
            name: "My Third Episode Redux",
            synopsis: "In the third episode, the third episode happens again.",
          },
        ],
      },
    });
  });

  it("should be ok on a 2-language 6-episode show", () => {
    expect(extractPerLanguageData(twoLanguageSixEpisodeInputShowData)).toEqual({
      en: {
        name: "Test Show",
        synopsisAvailable: true,
        episodes: [
          {
            season: 1,
            episode: 1,
            name: "My First Episode",
            synopsis: "In the first episode, the first episode happens.",
          },
          {
            season: 1,
            episode: 2,
            name: "My Second Episode",
            synopsis: "In the second episode, the second episode happens.",
          },
          {
            season: 1,
            episode: 3,
            name: "My Third Episode",
            synopsis: "In the third episode, the third episode happens.",
          },
          {
            season: 2,
            episode: 1,
            name: "My First Episode Redux",
            synopsis: "In the first episode, the first episode happens again.",
          },
          {
            season: 2,
            episode: 2,
            name: "My Second Episode Redux",
            synopsis:
              "In the second episode, the second episode happens again.",
          },
          {
            season: 2,
            episode: 3,
            name: "My Third Episode Redux",
            synopsis: "In the third episode, the third episode happens again.",
          },
        ],
      },
      xn: {
        name: "Xest Xhow",
        synopsisAvailable: true,
        episodes: [
          {
            season: 1,
            episode: 1,
            name: "Xy Xirst Xpisode",
            synopsis: "Xn the first episode, the first episode happens.",
          },
          {
            season: 1,
            episode: 2,
            name: "Xy Xecond Xpisode",
            synopsis: "Xn the second episode, the second episode happens.",
          },
          {
            season: 1,
            episode: 3,
            name: "Xy Xhird Xpisode",
            synopsis: "Xn the third episode, the third episode happens.",
          },
          {
            season: 2,
            episode: 1,
            name: "Xy Xirst Xpisode Xedux",
            synopsis: "Xn the first episode, the first episode happens again.",
          },
          {
            season: 2,
            episode: 2,
            name: "Xy Xecond Xpisode Xedux",
            synopsis:
              "Xn the second episode, the second episode happens again.",
          },
          {
            season: 2,
            episode: 3,
            name: "Xy Xhird Xpisode Xedux",
            synopsis: "Xn the third episode, the third episode happens again.",
          },
        ],
      },
    });
  });

  it("should reduce down to server-side episodes", () => {
    expect(
      extractPerLanguageData(twoLanguageSixEpisodeInputShowData, [
        {
          season_number: 2,
          episode_number: 2,
          filename: "/path/to/example.mp4",
          lengthSec: 120,
          genLength: 120,
          skipRanges: [],
        },
      ]),
    ).toEqual({
      en: {
        name: "Test Show",
        synopsisAvailable: true,
        episodes: [
          {
            season: 2,
            episode: 2,
            name: "My Second Episode Redux",
            synopsis:
              "In the second episode, the second episode happens again.",
          },
        ],
      },
      xn: {
        name: "Xest Xhow",
        synopsisAvailable: true,
        episodes: [
          {
            season: 2,
            episode: 2,
            name: "Xy Xecond Xpisode Xedux",
            synopsis:
              "Xn the second episode, the second episode happens again.",
          },
        ],
      },
    });
  });
});

describe("offsetTimeBySkipRanges", () => {
  it("should return time unmodified if skip ranges is empty", () => {
    expect(offsetTimeBySkipRanges(100, [])).toEqual(100);
  });

  it("should return time unmodified if skip range is after time", () => {
    expect(offsetTimeBySkipRanges(10, [{ start: 123, length: 18 }])).toEqual(
      10,
    );
  });

  it("should offset by one skip range", () => {
    expect(offsetTimeBySkipRanges(10, [{ start: 5, length: 8 }])).toEqual(18);
  });

  it("should offset by multiple skip ranges", () => {
    expect(
      offsetTimeBySkipRanges(100, [
        { start: 5, length: 8 },
        { start: 27, length: 3 },
        { start: 70, length: 6 },
      ]),
    ).toEqual(100 + 8 + 3 + 6);
  });

  it("should stop offsetting by later irrelevant skip ranges", () => {
    expect(
      offsetTimeBySkipRanges(30, [
        { start: 5, length: 8 },
        { start: 27, length: 3 },
        { start: 70, length: 6 },
      ]),
    ).toEqual(30 + 8 + 3);
  });
});

describe("imagePathForId", () => {
  it("should generate the expected format", () => {
    expect(
      imagePathForId(
        {
          frameOutputDir: "/path/to/output/dir",
          public: { imageOutputExtension: "webp" } as PublicRuntimeConfig,
        } as RuntimeConfig,
        "01234567-89ab-cdef-0123-456789abcdef",
      ),
    );
  });
});
