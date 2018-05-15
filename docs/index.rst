========
GitDrive
========
This is a high level documentation for GitDrive. This will detail the
intended use of the different parts in the project, along with any limitations,
issues, and missing parts/features.

Each section should be stand alone as much as possible. Meaning that no knowledge
of other sections is required to understand the functionality of a section.
That being said knowledge of the program's structure is helpful in understanding
the purpose behind the decisions that were made in designing the app.

==============
The Tech Stack
==============
Knowing the tech stack is helpful for understanding the structure. GitDrive is an Electron
app written in TypeScript. The Electron part means the app has two parts. The *main process*
and the *renderer process*.

The main process:
    Its what the app launches first, it's where the node run environment is and
    it's responsible for launching the renderer process/s. This is usually seen as the backend
    part where the logic is kept.

The renderer process:
    Contains the Chrome V8 engine along with access to the node environment APIs. This is what
    user interacts with and could consist of more than one window.

These two parts communicate on channels using something called ipcMain and ipcRenderer.
The ipc part stands for intra process communication. Each process is able to set listeners and send
messages on channels on its respective ipc object.

This should be enough for an overall idea, for a more in depth look, the Electron_ documentation
does a fantastic job. Also make sure to check awesome-electron_ for everything Electron related.

TypeScript is a structurally typed super set of javascript. This means that the app is transpiled
into javascript. It also means the code is type checked. This makes our code easier to refractor and
write with an IDE that supports TypeScript. It is recommended to look at the TypeScript handbook_
before diving into reading/writing any code.

The rest of the stack without build related dependencies is as follows:
    - Dugite_: A Typescript binder to Git's command line.
    - Mocha_: A test suite for javascript node applications.
    - Chai_: Chai is a BDD / TDD assertion library to be used in mocha tests.
    - Google-protobuf_: A language-neutral, platform-neutral mechanism for serializing structured data.
    - Vue_: A *progressive framework* for building responsive user interfaces. A bunch of vue related libraries are used as well.
    - Fs-extra_: Adds to the native node fs module methods and adds promise support to existing ones.

=============
The structure
=============
The application is a Model-View-Controller (MVC). The Model consists of the main Git commands that are
wrapped into the app commands. The app commands are listed in `The App`_. `The controller`_ part
consists of some state-hub logic integrated into the Vuex store then components. Then `the view`_
is specified per Vue component. This makes parts of the view (components) reuseable in whichever
context the user desires.

The file tree structure is explained below:

- **docs**: Is where this file resides, ie. the documentation.
- **build**: It is where the app gets transpiled.
- **src**: Where the app resides.
    + **components**: Where we keep the Vue components.
    + **examples**: A bunch of examples for how the code should be used.
    + **git-drive**: The logic for the app models is kept here.
        * **app**: The logic behind the main app commands: add-topicspace, ..., load-repo, start, ...
        * **controller**: Where the logic for the controller is kept.
        * **git**: The logic behind the core git commands is kept here.
    + **main**: The entry point for the main process, this is where webpack will look.
    + **model**: The model class objects abstraction is kept here.
        * **app**: The app classes/models.
        * **controller**: The controller classes/models.
        * **git**: The git classes/models.
    + **renderer**: The entry point for the renderer process/s, webpack will look here.
    + **store**: The Vuex store lies here, all the mutations, actions, and getters logic is here.
    + **tests**: The app tests, they are not transpiled like the rest of the dirs in src.
        * **app**: Tests for the app logic.
        * **controller**: Tests for the controller logic.
        * **git**: Tests for the core git commands.
        * **testRepos**: Toy repos for testing stuff on.
    + **util**: Utility functions that might be useful for any other parts in the app.
- **static**: Files that are used as is.
- **.electron-vue**: The webpack config and run scripts are here.
- **template**: Like static but its meant to be used by users not the app itself.

---------------------------

Notice how the *git-drive*, *model* and *tests* directories share the same structure.

The `protobuf`_ coupling/abstraction is specified within each model.

=================
The Build Process
=================

Our build process is not that involved but not trivial at the same time. Looking at the package.json_
scripts we notice 11 of them, most are not stand alone callable, here is the layout:

Dev-Build
---------
The start script is the one responsible this and has four steps. The first one is just cleaning the
build directory. The second step transpiles the app from TypeScript to javascript into the build
directory. The third runs the linter, based on the rules in tsconfig.json_. The fourth and last,
actually launches the app using webpack from the build/main and build/renderer directories

Production-Build
----------------
The dist (short for distribute) scripts are responsible for this. So far this is not functional.
I will finalize this and update the section accordingly.

App-Packaging
--------------
The pack scripts are responsible for this. So far this is not functional as well. Will update
the section once it is functional.

Testing
--------
The test script is the one responsible for this. The script runs any tests specified in the
src/test directory. The test assume the ts-node npm module to be installed globally as it is
responsible for transpiling the TypeScript tests in runtime thus it is not possible to run the
tests without it.

-----------------------------------

Notice how I did not go through any of the webpack setup or build configs. They are very standard
and self explaining to whoever knows anything about webpack. I know enough to make what is there now
work.

One thing worth mentioning is that none of the components are actually transpiled, they are compiled
in runtime using vue-loader and a bunch of other modules. This means when any of these are referenced,
ie. imported, they are referenced with respect to them existing in src/components directory not build/*
directory like the rest of the code.


===========
Terminology
===========
Below are formal definitions of each concept. Use this to help reason about and understand them.

**Repository**
    A group of one or more TopicSpaces. Each repository has a Main topicspace among other ones.
    The repo has a name that cannot be longer than a 100 character. Also each user in the
    repository must have a unique name.

**TopicSpace**
    A group of one or more WorkSpaces. Since each workspace can only have one user, the number
    of users has to match the number of workspaces. The name as well has to be less than a 100
    characters.

**WorkSpace**
    A single branch for one user only. Meaning that only the user is allowed to commit on this branch.
    This way we can get who the user is by reading the tip's commit author information. The name of
    the branch starts with a capital "G" letter then the first 10 characters in the first
    commit's SHAs. The "G" is added to avoid ambiguity in Git when referencing the branch ref and
    actual commit SHAs. This naming schema grants us unique names for quite a long time, a proof way
    is to make the length of the SHA characters adapt to the total number of workspaces, maybe one
    day in the future.

**Sync**
    For a user and a workspace, the operation does a commit followed by a push of the workspace then
    a fetch of all workspaces. This requires the branch checked-out to match the given workspace. It
    will also check that the given user owns the given workspace.

**Dispatcher**
    Where all the data-flow is handled along with events. It can control one or more app states. Any
    reads, writes to data should go through here. This will ensure the consistency of such operations
    and will make extending on them easier.

**App-State**
    A state that is tied to a browser window and app-data. The browser window coupling is not done
    yet. As for the app-data, this class is responsible for mutating the app-data state in a
    consistent state. This means creating a new object with every mutation since app-data is immutable.
    This class is also responsible for exposing any info from app-data. One might ask by now why not
    have app-data as a part of the Dispatcher instead of doing this. The reason is for the future where
    the app might have multiple windows in which dispatcher (or an api it will call) will be tasked
    with keeping information between them consistent.

**FS Explorer**
    The right bottom panel responsible for exploring the currently selected workspace. It will show
    directories/files and offer operations on them accordingly. These operations are tbd but one
    will be to show the history progression. This means show the linear line of commits that affected
    the directory or file in the selected workspace.

**Header Menu**
    Its the top panel where the app commands will reside. These commands will chang based on thei
    context, ie. the current repo, current topicspace, and current workspace.

**TS Pane**
    Its the left panel where the user browses the current repo's topicspaces and workspaces.
    WorkSpaces are named based on their users.

**App Data**
    The metadata that will be cached in between app sessions, such as current repos, current user,
    repos, etc. This class is coupled with a protobuf message, thus this is how it will be written
    and read.

**Store**
    The Vuex store, where the controller (dispatcher) meets the view. So the Vue component tree
    only allowsfor information to flow from parents to children using something they call props.
    This proves difficult if sibling components want to communicate information with each other.
    This problem can be solved by using a global data store as a single source of truth in which
    the entire component tree has access to the data in it using a defined set of interactions.
    These interactions are either getting the data, mutating the data, or doing an async action
    that might mutate the data eventually. By doing this our state transitions are clear to
    follow and thus debug.

============
The Git Core
============
This section assumes a certain level of comfort with Git commands, terminology and concepts.

This consists of the core Git commands that we wrap around with the help of dugite. A lof of
these are inspired or sometimes copied from the `GitHub Desktop`_ project, thanks to them
for that.

The list below will have commands that are exposed in multiple ways that depend on the
options given to the command. So in reality we have an 7 amount of Git commands/behaviors
exposed. Each command will also have an explanation of the purpose from including it along
with an explanation of why its exposed in such a way.

Also all the commands will not attempt to handle any error they encounter and will throw it
to the caller. The errors thrown follow the structure explained under core-git below.

Here are the commands in alphabetical order:

    **1.Add:**
        This will stage everything in the working tree. All changes no matter what they are
        will get staged. We do not expose partial staging (staging per file) since we have no
        use for it in our functionality. Partial staging is still achievable, if needed,
        using partial resets. A partial reset with the right option will effectively undo
        an add. The addOptions param is experimental, ie. not tested at all.
    **2.Branch:**
        We have two actions from the branch command.

        The first is to create a branch, which given a valid name with length less than a
        100 characters and a committish tip will create a branch at the committish. HEAD has
        to be explicitly specified to avoid ambiguity.

        The second is renaming a branch, which given a branch and a new valid name
        will rename the branch to that name. We use rename while creating workspaces after we
        create the first commit on them since we need the first 10 SHAs characters from it.
    **3.Checkout:**
        We have four actions from the checkout command.

        The first is just a normal checkout of a ref. Usually the ref will be a branch object,
        in fact this command is only used to checkout branches. The reason behind accepting
        a string is because of metadata branches. It turned out its a lot of headache to keep
        track of the metadata branch in a branch object so we only keep track of its ref name
        per repository and we used that name (string) to checkout when needed.

        The second is our beloved partial checkout. Given a list of paths and ref, the command
        will checkout the state of those paths based on the ref into the current working tree.

        The third is orphan checkout

    4.Clone:

    5.Commit:

    6.core-git:

    7.Diff-index:

    8.Diff:

    9.Fetch:

    10.For-each-ref:

    11.Init:

    12.Log:

    13.Pull:

    14.Push:

    15.Remote:

    16.Reset:

    17.Rev-parse:

    18.Show:

    19.Statue:

========
Protobuf
========

=======
The App
=======

==============
The Controller
==============

========
The View
========


.. _Electron: https://electronjs.org/docs
.. _awesome-electron: https://github.com/sindresorhus/awesome-electron
.. _handbook: https://www.typescriptlang.org/docs/handbook/basic-types.html
.. _dugite: https://github.com/desktop/dugite
.. _mocha: https://mochajs.org/
.. _chai: http://www.chaijs.com/
.. _google-protobuf: https://developers.google.com/protocol-buffers/
.. _vue: https://vuejs.org
.. _fs-extra: https://github.com/jprichardson/node-fs-extra
.. _package.json: ../package.json
.. _tsconfig.json: ../tsconfig.json
.. _GitHub Desktop: https://github.com/desktop/desktop
