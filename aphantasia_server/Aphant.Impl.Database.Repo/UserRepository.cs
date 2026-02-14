using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database;
using Aphant.Impl.Database.Entity;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Database.Repo;

internal class UserRepository(
    AphantasiaDataContext db,
    ILogger<AphantasiaDataContext> log
    ) : IUserDataContract
{
    private readonly AphantasiaDataContext _db = db;
    private readonly ILogger<AphantasiaDataContext> _log = log;

    public async Task<Result<User>> GetUserById(Guid id)
    {
        var user = await _db.Users
        .Where(u => u.Id == id)
        .Select(UserMapper.ToDtoFullExpr)
        .FirstOrDefaultAsync();

        if (user is null) return Error.NotFound();
        return user;
    }

    public async Task<Result<User>> GetUserByUsernameOrEmail(string usernameOrEmail)
    {
        var user = usernameOrEmail.Contains('@')
            ? await _db.Users
                .Where(u => u.Email == usernameOrEmail.ToLower())
                .Select(UserMapper.ToDtoFullExpr)
                .FirstOrDefaultAsync()
            : await _db.Users
                .Where(u => u.Username == usernameOrEmail)
                .Select(UserMapper.ToDtoFullExpr)
                .FirstOrDefaultAsync();

        if (user is null) return Error.NotFound();
        return user;
    }


    public async Task<Result<string>> GetUserPassHash(Guid id)
    {
        var passHash = await _db.Users
            .Where(u => u.Id == id)
            .Select(u => u.PassHash)
            .FirstOrDefaultAsync();

        if (passHash is null) return Error.NotFound();
        return passHash;
    }

    public async Task<Result<Guid>> InsertUser(
        string username, string passHash, string bio,
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