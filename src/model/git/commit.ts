import {CommitterID} from "./committer-id";
// tslint:disable-next-line:no-var-requires
const protoCommit = require("../../../static/commit_pb");

/** An immutable Git Commit. */
export class Commit {
    // /** The 40 character hex SHA has for the commit */
    // public readonly SHA: string;
    // /** The title/summary of the commit */
    // public readonly title: string;
    // /** The message/body of the commit */
    // public readonly body: string;
    // /**
    //  * The committer ID (email, name, time).
    //  * This assumes that the author and committer are the same
    //  * since it is the case in GitDrive.
    //  * Here is qoute from the Git Pro book as why they would be differen:
    //  * "You may be wondering what the difference is between author and
    //  * committer. The author is the person who originally wrote the patch,
    //  * whereas the committer is the person who last applied the patch. So,
    //  * if you send in a patch to a project and one of the core members applies
    //  * the patch, both of you get credit — you as the author and the core
    //  * member as the committer.""
    //  */
    // public readonly committer: CommitterID;
    // /** This is the parent's SHA, it is not a list as history is linear in GitDrive */
    // public readonly parentSHA: string;
    // /**
    //  * A list of old SHA hashes that belonged to the commit before it got rewritten.
    //  * If null then the commit was never rewritten.
    //  */
    // public readonly historySHA: ReadonlyArray<string> | null;
    private readonly protoObj: any;

    public constructor(
        sha: string,
        title: string,
        body: string,
        author: CommitterID,
        parent: string,
        history: ReadonlyArray<string> | null,
    ) {
        this.protoObj = new protoCommit.Commit();
        this.protoObj.setSha(sha);
        this.protoObj.setTitle(title);
        this.protoObj.setBody(body);
        this.protoObj.setCommitter(author.protoObj);
        this.protoObj.setParentsha(parent);
        this.protoObj.setHistoryshaList(history || []);
        // this.SHA = sha;
        // this.title = title;
        // this.body = body;
        // this.committer = author;
        // this.parentSHA = parent;
        // this.historySHA = history;
    }

    public get SHA(): string {
        return this.protoObj.getSha();
    }

    public get title(): string {
        return this.protoObj.getTitle();
    }

    public get body(): string {
        return this.protoObj.getBody();
    }

    public get committer(): CommitterID {
        return new CommitterID(this.protoObj.getCommitter());
    }

    public get parentSHA(): string {
        return this.protoObj.getParentsha();
    }

    public get historySHA(): ReadonlyArray<string> {
        return this.protoObj.getHistoryshaList();
    }

    /** See if the given SHA belongs or belonged to this commit obj */
    public async identity(oldSHA: string): Promise<boolean> {
        // it is this commit
        if (oldSHA === this.SHA) {
            return true;
        }
        // no history to look into
        if (!this.historySHA) {
            return false;
        }
        // see if it is was this commit
        for (const history of this.historySHA) {
            if (history === oldSHA) {
                return true;
            }
        }
        // did not find it in history
        return false;
    }
}
