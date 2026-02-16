namespace Aphant.Core.Dto;

public class Epoch
{
    public int Id { get; set; }

    public required string StartDate { get; set; }
    public required string EndDate { get; set; }
    public string? Name { get; set; }


    public required List<ThoughtNode> Thoughts { get; set; }
}

public class EpochLight
{
    public int Id { get; set; }

    public string? Name { get; set; }
}