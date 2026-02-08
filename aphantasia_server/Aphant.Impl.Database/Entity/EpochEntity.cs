using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity;

[PrimaryKey(nameof(Id))]
public class EpochEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public ICollection<ThoughtEntity> Thoughts { get; set; } = [];
}

