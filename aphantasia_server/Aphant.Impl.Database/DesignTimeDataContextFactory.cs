using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Aphant.Impl.Database
{
    internal class DesignTimeDataContextFactory : IDesignTimeDbContextFactory<AphantasiaDataContext>
    {
        public AphantasiaDataContext CreateDbContext(string[] args)
        {
            Console.WriteLine($"DesignTImeDataContext props: {string.Join(", ", args)}");

            var config = new ConfigurationBuilder()
                .AddJsonFile("migrationsettings.json")
                .Build();

            var checkConnString =Regex.Replace(config.GetConnectionString("DefaultConnection")!, @"Password=.*","");
            Console.WriteLine(checkConnString);
            Console.WriteLine("Continue? y|n");
            if (Console.ReadLine() != "y")
            {
                Console.WriteLine("Exiting");
                Environment.Exit(0);
            }

            var optionsBuilder = new DbContextOptionsBuilder<AphantasiaDataContext>()
                .UseNpgsql(config.GetConnectionString("DefaultConnection"));

            return new AphantasiaDataContext(optionsBuilder.Options);
        }
    }
}
