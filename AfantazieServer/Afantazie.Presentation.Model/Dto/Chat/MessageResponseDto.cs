using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Chat
{
    public class MessageResponseDto
    {
        public required string Message { get; set; }

        public required string Sender { get; set; }

        public required string Color { get; set; }

        public bool IsSystem { get; set; } = false;
    }
}
