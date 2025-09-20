using System.Text.Json;
using System.Text.Json.Nodes;
using Afantazie.Data.Model;
using Microsoft.Extensions.DependencyInjection;

namespace Afantazie.Tools;

public static class PositionsExporter
{
    public static async Task ExportPositions(IServiceProvider service)
    {
        DataContextProvider _dbProvider = service.GetRequiredService<DataContextProvider>();
        using var db = _dbProvider.GetDataContext();

        var positions = db.Thoughts.Select(t => new ThoughtPositionBackup
        {
            Id = t.Id,
            X = t.PositionX,
            Y = t.PositionY
        });

        var json = JsonSerializer.Serialize(positions);
        var fileName = $"backup_{DateTime.Now:yyyyMMdd}.json";
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), fileName);

        await File.WriteAllTextAsync(filePath, json);
    }
}

internal class ThoughtPositionBackup
{
    public int Id { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
}