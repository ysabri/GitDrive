import { Commit } from "../git/commit";
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
    /** The first commit in the topicSpace */
    public readonly firstCommit: Commit;
    /**
     * The origin commit that created the space, it is undefind for the first
     * space.
     */
    public readonly originCommit?: Commit;

    public constructor(
        name: string,
        users: ReadonlyArray<User>,
        workspaces: ReadonlyArray<WorkSpace>,
        firstCommit: Commit,
        origincommit?: Commit,
    ) {
        this.name = name;
        this.users = users;
        this.workSpaces = workspaces;
        this.firstCommit = firstCommit;
        this.originCommit = origincommit;
    }

    public id(): string {
        return `${this.name}\n\t\t Users:(${this.users.map((val) => {
            return val.id();
        }).toString()})\n\t\t and WorkSpaces:(${this.workSpaces.map((val) => {
            return val.id();
        }).toString()})`;
    }
}
