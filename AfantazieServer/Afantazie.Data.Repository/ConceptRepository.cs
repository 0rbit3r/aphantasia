using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal class ConceptRepository(
        DataContextProvider _contextProvider,
        ILogger<ConceptRepository> _log) : IConceptRepository
    {
        public async Task<Result> AssociateConceptToThought(int thoughtId, int HashtagId)
        {
            try
            {
                using (var context = _contextProvider.GetDataContext())
                {
                    var thought = context.Thoughts.FirstOrDefault(x => x.Id == thoughtId);
                    var hashtag = context.Concepts.FirstOrDefault(x => x.Id == HashtagId);

                    if (thought is null || hashtag is null)
                    {
                        return Error.NotFound();
                    }

                    var thoughtHashtag = new ThoughtConceptEntity
                    {
                        Concept = hashtag,
                        Thought = thought,
                    };

                    context.ThoughtConcepts.Add(thoughtHashtag);
                    await context.SaveChangesAsync();

                    return Result.Success();
                }
            }
            catch(Exception e)
            {
                _log.LogWarning(e, "Failed to associate hashtag {HashtagId} to thought {thoughtId}", HashtagId, thoughtId);
                return Error.ExceptionThrown(e);
            }
        }

        public async Task<Result<Concept>> GetConcept(string tag)
        {
            try
            {
                using (var context = _contextProvider.GetDataContext())
                {
                        var existingHashtag = await context
                            .Concepts
                            .FirstOrDefaultAsync(x => x.Tag.ToLower() == tag.ToLower());
                        if (existingHashtag is null)
                        {
                            return Error.NotFound();
                        }
                        return existingHashtag.Adapt<Concept>();
                }
            }
            catch (Exception e)
            {
                _log.LogWarning(e, "Failed to get hashtag {tag}", tag);
                return Error.ExceptionThrown(e);
            }
        }

        public async Task<Result<Concept>> InsertConceptAsync(string tag, string color)
        {
            try
            {
                _log.LogDebug("Inserting new hashtag {tag} into database", tag);
                using (var context = _contextProvider.GetDataContext())
                {
                    var hashtag = new ConceptEntity
                    {
                        Color = color,
                        Tag = tag.ToLower(),
                    };

                    context.Concepts.Add(hashtag);
                    await context.SaveChangesAsync();

                    return(hashtag.Adapt<Concept>());
                }
            }
            catch (Exception e)
            {
                _log.LogWarning(e, "Failed to insert hashtag {tag}", tag);
                return Error.ExceptionThrown(e);
            }
        }
    }
}
