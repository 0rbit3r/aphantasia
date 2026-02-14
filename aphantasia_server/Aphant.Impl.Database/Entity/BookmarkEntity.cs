using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity;

[PrimaryKey(nameof(ThoughtId), nameof(UserId))]
public class BookmarkEntity
{
    public Guid ThoughtId { get; set; }
    public ThoughtEntity Thought { get; set; } = null!;

    public Guid UserId { get; set; }
    public UserEntity User { get; set; } = null!;
}

