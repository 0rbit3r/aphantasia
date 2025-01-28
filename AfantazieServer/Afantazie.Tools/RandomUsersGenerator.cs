using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    internal static class RandomUsersGenerator
    {
        public static async Task GenerateUsersAsync(IServiceProvider services, int count)
        {
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            var usersRepo = services.GetRequiredService<IUserRepository>();

            Console.WriteLine("Generating users...");

            for (int i = 0; i < count; i++)
            {
                await authRepo.RegisterUserAsync($"test_{i}@te.st", $"Test_user_{i}", "Password");
            }

            Console.WriteLine("Assigning random colors");

            for (int i = 0; i < count; i++)
            {
                var red = new Random().Next(100, 256);
                var green = new Random().Next(100, 256);
                var blue = new Random().Next(100, 256);
                var color = $"#{red:X2}{green:X2}{blue:X2}";
                await usersRepo.AssignColor(i + 1, color);
            }
        }
    }
}
