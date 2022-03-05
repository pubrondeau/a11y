const { Octokit } = require('@octokit/rest');
const { createTokenAuth } = require('@octokit/auth-token');

exports.handler = async (event) => {
  const issueNumber = event.queryStringParameters.id;

  try {
    const auth = createTokenAuth(process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
    const { token } = await auth();
    const octokitClient = new Octokit({ auth: token });
    const response = await octokitClient.issues.listComments({
     owner: `pubrondeau`,
     repo: `a11y`,
     issue_number: issueNumber,
});

  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
    }
  }
}
