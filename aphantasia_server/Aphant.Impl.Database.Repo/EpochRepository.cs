using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Aphant.Impl.Database.Mapping;
using Aphant.Impl.Database.Entity;

namespace Aphant.Impl.Database.Repo;

internal class EpochRepository(AphantasiaDataContext db) : IEpochDataContract
{
    public async Task<Result<Epoch>> GetEpochAsync(int? id)
    {
        if (id is not null)
        {
            var dto = db.Epochs.Select(EpochMapper.ToDtoFullExpr).FirstOrDefault(e => e.Id == id);
            if (dto is null)
                return Error.NotFound("No such Epoch");
            return dto;
        }

        var epochlessThoughts = db.Thoughts
            .Where(t => t.EpochId == null)
            .Select(ThoughtMapper.ToDtoNodeExpr)
            .OrderByDescending(e => e.Id)
            .ToList();

        return new Epoch()
        {
            Id = -1,
            Name = "Current context",
            StartDate = epochlessThoughts.Last().Date,
            EndDate = epochlessThoughts.First().Date,
            Thoughts = epochlessThoughts
        };
    }

    public async Task<Result<Epoch>> CreateEpoch(int numberOfThoughts)
    {
        var epochlessThoughts = db.Thoughts
            .Where(t => t.Epoch == null)
            .OrderBy(t => t.Id)
            .Take(numberOfThoughts)
            .ToList();

        var newEpoch = db.Epochs.Add(new EpochEntity
        {
            Thoughts = epochlessThoughts,
            StartDate = epochlessThoughts.First().DateCreated,
            EndDate = epochlessThoughts.Last().DateCreated
        });

        return Result.Success(EpochMapper.ToDtoFull(newEpoch.Entity));
    }

    public async Task<Result<List<ThoughtNode>>> GetLatestContext(int numberOfThoughts)
        => db.Thoughts.OrderBy(t => t.Id).TakeLast(numberOfThoughts).Select(ThoughtMapper.ToDtoNodeExpr).ToList();

}