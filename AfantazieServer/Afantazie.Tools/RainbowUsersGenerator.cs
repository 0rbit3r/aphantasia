using Afantazie.Data.Interface.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    public static class RainbowUsersGenerator
    {
        public static async Task GenerateUsersAsync(IServiceProvider services, int count)
        {
            var authRepo = services.GetRequiredService<IUserAuthRepository>();
            var usersRepo = services.GetRequiredService<IUserRepository>();

            Console.WriteLine("Generating users...");
            Console.WriteLine("   Registering...");

            for (int i = 0; i < count; i++)
            {
                await authRepo.RegisterUserAsync($"test_{i}@te.st", $"Test_user_{i}", "Password");
            }

            var minimumColorChanel = 100;
            Console.WriteLine("   Assigning color...");
            for (int i = 0; i < count; i++)
            {
                if (i % 100 == 0)
                {
                    Console.WriteLine($"   {i} / {count}");
                }

                int red, green, blue;
                if (i < count / 3)
                {
                    red = ((-155 * 3 * i) / count) + 255;
                    green = ((155 * 3 * i) / count) + 100;
                    blue = 100;
                }
                else if (i >= count / 3 && i < count / 3 * 2)
                {
                    red = 100;
                    green = ((-155 * 3 * i) / count) + 409;
                    blue = ((155 * 3 * i) / count) - 55;
                }
                else
                {
                    red = ((155 * 3 * i) / count) - 210;
                    green = 100;
                    blue = ((-155 * 3 * i) / count) + 564;
                }
                var color = $"#{red:X2}{green:X2}{blue:X2}";
                await usersRepo.AssignColor(i + 1, color);
            }
        }
    }
}
