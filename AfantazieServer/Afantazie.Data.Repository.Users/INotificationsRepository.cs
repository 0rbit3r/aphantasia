using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface INotificationsRepository
    {
        Task<Result<List<Thought>>> GetNotificationsForUser(int userId, int amount);
    }
}
