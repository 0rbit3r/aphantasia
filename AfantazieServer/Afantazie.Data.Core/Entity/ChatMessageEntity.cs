using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Afantazie.Core.Model;

namespace Afantazie.Data.Model.Entity
{
    public class ChatMessageEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Color { get; set; } = "#e0e0e0";

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        // public int? UserId { get; set; } //This might be used in the future to allow clicking-thrugh to user profile
        [Required]
        public string Author { get; set; } = "";
        [Required]
        public string Content { get; set; } = "";
        
        public int? RepliesTo { get; set; }
    }
}
