import getStream from "get-stream";
import { execa } from "execa";
import debugGitHub from "debug";
import {Octokit} from "octokit";
import GitUrlParse from "git-url-parse";



const debug = debugGitHub("semantic-release:github");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });


/**
 * Return the list of commits contained in a given GitHub pull request.
 *
 * Given a pull request (PR) index, this function returns the list of conventional commits contained
 * in it.
 * The index of the PR is usually obtained by analysing the format of the squash and merge commit of the
 * PR request, where in the title, the index of the PR is mentioned, as shown below, where the PR index
 * is 33:
 *
 *  'Modify main documentation (#33)
 * 
 * When squashing and merging a PR, the history of commits is lost, but the latter can be recovered 
 * from the repository's hosting service (using the GitHub API, for instance).
 * 
 * @param {Object} context execution context, that contains command-line and configuration options
 *                         or environment variables, and more.
 * 
 * @param {Number} pullNumber Index of the pull request for which to retrieve inner (conventional) commits.
 *
 * @return {Promise<Array<Object>>} The list of commits contained in the given GitHub pull request.
 */
export async function getPullRequestCommits(context, pullNumber) {

  // Break repository URL into its components (e.g. owner, user, ...)
  let {name, owner} = GitUrlParse(context.repositoryUrl);
  debug(`==> Fetch commits of pull request ${pullNumber} from ${owner}/${name}`);

  let response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull}/commits', {
    owner: owner,
    repo: name,
    pull: pullNumber,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  debug(response)

//    ).map(({ message, gitTags, ...commit }) => ({ ...commit, message: message.trim(), gitTags: gitTags.trim() }));
      /*
  return (
    await getStream.array(
      gitLogParser.parse(
        { _: `${from ? from + ".." : ""}${to}`},
        { cwd: execaOptions.cwd, env: { ...process.env, ...execaOptions.env } }
      )
    )
  ).map(({ message, gitTags, ...commit }) => ({ ...commit, message: message.trim(), gitTags: gitTags.trim() }));
  */
}
