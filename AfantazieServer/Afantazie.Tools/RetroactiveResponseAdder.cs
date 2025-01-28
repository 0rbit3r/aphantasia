using Afantazie.Core.Model.Results;
using Afantazie.Data.Model;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal class RetroactiveResponseAdder
    {
        public static async Task<Result> AddResponses()
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();

            DataContextProvider dataContextProvider = new DataContextProvider(configuration);

            AfantazieDataContext dataContext = dataContextProvider.GetDataContext();

            int FROM = 3;
            int TO = 50;

            for (int i = FROM; i <= TO; i++)
            {
                await dataContext.Thoughts
                    .Include(t => t.Links)
                    .LoadAsync();

                var thought = await dataContext.Thoughts.FirstOrDefaultAsync(t => t.Id == i);
                if (thought == null)
                {
                    continue;
                }

                var strBuilder = new StringBuilder(thought.Content);

                if (thought.Links.Count == 0)
                {
                    continue;
                }

                strBuilder.AppendLine();
                strBuilder.AppendLine();
                strBuilder.AppendLine("--Odkazy");
                foreach (var link in thought.Links)
                {
                    strBuilder.AppendLine($"[{link.TargetThought.Id}]({link.TargetThought.Title})");
                }

                thought.Content = strBuilder.ToString();

                dataContext.Thoughts.Update(thought);
                var result = dataContext.SaveChanges();
            }



            return Result.Success();
        }
    }
}
