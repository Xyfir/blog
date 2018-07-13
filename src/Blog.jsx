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
      posts: [],
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

  /** Handle setting `state.post` from `props.post`. */
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

  /** Load new post if needed. */
  componentDidUpdate() {
    const { post } = this.state;
    if (post && post.loading) this._loadPost();
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
      })
      .catch(console.error);
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
          {posts.slice(0, 10).map(p => (
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
