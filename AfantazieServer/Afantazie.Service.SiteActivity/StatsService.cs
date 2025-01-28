using Afantazie.Service.Interface.SiteActivity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.SiteActivity
{
    internal class StatsService : IStatsService
    {
        private int UsersCount = 0;
        public int GetStats()
        {
            return UsersCount;
        }

        public void IncrementStats()
        {
            UsersCount++;
        }

        public void DecrementStats()
        {
            UsersCount--;
        }
    }
}
