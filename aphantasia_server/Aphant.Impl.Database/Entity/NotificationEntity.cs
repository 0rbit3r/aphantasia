using System.ComponentModel.DataAnnotations;
using Aphant.Core.Dto;

namespace Aphant.Impl.Database.Entity
{
    public class NotificationEntity
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public UserEntity User { get; set; } = null!;
        public Guid? ThoughtId { get; set; }
        public ThoughtEntity? Thought { get; set; }
        public string? Text { get; set; }
        public bool IsRead { get; set; }
        public Guid? FromUserId { get; set; }
        public UserEntity? FromUser { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
