using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace Afantazie.Core.Model
{
    public class ChatMessage
    {
        public required string Message { get; set; }

        public required string Sender { get; set; }

        public required string Color { get; set; }

        public DateTime SentAt { get; set; }
    }
}
