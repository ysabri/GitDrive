// This code was taken from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/master/app/src/lib/git/status.ts

import { DiffSelection, DiffSelectionType } from "../model/diff";
import { Repository } from "../model/repository";
import {
    AppFileStatus,
    FileEntry,
    GitStatusEntry,
    WorkingDirectoryFileChange,
    WorkingDirectoryStatus,
} from "../model/status";
import { fatalError } from "../util/errors-util";
import { mapStatus, parsePorcelainStatus } from "../util/status-parser";
import { git } from "./core-git";

/** The number of commits a revision range is ahead/behind. */
export interface IAheadBehind {
    readonly ahead: number;
    readonly behind: number;
}

/** The encapsulation of the result from 'git status' */
export interface IStatusResult {
  readonly currentBranch?: string;
  readonly currentUpstreamBranch?: string;
  readonly currentTip?: string;
  readonly branchAheadBehind?: IAheadBehind;

  /** true if the repository exists at the given location */
  readonly exists: boolean;

  /** the absolute path to the repository's working directory */
  readonly workingDirectory: WorkingDirectoryStatus;
}

function convertToAppStatus(status: FileEntry): AppFileStatus {
  if (status.kind === "ordinary") {
    switch (status.type) {
      case "added":
        return AppFileStatus.New;
      case "modified":
        return AppFileStatus.Modified;
      case "deleted":
        return AppFileStatus.Deleted;
    }
  } else if (status.kind === "copied") {
    return AppFileStatus.Copied;
  } else if (status.kind === "renamed") {
    return AppFileStatus.Renamed;
  } else if (status.kind === "conflicted") {
    return AppFileStatus.Conflicted;
  } else if (status.kind === "untracked") {
    return AppFileStatus.New;
  }

  return fatalError(`Unknown file status ${status}`);
}

/**
 *  Retrieve the status for a given repository,
 *  and fail gracefully if the location is not a Git repository
 */
export async function getStatus(
  repository: Repository,
): Promise<IStatusResult> {
    // This will be a beefy explanation command, the git status documentation
    // does a great job of explaining what the output contains and what
    // everything in it means. For now know that --porcelain=2 is a convenient
    // way to get an easily parsable output that is guaranteed to be backwards
    // compatible.
  const result = await git(
    ["status", "--untracked-files=all", "--branch", "--porcelain=2", "-z"],
    repository.path,
  );

  const files = new Array<WorkingDirectoryFileChange>();

  let currentBranch: string | undefined;
  let currentUpstreamBranch: string | undefined;
  let currentTip: string | undefined ;
  let branchAheadBehind: IAheadBehind | undefined;

  for (const entry of parsePorcelainStatus(result.stdout)) {
    if (entry.kind === "entry") {
      const status = mapStatus(entry.statusCode);

      if (status.kind === "ordinary") {
        // when a file is added in the index but then removed in the working
        // directory, the file won't be part of the commit, so we can skip
        // displaying this entry in the changes list
        if (
          status.index === GitStatusEntry.Added &&
          status.workingTree === GitStatusEntry.Deleted
        ) {
          continue;
        }
      }

      if (status.kind === "untracked") {
        // when a delete has been staged, but an untracked file exists with the
        // same path, we should ensure that we only draw one entry in the
        // changes list - see if an entry already exists for this path and
        // remove it if found
        const existingEntry = files.findIndex((p) => p.path === entry.path);
        if (existingEntry > -1) {
          files.splice(existingEntry, 1);
        }
      }

      // for now we just poke at the existing summary
      const summary = convertToAppStatus(status);
      const selection = DiffSelection.fromInitialSelection(
        DiffSelectionType.All,
      );

      files.push(
        new WorkingDirectoryFileChange(
          entry.path,
          summary,
          selection,
          entry.oldPath,
        ),
      );
    } else if (entry.kind === "header") {
      let m: RegExpMatchArray | null;
      const value = entry.value;

      // This intentionally does not match branch.oid initial
      if (value.match(/^branch\.oid ([a-f0-9]+)$/)) {
        m = value.match(/^branch\.oid ([a-f0-9]+)$/);
        if (m) {
            currentTip = m[1];
        }
      } else if (value.match(/^branch.head (.*)/)) {
        m = value.match(/^branch.head (.*)/);
        if (m && m[1] !== "(detached)") {
          currentBranch = m[1];
        }
      } else if (value.match(/^branch.upstream (.*)/)) {
        m = value.match(/^branch.upstream (.*)/);
        if (m) {
            currentUpstreamBranch = m[1];
        }
      } else if (value.match(/^branch.ab \+(\d+) -(\d+)$/)) {
        m = value.match(/^branch.ab \+(\d+) -(\d+)$/);
        if (m) {
            const ahead = parseInt(m[1], 10);
            const behind = parseInt(m[2], 10);

            if (!isNaN(ahead) && !isNaN(behind)) {
                branchAheadBehind = { ahead, behind };
            }
        }
      }
    }
  }

  const workingDirectory = WorkingDirectoryStatus.fromFiles(files);

  return {
    branchAheadBehind,
    currentBranch,
    currentTip,
    currentUpstreamBranch,
    exists: true,
    workingDirectory,
  };
}
