# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v0.3.1

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- Make April 1 animation less predictable ([b92d7342](https://github.com/steadygaze/frame-randomizer/commit/b92d7342))
- Also warn about April 1 nauseau ([8ed63820](https://github.com/steadygaze/frame-randomizer/commit/8ed63820))

### ❤️ Contributors

- Steady Gaze ([@steadygaze](http://github.com/steadygaze))

## v0.3.0

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.2.2...v0.3.0)

### 🚀 Enhancements

- Add April Fools color changing effect ([8876c84a](https://github.com/steadygaze/frame-randomizer/commit/8876c84a))

### 🩹 Fixes

- Make episode links less visible in light mode ([542df578](https://github.com/steadygaze/frame-randomizer/commit/542df578))

### ❤️ Contributors

- Steady Gaze ([@steadygaze](http://github.com/steadygaze))

## v0.2.2

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.2.1...v0.2.2)

### 🩹 Fixes

- Fix episode URL styles in dark mode ([954a286f](https://github.com/steadygaze/frame-randomizer/commit/954a286f))

### 🏡 Chore

- Update deps ([d2a2be15](https://github.com/steadygaze/frame-randomizer/commit/d2a2be15))

### ❤️ Contributors

- Steady Gaze ([@steadygaze](http://github.com/steadygaze))

## v0.2.1

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.2.0...v0.2.1)

### 🩹 Fixes

- Fix light scrollbar in dark mode ([40fff28b](https://github.com/steadygaze/frame-randomizer/commit/40fff28b))

### 📖 Documentation

- Add note about build/path known issue ([80d9cefe](https://github.com/steadygaze/frame-randomizer/commit/80d9cefe))
- Stage package-lock.json ([1f3c11b5](https://github.com/steadygaze/frame-randomizer/commit/1f3c11b5))

### 🏡 Chore

- Really upgrade nuxt-security ([4dcd1acf](https://github.com/steadygaze/frame-randomizer/commit/4dcd1acf))

### ❤️ Contributors

- Steady Gaze ([@steadygaze](http://github.com/steadygaze))

## v0.1.3...v0.2.0

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.1.3...v0.2.0)

### 🚀 Enhancements

- Add dark mode and themeing infra ([d2cdd2b8](https://github.com/steadygaze/frame-randomizer/commit/d2cdd2b8))

### 🩹 Fixes

- Fix Polish translation ([#4](https://github.com/steadygaze/frame-randomizer/pull/4))
- Fix saving audio on Firefox ([bb56f460](https://github.com/steadygaze/frame-randomizer/commit/bb56f460))
- Fix saved frame filename ([7990a0f4](https://github.com/steadygaze/frame-randomizer/commit/7990a0f4))
- Add check to prevent blindly growing queue ([207799f5](https://github.com/steadygaze/frame-randomizer/commit/207799f5))
- Revert vue-tsc to old version ([0f976281](https://github.com/steadygaze/frame-randomizer/commit/0f976281))
- Load prettier sort plugin ([06fd90c5](https://github.com/steadygaze/frame-randomizer/commit/06fd90c5))

### 💅 Refactors

- Add error object to ffprobe error log ([7e6a9190](https://github.com/steadygaze/frame-randomizer/commit/7e6a9190))
- Upgrade deps and refactor types ([1072ebb5](https://github.com/steadygaze/frame-randomizer/commit/1072ebb5))

### 📖 Documentation

- Add procedure for releasing a new version ([c790c637](https://github.com/steadygaze/frame-randomizer/commit/c790c637))

### 🏡 Chore

- Upgrade dev dependencies ([9f6051db](https://github.com/steadygaze/frame-randomizer/commit/9f6051db))
- Migrate to husky v9 ([b6f0304f](https://github.com/steadygaze/frame-randomizer/commit/b6f0304f))
- Upgrade Nuxt, nuxt-security, and more ([75d3d006](https://github.com/steadygaze/frame-randomizer/commit/75d3d006))
- **release:** V0.2.0 ([4703afc0](https://github.com/steadygaze/frame-randomizer/commit/4703afc0))

### ❤ Contributors

- Steady Gaze
- GPH-28

## v0.1.3

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.1.2...v0.1.3)

### 🩹 Fixes

- Fix real time/guess time inconsistencies ([f57d046](https://github.com/steadygaze/frame-randomizer/commit/f57d046))

### ✅ Tests

- Add tests for timer text generation ([37822d9](https://github.com/steadygaze/frame-randomizer/commit/37822d9))

### ❤️ Contributors

- Steady Gaze

## v0.1.2

[compare changes](https:///frame-randomizer/compare/v0.1.1...v0.1.2)

### 🩹 Fixes

- Fix writing incorrect answer data to runs (6e813bc)

### 💅 Refactors

- Refer to resources instead of frames (854d8f9)
- Size pane with rem (by text size) (4c4a3ee)

### 📦 Build

- Upgrade nuxt-security to latest (a20fb92)

### ❤️ Contributors

- Steady Gaze

## v0.1.1

[compare changes](https:///frame-randomizer/compare/v0.1.0...v0.1.1)

### 🩹 Fixes

- Retain kind on serving (d12d6f5)
- Fix rare duped resource ID race condition (2f8c755)
- Fix float volume display issue (2f3e652)
- Fix audio player drawing over modals (1db3146)

### 💅 Refactors

- Convert resource IDs to a set in cleanup (bce4c39)

### ❤️ Contributors

- Steady Gaze

## v0.1.0

[compare changes](https:///frame-randomizer/compare/v0.0.21...v0.1.0)

`v0.0.x` migration guide:

- Back up the `./frame-randomizer` directory.
- Either run `rm -r ./frame-randomizer` (the easy way) or run `mv ./frame-randomizer/frames ./frame-randomizer/resouces` or set resourceOutputDir to `./frame-randomizer/frames` and `mv ./frame-randomizer/frame-state ./frame-randomizer/resource-state` (the hard way).
- If you're setting them in environment variables or code, rename the options `frameGenMaxParallelism` to `resourceGenMaxParallelism`, `frameOutputDir` to `resourceOutputDir`, `framePregenCount` to `resourcePregenCount`, `frameRequiredStandardDeviation` to `frameRequiredStandardDeviation` to `frameRequiredStandardDeviation256` (and make it out of 256 instead of 65536).
- Tell users to refresh the page if they were using it when the server upgraded before they continue.

### 🚀 Enhancements

- Store server logs (dfb7194)
- Add option to include subtitles in frame (b3d68b2)
- Add audio mode (1f64aec)
- Add audio settings (1e80761)
- Disallow changing game mode during a run (7e5229f)
- Set per-kind minimums to pregenerate (eff44e2)
- Allow injecting audio encoding options (d70b821)
- Include kind in verified run data (1bc62c7)
- Shorten downloaded file names (de5edb0)

### 🩹 Fixes

- Fix message for run verification error (68a69d8)
- Show one column results on desktop (469d665)
- Fix cleanup of old version files without kind (f6e3f99)
- Distinguish frame/audio in verifier text (c6fcbf9)
- Remove extra spaces from translations (d2ee9b9)

### 💅 Refactors

- Add helper for getting app data path (33b2fe2)
- Use named export for logger (a75cd75)
- ⚠️ Rename frame options to reflect usage (fc9e09d)
- Refactor out queue top-up helpers (6de3496)
- ⚠️ Restructure/rename API endpoints (0b9d9ad)
- ⚠️ Use camelcase param cleanupId (2b58529)
- ⚠️ Rename resource options for consistency (04e0c1c)

### 📖 Documentation

- Add doc for subtitle options (0bb1ada)

#### ⚠️ Breaking Changes

- ⚠️ Rename frame options to reflect usage (fc9e09d)
- ⚠️ Restructure/rename API endpoints (0b9d9ad)
- ⚠️ Use camelcase param cleanupId (2b58529)
- ⚠️ Rename resource options for consistency (04e0c1c)

### ❤️ Contributors

- Steady Gaze

## v0.0.21

[compare changes](https:///frame-randomizer/compare/v0.0.20...v0.1.0)

### 🚀 Enhancements

- Add fuzzy search settings (0da658d)
- Add original language name search (7c063dc)

### 🩹 Fixes

- Fix possible bug with number display (eb7df35)

### 💅 Refactors

- ⚠️ Rename "default" language to original (34e791d)

### 📦 Build

- Add repo to package.json (6b9e7f9)

### 🏡 Chore

- Upgrade deps (9ed6320)

#### ⚠️ Breaking Changes

- ⚠️ Rename "default" language to original (34e791d)

### ❤️ Contributors

- DayBreakerBrony
- Steady Gaze

## v0.0.20

[compare changes](https://undefined/undefined/compare/v0.0.19...v0.0.20)

### 🩹 Fixes

- Fix skip button not disabled while loading (a148a11)
- Fix modals being oversized on mobile (f4a27e4)

### 💅 Refactors

- Shift run id slightly (d69e52a)

### 🏡 Chore

- Upgrade deps (9e1eb16)

### ❤️ Contributors

- Steady Gaze

## v0.0.19

[compare changes](https://undefined/undefined/compare/v0.0.18...v0.0.19)

### 🚀 Enhancements

- Add raster favicon setup at various sizes (bc972d1)
- Include frame assignment latency in run data (b4346a6)
- Include server-side version too (f7cd6aa)
- Include seek time in run data (8479dc4)
- Separate assignment/start timestamps (29bca24)
- Focus the "New Frame" button on run start (09038da)
- Add settings and object-fit setting (60a7f4c)
- Add additional real time timers (d8038e0)

### 🩹 Fixes

- Use clearer labels for run verification UI (c1c50d4)
- Show part of run id in UI (d7278a3)
- Translate settings button label (625afd7)
- Enable lazy language loading (77d3e74)
- Support switching languages during a run (f890d8c)

### 💅 Refactors

- Remove obsolete storage init code (13919eb)

### 📖 Documentation

- Document favicon setup (fbfac2b)
- Add hosting tips to README (ee08e26)

### 📦 Build

- Add pre-push hook (589e8fe)
- Upgrade dependencies (c58e022)

### ❤️ Contributors

- Steady Gaze

## v0.0.18

[compare changes](https://undefined/undefined/compare/v0.0.17...v0.0.18)

### 🩹 Fixes

- Set image content-type separately (c027612)
- Stop double-triggering of answer submission (f9ef6e4)
- Fix save button on Firefox (996ea8b)

### 📦 Build

- Upgrade to Nuxt 3.6.2 (5daede3)

### ❤️ Contributors

- Steady Gaze

## v0.0.17

[compare changes](https://undefined/undefined/compare/v0.0.16...v0.0.17)

### 🩹 Fixes

- Fix reset button behavior with run tracking (a1d2d52)

### 🎨 Styles

- Fix lint errors (319a762)

### ❤️ Contributors

- Steady Gaze

## v0.0.16

[compare changes](https://undefined/undefined/compare/v0.0.15...v0.0.16)

### 🩹 Fixes

- Stop deleting answer/image when tabbing away (6142732)

### ❤️ Contributors

- Steady Gaze

## v0.0.15

[compare changes](https://undefined/undefined/compare/v0.0.14...v0.0.15)

### 🚀 Enhancements

- Add basic run verification (768e385)
- Add cryptographic signing of results (b7767fd)

### 🩹 Fixes

- Fix wrong file extension on right click/save (3e1a37c)
- Also clean up answer on exit (d61d64f)

### 💅 Refactors

- Rename imageId to frameId (1e79d50)

### ❤️ Contributors

- Steady Gaze

## v0.0.14

[compare changes](https://undefined/undefined/compare/v0.0.13...v0.0.14)

### 🩹 Fixes

- Fix save button by tweaking image lifetimes (34d97a4)
- Warn if image is likely expired when saving (ca984f3)
- Fix Ctrl-u shortcut being used by browser (06bddf7)

### 📦 Build

- Ignore ./frame-randomizer dir (48972dc)
- Update dependencies (4aa6911)

### ❤️ Contributors

- Steady Gaze

## v0.0.13

[compare changes](https://undefined/undefined/compare/v0.0.12...v0.0.13)

### 🚀 Enhancements

- Show number shortcut modifier by browser (da8521f)
- Make Ctrl + u clear the search input (f688cf1)
- Load frames and answers from prior runs (1f652ca)
- Make show data config downloadable in About (8181608)

### 🩹 Fixes

- Fix save button not expanding to full width (6a51464)
- Make mod input momentarily highlight entry (72e37df)
- Fix language fallback behavior (2333fa0)

### 💅 Refactors

- Simplify datastore names (58e56eb)

### 📖 Documentation

- Update README with new config format (14b5366)

### 📦 Build

- Stop running tsc separately (092b824)
- Remove tsc from precommit hook (ebe564e)
- Update to Nuxt 3.6.1 (58c3627)
- Update misc deps (f2622bf)

### ❤️ Contributors

- Steady Gaze

## v0.0.12

[compare changes](https://undefined/undefined/compare/v0.0.11...v0.0.12)

### 🩹 Fixes

- Add human translation for zh by Cosmia Nebula (015182c)
- Remove errant $ from text (7670736)
- Use length exception for zh in About (9771b49)

### ❤️ Contributors

- Steady Gaze

## v0.0.11

[compare changes](https://undefined/undefined/compare/v0.0.10...v0.0.11)

### 🚀 Enhancements

- Add episode button functions (2b5c481)
- Add explicit save button (14d1ca7)

### 🩹 Fixes

- Add Polish translation by a human (#1)
- Fix missing i18n substitutions (4ef7cad)

### 💅 Refactors

- Fix typing for runtime config (38c3f54)
- Sort translation keys recursively (9ec929b)

### 📦 Build

- Move deps out of devDependencies (285bdfb)

### ❤️ Contributors

- Steady Gaze
- Krzysztof-WW

## v0.0.10

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.0.9...v0.0.10)

### 🚀 Enhancements

- Add Polish translations ([51ac5d1](https://github.com/steadygaze/frame-randomizer/commit/51ac5d1))

### 🩹 Fixes

- Improve German translations ([0d18b7b](https://github.com/steadygaze/frame-randomizer/commit/0d18b7b))

### 📦 Build

- Update dependencies ([bd73b53](https://github.com/steadygaze/frame-randomizer/commit/bd73b53))

### ❤️ Contributors

- Steady Gaze

## v0.0.9

[compare changes](https://github.com/steadygaze/frame-randomizer/compare/v0.0.8...v0.0.9)

### 🚀 Enhancements

- Include frame path in initial SSR result ([c8bf5f2](https://github.com/steadygaze/frame-randomizer/commit/c8bf5f2))
- Support multi-language show data input ([a36061d](https://github.com/steadygaze/frame-randomizer/commit/a36061d))
- Add a defaultLanguage option ([e7c8b96](https://github.com/steadygaze/frame-randomizer/commit/e7c8b96))
- Add frontend i18n support ([d21bdae](https://github.com/steadygaze/frame-randomizer/commit/d21bdae))
- Add ability to show TMDB link given ID ([6c921f4](https://github.com/steadygaze/frame-randomizer/commit/6c921f4))
- Add German, French, Russian, and Chinese ([526f22b](https://github.com/steadygaze/frame-randomizer/commit/526f22b))
- Add permissive robots.txt ([515945f](https://github.com/steadygaze/frame-randomizer/commit/515945f))
- Add translated reactive name and description ([849f7ec](https://github.com/steadygaze/frame-randomizer/commit/849f7ec))
- Make video file extension configurable ([d1b2bed](https://github.com/steadygaze/frame-randomizer/commit/d1b2bed))
- Generate a link to an episode from template ([58d64ad](https://github.com/steadygaze/frame-randomizer/commit/58d64ad))
- Add localized instance info option ([fdb80cb](https://github.com/steadygaze/frame-randomizer/commit/fdb80cb))

### 🔥 Performance

- Allow caching of show data ([4e42895](https://github.com/steadygaze/frame-randomizer/commit/4e42895))

### 🩹 Fixes

- Tweak language select/input spacing ([610ed58](https://github.com/steadygaze/frame-randomizer/commit/610ed58))
- Exempt Chinese from match length requirement ([01945e0](https://github.com/steadygaze/frame-randomizer/commit/01945e0))
- Remove errant spaces from German ([9d77cba](https://github.com/steadygaze/frame-randomizer/commit/9d77cba))

### 💅 Refactors

- Change to ESM module loading by default ([867160c](https://github.com/steadygaze/frame-randomizer/commit/867160c))
- Move to multi-page app ([d290a7f](https://github.com/steadygaze/frame-randomizer/commit/d290a7f))
- Use easier URL parsing helpers ([dc7194b](https://github.com/steadygaze/frame-randomizer/commit/dc7194b))
- Rename overview to synopsis on frontend ([7abe7bb](https://github.com/steadygaze/frame-randomizer/commit/7abe7bb))
- Change default base path to pwd ([88736d2](https://github.com/steadygaze/frame-randomizer/commit/88736d2))

### 📖 Documentation

- Document spurious error message ([1cc85c0](https://github.com/steadygaze/frame-randomizer/commit/1cc85c0))
- Update README.md for multi-language shows ([afc3036](https://github.com/steadygaze/frame-randomizer/commit/afc3036))

### 📦 Build

- Upgrade from nuxt 3.4.3 to 3.5.2 ([6c6f0dc](https://github.com/steadygaze/frame-randomizer/commit/6c6f0dc))
- Add json key sort format check ([ab52609](https://github.com/steadygaze/frame-randomizer/commit/ab52609))
- Upgrade to Nuxt 3.5.3 ([6109cc7](https://github.com/steadygaze/frame-randomizer/commit/6109cc7))
- Upgrade miscellaneous deps ([7fb82f1](https://github.com/steadygaze/frame-randomizer/commit/7fb82f1))
- Stop checking keys to fix prerender ([2b434f2](https://github.com/steadygaze/frame-randomizer/commit/2b434f2))
- Stop using standard-version for changelogs ([bcb7b03](https://github.com/steadygaze/frame-randomizer/commit/bcb7b03))

### 🤖 CI

- Add coveralls test coverage upload ([a482d05](https://github.com/steadygaze/frame-randomizer/commit/a482d05))
- Fix test coverage output format ([e8ff9bf](https://github.com/steadygaze/frame-randomizer/commit/e8ff9bf))

### ❤️ Contributors

- Steady Gaze

### [0.0.8](https://github.com/steadygaze/frame-randomizer/compare/v0.0.7...v0.0.8) (2023-06-01)

### Features

- add icons for buttons and tweak styling ([8a6a5a2](https://github.com/steadygaze/frame-randomizer/commit/8a6a5a24a86528c46e6c9efcbfd6a379f1d592a4))
- make correct/incorrect status more visible ([63cadf2](https://github.com/steadygaze/frame-randomizer/commit/63cadf2b6997102df468ab0fe5e18ef977228ce2))

### [0.0.7](https://github.com/steadygaze/frame-randomizer/compare/v0.0.6...v0.0.7) (2023-05-30)

### Bug Fixes

- fix timer updates when stats are hidden ([07c3eb7](https://github.com/steadygaze/frame-randomizer/commit/07c3eb79dcfc931a0882f5c353a2e807e51050fa))

### [0.0.6](https://github.com/steadygaze/frame-randomizer/compare/v0.0.5...v0.0.6) (2023-05-29)

### Features

- add new timer types (guessing, question) ([aec87b7](https://github.com/steadygaze/frame-randomizer/commit/aec87b761dd53df03a4b77e3f8eedf833391cb09))

### Bug Fixes

- fix incorrect timer minutes/hours ([ed0175f](https://github.com/steadygaze/frame-randomizer/commit/ed0175f87cd07d68b1b60831d04f2b67f83537e9))

### [0.0.5](https://github.com/steadygaze/frame-randomizer/compare/v0.0.4...v0.0.5) (2023-05-29)

### Features

- add ffprobe cache for fast server restarts ([d2d2b22](https://github.com/steadygaze/frame-randomizer/commit/d2d2b225b3a3934ceab38cecb46fe6dd6c85cf71))

### Bug Fixes

- add client-side image load error handling ([42c23b7](https://github.com/steadygaze/frame-randomizer/commit/42c23b737c348ece1a1d8fac43770de405fc786e))
- add server side error logging ([dd9441f](https://github.com/steadygaze/frame-randomizer/commit/dd9441f947d31cd5eca799040029b6230f15fd77))
- add server-side frame gen error handling ([b4d6c4c](https://github.com/steadygaze/frame-randomizer/commit/b4d6c4c58a0cafe0b3537e2f95e7f62b0227d408))
- fix cleaning up reserved but unexpired frames ([f70d2c3](https://github.com/steadygaze/frame-randomizer/commit/f70d2c3052deed32cf7637b03c8c90a45c2b734c))

### [0.0.4](https://github.com/steadygaze/frame-randomizer/compare/v0.0.3...v0.0.4) (2023-05-28)

### Features

- add a dedicated skip button ([c2c2647](https://github.com/steadygaze/frame-randomizer/commit/c2c26476a89eebe4d53ac34fc2e5b0f37d5df2fa))
- add network error message ([e08d24c](https://github.com/steadygaze/frame-randomizer/commit/e08d24ce1a567b2f1eeda7370652524f04496330))
- add streak and RTA timers ([2a08466](https://github.com/steadygaze/frame-randomizer/commit/2a0846657a51c97289656ffced9f1e0b7e516b79))
- set up client caching for generated frames ([672e0fb](https://github.com/steadygaze/frame-randomizer/commit/672e0fbf0188ed8cd37329b1bf6dbee19a8bbf70))
- show tens place in timer ([e63d00c](https://github.com/steadygaze/frame-randomizer/commit/e63d00c83f756c566cde533760cd7f45919c2ec0))
- support for sXXeXX and XXxXX searches ([a96431d](https://github.com/steadygaze/frame-randomizer/commit/a96431d5bdfce7897fbb26e1a04fee13fcd8df9f))
- support specifying credits with endOffset ([565e6d7](https://github.com/steadygaze/frame-randomizer/commit/565e6d774e8a98c2fe1a9597266dbd01e3345e61))
- update instructions for new features ([0ae7c9d](https://github.com/steadygaze/frame-randomizer/commit/0ae7c9d3beab9755711c6aebe4dd702162e5eae7))

### Bug Fixes

- add image generation error handling ([2da3336](https://github.com/steadygaze/frame-randomizer/commit/2da3336cce0ec04c30685124d514e45f4f31ad3d))
- allow Cloudflare analytics through CORS ([084038c](https://github.com/steadygaze/frame-randomizer/commit/084038cca96df40ca443f3db56c1846a0f92b587))
- autoscroll to selected when using arrow keys ([899625c](https://github.com/steadygaze/frame-randomizer/commit/899625c0669378ca28c240f5b4cfefbd22eae93f))
- omit show name if undefined ([40f6545](https://github.com/steadygaze/frame-randomizer/commit/40f6545ad1f243333007aa06e769cb9f1112a32f))
- remove Ctrl-0 binding ([cd97dde](https://github.com/steadygaze/frame-randomizer/commit/cd97dde3c8c4c4cac5b3366e2aba8d14a7e50869))

### [0.0.3](https://github.com/steadygaze/frame-randomizer/compare/v0.0.2...v0.0.3) (2023-05-21)

### Bug Fixes

- fix image rejection and reselection ([047ce01](https://github.com/steadygaze/frame-randomizer/commit/047ce0160c1712d39883d8c48d2f558e2a8631c8))

### [0.0.2](https://github.com/steadygaze/frame-randomizer/compare/v0.0.1...v0.0.2) (2023-05-20)

### Features

- format instructions as list ([3badb38](https://github.com/steadygaze/frame-randomizer/commit/3badb38346634c1f827639c1c8f01993025194d7))
- make fuzzy search options configurable ([c635005](https://github.com/steadygaze/frame-randomizer/commit/c635005b23e9849659b2f3c893bf9fc9f25cbef1))
- skip black frames and single colors ([7740237](https://github.com/steadygaze/frame-randomizer/commit/7740237031b8a74bb9ad769cb4608bbc206f800b))

### Bug Fixes

- always show scrollbar to avoid visual noise ([51c55e7](https://github.com/steadygaze/frame-randomizer/commit/51c55e71cfe2fc056ad9c11bf0bff4a801a8d0e5))
- disable autocomplete on search input ([2226167](https://github.com/steadygaze/frame-randomizer/commit/222616727ef2629cef8b9a3a001626f231696366))

### 0.0.1 (2023-05-17)

### Features

- add a bunch of logic to generate skip ranges ([3570c6c](https://github.com/steadygaze/frame-randomizer/commit/3570c6c0f58fd20218e516b3ed910524d415a15d))
- add a replay timing option ([4bb721b](https://github.com/steadygaze/frame-randomizer/commit/4bb721beb162c8e02f7a425fd86aa6e78a9e9b3a))
- add ability to limit initial ffprobes ([77c38d0](https://github.com/steadygaze/frame-randomizer/commit/77c38d0fd5223377c77a684ace7263dbf977e84d))
- add an about/instructions modal ([47062fb](https://github.com/steadygaze/frame-randomizer/commit/47062fb74fd63f4f371712a3f90f80e338c7d9a4))
- add answer submission draft implementation ([522788f](https://github.com/steadygaze/frame-randomizer/commit/522788f368738f9e51c244e6f7e2366a3ca72e93))
- add automated cleanup and image expiration ([57bb824](https://github.com/steadygaze/frame-randomizer/commit/57bb8241e535a30ba01726babcdd8d2410e49ab1))
- add automatic file to episode mapping ([d00ba09](https://github.com/steadygaze/frame-randomizer/commit/d00ba0970f529ecf325dda43bcdb3fbe4d6ca768))
- add basic correct/total counter ([86a8bf9](https://github.com/steadygaze/frame-randomizer/commit/86a8bf9e8815b25f6940d505d45e6317fc955232))
- add checks for required options ([5e43661](https://github.com/steadygaze/frame-randomizer/commit/5e43661a8118582d75acbbcb3f0f4c65d106ec76))
- add emoji favicon and noscript message ([9ffed05](https://github.com/steadygaze/frame-randomizer/commit/9ffed05679508476e866e727e6b9b4597b267240))
- add error case for 429 request limit ([16061db](https://github.com/steadygaze/frame-randomizer/commit/16061db636724d304bff6d36eca2bcfbe8494a13))
- add Fuse search and image side-by-side ([4087dad](https://github.com/steadygaze/frame-randomizer/commit/4087dad9d882fac03824a26114df4e1714a26cd0))
- add hacky API prototype ([38de4ac](https://github.com/steadygaze/frame-randomizer/commit/38de4ac286c3d5b5725bde0b62d880cb05d5c8e1))
- add helper to chunk match indices together ([2213641](https://github.com/steadygaze/frame-randomizer/commit/22136419eeebf43f33a6c6449bbaf16ce30fc6e5))
- add image pregeneration ([fd097fa](https://github.com/steadygaze/frame-randomizer/commit/fd097fa62d3e485e0bbbfd9b1bc56b5c10e77bcf))
- add initial example input component ([4a32fe8](https://github.com/steadygaze/frame-randomizer/commit/4a32fe8a52cd5e632bf1e9e83ef4d1b0aa192ef2))
- add more CSS layout improvements ([60ffbba](https://github.com/steadygaze/frame-randomizer/commit/60ffbbaca387bb7c17a4555b541eb94c8261866c))
- add more info to readout for skipped case ([0e5aec8](https://github.com/steadygaze/frame-randomizer/commit/0e5aec82063ce49f58adfcfad0b7f0e4e491e9e8))
- add nuxt security plugin ([0a768e9](https://github.com/steadygaze/frame-randomizer/commit/0a768e9d6d822e3d16ba35526040c5685854bc9e))
- add option for custom path to ffmpeg ([5af9855](https://github.com/steadygaze/frame-randomizer/commit/5af985526a5dcee8da0cada8374771924c9fa92b))
- add options injection in ffmpeg command ([05025ff](https://github.com/steadygaze/frame-randomizer/commit/05025ffcf397ce1372de9dd143e0b05eff888f5c))
- add prototype timing spec type ([3b67fc0](https://github.com/steadygaze/frame-randomizer/commit/3b67fc0f559932388e08c0403a1df36a6dddbf87))
- add stats reset button ([197c122](https://github.com/steadygaze/frame-randomizer/commit/197c12216d0e59419a827e2df3d71dd0746fcdc2))
- add TMDB attribution option to AboutModal ([763f3f8](https://github.com/steadygaze/frame-randomizer/commit/763f3f83db6876337d3502ef5fb2126564680575))
- add version, description options ([08b0bdc](https://github.com/steadygaze/frame-randomizer/commit/08b0bdcb8516e99bff8216b5d5ccc3e36b4872fc))
- add WIP reading of episode time ranges ([22cb128](https://github.com/steadygaze/frame-randomizer/commit/22cb1280c39dcf61ea18fadb68e291f7978c1250))
- add WIP timing implementation ([51a0f9b](https://github.com/steadygaze/frame-randomizer/commit/51a0f9b33a7ae2848eae45e655fbe380e37e415c))
- add working skipping of intro/credits ([0c05ce0](https://github.com/steadygaze/frame-randomizer/commit/0c05ce088865b347fed75b5fe996e85012e382a8))
- cap number of image generation jobs ([274b973](https://github.com/steadygaze/frame-randomizer/commit/274b973802140b9a2122a04abe84dd869d0f592b))
- change entries to episodes in config ([e283f0c](https://github.com/steadygaze/frame-randomizer/commit/e283f0ca691ddfe2984a00dde640027ac0e7414a))
- change layout depending on aspect ratio ([7f1c6aa](https://github.com/steadygaze/frame-randomizer/commit/7f1c6aad641e21719ea23882301d85b3b7f82898))
- change terminology from "image" to "frame" ([ca47b30](https://github.com/steadygaze/frame-randomizer/commit/ca47b307b9fdbac98d35209b85ccf1b014e1e6c1))
- clean up CSS input pane vertical sizing ([737000c](https://github.com/steadygaze/frame-randomizer/commit/737000c1efcf0bf0624eb43dfee2d9130384bec5))
- clear storage on restart ([c70abc8](https://github.com/steadygaze/frame-randomizer/commit/c70abc89a0062ce05e1dd2d5490bd6e2c35b2078))
- configure rate limit via env param ([a158eaa](https://github.com/steadygaze/frame-randomizer/commit/a158eaaca559c23430c2673b479f8cf236722bc8))
- connect new episode listing endpoint to Vue ([bf1a70f](https://github.com/steadygaze/frame-randomizer/commit/bf1a70f4d1533a99cdcbbeafb01ed36d580532d1))
- disable reset while in guessing state ([60c6a23](https://github.com/steadygaze/frame-randomizer/commit/60c6a23a9b3a00c1ea29f2fb88fff8703c31dac5))
- experiment with sending show data over API ([aeb9a57](https://github.com/steadygaze/frame-randomizer/commit/aeb9a5797084fec69a78d0ad69389cce041b62bf))
- give readout a semi-constant size ([9071228](https://github.com/steadygaze/frame-randomizer/commit/9071228f2e9708acf80432bb2c9bd5176a25d43e))
- handle input mouseover and tweak colors ([9762c46](https://github.com/steadygaze/frame-randomizer/commit/9762c46681f83f188d142a37a8b490be22d7102e))
- handle server init and errors ([590815e](https://github.com/steadygaze/frame-randomizer/commit/590815e48a2c42bd3939293e0df12966a611cfe1))
- implement initial image getting API ([f8090e7](https://github.com/steadygaze/frame-randomizer/commit/f8090e74d7203310e5390b9eca3c3f2536a0b6b1))
- improve local guessing output ([1ac98a6](https://github.com/steadygaze/frame-randomizer/commit/1ac98a68dc29b4eb6c33fa8f79fe2e2cda8264c0))
- improve missing file warnings ([334e3b5](https://github.com/steadygaze/frame-randomizer/commit/334e3b58e386c85cb6da71c8ecd8eb0e8a552bba))
- include alt text for TMDB logo ([1a97376](https://github.com/steadygaze/frame-randomizer/commit/1a97376fe5119d2b853ea9d1a40873eb48d09487))
- link the AGPL on GNU.org ([ebbd900](https://github.com/steadygaze/frame-randomizer/commit/ebbd900c429deee928a2d7b9187571e7b2e64403))
- log time taken for initial load ([cd14b3c](https://github.com/steadygaze/frame-randomizer/commit/cd14b3cbac861fb7958a735b674206e5841ae8b8))
- move initial image pregen to init time ([d6b3247](https://github.com/steadygaze/frame-randomizer/commit/d6b32475ec6163ef671cfd994c835c910f9280cc))
- note 3+ char requirement in placeholder ([c355615](https://github.com/steadygaze/frame-randomizer/commit/c3556152e5a73c8eb1dd18e561f9c199f3107305))
- ping server to clean up image after loading ([848d8c9](https://github.com/steadygaze/frame-randomizer/commit/848d8c955535e83ab4d94241ff2d43fe0366422c))
- read TV show name from config ([850075b](https://github.com/steadygaze/frame-randomizer/commit/850075b91025dc37c2ba40c7f8fd4568f389dce5))
- say that frame is random in help text ([d45f08d](https://github.com/steadygaze/frame-randomizer/commit/d45f08d83bff0e533ffd55082c23704e5afff466))
- separate answer and frame state storage ([ea16a47](https://github.com/steadygaze/frame-randomizer/commit/ea16a47ac454ef764a326e2878a90e2ec952aac5))
- support shallow searching for video files ([3479413](https://github.com/steadygaze/frame-randomizer/commit/3479413fe4e5db0498035322c9fb1041e33879bc))
- support up/down selection in guess input ([0f17be5](https://github.com/steadygaze/frame-randomizer/commit/0f17be58548f457a7c9b556f0b0b7d1751642596))
- switch to webp output ([b0a0ed2](https://github.com/steadygaze/frame-randomizer/commit/b0a0ed2ec4b7018f28409e1dfe849b02dbec2cee))
- tweak About content and formatting ([bb42158](https://github.com/steadygaze/frame-randomizer/commit/bb421581cea3b33c513f57426f54544766d5e8bc))
- tweak expiry log ([5f47238](https://github.com/steadygaze/frame-randomizer/commit/5f47238f75189230a2f6d215ec43063704b34ba4))
- use .png/.jpg image extension for API images ([ddb0b09](https://github.com/steadygaze/frame-randomizer/commit/ddb0b09ab97402ffdcf64ef7a868eddd5ffee0f8))
- use final image load event ([66e86bc](https://github.com/steadygaze/frame-randomizer/commit/66e86bc4673bd11a335eda268bb8692a92468795))

### Bug Fixes

- clean up event handlers and CSS ([50cc72d](https://github.com/steadygaze/frame-randomizer/commit/50cc72de5d85c3d2694bce81822e182d5732cb2d))
- clean up input search box styles ([16e225c](https://github.com/steadygaze/frame-randomizer/commit/16e225c592c31170d1f517a56ed65cc7d9d46426))
- clean up runtime configs and fix title ([4cd1513](https://github.com/steadygaze/frame-randomizer/commit/4cd1513b342cc43d7885f39024bfb2433792273e))
- fix bug that skipped special error readouts ([f40194b](https://github.com/steadygaze/frame-randomizer/commit/f40194bf57161cd44cc47ef8180dee1e80eda070))
- fix command if there are multiple spaces ([e7a6a93](https://github.com/steadygaze/frame-randomizer/commit/e7a6a93ad94291133e9b69945d1ccf79993b15d9))
- fix ffmpeg warning in command ([749252b](https://github.com/steadygaze/frame-randomizer/commit/749252b31b6741d0d11e0121906980cdeed080bf))
- fix Nuxt 3 warning about runtimeConfig access ([3edf4a0](https://github.com/steadygaze/frame-randomizer/commit/3edf4a0ea90a20944a84f7445423e727eb6993c4))
- fix search box overflowing pane when small ([05410df](https://github.com/steadygaze/frame-randomizer/commit/05410dfc5fff7d2a9820bbd6ef45a5f08a6e4a3c))
- fix source code URL mismatch ([c11626b](https://github.com/steadygaze/frame-randomizer/commit/c11626b2cde01ce3b10a71ad39d6c08f16732f2e))
- fix spinner and group buttons ([ff6c076](https://github.com/steadygaze/frame-randomizer/commit/ff6c076a13b7e34408e380794edb298a40849918))
- make rate limit more generous ([4c3a2bc](https://github.com/steadygaze/frame-randomizer/commit/4c3a2bce896577638ad9b69bb20e31673e2fc68f))
- remove unneeded debug log ([9bb9294](https://github.com/steadygaze/frame-randomizer/commit/9bb9294feea2d2e0c0a922029298bd76b0f196b6))
- reset UI in error cases ([b07695d](https://github.com/steadygaze/frame-randomizer/commit/b07695dfbe67447fe3ac24ac2266870b4ed83f8f))
- shell escape filenames ([c65fdba](https://github.com/steadygaze/frame-randomizer/commit/c65fdba51bc8273fdee619da646bfa694b5f5d84))
- stop logging cleanup start ([9044e3d](https://github.com/steadygaze/frame-randomizer/commit/9044e3d3fa85794718d7df0e740796d9925f0627))
- switch to defineLazyEventHandler and uuid v5 ([c1fe8e1](https://github.com/steadygaze/frame-randomizer/commit/c1fe8e1c3c9fa4dccf28d3c59d267b810e3da1ed))
- tweak pregen default ([7f72bcf](https://github.com/steadygaze/frame-randomizer/commit/7f72bcfcc26a482abb74699365d6b5e9457983b2))
