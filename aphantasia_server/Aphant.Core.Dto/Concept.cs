namespace Aphant.Core.Dto;

public class ConceptLight
{
    public required string Tag { get; set; }

    public required string Color { get; set; }
}

public class Concept
{
    public required string Tag { get; set; }

    public required string Color { get; set; }

    public int FollowersCount { get; set; }

    public List<ThoughtNode> Thoughts { get; set; } = [];
}

public class ConceptGraphNode
{
    public required string Tag { get; set; }
    public required string Color { get; set; }
    public int ThoughtCount { get; set; }
}

public class ConceptGraph
{
    public List<ConceptGraphNode> Nodes { get; set; } = [];
}