using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    /// <summary>
    /// Abstract error class and Factory methods for creating its subclasses.
    /// </summary>
    public abstract class Error
    {
        /// <summary>
        /// Specifies Http Code.
        /// </summary>
        public abstract int Code { get; }

        public override string ToString()
        {
            return $"{Code}: {GetType().Name}";
        }

        // Factory methods

        // Generic errors
        public static GeneralError General(int code, string message) => new GeneralError(code, message);

        public static AuthenticationError Auth() => new AuthenticationError();

        public static AuthenticationErrorWithMessage Auth(string message) => new AuthenticationErrorWithMessage(message);

        public static AlreadyExistsError AlreadyExists(string entity) => new AlreadyExistsError(entity);

        public static ValidationError Validation(string message) => new ValidationError(message);

        public static NotFoundError NotFound() => new NotFoundError();

    }
}
