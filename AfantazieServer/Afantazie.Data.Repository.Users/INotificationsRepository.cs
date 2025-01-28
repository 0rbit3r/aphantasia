using Afantazie.Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface INotificationsRepository
    {
        Task<List<Thought>> GetNotificationsForUser(int userId);
    }
}
