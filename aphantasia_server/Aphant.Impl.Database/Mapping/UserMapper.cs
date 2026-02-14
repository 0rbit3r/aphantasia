// using Aphant.Impl.Database.Entity;

using System.Linq.Expressions;
using Aphant.Impl.Database.Entity;
using Aphant.Core.Dto;

namespace Aphant.Impl.Database.Mapping;

public static class UserMapper
{

    public static Expression<Func<UserEntity, User>> ToDtoFullExpr = (UserEntity entity) =>
        new User
        {
            Id = entity.Id,
            Username = entity.Username,
            Bio = entity.Bio,
            Color = entity.Color,
            DateJoined = entity.DateJoined.ToString("yyyy-MM-dd")
        };

    public static User ToDtoFull(this UserEntity entity)
    {
        return ToDtoFullExpr.Compile()(entity);
    }

    public static Expression<Func<UserEntity, UserColorName>> ToDtoUserNameExpr = (UserEntity entity) =>
        new UserColorName
        {
            Id = entity.Id,
            Color=entity.Color,
            Username=entity.Username
        };

    public static UserColorName ToDtoUserName(this UserEntity entity)
    {
        return ToDtoUserNameExpr.Compile()(entity);
    }
}

