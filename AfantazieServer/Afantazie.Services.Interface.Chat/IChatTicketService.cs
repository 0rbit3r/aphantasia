using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Services.Interface.Chat
{
    public interface IChatTicketService
    {
        /// <summary>
        /// Creates a ticket for authenticating user in chat websocket.
        /// </summary>
        /// <returns>
        /// Generated ticket.
        /// </returns>
        Result<int> CreateChatTicket(int userId);

        /// <summary>
        /// Validates the ticket and returns the user id.
        /// </summary>
        Result<int> ClaimTicket(int ticket);
    }
}
