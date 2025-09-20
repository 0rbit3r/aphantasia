# Aphantasia

An open-source social network for graph theory enthusiasts and a cozy mindful universe for everyone else.

Official instance hosted at https://aphantasia.io

Complementary youtube channel: https://www.youtube.com/@AphantasticChannel

## How it works

For video tutorial see: TBD

Aphantasia is a virtual space focused on exploration and association. It consists of users, their thoughts and concepts rendered in an interactive graph view.

Thoughts are posts on Aphantasia. Every thought has an author, title, content, links and replies. Thoughts can link up to three existing thoughts - this means you can create not just replies, but associations.

Concepts can be added to thoughts to categorize them. Each concept has a tag that starts with an underscore - *ie. _aphantasia* - and can be nested using additional two underscores to narrow the scope - *ie. _aphantasia_bugReport_browserSupport*.

In short, **thought is sort of like a tweet and concept is sort of like a hashtag. And instead of an infinite feed, you use graph view to navigate them.**

## Contribution

Aphantasia is open to contributions, although the code is still a bit messy* and I would like to tidy it up and establish clear architecture and documentation before taking contributions seriously. That said, feel free to contact me if you want to contribute or just have a chat about it. (see contact below)

This repository is under AGPL license - feel free to fork, modify and get crazy with it if you dare, but keep it open.

*a bit messy = In some places it's a straight up hellscape.

## Installation

In order to locally run aphantasia, you will need the following technologies:
- .NET 8
- npm
- Database (PostgreSQL recommended, but usage of EFCore allows for any DB of choice)

Before running Aphantasia, set up a Database by creating an empty DB and scaffold it using `dotnet ef database update` with a connection string in migrationsettings.json > ConnectionStrings.DefaultConnection (you will need to create the file)
in project Afantazie.Data.Model.

Use `npm run dev` to run the local webapp and Visual Studio to run the Backend Server.

## TODO

The roadmap for the development is not clear-cut but will likely include:

### Features
- [ ] Pinch zoom
- [ ] Filtering (consolidate all thought endpoints into one with a good filter)
- [ ] Extend Concepts functionality
    - [ ] Trending concepts log on home screen
    - [ ] Concept graph visualization
    - [ ] More concept info (home-like - ie. newest, biggest, hot...)
    - [ ] Colorful concepts (based on their currently biggest thoughts)
- [ ] Follow users / concepts / thoughts + Custom subscriptions-like graph feed
- [ ] Scrollable home feeds
- [ ] Back button should focus previously viewed thought
- [ ] Server-side layout
- [ ] Pinned replies (this one is a maybe)
- [ ] Email verification (this one too)

### Code and architecture
- [ ] Refactor Frontend architecture and solidify its rules
- [ ] Rafactor some disgusting lazy code in backend
- [ ] Performance Optimization (Can we get to 60 FPS with 1000 thoughts on screen?)
- [ ] Add official code documentation
- [ ] Add either Unit or Integration tests to backend
- [ ] Add paging to places where it's currently missing
- [ ] Update password hashing algorithm from SHA256 to bcrypt (or other good alternative)
- [ ] Replace fetched svg icons with in-code svgs (to prevent lag before icons appear)

## API

I'm not against external usage of the API. If you want to have some fun with it, be my guest. Just keep in mind, that:
- There is no official documentation yet - if you want to use the API, you will have to reverse engineer it yourself.
- The application is still in development and the endpoints will likely radically change before the schema stabilizes.
- All bot-created thoughts must have a title starting with `[BOT]`.
- Spamming or any malicious activity will result in a ban.

## What's up with the name?

see: https://aphantasia.io/graph/1299

## Contact

You might get a hold of me at aphantastic[dot]channel[at]gmail[dot]com.
