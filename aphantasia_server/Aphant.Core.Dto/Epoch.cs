namespace Aphant.Core.Dto;

public static class EpochPseudoId
{
    public const int LatestContext = -2;
    public const int Epochless = -1;
}

public class Epoch
{
    /// <summary>
    /// Id can be:
    /// a) positive int - id of an existing epoch;
    /// b) -1 - epochless thoughts pseudoepoch;
    /// c) -2 - latest context pseudoepoch (epochless thoughts prepended by latest epoch to reach the epoch size);
    /// </summary>
    public int Id { get; set; }
    public required string StartDate { get; set; }
    public required string EndDate { get; set; }
    public string? Name { get; set; }
    public required List<ThoughtNode> Thoughts { get; set; }
    public int? NextEpochId { get; set; }
    public int? PreviousEpochId { get; set; }
}

public class EpochLight
{
    public int Id { get; set; }

    public string? Name { get; set; }
}