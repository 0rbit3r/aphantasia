# Aphantasia

**NOTICE! :** Aphantasia alpha has been shut down, big thank you to all who participated and stay tuned for Aphantasia 2.0 Beta!

Official instance has been and will be hosted at https://aphantasia.io

Complementary youtube channel: https://www.youtube.com/@AphantasticChannel

## How it works

Aphantasia is a virtual graph-based social space focused on exploration and association of colorful pieces of text called thoughts living in an explorable 2D space.

Every thought has an author, title, content, links and replies. Thoughts can link up to three existing thoughts - this means you can create not just replies, but associations.

Concepts can be added to thoughts to categorize them. Each concept has a tag that starts with an underscore - *ie. _aphantasia* - and can be nested using additional two underscores to narrow the scope - *ie. _aphantasia_bugReport_browserSupport*.

In short, **a thought is sort of like a tweet and a concept is sort of like a hashtag. And instead of an infinite feed, you use graph view to navigate them.**

## Installation

In order to locally run aphantasia, you will need the following technologies:
- .NET 8
- npm
- Database (PostgreSQL recommended, but usage of EFCore allows for any DB of choice)

Before running Aphantasia, set up a Database by creating an empty DB and scaffold it using `dotnet ef database update` with a connection string in migrationsettings.json > ConnectionStrings.DefaultConnection (you will need to create the file)
in project Afantazie.Data.Model.

Use `npm run dev` to run the local webapp and Visual Studio to run the Backend Server.

## Contact

You might get a hold of me at aphantastic[dot]channel[at]gmail[dot]com.

