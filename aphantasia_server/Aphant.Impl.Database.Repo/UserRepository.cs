using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database;
using Aphant.Impl.Database.Entity;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Repo;

internal class UserRepository(AphantasiaDataContext db) : IUserDataContract
{
    private readonly AphantasiaDataContext _db = db;

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
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success(entity.Id);
    }

    //todo - test coverage
    public async Task<Result<UserSettings>> GetSettings(Guid id)
    {
        var entity = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (entity is null)
            return Error.BadRequest("Non-existent user");
        return Result.Success(new UserSettings
        {
            Bio = entity.Bio,
            Color = entity.Color
        });
    }
    public async Task<Result> UpdateSettings(UserSettings newSettings)
    {
        var entity = await _db.Users.FirstOrDefaultAsync(u => u.Id == newSettings.UserId);
        if (entity is null)
            return Error.BadRequest("Non-existent user");

        entity.Color = newSettings.Color;
        entity.Bio = newSettings.Bio;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success(entity.Id);
    }

    public async Task<Result> ChangeThoughtColorsOfUser(Guid userId, string newColor)
    {
        var user = await _db.Users
            .Include(u => u.Thoughts)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return Error.BadRequest("Non-existent user");

        foreach (var thought in user.Thoughts)
            thought.Color = newColor;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success(user.Id);
    }
}