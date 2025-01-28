using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Services.Interface.Chat
{
    public interface IChatService
    {
        IList<ChatMessage> GetMessages();

        Result AddMessage(ChatMessage message);
    }
}
