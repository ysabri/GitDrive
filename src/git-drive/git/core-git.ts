import {
    GitError as errorsEnum,
    GitProcess,
    IGitExecutionOptions as GExecOption,
    IGitResult as GResult,
} from "dugite";
import { assertNever } from "../../util/errors-util";
/**
 * Defining our own error to include more information about the cause of
 * the errors. Not used for now, it will be once the error handlers are
 * implemented.
 */
export class GitError extends Error {
    /** The none zero returned error code */
    public readonly errCode: number;
    /** The human readable description of the error */
    public readonly description: string;
    /** The enum of the error, this is useful in filtering for certain errors */
    public readonly errEnum: errorsEnum;

    public constructor(
        description: string,
        args: ReadonlyArray<string>,
        errEnum: errorsEnum,
        errCode: number,
        actualText: string,
    ) {
        // just ensuring the info is included in the error and is formatted nicely
        super(`${description} With args: [${args.toString()}],`
            + ` exist code: ${errCode} and actual text: ${actualText}`);
        this.errCode = errCode;
        this.description = description;
        this.errEnum = errEnum;
    }
}

/**
 * Wrapper around dugite exec process in order to extended on it if desired.
 * The function will fulfil the promise with GResult that will contain any git
 * related errors. Or will reject when the git executable fails to launch,
 * in which case the thrown Error will have a string `code` property. See
 * * `dugite/errors.ts` for some of the known error codes.
 *
 * @param args          The arguments to pass to the git process.
 * @param cwd           The current working directory path for the command
 *                      being executed (this will not be needed for all the
 *                      commands).
 * @param ExecOptions   A bunch of environment, stdin, std  encoding, buffer
 *                      size, callback after spawn options for the when the
 *                      git process gets executed.
 */
export async function git(
    args: string[],
    cwd: string,
    ExecOptions?: GExecOption,
): Promise<GResult> {
    const cmdOptions = {...ExecOptions};

    const execResult = await GitProcess.exec(args, cwd, cmdOptions);

    const exitCode = execResult.exitCode;
    if (exitCode !== 0) {
        const stdout = execResult.stdout;
        const stderr = execResult.stderr;

        const stdoutEnum = GitProcess.parseError(stdout);
        const stderrEnum = GitProcess.parseError(stderr);
        // Throw the error based on whichever enum was found for it,
        // these won't overlap, its either or none
        let description = "";
        if (stderrEnum) {
            description += getDescriptionForError(stderrEnum) ;
            throw new GitError(description, args, stderrEnum, exitCode, "Stderr: " + stderr);
        } else if (stdoutEnum) {
            description += getDescriptionForError(stdoutEnum);
            throw new GitError(description, args, stdoutEnum, exitCode, "Stdout: " + stdout);
        }
    }

    return execResult;
}

/**
 * This is to disable any pre-configured credential helpers (especially the windows
 * one). The thing is git can be given a helper program that will get called
 * whenever it needs to verify a user. We will most likely have our own method
 * of verification and a credential helper.
 */
export const overrideCredentialHelper: ReadonlyArray<string> = ["-c", "credential.helper="];

/**
 * This function takes a known error and returns back a human readable
 * explanation that is usually shorter.
 */
function getDescriptionForError(error: errorsEnum): string {
    switch (error) {
      case errorsEnum.SSHKeyAuditUnverified:
        return "The SSH key is unverified.";
      case errorsEnum.SSHAuthenticationFailed:
      case errorsEnum.SSHPermissionDenied:
      case errorsEnum.HTTPSAuthenticationFailed:
        // tslint:disable-next-line:max-line-length
        return `Authentication failed. You may not have permission to access the repository or the repository may have been archived. Open ${
          "__DARWIN__" ? "preferences" : "options"
        } and verify that you're signed in with an account that has permission to access this repository.`;
      case errorsEnum.RemoteDisconnection:
        return "The remote disconnected. Check your Internet connection and try again.";
      case errorsEnum.HostDown:
        return "The host is down. Check your Internet connection and try again.";
      case errorsEnum.RebaseConflicts:
        return "We found some conflicts while trying to rebase. Please resolve the conflicts before continuing.";
      case errorsEnum.MergeConflicts:
        return "We found some conflicts while trying to merge. Please resolve the conflicts and commit the changes.";
      case errorsEnum.HTTPSRepositoryNotFound:
      case errorsEnum.SSHRepositoryNotFound:
        // tslint:disable-next-line:max-line-length
        return "The repository does not seem to exist anymore. You may not have access, or it may have been deleted or renamed.";
      case errorsEnum.PushNotFastForward:
        return "The repository has been updated since you last pulled. Try pulling before pushing.";
      case errorsEnum.BranchDeletionFailed:
        return "Could not delete the branch. It was probably already deleted.";
      case errorsEnum.DefaultBranchDeletionFailed:
        return `The branch is the repository's default branch and cannot be deleted.`;
      case errorsEnum.RevertConflicts:
        return "To finish reverting, please merge and commit the changes.";
      case errorsEnum.EmptyRebasePatch:
        return "There aren’t any changes left to apply.";
      case errorsEnum.NoMatchingRemoteBranch:
        return "There aren’t any remote branches that match the current branch.";
      case errorsEnum.NothingToCommit:
        return "There are no changes to commit.";
      case errorsEnum.NoSubmoduleMapping:
        // tslint:disable-next-line:max-line-length
        return "A submodule was removed from .gitmodules, but the folder still exists in the repository. Delete the folder, commit the change, then try again.";
      case errorsEnum.SubmoduleRepositoryDoesNotExist:
        return "A submodule points to a location which does not exist.";
      case errorsEnum.InvalidSubmoduleSHA:
        return "A submodule points to a commit which does not exist.";
      case errorsEnum.LocalPermissionDenied:
        return "Permission denied.";
      case errorsEnum.InvalidMerge:
        return "This is not something we can merge.";
      case errorsEnum.InvalidRebase:
        return "This is not something we can rebase.";
      case errorsEnum.NonFastForwardMergeIntoEmptyHead:
        return "The merge you attempted is not a fast-forward, so it cannot be performed on an empty branch.";
      case errorsEnum.PatchDoesNotApply:
        return "The requested changes conflict with one or more files in the repository.";
      case errorsEnum.BranchAlreadyExists:
        return "A branch with that name already exists.";
      case errorsEnum.BadRevision:
        return "Bad revision.";
      case errorsEnum.NotAGitRepository:
        return "This is not a git repository.";
      case errorsEnum.ProtectedBranchForcePush:
        return "This branch is protected from force-push operations.";
      case errorsEnum.ProtectedBranchRequiresReview:
        // tslint:disable-next-line:max-line-length
        return "This branch is protected and any changes requires an approved review. Open a pull request with changes targeting this branch instead.";
      case errorsEnum.PushWithFileSizeExceedingLimit:
        // tslint:disable-next-line:max-line-length
        return "The push operation includes a file which exceeds GitHub's file size restriction of 100MB. Please remove the file from history and try again.";
      case errorsEnum.HexBranchNameRejected:
        // tslint:disable-next-line:max-line-length
        return "The branch name cannot be a 40-character string of hexadecimal characters, as this is the format that Git uses for representing objects.";
      case errorsEnum.ForcePushRejected:
        return "The force push has been rejected for the current branch.";
      case errorsEnum.InvalidRefLength:
        return "A ref cannot be longer than 255 characters.";
      case errorsEnum.CannotMergeUnrelatedHistories:
        return "Unable to merge unrelated histories in this repository.";
      case errorsEnum.PushWithPrivateEmail:
        return "Cannot push these commits as they contain an email address marked as private on GitHub.";
      case errorsEnum.LFSAttributeDoesNotMatch:
        return "Git LFS attribute found in global Git configuration does not match expected value.";
      case errorsEnum.ProtectedBranchDeleteRejected:
        return "This branch cannot be deleted from the remote repository because it is marked as protected.";
      case errorsEnum.ProtectedBranchRequiredStatus:
        return "The push was rejected by the remote server because a required status check has not been satisfied.";
      default:
        return assertNever(error, `Unknown error: ${error}`);
    }
  }
