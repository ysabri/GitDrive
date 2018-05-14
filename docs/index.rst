========
GitDrive
========
This is the documentation for GitDrive. The documentation will detail the
intended use of the different parts in the project, along with any limitations,
issues, and missing parts/features.

Each section should be stand alone as much as possible. Meaning that no knowledge
of other sections is required to understand the functionality of a section.
That being said knowledge of the entire program is structured is helpful in understanding
the purpose or the decisions that were made in designing each section.

==============
The Tech Stack
==============
Knowing the tech stack is helpful for understanding the structure. GitDrive is an Electron
app written in TypeScript. The Electron part means that the app has two parts. The *main process*
and the *renderer process*.

The main process:
    Is what the app launches first, it's where the node run environment is and
    it's responsible for launching the renderer process/s.

The renderer process:
    Contains the Chrome V8 engine along with access to the node environment APIs.

This should be enough for an overall idea, for a more in depth look, the Electron_ documentation
does a fantastic job. Also make sure to check awesome-electron_ for everything Electron related.

TypeScript is a super set of javascript that is structurally typed. This means that the app is transpiled
into javascript. It also means the code is type checked. This makes our code easier to refractor and write
with an IDE that supports TypeScript. It is recommended to look at the TypeScript handbook_ before diving
into reading/writing any code.

The rest of the stack without build related dependencies is as follows:
    - Dugite_: A Typescript binder to Git's command line.
    - Mocha_: A test suite for javascript node applications.
    - Chai_: Chai is a BDD / TDD assertion library to be used in mocha tests.
    - Google-protobuf_: A language-neutral, platform-neutral mechanism for serializing structured data.
    - Vue_: A *progressive framework* for building responsive user interfaces. A bunch of vue related libraries are used as well.
    - Fs-extra_: Adds to the native node fs module methods and add promise support to existing ones.

=============
The structure
=============
The application is an Model-View-Controller (MVC). The Model consists of the main Git commands that are
wrapped into the app commands. The app commands are listed in `The App`_. `The controller`_ part consists of
some state-hub logic integrated into the Vuex store then components. Then `the view`_ is specified per Vue component. This
makes parts of the view (components) reuseable in whichever context the user desires.

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
    + **model**: The model class object abstraction is kept here.
        * **app**: The app classes/models.
        * **controller**: The controller classes/models.
        * **git**: The git classes/models.
    + **renderer**: The entry point for the renderer process/s, webpack will look here.
    + **store**: The Vuex store lies here, all the mutation, actions, and getters logic is here.
    + **tests**: The app tests, they are not transpiled like the rest of the dirs in src.
        * **app**: Tests for the app logic.
        * **controller**: Tests for the controller logic.
        * **git**: Tests for the core git commands.
        * **testRepos**: Toys repos for testing stuff on.
    + **util**: Utility functions that might be useful for any other parts in the app.
- **static**: Files that are used as is.
- **.electron-vue**: The webpack config and run scripts are here.
- **template**: Like static but it is meant to be used by users not the app itself.

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

============
The Git Core
============

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
