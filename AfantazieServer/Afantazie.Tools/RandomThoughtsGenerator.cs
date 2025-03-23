using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal static class RandomThoughtsGenerator
    {
        public static async Task GenerateData(IServiceProvider services)
        {
            var usersRepo = services.GetRequiredService<IUserRepository>();
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            var thoughtRepo = services.GetRequiredService<IThoughtRepository>();

            Console.Write("Enter number of users: ");

            if (!int.TryParse(Console.ReadLine(), out var usersNum))
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

            for(int i = 0; i < thoughtsNum; i++)
            {
                var userId = new Random().Next(1, usersNum + 1);
                var refNum = i < 2 ? 0 : new Random().Next(1, 2);
                var references = new List<int>();
                for (int j = 0; j < refNum; j++)
                {
                    references.Add(new Random().Next(1, i));
                }
                await thoughtRepo.InsertThoughtAsync(i.ToString(), i.ToString(), userId, 0, references);
            }

            Console.WriteLine("Done.");
        }
    }
}
