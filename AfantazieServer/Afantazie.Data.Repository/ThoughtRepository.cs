using System.Runtime.InteropServices;
using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Afantazie.Data.Repository
{
    internal partial class ThoughtRepository(
        DataContextProvider _contextProvider
        ) : IThoughtRepository
    {
        public async Task<Result<Thought>> GetThoughtByIdAsync(int id)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thought = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .Include(t => t.Concepts) //could proove as performance issue
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

        public async Task<Result<List<Thought>>> GetAllThoughtsAsync()
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
            string title,
            string content,
            int authorId,
            byte shape,
            IEnumerable<int> references)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtEntity =
                    new ThoughtEntity
                    {
                        Title = title,
                        Content = content,
                        AuthorId = authorId,
                        Shape = shape,
                        DateCreated = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)
                    };

                var newEntity = db.Add(thoughtEntity);
                await db.SaveChangesAsync();

                double sumX = 0, sumY = 0;
                foreach (var referenceId in references)
                {
                    var referencedThought = db.Thoughts.SingleOrDefault(t => t.Id == referenceId);
                    sumX += referencedThought?.PositionX ?? 0;
                    sumY += referencedThought?.PositionY ?? 0;

                    var referenceEntity = new ThoughtReferenceEntity
                    {
                        SourceId = newEntity.Entity.Id,
                        TargetId = referenceId,
                    };

                    db.Add(referenceEntity);
                }

                var initialPosX = 0d;
                var initialPosY = 0d;
                var rand = new Random();
                if (references.Any())
                {
                    initialPosX = sumX / references.Count();
                    initialPosY = sumY / references.Count();
                    initialPosX += (rand.NextDouble() - 0.5) * 100;
                    initialPosY += (rand.NextDouble() - 0.5) * 100;
                }
                else
                {
                    initialPosX = (rand.NextDouble() - 0.5) * 500;
                    initialPosY = (rand.NextDouble() - 0.5) * 500;
                }


                newEntity.Entity.PositionX = initialPosX;
                newEntity.Entity.PositionY = initialPosY;


                await db.SaveChangesAsync();

                return newEntity.Entity.Id;
            }
        }

        public async Task<Result<List<Thought>>> GetLatestLog(int amount)
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

        public async Task<Result<List<Thought>>> TakeBeforeId(int amount, int id, string? concept)
        {
            if (concept is not null)
            {
                concept = concept.ToLower();
            }
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
                var query = db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Concepts)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(concept))
                {
                    query = query
                     .Where(t => t.Concepts.Any(c => c.Tag == concept));
                }
                var list = await query
                    .Where(t => t.Id < id)
                    .Where(t => t.Id >= id - amount)
                    .ToListAsync();


                return (list.Take(amount)).Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeAfterId(int amount, int id, string? concept)
        {
            if (concept is not null)
            {
                concept = concept.ToLower();
            }
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
                var query = db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Concepts)
                    .AsQueryable();
                if (!string.IsNullOrEmpty(concept))
                {
                    query = query
                        .Where(t => t.Concepts.Any(c => c.Tag == concept));
                }
                var list = await query
                    .Where(t => t.Id > id)
                    .Where(t => t.Id <= id + amount)
                    .ToListAsync();

                return (list.Take(amount)).Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeAroundId(int amount, int thoughtId, string? concept)
        {
            if (concept is not null)
            {
                concept = concept.ToLower();
            }
            using (var db = _contextProvider.GetDataContext())
            {
                var query = db.Thoughts
                    .OrderBy(t => t.Id)
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Concepts)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(concept))
                {
                    query = query
                        .Where(t => t.Concepts.Any(c => c.Tag == concept));
                }

                var list = await query
                    .Where(t => t.Id >= thoughtId - amount / 2)
                    .Where(t => t.Id < thoughtId + amount / 2)
                    .ToListAsync();

                return list.Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> TakeLatest(int amount, string? concept)
        {
            if (concept is not null)
            {
                concept = concept.ToLower();
            }
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsQuery = db.Thoughts
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Concepts)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(concept))
                {
                    thoughtsQuery = thoughtsQuery
                        .Where(t => t.Concepts.Any(c => c.Tag == concept));
                }

                var thoughtsList = await thoughtsQuery
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

        public async Task<Result<List<Thought>>> GetThoughtsAfterDate(DateTime date)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsList = await db.Thoughts
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Where(t => t.DateCreated > date.ToUniversalTime())
                    .ToListAsync();

                return thoughtsList.Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> GetUsersThoughts(int user)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsList = await db.Thoughts
                    .Include(t => t.Author)
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Where(t => t.AuthorId == user)
                    .ToListAsync();

                return thoughtsList.Adapt<List<Thought>>();
            }
        }

        public async Task<Result<List<Thought>>> GetBiggestThoughts(int amount)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsWithBoth = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .OrderByDescending(t => t.SizeMultiplier)
                    .Take(amount)
                    .ToListAsync();

                return thoughtsWithBoth
                    .Adapt<List<Thought>>();
            }
        }

        public async Task<Result> DeleteThoughtAsync(int id)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thought = await db.Thoughts
                    .Include(t => t.Links)
                        .ThenInclude(l => l.TargetThought)
                        .ThenInclude(tt => tt.Backlinks)
                        .ThenInclude(ttt => ttt.SourceThought)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Concepts)
                    .SingleOrDefaultAsync(t => t.Id == id);


                if (thought is null)
                {
                    return Error.NotFound();
                }

                // unbump referenced thoughts
                foreach (var link in thought.Links)
                {
                    //check whether the thought is not from the same author
                    if (link.TargetThought.AuthorId == thought.AuthorId)
                        continue;
                    //check whether I have other replies to the thought
                    // (without this I could do bump once, add more replies and then shrink with every deletion.)
                    if (link.TargetThought.Backlinks.Where(b => b.SourceThought.AuthorId == thought.AuthorId).Count() > 1)
                        continue;

                    link.TargetThought.SizeMultiplier--;
                }

                db.Thoughts.Remove(thought);
                await db.SaveChangesAsync();

                return Result.Success();
            }
        }
    }
}
