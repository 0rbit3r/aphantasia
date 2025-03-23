using Afantazie.Core.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Mapping
{
    public static class EntityMappingConfiguration
    {
        public static void ConfigureEntityMapping()
        {
            // Map from ThoughtEntity to Thought
            TypeAdapterConfig<ThoughtEntity, Thought>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Author, src => src.Author.Adapt<User>())
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.DateCreated, src => src.DateCreated)
                .Map(dest => dest.Color, src => src.Author.Color)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Size, src => src.SizeMultiplier); 

            // Map from Thought to ThoughtEntity
            TypeAdapterConfig<Thought, ThoughtEntity>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Author, src => src.Author.Adapt<UserEntity>())
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.Shape, src => (byte)src.Shape)
                .Map(dest => dest.DateCreated,
                    src => DateTime.SpecifyKind(src.DateCreated, DateTimeKind.Utc))
                .Ignore(dest => dest.Links)
                .Ignore(dest => dest.Backlinks);

            TypeAdapterConfig<ThoughtReferenceEntity, ThoughtReference>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.SourceId, src => src.SourceId)
                .Map(dest => dest.TargetId, src => src.TargetId);

            TypeAdapterConfig<UserEntity, User>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.Username, src => src.Username)
                .Map(dest => dest.Color, src => src.Color);

            TypeAdapterConfig<User, UserEntity>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.Username, src => src.Username)
                .Map(dest => dest.Color, src => src.Color);
        }
    }
}
