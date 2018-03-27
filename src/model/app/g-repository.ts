import { Repository } from "../git/repository";
import { TopicSpace } from "./topicspace";
import { User } from "./user";


/** An immutable repository object */
export class GRepository extends Repository {
    // A list of TopicSpace in the repo
    public readonly topicSpaces: ReadonlyArray<TopicSpace>;
    // The global list of users in the Repo
    public readonly users: ReadonlyArray<User>;

    public constructor(
        path: string,
        topicspaces: ReadonlyArray<TopicSpace>,
        users: ReadonlyArray<User>,
    ) {
        super(path);
        this.topicSpaces = topicspaces;
        this.users = users;
    }

    public id(): string {
        return `**(Repository: ${super.id()}\n\t with TopicSpace: ${this.topicSpaces.map((val) => {
            return val.id();
        }).join("\n\t, TopicSpace: ")}\n\t and Users:(${this.users.map((val) => {
            return val.id();
        }).toString()})\n)**`;
    }
}
