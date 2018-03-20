import { RepositoryDoesNotExistErrorCode } from "dugite";
import { resolve } from "path";
import { git } from "./core-git";

/**
 * Get the absolute path to the top level working directory.
 *
 * @param path The path to a presumptive Git repository, either the root
 *             of the repository or any path within that repository.
 *
 * @returns null if the path provided doesn't reside within a Git repository.
 */
export async function getTopLevelWorkingDirectory(
  path: string,
): Promise<string | null> {
  let result;

  try {
    // Note, we use --show-cdup here instead of --show-toplevel because show-toplevel
    // dereferences symlinks and we want to resolve a path as closely as possible to
    // what the user gave us.
    result = await git(
      ["rev-parse", "--show-cdup"],
      path,
    );
  } catch (err) {
    if (err.code === RepositoryDoesNotExistErrorCode) {
      return null;
    }

    throw err;
  }

  // Exit code 128 means it was run in a directory that's not a git
  // repository.
  if (result.exitCode === 128) {
    return null;
  }

  const relativePath = result.stdout.trim();

  // No output means we're already at the root
  if (!relativePath) {
    return path;
  }

  return resolve(path, relativePath);
}

/** Is the path a git repository? */
export async function isGitRepository(path: string): Promise<boolean> {
  return (await getTopLevelWorkingDirectory(path)) !== null;
}
