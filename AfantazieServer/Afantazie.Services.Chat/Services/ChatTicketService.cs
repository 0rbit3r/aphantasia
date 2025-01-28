using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Services.Interface.Chat;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Chat.Services
{
    internal class ChatTicketService : IChatTicketService
    {
        ConcurrentBag<ChatTicket> tickets = new ConcurrentBag<ChatTicket>();

        public Result<int> CreateChatTicket(int userId)
        {
            var ticket = Random.Shared.Next();
            tickets.Add(new ChatTicket
            {
                Ticket = ticket,
                UserId = userId,
                CreatedAt = DateTime.Now
            });

            return ticket;
        }

        public Result<int> ClaimTicket(int ticket)
        {
            if (!tickets.Any(t => t.Ticket == ticket))
            {
                return Error.Auth();
            }

            var userId = tickets.First(t => t.Ticket == ticket).UserId;

            tickets = new ConcurrentBag<ChatTicket>(
                tickets
                    .Where(t => t.Ticket != ticket)
                    .Where(t => DateTime.Now - t.CreatedAt > TimeSpan.FromMinutes(2)));

            return userId;
        }
    }

    internal class ChatTicket
    {
        public required int Ticket { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
