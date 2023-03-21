import debugCommits from "debug";
import { getCommits } from "./git.js";
import { getPullRequestCommits } from "./github.js";

const debug = debugCommits("semantic-release:get-commits");

/**
 * Retrieve the list of commits on the current branch since the commit sha associated with the last release, or all the commits of the current branch if there is no last released version.
 *
 * @param {Object} context semantic-release context.
 *
 * @return {Promise<Array<Object>>} The list of commits on the branch `branch` since the last release.
 */
export default async ({
  cwd,
  env,
  options,
  lastRelease: { gitHead: from },
  nextRelease: { gitHead: to = "HEAD" } = {},
  logger,
}) => {
  if (from) {
    debug("Use from: %s, to: %s", from, to);
  } else {
    logger.log("No previous release found, retrieving all commits");
  }
  
// TODO: comment during GitHub testing
  let commits = await getCommits(from, to, { cwd, env });

  if ( commits.length && options.squashMerge ) {
    // Analyze each squash and merge commit to get the PR it refers to
    for (const commit of commits) {
      // Extract the PR number from the squash commit message.
      //
      // A squash commit has the following format:
      // 'Modify the data model (#3)'
      // Here, what we're extracting is the digit '3' from the squash
      // commit message, so that then to read inner commits of this 
      // pull request.
      const number = extractPullRequestNumber(commit.subject);
      if (number != null) {
        commits = await getPullRequestCommits(options, number);
      }
    }
  }

  logger.log(`Found ${commits.length} commits since last release ${from}`);
  debug("Parsed commits: %o", commits);

  return commits;
};

/**
 * Parses the title of a squash and merge commit, and returns the pull request number it refers to.
 *
 * A squash and merge commit combines several commits from a pull request's branch to the main branch, so
 * that to keep the git history lean and clean.
 * The expected format of a conventional squash and merge message is as follows:
 * 
 *   'Modify the data model (#34)'
 * 
 * Ehere '34' is the number of the pull request the input squash and commit message refers
 * to and that we want to extract.
 * 
 * @param {String} Squash and merge commit message containing the pull request number to be extracted.
 * @return {String} A string containing the pull request number this squash commit refers to.
 */
function extractPullRequestNumber(commit) {
  const regex = /\(\#(?<number>[0-9]+)\)/;
  const found = commit.toString().match(regex);
  
  return (found != null) ? found.groups.number : null;
}