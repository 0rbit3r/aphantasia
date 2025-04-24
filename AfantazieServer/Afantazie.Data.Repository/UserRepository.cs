using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    public class UserRepository (
        DataContextProvider _contextProvider
        ) : IUserRepository
    {
        public async Task<Result> AssignColor(int userId, string color)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return Error.NotFound();
                }

                if (user.Color == color)
                {
                    return Result.Success();
                }

                user.Color = color;

                var rowsAffected = context.SaveChanges();

                return rowsAffected > 0
                    ? Result.Success()
                    : Error.General(500, "Failed to save database changes.");
            }
        }

        public async Task<Result<string>> GetBio(int userId)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return Error.NotFound();
                }
                return user.Bio;
            }
        }

        public async Task<Result<string>> GetColor(int userId)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return Error.NotFound();
                }

                return user.Color;
            }
        }

        public async Task<Result<User>> GetUserByIdAsync(int id)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == id);
                if (user == null)
                {
                    return Error.NotFound();
                }

                return user.Adapt<User>();
            }
        }

        public async Task<Result<User>> GetUserByUsernameAsync(string username)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Username == username);
                if (user == null)
                {
                    return Error.NotFound();
                }

                return user.Adapt<User>();
            }
        }

        public async Task<Result> UpdateBio(int userId, string bio)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return Error.NotFound();
                }

                if (user.Bio == bio)
                {
                    return Result.Success();
                }

                user.Bio = bio;

                var rowsAffected = context.SaveChanges();

                return rowsAffected > 0
                    ? Result.Success()
                    : Error.General(500, "Failed to save user bio in database.");
            }
        }
    }
}
