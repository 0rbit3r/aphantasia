namespace Aphant.Core.Dto;

public class Epoch
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Color { get; set; }
     
    public required List<ThoughtTitle> Thoughts { get; set; }
}

public class EpochLight
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Color { get; set; }
}