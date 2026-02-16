using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Dto;

// Full thought will all information available
public class Thought
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Color { get; set; }
    public required UserColorName Author { get; set; }
    public required string Content { get; set; }
    public required string Date { get; set; }
    public int? EpochId { get; set; }
    public int Size { get; set; }
    public int BookmarkedCount { get; set; }
    public ThoughtShape Shape { get; set; }
    public ICollection<ThoughtTitle> Links { get; set; } = new List<ThoughtTitle>();
    public ICollection<ThoughtTitle> Replies { get; set; } = new List<ThoughtTitle>();
    public ICollection<ConceptLight> Concepts { get; set; } = new List<ConceptLight>();
}

// Lighter version that doesn't require joins in DB
public class ThoughtLight
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Color { get; set; }
    public Guid AuthorId { get; set; }
    public required string Date { get; set; }
    public int? EpochId { get; set; }
    public int Size { get; set; }
    public ThoughtShape Shape { get; set; }
}



// Lightest thought dto for replies, links, scollers etc.  - only key identyfying information
public class ThoughtTitle
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Color { get; set; }
    public ThoughtShape Shape { get; set; }
}

// Used for nodes in the graph
public class ThoughtNode
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public ThoughtShape Shape { get; set; }
    public int Size { get; set; }
    public string Color { get; set; } = "#ffffff";
    public double X { get; set; }
    public double Y { get; set; }
    public ICollection<string> Links { get; set; } = new List<string>();
    public ICollection<string> Replies { get; set; } = new List<string>();
}


// todo:

// on fe, map links to grafika (might be ready for list of strings?)
// register form
// fail messages banner ?
// welcome screen
// tutorial
// etc.
