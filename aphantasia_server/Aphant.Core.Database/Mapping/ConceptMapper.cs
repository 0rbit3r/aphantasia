// using Aphant.Core.Database.Entity;

using System.Linq.Expressions;
using Aphant.Core.Database.Entity;
using Aphant.Core.Dto;

namespace Aphant.Core.Database.Mapping;

public static class ConceptMapper
{
    public static Expression<Func<ConceptEntity, Concept>> ToDtoFullExpr = (ConceptEntity entity) =>
        new Concept
        {
            Tag = entity.Tag,
            Color = entity.Color,
            FollowersCount = entity.Followers.Count,
            ThoughtsCount = entity.Thoughts.Count
        };

    public static Concept ToDtoFull(this ConceptEntity entity)
    {
        return ToDtoFullExpr.Compile()(entity);
    }

    public static Expression<Func<ConceptEntity, ConceptLight>> ToDtoLightExpr = (ConceptEntity entity) =>
        new ConceptLight
        {
            Color = entity.Color,
            Tag = entity.Tag
        };

    public static ConceptLight ToDtoLight(this ConceptEntity entity)
    {
        return ToDtoLightExpr.Compile()(entity);
    }
}

