// This code was refactored from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/master/app/src/lib/git/for-each-ref.ts

import { Branch } from "models/git/branch";
import { Commit } from "models/git/commit";
import { CommitterID } from "models/git/committer-id";
import { Repository } from "models/git/repository";
import { git } from "./core-git";

/**
 * Get all the branches.
 * To get all the branches, call with just repository argument passed.
 */
export async function getBranches(
  repository: Repository,
  ...prefixes: string[],
): Promise<ReadonlyArray<Branch>> {
  const delimiter = "1F";
  const delimiterString = String.fromCharCode(parseInt(delimiter, 16));

  const format = [
    "%(refname)",
    "%(refname:short)",
    "%(upstream:short)",
    "%(objectname)", // SHA
    "%(author)",
    "%(parent)", // parent SHAs
    "%(symref)",
    "%(subject)",
    "%(body)",
    `%${delimiter}`, // indicate end-of-line as %(body) may contain newlines
  ].join("%00");

  if (!prefixes || !prefixes.length) {
    prefixes = ["refs/heads", "refs/remotes"];
  }
  // This is what the command would look like (without the new lines and tabs)
  /* "git for-each-ref --format='%(refname)%00%(refname:short)%00%
    (upstream:short)%00%(objectname)%00%(author)%00%(committer)%00%(parent)
    %00%(symref)%00%(subject)%00%(body)%00%${1F}' 'refs/heads' 'refs/remotes'"
  */
  const result = await git(
    ["for-each-ref", `--format=${format}`, ...prefixes],
    repository.path,
  );

  const names = result.stdout;
  const lines = names.split(delimiterString);

  // Remove the trailing newline
  lines.splice(-1, 1);
  // no branches found
  if (lines.length === 0) {
    return [];
  }

  const branches = [];

  for (const [ix, line] of lines.entries()) {
    // preceding newline character after first row
    const pieces = (ix > 0 ? line.substr(1) : line).split("\0");

    // This is the ref name with the prefix
    // it is commented out now because it is not used
    // TODO: take out if it is not going to be used.
    // const ref = pieces[0];
    const name = pieces[1];
    const upstream = pieces[2];
    const sha = pieces[3];

    const authorIdentity = pieces[4];
    const author = CommitterID.parseIdentity(authorIdentity);

    if (!author) {
      throw new Error(`Couldn't parse author identity ${authorIdentity}`);
    }

    const parentSHAs = pieces[5];
    // see if it is not a branch, could be a lightweight tag
    const symref = pieces[6];
    const summary = pieces[7];
    const body = pieces[8];

    const tip = new Commit(
      sha,
      summary,
      body,
      author,
      parentSHAs,
      null,
    );

    if (symref.length > 0) {
      // excude symbolic refs from the branch list
      continue;
    }

    branches.push(
      new Branch(name, upstream.length > 0 ? upstream : null, tip),
    );
  }

  return branches;
}
