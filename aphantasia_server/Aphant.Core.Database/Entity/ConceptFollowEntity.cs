using Microsoft.EntityFrameworkCore;

namespace Aphant.Core.Database.Entity;

[PrimaryKey(nameof(UserId), nameof(ConceptTag))]
public class ConceptFollowEntity
{
    public Guid UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public string ConceptTag { get; set; } = null!;
    public ConceptEntity Concept { get; set; } = null!;

    public int MinimumReplies { get; set; }
}

