import { render } from 'react-dom';
import React from 'react';
import Blog from '../../dist/index';

class Example extends React.Component {
  constructor(props) {
    super(props);

    this.state = { post: location.hash.substr(1) || null };

    window.onhashchange = () =>
      this.setState({ post: location.hash.substr(1) || null });
  }

  render() {
    return (
      <Blog
        post={this.state.post}
        repository="Xyfir/blog-posts"
        linkFormat="#{{post.id}}"
      />
    );
  }
}

render(<Example />, document.getElementById('content'));
