using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
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
        IThoughtRepository _thoughtRepository)
        : IActivityLogService
    {
        public  Task<Result<List<Thought>>> GetLatestActivity(int amount)
        {
            return _thoughtRepository.GetLatestMetaData(amount);
        }
    }
}
