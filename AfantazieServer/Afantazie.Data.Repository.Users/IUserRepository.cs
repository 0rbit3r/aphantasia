using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface IUserRepository
    {
        Task<Result> AssignColor(int userId, string color);
        Task<Result<string>> GetColor(int userId);
        Task<Result<User>> GetUserByIdAsync(int id);

        Task<Result<User>> GetUserByUsernameAsync(string username);

        Task<Result<string>> GetBio(int userId);
        Task<Result> UpdateBio(int userId, string bio);
    }
}
