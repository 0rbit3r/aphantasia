using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Entity
{
    [PrimaryKey(nameof(FollowedId), nameof(FollowerId))]
    public class UserFollowEntity
    {
        public Guid FollowerId { get; set; }

        public UserEntity Follower { get; set; } = null!;

        public Guid FollowedId { get; set; }

        public UserEntity Followed { get; set; } = null!;
    }
}
