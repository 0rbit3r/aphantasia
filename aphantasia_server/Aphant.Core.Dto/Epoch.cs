namespace Aphant.Core.Dto;

public class Epoch
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Color { get; set; }

    public required List<ThoughtLight> Thoughts { get; set; }
}

public class EpochLight
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Color { get; set; }
}