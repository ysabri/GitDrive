import { TopicSpace } from "models/app/TopicSpace";
import { User } from "models/app/User";
import { Repository } from "models/git/repository";


export class GRepository extends Repository {

    public readonly topicSpaces: ReadonlyArray<TopicSpace>;

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
