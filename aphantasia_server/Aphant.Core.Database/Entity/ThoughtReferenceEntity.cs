using Microsoft.EntityFrameworkCore;

namespace Aphant.Core.Database.Entity;

[PrimaryKey(nameof(SourceId), nameof(TargetId))]
public class ThoughtReferenceEntity
{
    // The source thought - the one that replies
    public Guid SourceId { get; set; }
    public ThoughtEntity SourceThought { get; set; } = null!;

    // The target thought - the one that is replied to
    public Guid TargetId { get; set; }
    public ThoughtEntity TargetThought { get; set; } = null!;
}
