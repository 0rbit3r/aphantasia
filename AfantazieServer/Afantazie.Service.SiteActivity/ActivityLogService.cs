using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.SiteActivity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.SiteActivity
{
    internal class ActivityLogService(
        IThoughtRepository _thoughtRepository,
        INotificationsRepository _notificationsRepo)
        : IActivityLogService
    {
        public Task<Result<List<Thought>>> GetBiggest(int amount)
        {
            return _thoughtRepository.GetBiggestThoughts(amount);
        }

        public async Task<Result<List<Thought>>> GetHotActivity(int amount)
        {
            var fortniteAgo = DateTime.Now.AddDays(-14);
            var listResult = await _thoughtRepository.GetThoughtsAfterDate(fortniteAgo);

            if (!listResult.IsSuccess)
            {
                return Error.General(500, "Failed to get hot activity");
            }

            return Result.Success(listResult.Payload!.OrderByDescending(x => x.Size).Take(amount).ToList());
        }

        public  Task<Result<List<Thought>>> GetLatestActivity(int amount)
        {
            return _thoughtRepository.GetLatestLog(amount);
        }
    }
}
