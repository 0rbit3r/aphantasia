using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class UserFollowEntity
    {

        public int Id { get; set; }

        public int FollowerId { get; set; }

        [Required]
        public UserEntity Follower { get; set; } = null!;

        public int FollowedId { get; set; }

        [Required]
        public UserEntity Followed { get; set; } = null!;
    }
}
