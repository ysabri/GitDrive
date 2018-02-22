// This code was taken from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/228fba240059e3952dd2ad544075f3bfa3cc1082/app/src/lib/remove-remote-prefix.ts
// and it was mainly written by: https://github.com/joshaber

/**
 * Remove the remote prefix from the string. If there is no prefix, returns
 * null. E.g.:
 *
 * origin/my-branch       -> my-branch
 * origin/thing/my-branch -> thing/my-branch
 * my-branch              -> null
 */
export function removeRemotePrefix(name: string): string | null {
  const pieces = name.match(/.*?\/(.*)/);
  if (!pieces || pieces.length < 2) {
    return null;
  }

  return pieces[1];
}
