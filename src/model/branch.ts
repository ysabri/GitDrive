import {Commit} from "./commit";
/**
 * An immutable Git branch.
 * If the branch's remoteUpstream is null, it means it is a local branch.
 * TODO: figure out how to name the branches and what should be the
 * minimum/maximum length for a branch.
 */
export class Branch {
    /** Current name of branch with no prefixes */
    public readonly name: string;

    /**
     * This is prefixed with the remote name, which will always be origin
     * since all GitDrive repos should have one remote only.
     * This will be null when remote is not configured.
     */
    public readonly remoteUpstream: string | null;
    /** Commit object the branch is pointing to */
    public readonly tip: Commit;

    public constructor(
        name: string,
        remote: string | null,
        tip: Commit,
    ) {
        this.name = name;
        this.remoteUpstream = remote;
        this.tip = tip;
    }


}
