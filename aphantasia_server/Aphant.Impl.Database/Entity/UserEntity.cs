using System.ComponentModel.DataAnnotations;

namespace Aphant.Impl.Database.Entity
{
    public class UserEntity
    {
        public Guid Id { get; set; }

        public string? Email { get; set; }

        public string Username { get; set; } = null!;

        public string PassHash { get; set; } = null!;

        public string PassSalt { get; set; } = null!;
        public string Color { get; set; } = null!;

        [MaxLength(300)]
        public string Bio { get; set; } = null!;
        public DateTime DateJoined { get; set; }

        public ICollection<NotificationEntity> Notifications { get; set; } = [];
        public ICollection<ThoughtEntity> Thoughts { get; set; } = [];
        public ICollection<BookmarkEntity> Bookmarks { get; set; } = [];
        public ICollection<ConceptEntity> FollowedConcepts { get; set; } = [];
        public ICollection<UserEntity> FollowedUsers { get; set; } = [];
        public ICollection<UserEntity> FollowerUsers { get; set; } = [];
    }
}
