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
    internal class HashtagRepository(
        DataContextProvider _contextProvider,
        ILogger<HashtagRepository> _log) : IHashtagRepository
    {
        public async Task<Result> AssociateHashtagToThought(int thoughtId, int HashtagId)
        {
            try
            {
                using (var context = _contextProvider.GetDataContext())
                {
                    var thought = context.Thoughts.FirstOrDefault(x => x.Id == thoughtId);
                    var hashtag = context.Hashtags.FirstOrDefault(x => x.Id == HashtagId);

                    if (thought is null || hashtag is null)
                    {
                        return Error.NotFound();
                    }

                    var thoughtHashtag = new ThoughtHashtagEntity
                    {
                        Hashtag = hashtag,
                        Thought = thought,
                    };

                    context.ThoughtHashtags.Add(thoughtHashtag);
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

        public async Task<Result<Hashtag>> GetHashtag(string hashtag)
        {
            try
            {
                using (var context = _contextProvider.GetDataContext())
                {
                        var existingHashtag = await context.Hashtags.FirstOrDefaultAsync(x => x.Tag == hashtag);
                        if (existingHashtag is null)
                        {
                            return Error.NotFound();
                        }
                        return existingHashtag.Adapt<Hashtag>();
                }
            }
            catch (Exception e)
            {
                _log.LogWarning(e, "Failed to get hashtag {tag}", hashtag);
                return Error.ExceptionThrown(e);
            }
        }

        public async Task<Result<Hashtag>> InsertHashtagAsync(string tag, string color)
        {
            try
            {
                _log.LogDebug("Inserting new hashtag {tag} into database", tag);
                using (var context = _contextProvider.GetDataContext())
                {
                    var hashtag = new HashtagEntity
                    {
                        Color = color,
                        Tag = tag,
                    };

                    context.Hashtags.Add(hashtag);
                    await context.SaveChangesAsync();

                    return(hashtag.Adapt<Hashtag>());
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
