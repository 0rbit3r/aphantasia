// using Aphant.Core.Database.Entity;

using System.Linq.Expressions;
using Aphant.Core.Database.Entity;
using Aphant.Core.Dto;

namespace Aphant.Core.Database.Mapping;

public static class ThoughtMapper
{

    public static Expression<Func<ThoughtEntity, Thought>> ToDtoFullExpr = (ThoughtEntity entity) =>
        new Thought
        {
            Id = entity.Id,
            Title = entity.Title,
            Date = entity.DateCreated.ToString("yyyy-MM-dd"),
            Size = entity.SizeMultiplier,
            Shape = (ThoughtShape)entity.Shape,
            Content = entity.Content,
            BookmarkedCount = entity.Bookmarks.Count,
            Author =            //todo - add expr from UserMapper
                                new UserLight { Id = entity.AuthorId, Color = entity.Author.Color, Username = entity.Author.Username },
            Concepts = entity.Concepts.AsQueryable().Select(ConceptMapper.ToDtoLightExpr).ToList()
        };

    public static Thought ToDtoFull(this ThoughtEntity entity)
    {
        return ToDtoFullExpr.Compile()(entity);
    }

    public static Expression<Func<ThoughtEntity, ThoughtLight>> ThoughtToDtoLight = (ThoughtEntity entity) =>
        new ThoughtLight
        {
            Id = entity.Id,
            Title = entity.Title,
            Size = entity.SizeMultiplier,
            Shape = (ThoughtShape)entity.Shape,
            Author = new UserLight { Id = entity.AuthorId, Color = entity.Author.Color, Username = entity.Author.Username }
        };

    public static ThoughtLight ToDtoLight(this ThoughtEntity entity)
    {
        return ThoughtToDtoLight.Compile()(entity);
    }
}

