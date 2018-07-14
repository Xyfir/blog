A customizable yet simple, GitHub-hosted, React-powered, and Markdown-supported blogging system that is easily integrated into existing sites and applications. Used by [Ptorx](https://ptorx.com) and other projects in the [Xyfir Network](https://www.xyfir.com/network).

# Demonstrations

- [Xyfir Network Blog](https://www.xyfir.com/blog/)
- [Ptorx Blog](https://ptorx.com/blog/)
- Have a blog that uses `@xyfir/blog`? Add it to this list and submit a PR!

# Installation and Setup

**Note:** This package is currently in alpha, meaning its API may change significantly in the future. Backwards compatibility will be strived for, but cannot be guaranteed.

_See the [example](https://github.com/Xyfir/blog/tree/master/example) directory for a working, up-to-date, example._

```bash
npm install @xyfir/blog
```

Then, somewhere in your React application:

```jsx
import Blog from '@xyfir/blog';

// ...

<Blog
  // (optional) ID of the post being viewed
  // You'll have to handle extracting the id from the current URL based on your `linkFormat`!
  post="group/year/month/filename"
  // (optional) Groups from the repo to allow posts from.
  // Defaults to allowing all groups.
  // A "group" is a subdirectory in the GitHub repository
  groups={['group1', 'group2']}
  // (required) GitHub repository id.
  // Example: `":user/:repo" | "Xyfir/blog-posts"`
  repository="GitHubUser/GitHubRepository"
  // (required) Format to use for blog links
  // Example: `"/blog/{{post.id}}" | "/blog?id={{post.id}}"`
  linkFormat="/blog/{{post.id}}"
  // (optional) Passed to `marked('', markedOptions)` when converting Markdown
  // to HTML. See: https://marked.js.org
  // Nothing passed by default, meaning Markdown is NOT sanitized
  markedOptions={{}}
/>;

// ...
```

That's pretty much it in terms of code, but you'll have to style everything yourself. Optionally, you can use the default styles which you can import from `node_modules/@xyfir/blog/dist/blog.css`, which pairs nicely with the GitHub Markdown styles as found in [github-markdown-css](https://github.com/sindresorhus/github-markdown-css).

# Writing and Managing Posts

You should have a public GitHub repository created which you'll point to in `<Blog>`'s `repository` prop. The repository should have a structure that looks something like this:

```
some-group/
  2017/
    02/
      some-post.md
      another-post.md
    04/
      hello-world.md
  2018/
    01/
      hello-world.md
    12/
      lorem-ipsum.md
some-other-group/
  ...
posts.json
```

The first subdirectories within the repository are your "groups", which allow you to optionally organize things however you want. For Xyfir, we use it to organize posts by site name, since we have lots of sites but want all of our posts in a single repository. You can do whatever you want however.

Within groups, are year subdirectories, simply `YYYY`-formatted years. Within year subdirectories are month subdirectories, simply `MM`-formatted months.

Finally, within the month subdirectories are the posts themselves, which can be named anything you want but generally should be URL-friendly and contain at least part of the post's title. Post names must only be unique within the subdirectory that they reside.

`posts.json` allows you to make posts publicly available to the `<Blog>` component by adding the post's metadata to its array. The `posts.json` array should look something like this:

```json
[
  {
    "id": "test/2018/07/test-2",
    "group": "test",
    "title": "Test #2",
    "author": "Mr. Xyfir",
    "posted": "2018-07-13"
  },
  {
    "id": "test/2018/07/test-1",
    "group": "test",
    "title": "Test #1",
    "author": "Mr. Xyfir",
    "posted": "2018-07-12",
    "edited": "2018-07-13",
    "canonical": "https://www.xyfir.com/blog/test-1"
  }
]
```

Order doesn't matter, but we generally recommend putting the newest posts at the top.

- `id` - _required_ - A **post id** is a unique identifier for each post of the following format: `group/year/month/filename`. Note that `filename` excludes the `.md` extension!
- `group` - _required_ - The group the post resides in.
- `title` - _required_ - The post's title.
- `author` - _required_ - The post's author.
- `posted` - _required_ - The date the post was posted. Format: `YYYY-MM-DD`.
- `edited` - _optional_ - The date the post was edited. Format: `YYYY-MM-DD`.
- `canonical` - _optional_ - The canonical link for the post if it is available at multiple locations. See Wikipedia: [Canonical link element](https://en.wikipedia.org/wiki/Canonical_link_element).

To create, edit, or delete a post is easy: add/edit/delete the file within the repository at `group/year/month/filename`, and then update `posts.json` to reflect the changes if needed, and then commit and push your changes to the live repository. All of the blogs that point to that repository will automatically be updated upon the next page load.
