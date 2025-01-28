using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal partial class ThoughtRepository(
        DataContextProvider _contextProvider
        ) : IThoughtRepository
    {
        public async Task<Result<Thought>> GetThoughtById(int id)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thought = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .Where(t => t.Id == id)
                    .SingleOrDefaultAsync();

                if (thought is null)
                {
                    return Error.NotFound();
                }

                return thought.Adapt<Thought>();
            }
        }

        public async Task<Result<int>> GetTotalThoughtsCountAsync()
        {
            using (var db = _contextProvider.GetDataContext())
            {
                return await db.Thoughts.CountAsync();
            }
        }

        public async Task<Result<List<Thought>>> GetAllThoughts()
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsWithBoth = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .ToListAsync();

                return thoughtsWithBoth
                    .Adapt<List<Thought>>();
            }
        }

        public Task<Result<IEnumerable<Thought>>> GetThoughtsByOwner(int ownerId)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<int>> InsertThoughtAsync(
            string title, string content, int authorId, IEnumerable<int> references)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtEntity =
                    new ThoughtEntity {
                        Title = title,
                        Content = content,
                        AuthorId = authorId,
                        DateCreated = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
                    };

                var newEntity = db.Add(thoughtEntity);
                await db.SaveChangesAsync();

                foreach (var referenceId in references)
                {
                    var referenceEntity = new ThoughtReferenceEntity
                    {
                        SourceId = newEntity.Entity.Id,
                        TargetId = referenceId,
                    };

                    db.Add(referenceEntity);
                }

                await db.SaveChangesAsync();

                return newEntity.Entity.Id;
            }
        }

        public async Task<Result<List<Thought>>> GetLatestMetaData(int amount)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsWithBoth = await db.Thoughts
                 .Include(t => t.Author)
                 .OrderByDescending(Task => Task.DateCreated)
                 .Take(amount)
                 .ToListAsync();

                return thoughtsWithBoth
                    .Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeBeforeId(int amount, int id)
        {
            // validations
            if (amount < 0)
            {
                return Error.Validation("Amount must be a positive integer.");
            }
            if (id < 0)
            {
                return Error.Validation("Id must be a positive integer.");
            }

            // get the thoughts
            using (var db = _contextProvider.GetDataContext())
            {
                var list = await db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Where(t => t.Id < id)
                    .Where(t => t.Id >= id - amount)
                    .ToListAsync();
                    

                return (list.Take(amount)).Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeAfterId(int amount, int id)
        {
            // validations
            if (amount < 0)
            {
                return Error.Validation("Amount must be a positive integer.");
            }
            if (id < 0)
            {
                return Error.Validation("Id must be a positive integer.");
            }

            // get the thoughts
            using (var db = _contextProvider.GetDataContext())
            {
                var list = await db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Where(t => t.Id > id)
                    .Where(t => t.Id <= id + amount)
                    .ToListAsync();

                return (list.Take(amount)).Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeAroundId(int amount, int thoughtId)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var list = await db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Where(t => t.Id >= thoughtId - amount / 2)
                    .Where(t => t.Id < thoughtId + amount / 2)
                    .ToListAsync();

                return list.Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeLatest(int amount)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsList = await db.Thoughts
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .OrderByDescending(t => t.DateCreated)
                    .Take(amount)
                    .ToListAsync();

                thoughtsList.Reverse();

                return thoughtsList.Adapt<List<Thought>>();
            }
        }

        public async Task<Result<int>> BumpThoughtAsync(int targetId)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thought = db.Thoughts
                    .Where(t => t.Id == targetId)
                    .SingleOrDefault();

                if (thought is null)
                {
                    return Error.NotFound();
                }

                thought.SizeMultiplier++;

                await db.SaveChangesAsync();

                return thought.SizeMultiplier;
            }
        }
    }
}
