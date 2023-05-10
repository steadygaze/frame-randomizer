# Frame Randomizer

This is a web app that generates and serves random frames from a TV show or similar content, as both a curiosity and a guessing game. It is free software licensed under the AGPL, meaning anyone can set up their own instance for their favorite show, as long as they make the source code (if modified) freely available.

Note that this software is agnostic of what show is randomized from. The content served is the instance operator's sole responsibility. If you have concerns about the content served by a specific instance, contact the site operator instead of the maintainers of this project.

## Setting up your own

If you just want to set up an instance, you need to supply a JSON config file with information about your show, a recent version of Node.js, and have episodes accessible on disk. These instructions are for Linux, but it may be possible to set up a server on other platforms.

### Show config

You need to supply a config file for the show. (Comments are not allowed in normal JSON; they are just used to document this example.) The `episodes` section can be downloaded from [TMDB](https://www.themoviedb.org/) using its API and the tool [`frame-randomizer-create`](https://github.com/steadygaze/frame-randomizer-create/).

```json
{
  // List of episodes.
  "episodes": [
    {
      "season": 1, // Season number.
      "episode": 1, // Season number.
      "name": "My First Episode", // Episode name.
      "overview": "In the first episode, wacky hijinks occurred.", // Plot overview.
      // Episode timing info, used to ignore sections. See Timings in utils/file.ts.
      "timings": {
        "intro": {
          // If there is an intro that plays from the beginning.
          "end": "1:10"
        }
      }
    } // Rest of the episodes...
  ],
  "commonTimings": {
    // Common timings for all episodes.
    "credits": {
      // If there are credits that play until the end.
      "start": "22:12"
    }
  }
}
```

### Running

Consult the `RuntimeConfig` section of `nuxt.config.ts` for all the settings that are available. Each will be configurable as environment variables. For example, you might create a simple script:

`app.env`:

```shell
export NUXT_EPISODE_DATA_PATH="/path/to/episode_config.json"
export NUXT_PUBLIC_INSTANCE_NAME="My Randomizer"
export NUXT_VIDEO_SOURCE_DIR="/path/to/video/files/"
export PORT=3000
# Additional configs...
```

Once these configs are set, grab a built version from releases on Github or build a custom one using the development instructions. Inside, running `server/index.mjs` will start the server.

```shell
source app.env && node path/to/server/index.mjs
```

### Stability

Currently, the software is in an unstable state; required options, option availability, and option interpretation can change between versions. Check the changelog or commit history when upgrading

## Development

This app is built on Nuxt 3; check out the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

Note that by contributing to this project, you agree to this project's Contributor License Agreement (CLA.md).

### Setup

Make sure to install the dependencies:

```shell
npm install
```

### Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

### Linting

A Husky precommit hook is set up to check the formatting and lint the code before committing. You can run `npm run format` and `npm run check` to format and lint your code periodically.
