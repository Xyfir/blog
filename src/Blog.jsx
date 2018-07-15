import marked from 'marked';
import React from 'react';

const Stats = ({ post }) => (
  <ul className="post-stats">
    <li className="group">{post.group}</li>
    <li className="posted" title="YYYY-MM-DD">
      Posted on <span className="date">{post.posted}</span>
    </li>
    <li className="author">
      By <span className="name">{post.author}</span>
    </li>
    {post.edited ? (
      <li className="edited" title="YYYY-MM-DD">
        Edited on <span className="date">{post.edited}</span>
      </li>
    ) : null}
  </ul>
);

export default class Blog extends React.Component {
  /**
   * @typedef {object} BlogProps
   * @prop {MarkedOptions} [markedOptions] - Passed to `marked('', options)` when
   *  converting Markdown to HTML. See: https://marked.js.org
   * @prop {string[]} [descriptionFormat] - Format to use for the page
   *  descriptions. First element is for when _not_ viewing a post, and the
   *  second element is for when the user _is_ viewing a post.
   * @prop {string[]} [titleFormat] - Format to use for the page title.
   *  First element is for when _not_ viewing a post, and the second element
   *  is for when the user _is_ viewing a post.
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
    else this._setPageMetadata(post);
  }

  componentWillUnmount() {
    this._setPageMetadata();
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
        this._setPageMetadata(post);
      })
      .catch(console.error);
  }

  /** @param {Post} [post] */
  _setPageMetadata(post) {
    const { titleFormat, descriptionFormat } = this.props;

    // Set <title>
    if (Array.isArray(titleFormat)) {
      document.title = post
        ? this._format(titleFormat[1], post)
        : titleFormat[0];
    }

    // Set <meta name="description" content="..." />
    let meta = document.querySelector('meta[name="description"]');
    if (Array.isArray(descriptionFormat)) {
      // Element already exists
      if (meta) {
        meta.content = post
          ? this._format(descriptionFormat[1], post)
          : descriptionFormat[0];
      }
      // Create element
      else {
        meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post
          ? this._format(descriptionFormat[1], post)
          : descriptionFormat[0];
        meta.dataset.xy = true;
        document.head.appendChild(meta);
      }
    }
    // We created a description meta element we need to delete
    else if (meta && meta.dataset.xy && (!post || !post.description)) {
      meta.remove();
    }

    // Set <link rel='canonical' href='...' />
    let link = document.querySelector('link[rel="canonical"]');
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

  /**
   * @param {string} format
   * @param {Post} [post]
   * @return {string}
   */
  _format(format, post = {}) {
    return format.replace(/\{\{post\.(\w+)\}\}/g, (m, $1) => post[$1] || '');
  }

  render() {
    const { linkFormat, markedOptions = {} } = this.props;
    const { post, posts, search } = this.state;

    return post && !post.loading ? (
      <div className="xyfir-blog view-post">
        <article className="blog-post">
          <header>
            <h1 className="title">{post.title}</h1>
            {post.description ? (
              <p className="description">{post.description}</p>
            ) : null}
            <Stats post={post} />
          </header>

          <div
            dangerouslySetInnerHTML={{
              __html: marked(post.content, markedOptions)
            }}
            className="markdown-body"
          />
        </article>

        <nav className="recent-posts">
          <span className="title">Recent Posts</span>

          <ul className="new-posts">
            {posts
              .sort((a, b) => a.posted < b.posted)
              .slice(0, 10)
              .map(p => (
                <li
                  key={p.id}
                  className={`post ${p.id == post.id ? 'current-post' : ''}`}
                >
                  <a href={this._format(linkFormat, p)} className="title">
                    {p.title}
                  </a>
                </li>
              ))}

            <li className="view-all">
              <a href={this._format(linkFormat)}>All posts ...</a>
            </li>
          </ul>
        </nav>
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
          placeholder="Search posts..."
        />

        <ul className="posts">
          {posts
            .filter(
              p =>
                p.title.toLowerCase().indexOf(search) > -1 ||
                p.group.toLowerCase().indexOf(search) > -1
            )
            .sort((a, b) => a.posted < b.posted)
            .map(p => (
              <li key={p.id}>
                <a href={this._format(linkFormat, p)} className="title">
                  {p.title}
                </a>

                {p.description ? (
                  <p className="description">{p.description}</p>
                ) : null}

                <Stats post={p} />
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
