using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal class CitHepImporter
    {
        public async static Task ImportCitHepFileAsync(IServiceProvider services)
        {
            bool LIMIT_TO_5_CITATIONS = false;
            int NODES_LIMIT = 3000;

            // file size
            int nodes = 34546;
            int edges = 421578;

            string path = "C:/Users/kakos/Downloads/cit-HepPh.txt/Cit-HepPh.txt";

            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();
            var userRepo = services.GetRequiredService<IUserRepository>();
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            Dictionary<int, int> idToOurId = new Dictionary<int, int>();
            // holds OUR ids of thought references
            List<int>[] references = new List<int>[nodes + 1];

            var lastUsedOurId = 1;

            using (StreamReader reader = new StreamReader(path))
            {
                string? line = reader.ReadLine();
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
                    if (!idToOurId.ContainsKey(int.Parse(parts[0])))
                    {
                        idToOurId.Add(int.Parse(parts[0]), lastUsedOurId++);
                    }
                    if (!idToOurId.ContainsKey(int.Parse(parts[1])))
                    {
                        idToOurId.Add(int.Parse(parts[1]), lastUsedOurId++);
                    }

                    if (references[idToOurId[int.Parse(parts[0])]] == null)
                    {
                        references[idToOurId[int.Parse(parts[0])]] = new List<int>();
                    }
                    if (LIMIT_TO_5_CITATIONS && references[idToOurId[int.Parse(parts[0])]].Count >= 5)
                    {
                        line = reader.ReadLine();
                        continue;
                    }
                    references[idToOurId[int.Parse(parts[0])]].Add(idToOurId[int.Parse(parts[1])]);
                    
                    line = reader.ReadLine();
                }

                await RainbowUsersGenerator.GenerateUsersAsync(services, NODES_LIMIT + 1);

                foreach (var nodeReferences in references)
                {
                    if (nodeReferences is null)
                    {
                        continue;
                    }
                    var nodeLimitedReferences = nodeReferences
                        .Where(r => r < NODES_LIMIT)
                        .ToList();
                    nodeReferences.Clear();
                    nodeReferences.AddRange(nodeLimitedReferences);
                }

                for (int i = 1; i <= NODES_LIMIT; i++)
                {
                    if (i%100 == 0)
                    {
                        Console.WriteLine($"{i} / {nodes}");
                    }
                    await thoughtRepo.InsertThoughtAsync(
                        $"{i}th thought", $"{i}th thought", i, 0, references[i] ?? new List<int>());
                }

                Console.WriteLine("Done!");
                Console.ReadLine();
            }
        }
    }
}
