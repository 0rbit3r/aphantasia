using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal class RainbowTreeGenerator
    {
        public static async Task GenerateData(IServiceProvider services)
        {
            var usersRepo = services.GetRequiredService<IUserRepository>();
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();

            Console.Write("Enter number of thoughts: ");

            if (!int.TryParse(Console.ReadLine(), out var thoughtsNum))
            {
                Console.WriteLine("Invalid number. Exiting");
                return;
            }

            await RainbowUsersGenerator.GenerateUsersAsync(services, thoughtsNum);

            Console.WriteLine("Generating thoughts...");

            for (int i = 1; i < thoughtsNum + 1; i++)
            {
                var userId = i;
                var refNum = i < 2 ? 0 : 1;
                var references = new List<int>();
                for (int j = 0; j < refNum; j++)
                {
                    references.Add(new Random().Next(1, i));
                }
                await thoughtRepo.InsertThoughtAsync(i.ToString(), i.ToString(), userId, references);
            }

            Console.WriteLine("Done.");
        }
    }
}
