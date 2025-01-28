using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal static class CitHepObsidianImporter
    {
        public async static Task ImportCitHepFileToObsidianAsync(IServiceProvider services)
        {
            int nodes = 34546;
            int edges = 421578;
            string path = "C:/Users/kakos/Downloads/cit-HepPh.txt/Cit-HepPh.txt";
            string outputFolder = "C:/Users/kakos/Desktop/CitHepVault";


            Directory.CreateDirectory(outputFolder);

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
                    references[idToOurId[int.Parse(parts[0])]].Add(idToOurId[int.Parse(parts[1])]);

                    line = reader.ReadLine();
                }

                for (int i = 1; i <= nodes; i++)
                {
                    if (i % 100 == 0)
                    {
                        Console.WriteLine($"{i} / {nodes}");
                    }


                    StreamWriter writer = new StreamWriter($"{outputFolder}/{i}.md");
                    //write to a markdown file

                    for (int j = 0; j < (references[i]?.Count ?? 0); j++)
                    {
                        writer.WriteLine($"[[{references[i][j]}]]");
                    }
                    writer.Close();
                }

                Console.WriteLine("Done!");
                Console.ReadLine();
            }
        }
    }
}
