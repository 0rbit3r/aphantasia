using Afantazie.Core.Localization.Profile;
using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.Profiles;
using Microsoft.Extensions.Logging;

namespace Afantazie.Service.Profiles
{
    public class UserProfileService(
        IThoughtRepository _thoughtRepo,
        IUserRepository _userRepo,
        IProfileMessages _profileMessages,
        ILogger<UserProfileService> _logger
        ): IUserProfileService
    {
        public async Task<Result<Profile>> GetUserProfile(string username, ThoughtsTemporalFilter filter)
        {
            _logger.LogInformation("Getting profile for user {username}", username);

            var userResult = await _userRepo.GetUserByUsernameAsync(username);
            if (!userResult.IsSuccess)
            {
                return userResult.Error!;
            }

            var user = userResult.Payload!;

            var thoughtsResult = await _thoughtRepo.GetUsersThoughts(user.Id);

            if (!thoughtsResult.IsSuccess)
            {
                return thoughtsResult.Error!;
            }

            var linksThoughtReferences = thoughtsResult.Payload!.SelectMany(t => t.Links).ToList();   
            var referencedThoughts = new List<Thought>();
            foreach(var reference in linksThoughtReferences)
            {
                if (thoughtsResult!.Payload!.Any(t => t.Id == reference.TargetId)
                    || referencedThoughts.Any(t => t.Id == reference.TargetId))
                {
                    continue;
                }

                var referencedThought = await _thoughtRepo.GetThoughtByIdAsync(reference.TargetId);
                if (!referencedThought.IsSuccess)
                {
                    _logger.LogWarning("Referenced thought with id {id} not found.", reference);
                    continue;
                }
                referencedThoughts.Add(referencedThought.Payload!);
            }

            var thoughts = thoughtsResult.Payload!;

            thoughts.AddRange(referencedThoughts);
            thoughts = thoughts.OrderBy(t => t.DateCreated).ToList();
            var profile = new Profile
            {
                Username = user.Username,
                Color = user.Color,
                Thoughts = thoughts,
                JoinedDate = thoughts.FirstOrDefault(t => t.Author.Id == user.Id)?.DateCreated.ToString("yyy-MM-dd") ?? _profileMessages.NotYetJoined, 
                TotalCount = thoughts.Where(t => t.Author.Id == user.Id).Count(),
                Bio = user.Bio,
            };

            return profile;
        }
    }
}
