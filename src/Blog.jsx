import marked from 'marked';
import React from 'react';

export default class Blog extends React.Component {
  /**
   * @typedef {object} BlogProps
   * @prop {MarkedOptions} [markedOptions] - Passed to `marked('', options)` when
   *  converting Markdown to HTML. See: https://marked.js.org
   * @prop {string} repository - GitHub repository id.
   *  Example: `":user/:repo" | "Xyfir/blog-posts"`
   * @prop {string[]} [groups] - Groups from the repo to allow posts from.
   *  Defaults to allowing all groups.
   * @prop {string} linkFormat - Format to use for blog links.
   *  Example: `"/blog/{{post.id}}" | "/blog?id={{post.id}}"`
   * @prop {string} [post] - The full identifier of the blog post to view.
   *  Example: `"group/2020/07/my-blog-post"`
   */
  /** @param {BlogProps} props */
  constructor(props) {
    super(props);

    /** @type {BlogProps} */
    this.props;

    this.state = {
      search: '',
      /**
       * @typedef {object} Post
       * @prop {string} id
       * @prop {string} [group]
       * @prop {string} [title]
       * @prop {string} [author]
       * @prop {string} [posted]
       * @prop {string} [edited]
       * @prop {boolean} loading
       * @prop {string} [canonical]
       */
      /** @type {Post[]} */
      posts: [],
      /** @type {Post} */
      post: null
    };
  }

  componentDidMount() {
    const { repository, groups } = this.props;

    // Load posts from repository
    fetch(`https://raw.githubusercontent.com/${repository}/master/posts.json`)
      .then(res => res.json())
      .then(posts =>
        this.setState({
          // Filter out posts from non-allowed groups
          posts: posts.filter(p => !groups || groups.indexOf(p.group) > -1)
        })
      )
      .catch(console.error);
  }

  /**
   * Handle setting `state.post` from `props.post`.
   * @param {BlogProps} props
   * @param {Blog.state} state
   */
  static getDerivedStateFromProps(props, state) {
    const { post: postId } = props;
    const { post } = state;

    // From post to no post
    if (post && !postId) return { post: null };
    // From no post to post
    if (!post && postId) return { post: { id: postId, loading: true } };
    // From post to another post
    if (post && postId && postId != post.id)
      return { post: { id: postId, loading: true } };

    return null;
  }

  /** Load new post if needed. Update canonical link. */
  componentDidUpdate() {
    const { post } = this.state;
    if (post && post.loading) this._loadPost();
    else this._setCanonical(post);
  }

  /**
   * Load metadata for post from `state.posts` and then load the post's content
   *  from GitHub, and finally into `state.post`.
   */
  _loadPost() {
    const { repository } = this.props;
    const post = Object.assign(
      { loading: false },
      this.state.posts.find(p => p.id == this.state.post.id)
    );

    fetch(
      `https://raw.githubusercontent.com/${repository}/master/${post.id}.md`
    )
      .then(res => res.text())
      .then(content => {
        post.content = content;
        this.setState({ post });
        this._setCanonical(post);
      })
      .catch(console.error);
  }

  /** @param {Post} post */
  _setCanonical(post) {
    let link = document.querySelector('link[rel="canonical"]');

    // Set <link rel='canonical' href='...' />
    if (post && post.canonical) {
      // Element already exists
      if (link) {
        link.href = post.canonical;
      }
      // Create element
      else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = post.canonical;
        link.dataset.xy = true;
        document.head.appendChild(link);
      }
    }
    // We created a canonical link element we need to delete
    else if (link && link.dataset.xy && (!post || !post.canonical)) {
      link.remove();
    }
  }

  render() {
    const { linkFormat, markedOptions = {} } = this.props;
    const { post, posts, search } = this.state;

    return post && !post.loading ? (
      <div className="xyfir-blog view-post">
        <article
          dangerouslySetInnerHTML={{
            __html: marked(post.content, markedOptions)
          }}
          className="blog-post markdown"
        />

        <ul className="new-posts">
          {posts
            .sort((a, b) => a.posted < b.posted)
            .slice(0, 10)
            .map(p => (
              <li key={p.id}>
                <a
                  href={linkFormat.replace('{{post.id}}', p.id)}
                  className="title"
                >
                  {p.title}
                </a>
              </li>
            ))}
        </ul>
      </div>
    ) : (
      <div className="xyfir-blog explore">
        <input
          type="search"
          value={search}
          onChange={e =>
            this.setState({ search: e.target.value.toLowerCase() })
          }
          className="search"
        />

        <ul className="posts">
          {posts
            .filter(
              p => p.title.indexOf(search) > -1 || p.group.indexOf(search) > -1
            )
            .sort((a, b) => a.posted < b.posted)
            .map(p => (
              <li key={p.id}>
                <a
                  href={linkFormat.replace('{{post.id}}', p.id)}
                  className="title"
                >
                  {p.title}
                </a>

                <ul className="stats">
                  <li className="group">{p.group}</li>
                  <li className="posted">
                    Posted on {p.posted} by {p.author}
                  </li>
                  {p.edited ? (
                    <li className="edited">Edited on {p.edited}</li>
                  ) : null}
                </ul>
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
