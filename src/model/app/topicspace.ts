import { Commit } from "models/git/commit";
import { User } from "./user";
import { WorkSpace } from "./workspace";

/** An immutable TopicSpace */
export class TopicSpace {
    /** The name of the TopicSpace */
    public readonly name: string;
    /** The list of users in the space */
    public readonly users: ReadonlyArray<User>;
    /** The WorkSpaces in the topic space, it should match users in length */
    public readonly workSpaces: ReadonlyArray<WorkSpace>;
    /**
     * The origin commit that created the space, it is undefind for the first
     * space.
     */
    public readonly originCommit?: Commit;

    public constructor(
        name: string,
        users: ReadonlyArray<User>,
        workspaces: ReadonlyArray<WorkSpace>,
        origincommit?: Commit,
    ) {
        this.name = name;
        this.users = users;
        this.workSpaces = workspaces;
        this.originCommit = origincommit;
    }
}
