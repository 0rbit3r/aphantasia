using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IConceptService
    {
        Task<Result> HandleNewThoughtConceptsAsync(Thought thought);

        Task<Result<Concept>> GetConcept(string tag);
    }
}
