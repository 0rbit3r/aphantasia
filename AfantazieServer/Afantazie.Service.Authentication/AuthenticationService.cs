using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace Afantazie.Service.Auth
{
    public class AuthenticationService(
        IUserAuthRepository _userRepository,
        IConfiguration _config,
        IAuthValidationMessages _errorMessages,
        ILogger<AuthenticationService> _log) : IAuthenticationService
    {

        public async Task<Result<(string, string)>> Login(string emailOrLogin, string password)
        {
            _log.LogInformation("Attempting to log in user {emailOrLogin}", emailOrLogin);
            var usingEmail = emailOrLogin.Contains("@");

            var loginResult = usingEmail
                ? await _userRepository.VerifyLoginByEmail(emailOrLogin, password)
                : await _userRepository.VerifyLoginByUsername(emailOrLogin, password);

            if (loginResult.IsSuccess)
            {
                var username = usingEmail
                    ? (await _userRepository.GetUsernameByEmail(emailOrLogin)).Payload!
                    : emailOrLogin;
                _log.LogInformation("User {username} logged in successfully.", username);
                return (JwtUtil.GenerateJwtToken(loginResult.Payload, username, _config), "Refresh-token");
            }

            _log.LogInformation("Login failed with error {error}", loginResult.Error);
            return loginResult.Error!;
        }

        public Task<bool> Refresh()
        {
            throw new NotImplementedException();
        }

        public async Task<Result> Register(string username, string email, string password)
        {
            _log.LogInformation("Attempting to register user {username}", username);

            username = username.Trim();
            var errors = new MultiError();

            if (username.Length < 3 || username.Length > 20)
            {
                errors.Add(Error.Validation(string.Format(_errorMessages.InvalidUsernameLength, 3, 20)));
            }
            if (!Regex.IsMatch(username, @"^[a-zA-Z ÁáČčĎďÉéĚěÍíŇňÓóŘřŠšŤťÚúŮůÝýŽž]+$"))
            {
                errors.Add(Error.Validation(_errorMessages.InvalidUsernameFormat));
            }
            if (!Regex.IsMatch(email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
            {
                errors.Add(Error.Validation(_errorMessages.InvalidEmail));
            }
            if (password.Length < 8 || password.Length > 20
                || !Regex.IsMatch(password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"))
            {
                errors.Add(Error.Validation(string.Format(_errorMessages.InvalidPassword, 8, 20)));
            }
            if (errors.Any())
            {
                _log.LogInformation("Registration failed with errors\n{errors}", errors);
                return errors;
            }


            var result = await _userRepository.RegisterUserAsync(email, username, password);
            if (result.IsSuccess)
            {
                _log.LogInformation("User {username} registered successfully.", username);
            }
            else
            {
                _log.LogInformation("Registration failed with error {error}", result.Error);
            }
            return result;
        }
    }
}
