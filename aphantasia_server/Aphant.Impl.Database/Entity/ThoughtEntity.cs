using System.ComponentModel.DataAnnotations;
using Aphant.Core.Dto;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity;

[Index(nameof(EpochId))]
public class ThoughtEntity
{
    [Key]
    public Guid Id { get; set; }
    [MaxLength(50)]
    public required string Title { get; set; } = null!;
    [MaxLength(7)]
    public required string Color { get; set; } = null!;
    public required DateTime DateCreated { get; set; }
    public Guid AuthorId { get; set; }
    public UserEntity Author { get; set; } = null!;
    public int SizeMultiplier { get; set; }
    public ThoughtShape Shape { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    [MaxLength(3000)]
    public required string Content { get; set; } = null!;
    public int? EpochId { get; set; }
    public EpochEntity? Epoch { get; set; }
    // Outgoing links (links from this Thought to others)
    public ICollection<ThoughtReferenceEntity> Links { get; set; } = [];
    // Incoming links (links from others to this Thought)
    public ICollection<ThoughtReferenceEntity> Backlinks { get; set; } = [];
    public ICollection<ConceptEntity> Concepts { get; set; } = [];
    public ICollection<BookmarkEntity> Bookmarks { get; set; } = [];
}