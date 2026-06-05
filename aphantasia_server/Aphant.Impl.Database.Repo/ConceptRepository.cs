using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database.Entity;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Repo;

internal class ConceptRepository(AphantasiaDataContext _db) : IConceptDataContract
{
    public async Task<Result<Concept>> GetConcept(string tag)
    {
        var concept = await _db.Concepts
            .Include(c => c.Thoughts)
            .Include(c => c.Followers)
            .FirstOrDefaultAsync(c => c.Tag == tag);

        if (concept is null) return Error.NotFound();
        return concept.ToDtoFull();
    }

    public async Task<Result<Concept>> CreateConcept(string tag, string color)
    {
        var existing = await _db.Concepts.FirstOrDefaultAsync(c => c.Tag == tag);
        if (existing is not null) return existing.ToDtoFull();

        var entity = new ConceptEntity
        {
            Tag = tag,
            Color = color,
            DateCreated = DateTime.UtcNow
        };

        _db.Concepts.Add(entity);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // concurrent insert — fetch the winner
            var winner = await _db.Concepts.FirstOrDefaultAsync(c => c.Tag == tag);
            if (winner is null) return Error.General("Failed to create concept");
            return winner.ToDtoFull();
        }

        return entity.ToDtoFull();
    }

    public async Task<Result> AddThoughtToConcept(Guid thoughtId, string conceptTag)
    {
        var exists = await _db.ThoughtConcepts
            .AnyAsync(tc => tc.ThoughtId == thoughtId && tc.ConceptTag == conceptTag);

        if (exists) return Result.Success();

        _db.ThoughtConcepts.Add(new ThoughtConceptEntity
        {
            ThoughtId = thoughtId,
            ConceptTag = conceptTag
        });

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // concurrent insert on same pair — fine to ignore
        }

        return Result.Success();
    }
}
