using System.Text.Json;
using Afantazie.Core.Model;
using Afantazie.Data.Model;
using Microsoft.Extensions.DependencyInjection;

namespace Afantazie.Tools;

internal class PositionsImporter
{
    public static async Task ImportPositions(IServiceProvider service)
    {
        Console.WriteLine("Enter file to import: ");
        var path = Console.ReadLine();
        var pathIsCorrect = false;
        var text = "";
        while (!pathIsCorrect)
        {
            try
            {
                Console.WriteLine(path);
                text = File.ReadAllText(path!);
                pathIsCorrect = true;
            }
            catch { Console.WriteLine("Wrong input. Try again."); }
        }

        List<ThoughtPositionBackup> positions = JsonSerializer.Deserialize<List<ThoughtPositionBackup>>(text)
        ?? [];

        DataContextProvider _dbProvider = service.GetRequiredService<DataContextProvider>();
        using var db = _dbProvider.GetDataContext();

        foreach (var t in db.Thoughts)
        {
            var matchingPosInFile = positions.SingleOrDefault(p => p.Id == t.Id);
            if (matchingPosInFile is null) continue;
            Console.WriteLine($"Matched thought {t.Id} - X: {matchingPosInFile.X} Y: {matchingPosInFile.Y}");
            t.PositionX = matchingPosInFile.X;
            t.PositionY = matchingPosInFile.Y;
        }

        Console.WriteLine("Press y to save changes");
        var input = Console.ReadLine();

        if (input != "y") return;

        await db.SaveChangesAsync();
    }
}