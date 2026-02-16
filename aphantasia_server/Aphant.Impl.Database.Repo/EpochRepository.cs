using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;
using Aphant.Impl.Database.Mapping;

namespace Aphant.Impl.Database.Repo;

internal class EpochRepository(
    AphantasiaDataContext db,
    ILogger<AphantasiaDataContext> log
    ) : IEpochDataContract
{
    public async Task<Result<Epoch>> GetEpochAsync(int? id)
    {
        try
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
                .Select(ThoughtMapper.ToDtoNodeExpr).ToList();

            var lastEpochEndedDate = db.Epochs.Any()
                ? db.Epochs.Max(e => e.EndDate)
                : DateTime.UtcNow;

            return new Epoch()
            {
                Id = -1,
                Name = "now",
                StartDate = lastEpochEndedDate.ToString(),
                EndDate = "today",
                Thoughts = epochlessThoughts
            };
        }
        catch (Exception e)
        {
            log.LogError(e, "Data layer failure");
            return Error.ExceptionThrown(e);
        }
    }
}