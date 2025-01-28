using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Services.Interface.Chat;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Chat.Services
{
    internal class ChatService : IChatService
    {
        // Thread-safe collection to store messages.
        private readonly ConcurrentBag<ChatMessage> Messages = new();

        public Result AddMessage(ChatMessage message)
        {
            Messages.Add(message);

            return Result.Success();
        }

        public IList<ChatMessage> GetMessages()
        {
            var orderedMessages = Messages.OrderBy(x => x.SentAt).ToList();
            return orderedMessages;
        }
    }
}
