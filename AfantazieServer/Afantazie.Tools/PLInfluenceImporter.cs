using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model.Entity;
using Afantazie.Data.Model;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal class PLInfluenceImporter
    {
        public static async Task ImportPLInfluence(IServiceProvider services)
        {
            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
            Console.WriteLine("Importing Programming languages file");

            var path = "C:/Projects/Afantazie_official_repo/Secondary_files/Datasets/Programming_languages_influence.txt";

            List<ThoughtEntity> thoughtEntities = new();
            Dictionary<int, List<int>> links = new();
            var index = 0;

            using (var yearReader = new StreamReader(path))
            {
                var line = yearReader.ReadLine();
                while (line != null)
                {
                    if (line.StartsWith('#'))
                    {
                        line = yearReader.ReadLine();
                        continue;
                    }
                    if (line.StartsWith("Year"))
                    {
                        var parts = line.Split(" ");
                        var thoughtName = parts[1].Trim('\"');
                        var year = parts[2].Trim('\"');

                        thoughtEntities.Add(new ThoughtEntity
                        {
                            AuthorId = index,
                            Title = thoughtName,
                            Content = thoughtName,
                            DateCreated = DateTime.Parse($"{year}-01-01"),
                            SizeMultiplier = 0
                        });
                        index++;
                    }
                    line = yearReader.ReadLine();
                }

                thoughtEntities = thoughtEntities.OrderBy(t => t.DateCreated).ToList();
                for (int i = 0; i < thoughtEntities.Count; i++)
                {
                    thoughtEntities[i].AuthorId = i + 1;
                }

            }
            using (var citeReader = new StreamReader(path))
            {
                var line = citeReader.ReadLine();
                while (line != null)
                {
                    if (line.StartsWith('#'))
                    {
                        line = citeReader.ReadLine();
                        continue;
                    }
                    if (line.StartsWith("Cite"))
                    {
                        var parts = line.Split(" ");
                        var sourceName = parts[1].Trim('\"');
                        var targetName = parts[2].Trim('\"');

                        var sourceId = thoughtEntities.FindIndex(t => t.Title == sourceName);//get zero indexed ids
                        var targetId = thoughtEntities.FindIndex(t => t.Title == targetName);

                        if (sourceId == -1 || targetId == -1)
                        {
                            Console.WriteLine($"Source or target not found. Skipping line: {line}");
                        }
                        else
                        {
                            if (!links.ContainsKey(sourceId))
                            {
                                links.Add(sourceId, new List<int>([targetId]));
                            }
                            else
                            {
                                links[sourceId].Add(targetId);
                            }
                        }
                    }

                    line = citeReader.ReadLine();
                }
            }

            await RainbowUsersGenerator.GenerateUsersAsync(services, thoughtEntities.Count + 10);

            index = 0;
            foreach (var thought in thoughtEntities)
            {
                var thoughtRefs = links.ContainsKey(index)
                    ? links[index].Select(id => id + 1).ToList() //database counts from 1
                    : [];
                var newThought = await thoughtRepo.InsertThoughtAsync(
                    thought.Title,
                    thought.Content,
                    thought.AuthorId + 1,
                    thoughtRefs
                    );
                using (var db = services.GetRequiredService<DataContextProvider>().GetDataContext())
                {
                    var thoughtEntity = db.Thoughts.FirstOrDefault(t => t.Id == newThought.Payload);
                    thoughtEntity.DateCreated = DateTime.SpecifyKind(thought.DateCreated, DateTimeKind.Utc);
                    await db.SaveChangesAsync();
                }
                index++;
            }

            Console.WriteLine("Done");
        }
    }
}
