using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Aphant.Impl.Database.Entity;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Database;

internal partial class DbRepository : IDataService
{
    public async Task<Result<Guid>> InsertUser(
        string username, string passHash, string passSalt, string bio,
        DateTime? dateCreated = null, string? email = null, string? color = null)
    {
        try
        {
            if (_db.Users.Any(u => u.Username == username))
                return Error.BadRequest("This username is taken.");
            if (email is not null && _db.Users.Any(u => u.Email == email))
                return Error.BadRequest("This email is taken. Do you already have an account?");

            var entity = new UserEntity
            {
                Id = Guid.CreateVersion7(),
                Username = username,
                PassHash = passHash,
                PassSalt = passSalt,
                Bio = bio,
                Color = color ?? "#e0e0e0",
                Email = email,
                DateJoined = dateCreated ?? DateTime.UtcNow
            };
            _db.Users.Add(entity);
            _db.SaveChanges();
            return Result.Success(entity.Id);
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to insert user to database.");
            return Error.General("Server error");
        }
    }
}