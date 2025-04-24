using Afantazie.Core.Model;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public byte Type { get; set; } = (byte)NotificationType.Reply;

        public string Color { get; set; } = "";

        public string DateCreated { get; set; } = "";

        public int? ThoughtId { get; set; } = null;

        public string? ThoughtTitle { get; set; } = "";

        public string? ThoughtAuthor { get; set; } = "";

        public bool isRead { get; set; } = false;
    }
}
