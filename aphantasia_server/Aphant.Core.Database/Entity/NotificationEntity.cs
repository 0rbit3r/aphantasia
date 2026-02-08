using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Database.Entity
{
    public class NotificationEntity
    {
        [Key]
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public UserEntity User { get; set; } = null!;

        public Guid? ThoughtId { get; set; }

        public ThoughtEntity? Thought { get; set; } = null!;

        public string? Text { get; set; }

        public byte Type { get; set; }

        public bool IsRead { get; set; }

        public DateTime DateCreated { get; set; }
    }
}
