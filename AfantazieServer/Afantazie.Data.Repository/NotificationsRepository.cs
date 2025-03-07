using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal class NotificationsRepository(
        DataContextProvider _contextProvider,
        ILogger<NotificationsRepository> _log) : INotificationsRepository
    {
        public async Task<Result<List<Thought>>> GetNotificationsForUser(int userId, int amount)
        {
            using (var dbContext = _contextProvider.GetDataContext())
            {
                try
                {
                    var usersThoughtIds = await dbContext.Thoughts
                        .Where(t => t.AuthorId == userId)
                        .Select(t => t.Id)
                        .ToListAsync();
                    var responses = await dbContext.ThoughtReferences
                        .AsQueryable()
                        .Include(tr => tr.SourceThought.Author)
                        .Where(tr => usersThoughtIds.Contains(tr.TargetId) && !usersThoughtIds.Contains(tr.SourceId))
                        .Select(tr => tr.SourceThought)
                        .Distinct()
                        .OrderByDescending(t => t.DateCreated)
                        .ToListAsync();

                    return responses.Take(amount).Adapt<List<Thought>>();
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Failed to get notifications for user {userId}", userId) ;
                    return Error.General(500, "Failed to get notifications for user");
                }
            }
        }

    }
}
