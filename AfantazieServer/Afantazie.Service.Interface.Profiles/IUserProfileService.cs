using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;


namespace Afantazie.Service.Interface.Profiles
{
    public interface IUserProfileService
    {
        Task<Result<Profile>> GetUserProfile(string username, ThoughtsTemporalFilter filter);
    }
}
