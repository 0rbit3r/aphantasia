using Afantazie.Core.Model.Results;

namespace Afantazie.Data.Interface.Repository
{
    public interface IUserAuthRepository
    {
        public Task<Result<string>> GetUsernameByEmail(string emailOrLogin);

        /// <summary>
        /// Registers new user.
        /// </summary>
        public Task<Result> RegisterUserAsync(string email, string username, string password);

        /// <summary>
        /// Verifies that the login credentials are correct.
        /// </summary>
        /// <returns>
        /// Successful result with id of the logged in user.
        /// Or AuthenticationError if the credentials are incorrect.
        /// </returns>
        public Task<Result<int>> VerifyLoginByEmail(string email, string password);

        /// <summary>
        /// Verifies that the login credentials are correct.
        /// </summary>
        /// <returns>
        /// Successful result with id of the logged in user.
        /// Or AuthenticationError if the credentials are incorrect.
        /// </returns>
        public Task<Result<int>> VerifyLoginByUsername(string username, string password);
    }
}
