# Release Procedure

This is a description of the rough steps required to release a new version.

## Increment version

1. In `package.json`, change `version` to the new version.
1. In `nuxt.config.ts`, change `runtimeConfig.public.softwareVersion` to the new version.
1. Run `npm install` to also update the version in `package-lock.json` to prevent spurious diffs in future commits.

## Generate commit and tags

Yes, this is probably needlessly convoluted. Don't tell anyone how I live.

1. Generate a changelog with `npx changelogen@latest` and copy it into `CHANGELOG.md`.
1. Stage `CHANGELOG.md`, `package.json`, `package-lock.json`, and `nuxt.config.ts` and commit with description `chore(release): v<version>`.
1. Generate the release tag with `git tag v<version>`.
1. Push the commit to main with `git push`.
1. Push the tag with `git push origin v<version>`.

## Release on GitHub

1. Open the GitHub releases page and create a new release at the new tag.
1. Copy the changelog into the description and publish! Attaching the built version is not needed due to environment variables in `nuxt.config.ts` being evaluated at build time.
1. Deploy the new version to any remote servers, if applicable.
