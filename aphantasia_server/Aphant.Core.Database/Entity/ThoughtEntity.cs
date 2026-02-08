using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Core.Database.Entity;

[Index(nameof(EpochId))]
public class ThoughtEntity
{
    [Key]
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime DateCreated { get; set; }
    public Guid AuthorId { get; set; }
    public UserEntity Author { get; set; } = null!;
    public int SizeMultiplier { get; set; }
    public byte Shape { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    [MaxLength(3000)]
    public string Content { get; set; } = null!;
    public int? EpochId { get; set; }
    public EpochEntity? Epoch { get; set; }
    // Outgoing links (links from this Thought to others)
    public ICollection<ThoughtReferenceEntity> Links { get; set; } = [];
    // Incoming links (links from others to this Thought)
    public ICollection<ThoughtReferenceEntity> Backlinks { get; set; } = [];
    public ICollection<ConceptEntity> Concepts { get; set; } = [];
    public ICollection<BookmarkEntity> Bookmarks { get; set; } = [];
}