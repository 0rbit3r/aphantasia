using Afantazie.Core.Model;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal class NotificationsRepository(DataContextProvider _contextProvider) : INotificationsRepository
    {
        public async Task<List<Thought>> GetNotificationsForUser(int userId)
        {
            using (var dbContext = _contextProvider.GetDataContext())
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
                    .OrderBy(t => t.DateCreated)
                    .ToListAsync();

                return responses.Adapt<List<Thought>>();
            }
        }
    }
}
