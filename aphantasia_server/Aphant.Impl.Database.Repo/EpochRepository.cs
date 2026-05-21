using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Data;
using Aphant.Impl.Database.Mapping;
using Aphant.Impl.Database.Entity;
using Aphant.Core.Contracta.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Repo;

internal class EpochRepository(AphantasiaDataContext db, IOptions<EpochOptions> opts) : IEpochDataContract
{
    public async Task<Result<Epoch>> GetEpochAsync(int id)
    {
        if (id == EpochPseudoId.LatestContext)
        {
            var latestContext = await GetLatestContext(opts.Value.ThoughtsPerEpoch);
            if (!latestContext.IsSuccess) return latestContext.Error!;

            var latestEpochId = await db.Epochs.OrderByDescending(e => e.Id).Select(e => (int?)e.Id).FirstOrDefaultAsync();

            return new Epoch
            {
                Id = EpochPseudoId.LatestContext,
                Thoughts = latestContext.Payload!.OrderByDescending(t => t.Id).ToList(),
                StartDate = latestContext.Payload!.FirstOrDefault()?.Date ?? "",
                EndDate = latestContext.Payload!.LastOrDefault()?.Date ?? "",
                NextEpochId = EpochPseudoId.Epochless,
                PreviousEpochId = latestEpochId
            };
        }

        if (id == EpochPseudoId.Epochless)
        {
            var epochlessThoughts = await db.Thoughts
                .Where(t => t.EpochId == null)
                .Select(ThoughtMapper.ToDtoNodeExpr)
                .OrderByDescending(e => e.Id)
                .ToListAsync();

            if (!epochlessThoughts.Any())
                return new Epoch { Id = EpochPseudoId.Epochless, Name = null, StartDate = "", EndDate = "", Thoughts = [], PreviousEpochId = EpochPseudoId.LatestContext, NextEpochId = null };

            return new Epoch()
            {
                Id = EpochPseudoId.Epochless,
                Name = null,
                StartDate = epochlessThoughts.Last().Date,
                EndDate = epochlessThoughts.First().Date,
                Thoughts = epochlessThoughts,
                PreviousEpochId = EpochPseudoId.LatestContext,
                NextEpochId = null
            };
        }

        var dto = await db.Epochs.Select(EpochMapper.ToDtoFullExpr).FirstOrDefaultAsync(e => e.Id == id);
        if (dto is null)
            return Error.NotFound("No such Epoch");
        return dto;
    }

    public async Task<Result<Epoch>> CreateEpoch(int numberOfThoughts)
    {
        var epochlessThoughts = await db.Thoughts
            .Where(t => t.Epoch == null)
            .OrderBy(t => t.Id)
            .Take(numberOfThoughts)
            .ToListAsync();

        if (epochlessThoughts.Count < numberOfThoughts)
            return Error.BadRequest($"Cannot create new epoch of {numberOfThoughts} thoughts - there are only {epochlessThoughts.Count} epochless thoughts");

        var lastEpoch = await db.Epochs.OrderByDescending(e => e.Id).FirstOrDefaultAsync();

        var newEpoch = await db.Epochs.AddAsync(new EpochEntity
        {
            Thoughts = epochlessThoughts,
            StartDate = epochlessThoughts.First().DateCreated,
            EndDate = epochlessThoughts.Last().DateCreated,
            PreviousEpochId = lastEpoch?.Id
        });

        await db.SaveChangesAsync();

        if (lastEpoch is not null)
        {
            lastEpoch.NextEpochId = newEpoch.Entity.Id;
            await db.SaveChangesAsync();
        }

        return await GetEpochAsync(newEpoch.Entity.Id);
    }

    public async Task<Result<List<ThoughtNode>>> GetLatestContext(int numberOfThoughts) //todo move this to thoughts repo/logic
        => await db.Thoughts.OrderByDescending(t => t.Id).Take(numberOfThoughts).Select(ThoughtMapper.ToDtoNodeExpr).ToListAsync();

}