using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity;

[PrimaryKey(nameof(ThoughtId), nameof(ConceptTag))]
public class ThoughtConceptEntity
{
    public Guid ThoughtId { get; set; }

    public ThoughtEntity Thought { get; set; } = null!;

    public string ConceptTag { get; set; } = null!;

    public ConceptEntity Concept { get; set; } = null!;
}

