using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IHashtagService
    {
        Task<Result> HandleNewThoughtHashtagsAsync(Thought thought);


    }
}
