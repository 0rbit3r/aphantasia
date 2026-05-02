using System.ComponentModel.DataAnnotations;

namespace Aphant.Impl.Database.Entity;

public class ChatMessageEntity
{
    [Key]
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public UserEntity Author { get; set; } = null!;
    [MaxLength(500)]
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public Guid? ParentId { get; set; }
    public ChatMessageEntity? Parent { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
}
