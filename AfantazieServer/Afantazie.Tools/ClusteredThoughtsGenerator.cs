using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal static class ClusteredThoughtsGenerator
    {
        public static async Task GenerateData(IServiceProvider services)
        {
            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();

            Console.WriteLine("Enter number of users: ");
            if (!int.TryParse(Console.ReadLine(), out var usersNum))
            {
                Console.WriteLine("Invalid number. Exiting");
                return;
            }

            Console.WriteLine("Enter number of clusters (topics): ");
            if (!int.TryParse(Console.ReadLine(), out var clustersNum))
            {
                Console.WriteLine("Invalid number. Exiting");
                return;
            }

            Console.WriteLine("Enter probability of a thought refering to different cluster ( n / 100): ");
            if (!int.TryParse(Console.ReadLine(), out var interClusterProb))
            {
                Console.WriteLine("Invalid number. Exiting");
                return;
            }

            Console.Write("Enter number of thoughts: ");
            if (!int.TryParse(Console.ReadLine(), out var thoughtsNum))
            {
                Console.WriteLine("Invalid number. Exiting");
                return;
            }

            await RandomUsersGenerator.GenerateUsersAsync(services, usersNum);

            Console.WriteLine("Generating thoughts...");

            var clusters = new List<List<int>>();
            for (int i = 0; i < clustersNum; i++)
            {
                clusters.Add(new List<int>());
            }


            for (int i = 1; i < thoughtsNum + 1; i++)
            {
                var userId = new Random().Next(1, usersNum + 1);
                var refNum = i < 5 ? 0 : 5;

                var chosenClusterIndex = new Random().Next(0, clustersNum);
                var references = new List<int>();

                if (clusters[chosenClusterIndex].Count > 4)
                {
                    for (int referenceIndex = 0; referenceIndex < refNum; referenceIndex++)
                    {
                        var chooseDifferentCluster = new Random().Next(0, 100) < interClusterProb;
                        if (chooseDifferentCluster)
                        {
                            var newChosenCluster = new Random().Next(0, clustersNum);
                            var chosenThoughtIndex = new Random().Next(
                                Math.Max(0, clusters[newChosenCluster].Count - 20), //dont go too far in history
                                clusters[newChosenCluster].Count
                                );
                            var chosenThoughtId = clusters[newChosenCluster][chosenThoughtIndex];
                            if (!references.Contains(chosenThoughtId))
                            {
                                references.Add(chosenThoughtId);
                            }
                        }
                        else
                        {
                            var chosenThoughtIndex = new Random().Next(
                                Math.Max(0, clusters[chosenClusterIndex].Count - 20), //dont go too far in history
                                clusters[chosenClusterIndex].Count
                                );
                            if (clusters[chosenClusterIndex].Count > 0)
                            {
                                var chosenThoughtId = clusters[chosenClusterIndex][chosenThoughtIndex];
                                if (!references.Contains(chosenThoughtId))
                                {
                                    references.Add(chosenThoughtId);
                                } 
                            }
                        }
                    }
                }

                clusters[chosenClusterIndex].Add(i);

                await thoughtRepo.InsertThoughtAsync(i.ToString(), i.ToString(), userId, 0, references);
            }

            Console.WriteLine("Done.");
        }
    }
}
