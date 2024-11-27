# Contentstack - Custom Field - Cross-stack Entry Reference Field

Custom field developed for Contentstack that allows for searching and selecting entry references from another stack. Connection to other stacks as well as content type and columns can be configured for each instance of the custom field separately.

# Development

1. `yarn install`
2. `yarn dev` - `http://localhost:5174/` should open in the browser
3. Click on button to open reference field selector modal.

NOTE: If modal does not appear, ensure pop-ups are not blocked by the browser window.

Override default environment variables in [.env.development](.env.development) by creating `.env.development.local` file and adding them there.

# Build

Entire codebase is compiled into a single html file (`dist/index.html`) via `yarn build` command. The code in the file should be copied/pasted into "Hosting method => Hosted by Contenstack => Extension source code" field. when adding the extension in Contentstack.

