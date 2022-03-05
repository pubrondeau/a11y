const { Octokit } = require('@octokit/rest');
const { createTokenAuth } = require('@octokit/auth-token');

exports.handler = async (event) => {
  const issueNumber = event.queryStringParameters.id;

  try {
    const auth = createTokenAuth(process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
    const { token } = await auth();
    const octokitClient = new Octokit({ auth: token });
    const { data: rateLimitInfo } = await Octokit.rateLimit.get();
    const remainingCalls = rateLimitInfo.resources.core.remaining;
    console.log(`GitHub API requests remaining: ${remainingCalls}`);
    if (remainingCalls === 0) {
    return {
       statusCode: 429,
        body: JSON.stringify({ error: 'Unable to fetch comments at this time. Check back later.' }),
    };
   const response = await octokitClient.issues.listComments({
   owner: `pubrondeau`,
   repo: `a11y`,
   issue_number: issueNumber,
   });
  
  const comments = response.data
  // Sort by most recent comments
  .sort((comment1, comment2) => comment2.created_at.localeCompare(comment1.created_at))
  // Restructure the data so the client-side JS doesn't have to do this
  .map((comment) => {
    return {
      user: {
        avatarUrl: comment.user.avatar_url,
        name: comment.user.login,
      },
      datePosted: dayjs(comment.created_at).fromNow(),
      isEdited: comment.created_at !== comment.updated_at,
      isAuthor: comment.author_association === 'OWNER',
      body: toMarkdown(comment.body),
    };
  });

return {
  statusCode: response.status,
  body: JSON.stringify({ data: comments }),
};

    
}
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
    }
  }
}
