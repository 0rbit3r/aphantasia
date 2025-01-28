using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal class CitHepImporterTemporal
    {
        //public async static Task ImportCitHepFileAsync(IServiceProvider services)
        //{
        //    bool LIMIT_TO_5_CITATIONS = false;
        //    int NODES_LIMIT = 34546;

        //    // file size
        //    int nodes = 34546;
        //    int edges = 421578;

        //    string path = "C:/Users/kakos/Downloads/cit-HepPh.txt/Cit-HepPh.txt";
        //    string temporalDataPath = "C:/Projects/Afantazie_official_repo/Secondary_files/CitHep_Dataset/cit-HepPh-dates.txt/cit-HepPh-dates.txt";

        //    //var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
        //    var userRepo = services.GetRequiredService<IUserRepository>();
        //    var authRepo = services.GetRequiredService<IUserAuthRepository>();
        //    var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
        //    Dictionary<int, int> idToOurId = new Dictionary<int, int>();
        //    // holds OUR ids of thought references
        //    List<int>[] references = new List<int>[nodes + 1];

        //    var lastUsedOurId = 1;

        //    using (StreamReader reader = new StreamReader(path))
        //    {
        //        string? line = reader.ReadLine();
        //        // Read the cithep file as-is - the header is expected and skipped
        //        line = reader.ReadLine();
        //        line = reader.ReadLine();
        //        line = reader.ReadLine();
        //        line = reader.ReadLine();

        //        for (int edge = 1; edge <= edges; edge++)
        //        {
        //            if (line is null)
        //            {
        //                Console.WriteLine("Unexpected EOF. Exiting");
        //                break;
        //            }

        //            var parts = line.Split("\t");
        //            if (!idToOurId.ContainsKey(int.Parse(parts[0])))
        //            {
        //                idToOurId.Add(int.Parse(parts[0]), lastUsedOurId++);
        //            }
        //            if (!idToOurId.ContainsKey(int.Parse(parts[1])))
        //            {
        //                idToOurId.Add(int.Parse(parts[1]), lastUsedOurId++);
        //            }

        //            if (references[idToOurId[int.Parse(parts[0])]] == null)
        //            {
        //                references[idToOurId[int.Parse(parts[0])]] = new List<int>();
        //            }
        //            if (LIMIT_TO_5_CITATIONS && references[idToOurId[int.Parse(parts[0])]].Count >= 5)
        //            {
        //                line = reader.ReadLine();
        //                continue;
        //            }
        //            references[idToOurId[int.Parse(parts[0])]].Add(idToOurId[int.Parse(parts[1])]);

        //            line = reader.ReadLine();
        //        }

        //        var dates = getPublicationDates(temporalDataPath, idToOurId);

        //        await RainbowUsersGenerator.GenerateUsersAsync(services, NODES_LIMIT + 1);

        //        // limit the references to the nodes limit (to keep links in bounds)
        //        for (int i = 0; i < references.Length; i++)
        //        {
        //            if (references[i] is null)
        //            {
        //                references[i] = new List<int>();
        //                continue;
        //            }
        //            var nodeLimitedReferences = references[i]
        //                .Where(r => r < NODES_LIMIT)
        //                .ToList();
        //            references[i].Clear();
        //            references[i].AddRange(nodeLimitedReferences);
        //        }
        //        for (int i = 1; i <= NODES_LIMIT; i++)
        //        {
        //            if (i % 100 == 0)
        //            {
        //                Console.WriteLine($"{i} / {nodes}");
        //            }
        //            var insertedId = await thoughtRepo.InsertThoughtAsync(
        //                $"{i}th thought", $"{i}th thought", i, references[i] ?? new List<int>());

        //            if (dates.ContainsKey(i))
        //                using (var db = services.GetRequiredService<DataContextProvider>().GetDataContext())
        //                {
        //                    var thought = db.Thoughts.FirstOrDefault(t => t.Id == insertedId.Payload);
        //                    thought.DateCreated = DateTime.SpecifyKind(dates[i], DateTimeKind.Utc);
        //                    await db.SaveChangesAsync();
        //                }
        //            else
        //                Console.WriteLine($"No date for thought {i} found");
        //        }

        //        Console.WriteLine("Done!");
        //        Console.ReadLine();
        //    }
        //}

        public static async Task ImportCitHepFileAsync(IServiceProvider services)
        {
            Console.WriteLine("Generating temporal Thoughts");

            // Parametrization

            int NODES_LIMIT = 34546;

            // file size
            int nodes = 34546;
            int edges = 421578;

            string edgesPath = "C:/Users/kakos/Downloads/cit-HepPh.txt/Cit-HepPh.txt";
            string datesFilePath = "C:/Projects/Afantazie_official_repo/Secondary_files/CitHep_Dataset/cit-HepPh-dates.txt/cit-HepPh-dates.txt";

            //var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
            var userRepo = services.GetRequiredService<IUserRepository>();
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
            Dictionary<int, int> idToOurId = new Dictionary<int, int>();


            Dictionary<int, ThoughtEntity> thoughtEntities = new Dictionary<int, ThoughtEntity>();

            // load nodes and dates
            Console.WriteLine("Loading nodes and dates");
            using (StreamReader reader = new StreamReader(datesFilePath))
            {
                string? line = reader.ReadLine();
                // Read the cithep file as-is - the header is expected and skipped
                line = reader.ReadLine();
                var index = 1;
                while (line is not null)
                {
                    if (index % 1000 == 0)
                    {
                        Console.WriteLine($"{index}");
                    }
                    var idAndDate = line.Split("\t");
                    if (idAndDate.Length != 2)
                    {
                        Console.WriteLine("Unexpected line format. Exiting");
                        break;
                    }
                    if (idAndDate[0].Length > 7)
                    {
                        if (idAndDate[0].Substring(0, 2) == "11")
                        {
                            idAndDate[0] = idAndDate[0].Substring(2);
                        }
                        else
                        {
                            Console.WriteLine($"Unexpected id format. {idAndDate[0]} Exiting");
                        }
                    }
                    var originalId = int.Parse(idAndDate[0]);

                    if (!thoughtEntities.ContainsKey(originalId))
                    {

                        thoughtEntities.Add(originalId, new ThoughtEntity
                        {
                            AuthorId = index,
                            Content = idAndDate[0],
                            Title = idAndDate[0],
                            DateCreated = DateTime.SpecifyKind(DateTime.Parse(idAndDate[1]), DateTimeKind.Utc),
                            SizeMultiplier = 0
                        });
                    }

                    line = reader.ReadLine();
                    index++;
                }
            }

            // Generate Users
            await RainbowUsersGenerator.GenerateUsersAsync(services, thoughtEntities.Count + 10);

            // load edges
            Console.WriteLine("Loading edges");
            Dictionary<ThoughtEntity, List<int>> thoughtsLinkArrays = new Dictionary<ThoughtEntity, List<int>>();
            using (StreamReader reader = new StreamReader(edgesPath))
            {
                string? line = reader.ReadLine();
                // Read the cithep file as-is - the header is expected and skipped
                line = reader.ReadLine();
                line = reader.ReadLine();
                line = reader.ReadLine();
                line = reader.ReadLine();

                for (int edge = 1; edge <= edges; edge++)
                {
                    if (line is null)
                    {
                        Console.WriteLine("Unexpected EOF. Exiting");
                        break;
                    }
                    var parts = line.Split("\t");

                    if (thoughtEntities.TryGetValue(int.Parse(parts[0]), out var associatedSourceThought))
                    {
                        if (thoughtEntities.TryGetValue(int.Parse(parts[1]), out var associatedTargetThought))
                        {
                            if (associatedTargetThought.DateCreated < associatedSourceThought.DateCreated)
                            {
                                if (!thoughtsLinkArrays.ContainsKey(associatedSourceThought))
                                {
                                    thoughtsLinkArrays.Add(associatedSourceThought, new List<int>([int.Parse(parts[1])]));
                                }
                                else
                                {
                                    thoughtsLinkArrays[associatedSourceThought].Add(int.Parse(parts[1]));
                                }
                            }
                            else
                            {
                                if (!thoughtsLinkArrays.ContainsKey(associatedTargetThought))
                                {
                                    thoughtsLinkArrays.Add(associatedTargetThought, new List<int>([int.Parse(parts[0])]));
                                }
                                else
                                {
                                    thoughtsLinkArrays[associatedTargetThought].Add(int.Parse(parts[0]));
                                }
                            }
                        }
                        else
                        {
                            Console.WriteLine($"  Target Thought {int.Parse(parts[1])} not found");
                        }

                    }
                    else
                    {
                        Console.WriteLine($"  Source Thought {int.Parse(parts[0])} not found");
                    }
                    //Console.WriteLine($"{int.Parse(parts[0])} > {int.Parse(parts[1])} {int.Parse(parts[0]) > int.Parse(parts[1])}");


                    line = reader.ReadLine();
                }
            }

            // order into list at the end to ensure ascending order of ids.
            var dateOrderedList = thoughtEntities
                .OrderBy(kv => kv.Value.DateCreated)
                .Select(kv => kv.Value)
                .ToList();

            // remap ids to the new ones (expecting ascending ordering starting from 1)
            Console.WriteLine("Remapping ids");
            var i = 0;
            foreach (var thought in dateOrderedList)
            {
                if (i++ % 1000 == 0)
                    Console.WriteLine($"{i} / {dateOrderedList.Count}");
                if (thoughtsLinkArrays.ContainsKey(thought))
                {
                    thoughtsLinkArrays[thought] = thoughtsLinkArrays[thought]
                        .Select(l => dateOrderedList.FindIndex(t => int.Parse(t.Title) == l))
                        .ToList();
                }
                thought.AuthorId = i;
            }

            //save in DB
            Console.WriteLine("Saving in DB");
            i = 0;
            foreach (var thought in dateOrderedList)
            {
                if (i++ % 1000 == 0)
                    Console.WriteLine($"{i} / {dateOrderedList.Count}");

                if (!thoughtsLinkArrays.TryGetValue(thought, out var links))
                {
                    links = new List<int>();
                }

                var newThought = await thoughtRepo.InsertThoughtAsync(
                    thought.Title,
                    thought.Content,
                    thought.AuthorId,
                    links);

                using (var db = services.GetRequiredService<DataContextProvider>().GetDataContext())
                {
                    var thoughtEntity = db.Thoughts.FirstOrDefault(t => t.Id == newThought.Payload);
                    thoughtEntity.DateCreated = thought.DateCreated;
                    await db.SaveChangesAsync();
                }
            }

            //

        }
    }

}
