using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.SiteActivity
{
    public interface IStatsService
    {
        int GetStats();

        void IncrementStats();

        void DecrementStats();
    }
}
