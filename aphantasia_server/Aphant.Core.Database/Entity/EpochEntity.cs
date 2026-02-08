using Microsoft.EntityFrameworkCore;

namespace Aphant.Core.Database.Entity;

[PrimaryKey(nameof(Id))]
public class EpochEntity
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Name { get; set; }
    public ICollection<ThoughtEntity> Thoughts { get; set; } = [];
}

