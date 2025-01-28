using Afantazie.Core.Model.Results;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    // Calculates sizes of the thoughts based on the number of their backlinks.
    internal class RetroactiveSizeCalculator
    {
        public static async Task<Result> CalculateSizeMultipliers()
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();

            DataContextProvider dataContextProvider = new DataContextProvider(configuration);

            AfantazieDataContext dataContext = dataContextProvider.GetDataContext();

            var allThoughtEntities = await dataContext.Thoughts
                .Include(t => t.Backlinks).Include(t => t.Author).ToListAsync();

            for (int i = 0; i < allThoughtEntities.Count; i++)
            {
                var thought = allThoughtEntities[i];
                var sizeMultiplier = 0;

                var encounteredAuthors = new List<int> {};

                foreach (var link in thought.Backlinks)
                {
                    var replyingThought = allThoughtEntities.FirstOrDefault(t => t.Id == link.SourceId);
                    if (replyingThought == null)
                    {
                        Console.WriteLine($"Reply author not found for link {link.Id}");
                        continue;
                    }
                    if (replyingThought.Author.Id != thought.Author.Id
                        && !encounteredAuthors.Any(encountered => encountered == replyingThought.Author.Id))
                    {
                        encounteredAuthors.Add(replyingThought.Author.Id);
                        sizeMultiplier++;
                    }
                }

                Console.WriteLine($"{sizeMultiplier}: {thought.Title}");
                thought.SizeMultiplier = sizeMultiplier;
            }
            Console.WriteLine("Save changes?");
            Console.ReadLine();
            if (allThoughtEntities.Count > 0)
            {
                dataContext.Thoughts.UpdateRange(allThoughtEntities);
                await dataContext.SaveChangesAsync();
            }

            return Result.Success();
        }
    }
}
