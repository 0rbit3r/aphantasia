﻿using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.SiteActivity
{
    public interface IActivityLogService
    {
        Task<Result<List<Thought>>> GetLatestActivity(int amount);
    }
}
