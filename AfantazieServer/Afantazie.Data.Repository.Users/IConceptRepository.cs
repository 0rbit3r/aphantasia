using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface IConceptRepository
    {
        Task<Result<Concept>> InsertConceptAsync(string tag, string color);

        Task<Result<Concept>> GetConcept(string tag);

        Task<Result> AssociateConceptToThought(int thoughtId, int HashtagId);
    }
}
