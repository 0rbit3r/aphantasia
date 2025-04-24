using Afantazie.Core.Model.Results;
using Afantazie.Data.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal static class LinkFormatUpdater
    {
        public static async Task<Result> UpdateLinkFormat()
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();

            DataContextProvider dataContextProvider = new DataContextProvider(configuration);

            AfantazieDataContext dataContext = dataContextProvider.GetDataContext();

            int FROM = 1;
            int TO = 713;

            for (int i = FROM; i <= TO; i++)
            {
                if (i % 100 == 0)
                {
                    Console.WriteLine($"Processing {i}");
                }
                await dataContext.Thoughts
                    .Include(t => t.Links)
                    .LoadAsync();

                var thought = await dataContext.Thoughts.FirstOrDefaultAsync(t => t.Id == i);
                if (thought == null)
                {
                    continue;
                }

                string pattern = @"\[(\d+)\]\((.*?)\)";
                string ReplaceResult = Regex.Replace(thought.Content, pattern, "[$1][$2]");

                thought.Content = ReplaceResult;

                dataContext.Thoughts.Update(thought);
                var result = dataContext.SaveChanges();
            }
            Console.WriteLine("Done");
            return Result.Success();
        }
    }
}
