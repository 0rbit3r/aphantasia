namespace Aphant.Core.Dto;

// Full thought will all information available
public class Thought
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required UserLight Author { get; set; }
    public required string Content { get; set; }
    public required string Date { get; set; }
    public int Size { get; set; }
    public ThoughtShape Shape { get; set; }
    public ICollection<ThoughtLight> Links { get; set; } = new List<ThoughtLight>();
    public ICollection<ThoughtLight> Replies { get; set; } = new List<ThoughtLight>();
    public ICollection<ConceptLight> Concepts { get; set; } = new List<ConceptLight>();

}

// Lighter thought dto for replies, links, scollers etc.
public class ThoughtLight
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public ThoughtShape Shape { get; set; }
    public int Size { get; set; }
    public required UserLight Author { get; set; }
}

// Used for nodes in the graph
public class ThoughtNode
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public ThoughtShape Shape { get; set; }
    public int Size { get; set; }
    public string Color { get; set; } = "#ffffff";
    public double x { get; set; }
    public double y { get; set; }

}
