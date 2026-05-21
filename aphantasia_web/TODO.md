# Granular todo

# Current task
- [ ] Epochs
    - [ ] Epoch Management Service
    - [ ] Epoch book view
    - [ ]


## Features
- [ ] Delete account

- [ ] Better links
    - [ ] Quick link
    - [ ] Link selection
        - [ ] Mine
        - [ ] Epoch+scroll
        - [ ] Bookmarked


# Bugs
- [x] multiline titles

# Tweaks
- [ ] Positions postage
- [ ] Shorter edges (maybe pair with lower push strength?)
- [ ] try to preserve viewport pos on grafika reinitalization


# Repo Refactoring
  ---
  We are refactoring the Aphantasia backend to remove the Repository layer entirely. The project is a .NET 10 clean architecture monorepo (aphantasia_server/).

  Why: The repo layer (Aphant.Impl.Database.Repo) is an abstraction over EF Core that provides no real benefit — tests use real SQLite (SeededAppContainer), never mocking data contracts. The layer is actively harmful: it prevents logic
  services from owning transactions, which causes partial mutation bugs in multi-step writes like DeleteThought.

  What to do:

  1. Read CLAUDE.md for project structure before starting.
  2. For each repository in Aphant.Impl.Database.Repo/ (ThoughtRepository, UserRepository, NotificationRepository, ChatRepository, EpochRepository), move its query logic directly into the corresponding logic service in
  Aphant.Impl.Logic/. Logic services should inject AphantasiaDataContext directly. Shared/reusable queries can live as internal helper classes inside the logic project (e.g. ThoughtQueries.cs) — not a separate project, not interfaces.
  3. Remove all IXxxDataContract interfaces from Aphant.Core.Contract/Data/.
  4. Delete the Aphant.Impl.Database.Repo project and remove it from the solution.
  5. Rewire DI in Aphant.Boot.WebServer/Program.cs and Aphant.Boot.LayoutDaemon/Program.cs — remove RegisterDbRepositoryModule, register logic services with DbContext directly.
  6. Wrap any multi-step write operations (e.g. DeleteThought — debumps + delete) in a DB transaction using _db.Database.BeginTransactionAsync().
  7. Remove all try/catch (DbUpdateException) blocks from the moved query code. Error returns (Error.NotFound, Error.BadRequest) stay for domain conditions. Infrastructure exceptions propagate — the background service loop already has a
   top-level catch, and the web server has global exception middleware.
  8. Run dotnet build and dotnet test Aphant.Boot.Tester — all tests must pass before finishing.

  Discuss approach with the user before making changes if anything is ambiguous. Do not make broad architectural changes beyond the scope above.

  The prompt above needs some work - Instead of removing data, lets leave data for simple crud (or at crud-like enough) opereations and simply give Logic access to the DbContext.

  THe point is to have Data for a simple operations (CRUD, Inserts with creation of automatic names, dates... stuff like that), 
  while the logic layer handles the truly non-trivial operations, such as Thought creation, Epoch managmemnt, Deletion, etc. etc.