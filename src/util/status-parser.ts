// This code was taken from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/master/app/src/lib/status-parser.ts
// and it was mainly written by: https://github.com/niik

import { FileEntry, GitStatusEntry } from "models/git/status";

export type StatusItem = IStatusHeader | IStatusEntry;

export interface IStatusHeader {
  readonly kind: "header";
  readonly value: string;
}

/** A representation of a parsed status entry from git status */
export interface IStatusEntry {
  readonly kind: "entry";

  /** The path to the file relative to the repository root */
  readonly path: string;

  /** The two character long status code */
  readonly statusCode: string;

  /** The original path in the case of a renamed file */
  readonly oldPath?: string;
}

const ChangedEntryType = "1";
const RenamedOrCopiedEntryType = "2";
const UnmergedEntryType = "u";
const UntrackedEntryType = "?";
const IgnoredEntryType = "!";

/** Parses output from git status --porcelain -z into file status entries */
export function parsePorcelainStatus(
  output: string,
): ReadonlyArray<StatusItem> {
  const entries = new Array<StatusItem>();

  // See https://git-scm.com/docs/git-status
  //
  // In the short-format, the status of each path is shown as
  // XY PATH1 -> PATH2
  //
  // There is also an alternate -z format recommended for machine parsing. In that
  // format, the status field is the same, but some other things change. First,
  // the -> is omitted from rename entries and the field order is reversed (e.g
  // from -> to becomes to from). Second, a NUL (ASCII 0) follows each filename,
  // replacing space as a field separator and the terminating newline (but a space
  // still separates the status field from the first filename). Third, filenames
  // containing special characters are not specially formatted; no quoting or
  // backslash-escaping is performed.

  const fields = output.split("\0");
  let field: string | undefined;
  field = fields.shift();
  while (field) {
    if (field.startsWith("# ") && field.length > 2) {
      entries.push({ kind: "header", value: field.substr(2) });
      field = fields.shift();
      continue;
    }

    const entryKind = field.substr(0, 1);

    if (entryKind === ChangedEntryType) {
      entries.push(parseChangedEntry(field));
    } else if (entryKind === RenamedOrCopiedEntryType) {
      entries.push(parsedRenamedOrCopiedEntry(field, fields.shift()));
    } else if (entryKind === UnmergedEntryType) {
      entries.push(parseUnmergedEntry(field));
    } else if (entryKind === UntrackedEntryType) {
      entries.push(parseUntrackedEntry(field));
    } else if (entryKind === IgnoredEntryType) {
      // Ignored, we don't care about these for now
    }
    field = fields.shift();
  }

  return entries;
}

// 1 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <path>
// tslint:disable-next-line:max-line-length
const changedEntryRe = /^1 ([MADRCUTX?!.]{2}) (N\.\.\.|S[C.][M.][U.]) (\d+) (\d+) (\d+) ([a-f0-9]+) ([a-f0-9]+) ([\s\S]*?)$/;

function parseChangedEntry(field: string): IStatusEntry {
  const match = changedEntryRe.exec(field);

  if (!match) {
    throw new Error(`Failed to parse status line for changed entry: ${field}`);
  }

  return {
    kind: "entry",
    path: match[8],
    statusCode: match[1],
  };
}

// 2 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <X><score> <path><sep><origPath>
// tslint:disable-next-line:max-line-length
const renamedOrCopiedEntryRe = /^2 ([MADRCUTX?!.]{2}) (N\.\.\.|S[C.][M.][U.]) (\d+) (\d+) (\d+) ([a-f0-9]+) ([a-f0-9]+) ([RC]\d+) ([\s\S]*?)$/;

function parsedRenamedOrCopiedEntry(
  field: string,
  oldPath: string | undefined,
): IStatusEntry {
  const match = renamedOrCopiedEntryRe.exec(field);

  if (!match) {
    throw new Error(
      `Failed to parse status line for renamed or copied entry: ${field}`,
    );
  }

  if (!oldPath) {
    throw new Error(
      "Failed to parse renamed or copied entry, could not parse old path",
    );
  }

  return {
    kind: "entry",
    oldPath,
    path: match[9],
    statusCode: match[1],
  };
}

// u <xy> <sub> <m1> <m2> <m3> <mW> <h1> <h2> <h3> <path>
// tslint:disable-next-line:max-line-length
const unmergedEntryRe = /^u ([DAU]{2}) (N\.\.\.|S[C.][M.][U.]) (\d+) (\d+) (\d+) (\d+) ([a-f0-9]+) ([a-f0-9]+) ([a-f0-9]+) ([\s\S]*?)$/;

function parseUnmergedEntry(field: string): IStatusEntry {
  const match = unmergedEntryRe.exec(field);

  if (!match) {
    throw new Error(`Failed to parse status line for unmerged entry: ${field}`);
  }

  return {
    kind: "entry",
    path: match[10],
    statusCode: match[1],
  };
}

function parseUntrackedEntry(field: string): IStatusEntry {
  const path = field.substr(2);
  return {
    kind: "entry",
    // NOTE: We return ?? instead of ? here to play nice with mapStatus,
    // might want to consider changing this (and mapStatus) in the future.
    path,
    statusCode: "??",
  };
}

/**
 * Map the raw status text from Git to a structure we can work with in the app.
 */
export function mapStatus(status: string): FileEntry {
  if (status === "??") {
    return {
      kind: "untracked",
    };
  }

  if (status === ".M") {
    return {
      index: GitStatusEntry.Unchanged,
      kind: "ordinary",
      type: "modified",
      workingTree: GitStatusEntry.Modified,
    };
  }

  if (status === "M.") {
    return {
      index: GitStatusEntry.Modified,
      kind: "ordinary",
      type: "modified",
      workingTree: GitStatusEntry.Unchanged,
    };
  }

  if (status === ".A") {
    return {
      index: GitStatusEntry.Unchanged,
      kind: "ordinary",
      type: "added",
      workingTree: GitStatusEntry.Added,
    };
  }

  if (status === "A.") {
    return {
      index: GitStatusEntry.Added,
      kind: "ordinary",
      type: "added",
      workingTree: GitStatusEntry.Unchanged,
    };
  }

  if (status === ".D") {
    return {
      index: GitStatusEntry.Unchanged,
      kind: "ordinary",
      type: "deleted",
      workingTree: GitStatusEntry.Deleted,
    };
  }

  if (status === "D.") {
    return {
      index: GitStatusEntry.Deleted,
      kind: "ordinary",
      type: "deleted",
      workingTree: GitStatusEntry.Unchanged,
    };
  }

  if (status === "R.") {
    return {
      index: GitStatusEntry.Renamed,
      kind: "renamed",
      workingTree: GitStatusEntry.Unchanged,
    };
  }

  if (status === ".R") {
    return {
      index: GitStatusEntry.Unchanged,
      kind: "renamed",
      workingTree: GitStatusEntry.Renamed,
    };
  }

  if (status === "C.") {
    return {
      index: GitStatusEntry.Copied,
      kind: "copied",
      workingTree: GitStatusEntry.Unchanged,
    };
  }

  if (status === ".C") {
    return {
      index: GitStatusEntry.Unchanged,
      kind: "copied",
      workingTree: GitStatusEntry.Copied,
    };
  }

  if (status === "AD") {
    return {
      index: GitStatusEntry.Added,
      kind: "ordinary",
      type: "added",
      workingTree: GitStatusEntry.Deleted,
    };
  }

  if (status === "AM") {
    return {
      index: GitStatusEntry.Added,
      kind: "ordinary",
      type: "added",
      workingTree: GitStatusEntry.Modified,
    };
  }

  if (status === "RM") {
    return {
      index: GitStatusEntry.Renamed,
      kind: "renamed",
      workingTree: GitStatusEntry.Modified,
    };
  }

  if (status === "RD") {
    return {
      index: GitStatusEntry.Renamed,
      kind: "renamed",
      workingTree: GitStatusEntry.Deleted,
    };
  }

  if (status === "DD") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Deleted,
      us: GitStatusEntry.Deleted,
    };
  }

  if (status === "AU") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Modified,
      us: GitStatusEntry.Added,
    };
  }

  if (status === "UD") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Deleted,
      us: GitStatusEntry.Modified,
    };
  }

  if (status === "UA") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Added,
      us: GitStatusEntry.Modified,
    };
  }

  if (status === "DU") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Modified,
      us: GitStatusEntry.Deleted,
    };
  }

  if (status === "AA") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Added,
      us: GitStatusEntry.Added,
    };
  }

  if (status === "UU") {
    return {
      kind: "conflicted",
      them: GitStatusEntry.Modified,
      us: GitStatusEntry.Modified,
    };
  }

  // as a fallback, we assume the file is modified in some way
  return {
    kind: "ordinary",
    type: "modified",
  };
}
