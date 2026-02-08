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

    public int ThoughtsCount { get; set; }
}