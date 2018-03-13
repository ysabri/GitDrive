import { TopicSpace } from "models/app/topicspace";
import { User } from "models/app/user";
import { Repository } from "models/git/repository";

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

}
