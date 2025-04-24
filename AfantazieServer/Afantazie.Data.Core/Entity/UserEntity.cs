using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class UserEntity : IEntity
    {
        public int Id { get; set; }

        public required string Email { get; set; }

        public required string Username { get; set; }
        
        public required string Password { get; set; }

        public required string Color { get; set; }

        [MaxLength(300)]
        public string Bio { get; set; } = "";

        public ICollection<NotificationEntity> Notifications { get; set; }
            = new List<NotificationEntity>();
    }
}
