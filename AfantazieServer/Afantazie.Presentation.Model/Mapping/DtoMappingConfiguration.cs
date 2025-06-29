using Mapster;
using Afantazie.Core.Model;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Presentation.Model.Dto.ThoughtFiltering;
using Afantazie.Presentation.Model.Dto;

namespace Afantazie.Presentation.Model.Mapping
{
    public static class DtoMappingConfiguration
    {
        public static void ConfigureDtoMapping()
        {
            TypeAdapterConfig<Thought, FullThoughtDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Author, src => src.Author.Username)
                .Map(dest => dest.Color, src => src.Color)
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.DateCreated, src => src.DateCreated.ToString("yyyy-MM-dd"))
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Links, src => src.Links.Select(l => l.TargetId).ToList())
                .Map(dest => dest.Backlinks, src => src.Backlinks.Select(b => b.SourceId).ToList())
                .Map(dest => dest.Hashtags, src => src.Concepts.Select(h => h.Adapt<HashtagDto>()).ToList())
                .Map(dest => dest.Size, src => src.Size);

            TypeAdapterConfig<Thought, ThoughtColoredTitleDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Color, src => src.Color);

            TypeAdapterConfig<ThoughtsTemporalFilterDto, ThoughtsTemporalFilter>.NewConfig()
                .MapWith(dto => new ThoughtsTemporalFilter
                {
                    Amount = dto.Amount,
                    TemporalFilterType = dto.AfterThoughtId.HasValue
                        ? TemporalFilterType.AfterId
                        : dto.BeforeThoughtId.HasValue
                            ? TemporalFilterType.BeforeId
                            : dto.AroundThoughtId.HasValue
                                ? TemporalFilterType.AroundId
                                : TemporalFilterType.Latest,
                    ThoughtId = dto.AfterThoughtId.HasValue
                    ? dto.AfterThoughtId.Value
                        : dto.BeforeThoughtId.HasValue
                            ? dto.BeforeThoughtId.Value
                            : dto.AroundThoughtId.HasValue
                                ? dto.AroundThoughtId.Value
                                : null
                });

            TypeAdapterConfig<Thought, ThoughtNodeDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Author, src => src.Author.Username)
                .Map(dest => dest.AuthorColor, src => src.Color)
                .Map(dest => dest.Links, src => src.Links.Select(l => l.TargetId).ToList())
                .Map(dest => dest.Backlinks, src => src.Backlinks.Select(b => b.SourceId).ToList())
                .Map(dest => dest.DateCreated, src => src.DateCreated.ToString("yyyy-MM-dd"))
                .Map(dest => dest.Size, src => src.Size)
                .Map(dest => dest.PositionX, src => src.PositionX)
                .Map(dest => dest.PositionY, src => src.PositionY);

            TypeAdapterConfig<Profile, ProfileDto>.NewConfig()
                .Map(dest => dest.Username, src => src.Username)
                .Map(dest => dest.Color, src => src.Color)
                .Map(dest => dest.TotalCount, src => src.TotalCount)
                .Map(dest => dest.JoinedDate, src => src.JoinedDate)
                .Map(dest => dest.Thoughts, src => src.Thoughts.Adapt<IList<ThoughtNodeDto>>())
                .Map(dest => dest.Bio, src => src.Bio);

            TypeAdapterConfig<Concept, HashtagDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Tag, src => src.Tag)
                .Map(dest => dest.Color, src => src.Color);
        }
    }
}
