To get this working, you'll need to:

```bash
# `npm install -g webpack-cli` first if needed
# assuming you're in the package's root directory (not example/)
npm install
npm run build
npm link
cd example
npm install
npm link @xyfir/blog
webpack-cli
node src/server
```

Then view it in your browser at http://localhost:2064
