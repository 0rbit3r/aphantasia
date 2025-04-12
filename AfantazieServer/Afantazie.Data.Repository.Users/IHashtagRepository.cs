using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface IHashtagRepository
    {
        Task<Result<Hashtag>> InsertHashtagAsync(string tag, string color);

        Task<Result<Hashtag>> GetHashtag(string tag);

        Task<Result> AssociateHashtagToThought(int thoughtId, int HashtagId);
    }
}
