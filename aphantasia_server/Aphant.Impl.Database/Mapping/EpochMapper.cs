using System.Linq.Expressions;
using Aphant.Core.Dto;
using Aphant.Impl.Database.Entity;

namespace Aphant.Impl.Database.Mapping;

public static class EpochMapper
{
    public static Expression<Func<EpochEntity, Epoch>> ToDtoFullExpr = (EpochEntity entity) =>
        new Epoch
        {
            Id = entity.Id,
            EndDate = entity.EndDate.ToString(),
            StartDate = entity.StartDate.ToString(),
            Thoughts = entity.Thoughts.AsQueryable().Select(ThoughtMapper.ToDtoNodeExpr).ToList()  
        };

    public static Epoch ToDtoFull(this EpochEntity entity)
    {
        return ToDtoFullExpr.Compile()(entity);
    }
}
