using Afantazie.Core.Model.Results;
using System.Reflection.Metadata;

namespace Afantazie.Service.Interface.Authentication
{
    public interface IAuthenticationService
    {
        public Task<Result<(string, string)>> Login(string user, string password);

        public Task<bool> Refresh();

        public Task<Result> Register(string user, string email, string password);
    }
}
