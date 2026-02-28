import Post from '../_post/_post.js';
import React from 'react';

const PostsList = ({ posts, isEditing, setIsEditing, currentPost, setCurrentPost, onPostSubmit, onJoin, userEmail, onQuit  }) => {
  return (
      <div className="Cards-List">
        {isEditing ? (
          <Post post={currentPost} isEditing={true}
            onInputChange={(field, value) => {
              setCurrentPost({ ...currentPost, [field]: value });
            }}
            onPostSubmit={onPostSubmit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          posts.length === 0 ? (
            <div>No events found :(</div>
          ) : (
            posts.map((post, index) => (
              <Post 
                key={index} 
                post={{
                  ...post,
                  userEmail: userEmail
                }}
                onJoin={() => onJoin(post.name)}
                onQuit={() => onQuit(post.name)}
              />
            ))
          )
        )}
    </div>
  );
};

export default PostsList;
