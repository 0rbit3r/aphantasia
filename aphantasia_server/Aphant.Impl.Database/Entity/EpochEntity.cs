using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity;

[PrimaryKey(nameof(Id))]
public class EpochEntity
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Name { get; set; }
    public ICollection<ThoughtEntity> Thoughts { get; set; } = [];

    public int? PreviousEpochId { get; set; }
    public EpochEntity? PreviousEpoch { get; set; }
    public int? NextEpochId { get; set; }
    public EpochEntity? NextEpoch { get; set; }
}

