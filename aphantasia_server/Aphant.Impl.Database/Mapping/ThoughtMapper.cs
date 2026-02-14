using System.Linq.Expressions;
using Aphant.Core.Dto;
using Aphant.Impl.Database.Entity;

namespace Aphant.Impl.Database.Mapping;

public static class ThoughtMapper
{

    public static Expression<Func<ThoughtEntity, Thought>> ToDtoFullExpr = (ThoughtEntity entity) =>
        new Thought
        {
            Id = entity.Id,
            Title = entity.Title,
            Color = entity.Color,
            Date = entity.DateCreated.ToString("yyyy-MM-dd"),
            Size = entity.SizeMultiplier,
            Shape = entity.Shape,
            Content = entity.Content,
            BookmarkedCount = entity.Bookmarks.Count,
            Author = new() { Id = entity.AuthorId, Color = entity.Author.Color, Username = entity.Author.Username },
            Concepts = entity.Concepts.AsQueryable().Select(ConceptMapper.ToDtoLightExpr).ToList(),
            EpochId = entity.EpochId,
            Links = entity.Links.AsQueryable().Select(tr => new ThoughtTitle(){
                Id= tr.TargetThought.Id,
                Color= tr.TargetThought.Color,
                Title=tr.TargetThought.Title
                }).ToList(),

            Replies = entity.Backlinks.AsQueryable().Select(tr => new ThoughtTitle(){
                Id= tr.SourceThought.Id,
                Color= tr.SourceThought.Color,
                Title=tr.SourceThought.Title
                }).ToList()
        };

    public static Thought ToDtoFull(this ThoughtEntity entity)
    {
        return ToDtoFullExpr.Compile()(entity);
    }

    public static Expression<Func<ThoughtEntity, ThoughtLight>> ToDtoLightExpr = (ThoughtEntity entity) =>
        new ThoughtLight
        {
            Id = entity.Id,
            Title = entity.Title,
            Color = entity.Color,
            Date = entity.DateCreated.ToString("yyyy-MM-dd"),
            Size = entity.SizeMultiplier,
            Shape = entity.Shape,
            AuthorId = entity.AuthorId,
            EpochId = entity.EpochId
        };

    public static ThoughtLight ToDtoLight(this ThoughtEntity entity)
    {
        return ToDtoLightExpr.Compile()(entity);
    }

    public static Expression<Func<ThoughtEntity, ThoughtTitle>> ToDtoTitleExpr = (ThoughtEntity entity) =>
        new ThoughtTitle
        {
            Id = entity.Id,
            Title = entity.Title,
            Shape = entity.Shape,
            Color = entity.Color
        };

    public static ThoughtTitle ToDtoTitle(this ThoughtEntity entity)
    {
        return ToDtoTitleExpr.Compile()(entity);
    }

    //todo - to node
}

