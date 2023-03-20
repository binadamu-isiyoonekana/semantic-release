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
    // Analyze each squash comit to get the PR it is from
    for (const commit of commits) {
      // Extract the PR number from the squash commit message.
      //
      // A squash commit has the following format:
      // 'Modify the data model (#3)'
      // Here, what we're extracting is the '#3', so that then
      // to read innder commits of this pull request with number '3'.
      let pullNumber = getPullRequestNumber(commit);
      
      const commits = await getPullRequestCommits(options, pullNumber);
    }
  }

  logger.log(`Found ${commits.length} commits since last release ${from}`);
  debug("Parsed commits: %o", commits);

  return commits;
};

/**
 * Parses the title of a squash and merge commit, and return the pull request it came from.
 * 
 * @param {String} Squash and merge commit message containing the pull request number to be extracted.
 * @return {Number} The pull request number from which this squash commit was created.
 */
function getPullRequestNumber(squash) {
  // TODO
  let number = 0;

  return number;
}