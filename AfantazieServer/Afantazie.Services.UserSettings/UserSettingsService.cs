using Afantazie.Core.Constants;
using Afantazie.Core.Localization.ThoughtValidation;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.UserSettings;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace Afantazie.Service.UserSettings
{
    public class UserSettingsService(
        IUserRepository _repo,
        ILogger<UserSettingsService> _logger,
        IValidationMessages _validationMessages
        ) : IUserSettingsService
    {
        public async Task<Result> UpdateColor(int userId, string color)
        {
            _logger.LogInformation("Updating color for userId: {userId} to {color}", userId, color);
            if (string.IsNullOrWhiteSpace(color) || !Regex.IsMatch(color, @"^#(?:[0-9a-fA-F]{3}){1,2}$"))
            {
                return Error.Validation("Invalid color");
            }
            return await _repo.AssignColor(userId, color);
        }

        public async Task<Result<string>> GetColor(int userId)
        {
            _logger.LogInformation("Getting color for userId: {userId}", userId);
            return await _repo.GetColor(userId);
        }

        public Task<Result> UpdateBio(int userId, string bio)
        {
            _logger.LogInformation("Updating bio for userId {userId} to {value}", userId, bio);
            if (bio.Length > AfantazieConstants.MaxBioLength)
            {
                return Task.FromResult(Result.Failure(Error.Validation(_validationMessages.BioTooLong)));
            }
            return _repo.UpdateBio(userId, bio);
        }

        public Task<Result<string>> GetBio(int userId)
        {
            _logger.LogDebug("Getting bio for userId {userId}", userId);

            return _repo.GetBio(userId);
        }
    }
}
